const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PesaPal configuration
const PESAPAL_CONFIG = {
  consumerKey: process.env.VITE_PESAPAL_CONSUMER_KEY,
  consumerSecret: process.env.VITE_PESAPAL_CONSUMER_SECRET,
  environment: process.env.VITE_PESAPAL_ENVIRONMENT || 'live'
};

const PESAPAL_BASE_URL = PESAPAL_CONFIG.environment === 'sandbox' 
  ? 'https://cybqa.pesapal.com/pesapalv3'
  : 'https://pay.pesapal.com/v3/api';

let pesapalToken = null;
let tokenExpiry = null;

// Helper function to get PesaPal access token
async function getPesaPalToken() {
  if (pesapalToken && tokenExpiry && new Date() < tokenExpiry) {
    return pesapalToken;
  }

  // Check if credentials are configured
  if (!PESAPAL_CONFIG.consumerKey || !PESAPAL_CONFIG.consumerSecret || 
      PESAPAL_CONFIG.consumerKey === 'your_consumer_key_here' || 
      PESAPAL_CONFIG.consumerSecret === 'your_consumer_secret_here') {
    throw new Error('PesaPal credentials not configured. Please update your .env file with real credentials.');
  }

  try {
    console.log('Requesting PesaPal token with credentials:', {
      consumerKey: PESAPAL_CONFIG.consumerKey.substring(0, 8) + '...',
      environment: PESAPAL_CONFIG.environment,
      url: `${PESAPAL_BASE_URL}/Auth/RequestToken`
    });

    const response = await fetch(`${PESAPAL_BASE_URL}/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: PESAPAL_CONFIG.consumerKey,
        consumer_secret: PESAPAL_CONFIG.consumerSecret
      })
    });

    console.log('PesaPal response status:', response.status);
    console.log('PesaPal response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PesaPal API error response:', errorText);
      throw new Error(`PesaPal API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('PesaPal token response:', data);
    
    if (data.status === '200' && data.token) {
      pesapalToken = data.token;
      tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      return data.token;
    }
    
    throw new Error(data.message || 'Failed to get access token');
  } catch (error) {
    console.error('PesaPal Auth Error:', error);
    throw error;
  }
}

// Proxy endpoint for PesaPal API calls
app.post('/api/pesapal-proxy/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/pesapal-proxy', '');
    const token = await getPesaPalToken();

    // Only forward safe headers
    const forwardHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${PESAPAL_BASE_URL}${path}`, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    // Try to parse as JSON, but if it fails, return the raw text
    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PesaPal proxy server is running' });
});

// Configuration check endpoint
app.get('/api/pesapal-config', (req, res) => {
  const config = {
    environment: PESAPAL_CONFIG.environment,
    baseUrl: PESAPAL_BASE_URL,
    consumerKey: PESAPAL_CONFIG.consumerKey ? 
      PESAPAL_CONFIG.consumerKey.substring(0, 8) + '...' : 'Not configured',
    consumerSecret: PESAPAL_CONFIG.consumerSecret ? 
      PESAPAL_CONFIG.consumerSecret.substring(0, 8) + '...' : 'Not configured',
    isConfigured: !!(PESAPAL_CONFIG.consumerKey && PESAPAL_CONFIG.consumerSecret && 
                    PESAPAL_CONFIG.consumerKey !== 'your_consumer_key_here' && 
                    PESAPAL_CONFIG.consumerSecret !== 'your_consumer_secret_here')
  };
  
  res.json(config);
});

// Start server
app.listen(PORT, () => {
  console.log(`PesaPal proxy server running on port ${PORT}`);
  console.log(`Environment: ${PESAPAL_CONFIG.environment}`);
  console.log(`PesaPal URL: ${PESAPAL_BASE_URL}`);
}); 