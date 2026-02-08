// server.js
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const url = require('url');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;

// Database file path
const DB_FILE = path.join(__dirname, 'data', 'urls.json');

// Ensure data directory and file exist
function initDatabase() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ urls: [], counter: 0 }));
  }
}

// Read database
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { urls: [], counter: 0 };
  }
}

// Write database
function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Initialize database on startup
initDatabase();

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));

// IMPORTANT: Body parsers for both JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint - Create short URL (POST)
app.post('/api/shorturl', (req, res) => {
  // Get URL from body (works for both JSON and form-urlencoded)
  const originalUrl = req.body.url;

  console.log('Received URL:', originalUrl); // Debug log

  // Validate URL exists
  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }

  // Parse the URL to validate format
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (error) {
    console.log('URL parse error:', error.message);
    return res.json({ error: 'invalid url' });
  }

  // Check if protocol is http or https
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    console.log('Invalid protocol:', parsedUrl.protocol);
    return res.json({ error: 'invalid url' });
  }

  // Get hostname for DNS lookup
  const hostname = parsedUrl.hostname;
  console.log('Looking up hostname:', hostname);

  // DNS lookup to verify the domain exists
  dns.lookup(hostname, (err, address) => {
    if (err) {
      console.log('DNS lookup error:', err.message);
      return res.json({ error: 'invalid url' });
    }

    console.log('DNS resolved to:', address);

    // Read current database
    const db = readDatabase();

    // Check if URL already exists
    const existingUrl = db.urls.find(item => item.original_url === originalUrl);
    if (existingUrl) {
      console.log('URL already exists:', existingUrl);
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }

    // Create new short URL
    db.counter += 1;
    const newEntry = {
      original_url: originalUrl,
      short_url: db.counter
    };
    db.urls.push(newEntry);

    // Save to database
    writeDatabase(db);

    console.log('Created new short URL:', newEntry);

    res.json({
      original_url: newEntry.original_url,
      short_url: newEntry.short_url
    });
  });
});

// API endpoint - Redirect to original URL (GET)
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrlParam = req.params.short_url;
  
  console.log('Redirect request for:', shortUrlParam);

  // Parse the short URL as integer
  const shortUrl = parseInt(shortUrlParam, 10);

  // Check if it's a valid number
  if (isNaN(shortUrl)) {
    return res.json({ error: 'Wrong format' });
  }

  // Read database
  const db = readDatabase();

  // Find the URL entry
  const urlEntry = db.urls.find(item => item.short_url === shortUrl);

  if (!urlEntry) {
    console.log('Short URL not found:', shortUrl);
    return res.json({ error: 'No short URL found for the given input' });
  }

  console.log('Redirecting to:', urlEntry.original_url);

  // Redirect to original URL
  res.redirect(urlEntry.original_url);
});

// API endpoint - Get all URLs (for display)
app.get('/api/urls', (req, res) => {
  const db = readDatabase();
  res.json(db.urls);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 URL Shortener running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
});