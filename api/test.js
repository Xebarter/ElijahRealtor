export default function handler(req, res) {
  console.log('Test function called:', req.method, req.url);
  res.status(200).json({ message: 'Test function working', url: req.url });
} 