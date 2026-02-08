// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));

// Trust proxy for getting real IP behind reverse proxies (Render, Heroku, etc.)
app.set('trust proxy', true);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint - Who Am I
app.get('/api/whoami', (req, res) => {
  // Get IP address
  const ipaddress = req.ip || 
                    req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress;

  // Get preferred language (first language in Accept-Language header)
  const language = req.headers['accept-language'] || 'unknown';

  // Get software (User-Agent header)
  const software = req.headers['user-agent'] || 'unknown';

  res.json({
    ipaddress: ipaddress,
    language: language,
    software: software
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Request Header Parser running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
});