// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint - empty date parameter (current time)
app.get('/api', (req, res) => {
  const now = new Date();
  res.json({
    unix: now.getTime(),
    utc: now.toUTCString()
  });
});

// API endpoint - with date parameter
app.get('/api/:date', (req, res) => {
  const { date } = req.params;
  let parsedDate;

  // Check if it's a Unix timestamp (all digits)
  if (/^\d+$/.test(date)) {
    parsedDate = new Date(parseInt(date));
  } else {
    parsedDate = new Date(date);
  }

  // Check if date is valid
  if (parsedDate.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Timestamp Microservice running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
});