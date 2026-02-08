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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint - Create short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL format
  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }

  // Parse the URL
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  // Check if protocol is http or https
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  // DNS lookup to verify the domain exists
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Read current database
    const db = readDatabase();

    // Check if URL already exists
    const existingUrl = db.urls.find(item => item.original_url === originalUrl);
    if (existingUrl) {
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

    res.json({
      original_url: newEntry.original_url,
      short_url: newEntry.short_url
    });
  });
});

// API endpoint - Redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  if (isNaN(shortUrl)) {
    return res.json({ error: 'Wrong format' });
  }

  // Read database
  const db = readDatabase();

  // Find the URL
  const urlEntry = db.urls.find(item => item.short_url === shortUrl);

  if (!urlEntry) {
    return res.json({ error: 'No short URL found for the given input' });
  }

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