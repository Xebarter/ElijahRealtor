export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  let body = req.body;

  if (!body) {
    body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      });
      req.on('error', reject);
    });
  }

  const consumer_key = body.consumer_key || process.env.PESAPAL_CONSUMER_KEY;
  const consumer_secret = body.consumer_secret || process.env.PESAPAL_CONSUMER_SECRET;

  try {
    const response = await fetch('https://pay.pesapal.com/v3/api/Auth/RequestToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ consumer_key, consumer_secret }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to Pesapal' });
  }
}
