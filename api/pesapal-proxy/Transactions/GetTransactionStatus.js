export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const token = req.headers['authorization'] || '';
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';

  try {
    const response = await fetch(
      `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus${query}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: token,
        },
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get transaction status from Pesapal' });
  }
}
