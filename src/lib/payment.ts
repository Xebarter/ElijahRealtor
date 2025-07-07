import { mockPesaPalService } from './mockPesaPal';

interface PesaPalConfig {
  consumerKey: string;
  consumerSecret: string;
  ipnId: string;
  callbackUrl: string;
  environment: 'sandbox' | 'live';
}

interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  email: string;
  phone: string;
}

interface PaymentResponse {
  status: 'success' | 'error';
  payment_url?: string;
  order_tracking_id?: string;
  message?: string;
}

interface PesaPalTokenResponse {
  token: string;
  expiryDate: string;
  error?: any;
  status: string;
  message: string;
}

interface PesaPalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: any;
  status: string;
  message: string;
}

class PesaPalService {
  private config: PesaPalConfig;
  private baseUrl: string;
  private fallbackUrl: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor() {
    this.config = {
      consumerKey: import.meta.env.VITE_PESAPAL_CONSUMER_KEY || '',
      consumerSecret: import.meta.env.VITE_PESAPAL_CONSUMER_SECRET || '',
      ipnId: import.meta.env.VITE_PESAPAL_IPN_ID || '',
      callbackUrl: import.meta.env.VITE_PESAPAL_CALLBACK_URL || '',
      environment: (import.meta.env.VITE_PESAPAL_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox'
    };

    // Use proxy server for real PesaPal integration
    this.baseUrl = 'http://localhost:3001/api/pesapal-proxy';
    this.fallbackUrl = this.baseUrl;
  }

  private isTokenValid(): boolean {
    return this.token !== null && 
           this.tokenExpiry !== null && 
           new Date() < this.tokenExpiry;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, options: RequestInit, useFallback: boolean = false): Promise<Response> {
    const baseUrl = useFallback ? this.fallbackUrl : this.baseUrl;
    const fullUrl = `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Fetching ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
          ...options,
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        // If this is the last attempt, throw the error
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        // If we're using proxy and it fails, try fallback on next attempt
        if (!useFallback && (error.message.includes('socket hang up') || error.message.includes('fetch'))) {
          console.log('Proxy failed, will try direct connection on next attempt');
          return this.fetchWithRetry(url, options, true);
        }
        
        // Wait before retrying
        await this.delay(this.retryDelay * attempt);
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.isTokenValid()) {
      return this.token!;
    }

    try {
      // Validate required config
      if (!this.config.consumerKey || !this.config.consumerSecret) {
        throw new Error('PesaPal credentials not configured. Please create a .env file with VITE_PESAPAL_CONSUMER_KEY and VITE_PESAPAL_CONSUMER_SECRET. For development, you can use PesaPal sandbox credentials.');
      }

      console.log('Requesting PesaPal access token...');

      const response = await this.fetchWithRetry('/Auth/RequestToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          consumer_key: this.config.consumerKey,
          consumer_secret: this.config.consumerSecret
        })
      });

      const data: PesaPalTokenResponse = await response.json();
      
      if (data.status === '200' && data.token) {
        this.token = data.token;
        // Set expiry to 1 hour from now (PesaPal tokens typically last 1 hour)
        this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        console.log('PesaPal access token obtained successfully');
        return data.token;
      }
      
      throw new Error(data.message || 'Failed to get access token');
    } catch (error: any) {
      console.error('PesaPal Auth Error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error('CORS Error: PesaPal doesn\'t allow direct browser requests. You need a backend proxy server to handle PesaPal API calls. Please set up a backend server or use the mock service for development.');
      } else if (error.message.includes('socket hang up')) {
        throw new Error('Unable to connect to PesaPal servers. Please check your internet connection and try again.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Connection to PesaPal timed out. Please try again.');
      } else if (error.message.includes('credentials not configured')) {
        throw new Error(error.message);
      } else {
        throw new Error('Payment service temporarily unavailable. Please try again in a few minutes.');
      }
    }
  }

  async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Initiating PesaPal payment...');

      const token = await this.getAccessToken();
      
      // Generate unique merchant reference
      const merchantReference = `VISIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const orderData = {
        id: merchantReference,
        currency: paymentData.currency,
        amount: paymentData.amount,
        description: paymentData.description,
        callback_url: this.config.callbackUrl,
        notification_id: this.config.ipnId,
        billing_address: {
          email_address: paymentData.email,
          phone_number: paymentData.phone,
          country_code: this.getCountryCode(paymentData.currency),
          first_name: paymentData.email.split('@')[0], // Extract name from email
          last_name: 'Customer'
        }
      };

      console.log('Submitting order request to PesaPal...');

      const response = await this.fetchWithRetry('/Transactions/SubmitOrderRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data: PesaPalOrderResponse = await response.json();
      
      if (data.status === '200' && data.redirect_url) {
        console.log('Payment URL generated successfully');
        return {
          status: 'success',
          payment_url: data.redirect_url,
          order_tracking_id: data.order_tracking_id
        };
      }
      
      return {
        status: 'error',
        message: data.message || 'Payment initiation failed'
      };
    } catch (error: any) {
      console.error('PesaPal Payment Error:', error);
      return {
        status: 'error',
        message: error.message || 'Payment service unavailable'
      };
    }
  }

  async verifyPayment(orderTrackingId: string): Promise<{ status: string; payment_status: string; payment_method?: string; amount?: number; currency?: string }> {
    try {
      const token = await this.getAccessToken();
      
      const response = await this.fetchWithRetry(`/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      return {
        status: data.status || 'PENDING',
        payment_status: data.payment_status_description || data.status_code || 'PENDING',
        payment_method: data.payment_method,
        amount: data.amount,
        currency: data.currency
      };
    } catch (error: any) {
      console.error('PesaPal Verification Error:', error);
      throw new Error('Payment verification failed');
    }
  }

  private getCountryCode(currency: string): string {
    const currencyToCountry: Record<string, string> = {
      'KES': 'KE',
      'UGX': 'UG', 
      'TZS': 'TZ',
      'RWF': 'RW',
      'NGN': 'NG',
      'GHS': 'GH',
      'ZAR': 'ZA',
      'USD': 'US'
    };
    
    return currencyToCountry[currency] || 'KE';
  }

  // Method to register IPN URL (should be called once during setup)
  async registerIPN(ipnUrl: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      
      const response = await this.fetchWithRetry('/URLSetup/RegisterIPN', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: ipnUrl,
          ipn_notification_type: 'GET'
        })
      });

      const data = await response.json();
      return data.status === '200';
    } catch (error) {
      console.error('IPN Registration Error:', error);
      return false;
    }
  }

  // Method to test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getAccessToken();
      return { success: true, message: 'Connection to PesaPal successful' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // Method to check if PesaPal is configured
  isConfigured(): boolean {
    return !!(this.config.consumerKey && this.config.consumerSecret);
  }

  // Method to get configuration status
  getConfigurationStatus(): { configured: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!this.config.consumerKey) missing.push('VITE_PESAPAL_CONSUMER_KEY');
    if (!this.config.consumerSecret) missing.push('VITE_PESAPAL_CONSUMER_SECRET');
    if (!this.config.ipnId) missing.push('VITE_PESAPAL_IPN_ID');
    if (!this.config.callbackUrl) missing.push('VITE_PESAPAL_CALLBACK_URL');
    
    return {
      configured: missing.length === 0,
      missing
    };
  }
}

// Use real PesaPal service (with fallback to mock if not configured)
const isDevelopment = import.meta.env.DEV;
const realPesaPalService = new PesaPalService();

// Use real service if configured, otherwise use mock for development
export const pesapalService = isDevelopment && !realPesaPalService.isConfigured() 
  ? mockPesaPalService 
  : realPesaPalService;

// Export configuration check helper
export const checkPesaPalConfiguration = () => {
  return pesapalService.getConfigurationStatus();
};

// Utility function to get visit booking fee by country
export const getVisitBookingFee = (country: string): { amount: number; currency: string } => {
  const fees: Record<string, { amount: number; currency: string }> = {
    'Kenya': { amount: 5000, currency: 'KES' },
    'Uganda': { amount: 50000, currency: 'UGX' },
    'Tanzania': { amount: 25000, currency: 'TZS' },
    'Rwanda': { amount: 5000, currency: 'RWF' },
    'Nigeria': { amount: 10000, currency: 'NGN' },
    'Ghana': { amount: 200, currency: 'GHS' },
    'South Africa': { amount: 500, currency: 'ZAR' },
    'United States': { amount: 50, currency: 'USD' }
  };

  return fees[country] || { amount: 50, currency: 'USD' };
};

// Utility function to format payment amounts for display
export const formatPaymentAmount = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const currencySymbols: Record<string, string> = {
    'KES': 'KSh',
    'UGX': 'USh',
    'TZS': 'TSh',
    'RWF': 'RF',
    'NGN': '₦',
    'GHS': 'GH₵',
    'ZAR': 'R',
    'USD': '$'
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${formatter.format(amount)}`;
};

// Validate payment amount based on currency
export const validatePaymentAmount = (amount: number, currency: string): boolean => {
  const minAmounts: Record<string, number> = {
    'KES': 100,
    'UGX': 1000,
    'TZS': 1000,
    'RWF': 100,
    'NGN': 100,
    'GHS': 1,
    'ZAR': 10,
    'USD': 1
  };

  const maxAmounts: Record<string, number> = {
    'KES': 1000000,
    'UGX': 10000000,
    'TZS': 10000000,
    'RWF': 1000000,
    'NGN': 1000000,
    'GHS': 10000,
    'ZAR': 100000,
    'USD': 10000
  };

  const min = minAmounts[currency] || 1;
  const max = maxAmounts[currency] || 1000000;

  return amount >= min && amount <= max;
};