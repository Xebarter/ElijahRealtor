// Mock PesaPal service for development
// This simulates PesaPal responses without making actual API calls

class MockPesaPalService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  private isTokenValid(): boolean {
    return this.token !== null && 
           this.tokenExpiry !== null && 
           new Date() < this.tokenExpiry;
  }

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.isTokenValid()) {
      return this.token!;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a mock token
    this.token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    console.log('Mock PesaPal: Access token generated successfully');
    return this.token;
  }

  async initiatePayment(): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate successful payment initiation
    return {
      status: 'success',
      payment_url: `http://localhost:5173/mock-payment`,
      order_tracking_id: 'MOCK_ORDER_ID'
    };
  }

  async verifyPayment(): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate payment verification
    // In a real scenario, this would check the actual payment status
    const isCompleted = Math.random() > 0.3; // 70% success rate for demo
    return {
      status: isCompleted ? 'COMPLETED' : 'PENDING',
      payment_status: isCompleted ? 'COMPLETED' : 'PENDING',
      payment_method: 'MOCK_PAYMENT',
      amount: 1000,
      currency: 'KES'
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getAccessToken();
      return { 
        success: true, 
        message: 'Mock PesaPal connection successful (Development Mode)' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  isConfigured(): boolean {
    return true; // Mock service is always "configured"
  }

  getConfigurationStatus(): { configured: boolean; missing: string[] } {
    return {
      configured: true,
      missing: []
    };
  }
}

export const mockPesaPalService = new MockPesaPalService(); 