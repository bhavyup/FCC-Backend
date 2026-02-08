const express = require('express');
const cors = require('cors');
const dns = require('dns');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// In-memory database
let urlDatabase = [];
let counter = 0;

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST - Create short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  console.log('Received URL:', originalUrl);

  if (!originalUrl) {
    console.log('No URL provided');
    return res.json({ error: 'invalid url' });
  }

  // Try to parse URL
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
    console.log('Parsed successfully:', parsedUrl.href);
    console.log('Protocol:', parsedUrl.protocol);
    console.log('Hostname:', parsedUrl.hostname);
  } catch (e) {
    console.log('Parse error:', e.message);
    return res.json({ error: 'invalid url' });
  }

  // Check protocol
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    console.log('Bad protocol:', parsedUrl.protocol);
    return res.json({ error: 'invalid url' });
  }

  // DNS lookup
  dns.lookup(parsedUrl.hostname, (err, address) => {
    if (err) {
      console.log('DNS error:', err.message);
      return res.json({ error: 'invalid url' });
    }

    console.log('DNS resolved:', parsedUrl.hostname, '->', address);

    // Check if exists
    const existing = urlDatabase.find(u => u.original_url === originalUrl);
    if (existing) {
      return res.json({
        original_url: existing.original_url,
        short_url: existing.short_url
      });
    }

    // Create new
    counter++;
    const newEntry = {
      original_url: originalUrl,
      short_url: counter
    };
    urlDatabase.push(newEntry);

    console.log('Created:', newEntry);

    return res.json({
      original_url: newEntry.original_url,
      short_url: newEntry.short_url
    });
  });
});

// GET - Redirect
app.get('/api/shorturl/:short_url', (req, res) => {
  console.log('Redirect request:', req.params.short_url);

  const shortUrl = parseInt(req.params.short_url, 10);

  if (isNaN(shortUrl)) {
    return res.json({ error: 'Wrong format' });
  }

  const entry = urlDatabase.find(u => u.short_url === shortUrl);

  if (!entry) {
    console.log('Not found. Database:', urlDatabase);
    return res.json({ error: 'No short URL found' });
  }

  console.log('Redirecting to:', entry.original_url);
  return res.redirect(entry.original_url);
});

// GET - List URLs
app.get('/api/urls', (req, res) => {
  res.json(urlDatabase);
});

// Static files AFTER API routes
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});