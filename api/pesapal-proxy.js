export default async function handler(req, res) {
  // Pesapal API base
  const PESA_BASE = process.env.PESAPAL_API_BASE || 'https://pay.pesapal.com/v3/api';

  // Helper to forward requests to Pesapal
  async function forwardPesapal(path, options = {}) {
    const url = `${PESA_BASE}${path}`;
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  // Route: /api/pesapal-proxy/Auth/RequestToken
  if (req.method === 'POST' && req.url.endsWith('/Auth/RequestToken')) {
    const { consumer_key, consumer_secret } = req.body || req.query || {};
    // Use env if not provided
    const key = consumer_key || process.env.PESAPAL_CONSUMER_KEY;
    const secret = consumer_secret || process.env.PESAPAL_CONSUMER_SECRET;

    const { status, data } = await forwardPesapal('/Auth/RequestToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
    });
    res.status(status).json(data);
    return;
  }

  // Route: /api/pesapal-proxy/Transactions/SubmitOrderRequest
  if (req.method === 'POST' && req.url.endsWith('/Transactions/SubmitOrderRequest')) {
    const token = req.headers['authorization'] || '';
    const { status, data } = await forwardPesapal('/Transactions/SubmitOrderRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(req.body),
    });
    res.status(status).json(data);
    return;
  }

  // Route: /api/pesapal-proxy/Transactions/GetTransactionStatus
  if (req.method === 'GET' && req.url.includes('/Transactions/GetTransactionStatus')) {
    const token = req.headers['authorization'] || '';
    const query = req.url.split('?')[1] ? '?' + req.url.split('?')[1] : '';
    const { status, data } = await forwardPesapal(`/Transactions/GetTransactionStatus${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': token,
      },
    });
    res.status(status).json(data);
    return;
  }

  // Not found
  res.status(404).json({ error: 'Not found' });
} 