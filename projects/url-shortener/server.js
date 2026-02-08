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
    return res.json({ error: 'invalid url' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (e) {
    console.log('Parse error:', e.message);
    return res.json({ error: 'invalid url' });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    console.log('Bad protocol:', parsedUrl.protocol);
    return res.json({ error: 'invalid url' });
  }

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
  const param = req.params.short_url;
  console.log('Redirect request:', param);

  const shortUrl = parseInt(param, 10);

  if (isNaN(shortUrl)) {
    return res.json({ error: 'Wrong format' });
  }

  const entry = urlDatabase.find(u => u.short_url === shortUrl);

  if (!entry) {
    console.log('Not found. DB:', JSON.stringify(urlDatabase));
    return res.json({ error: 'No short URL found' });
  }

  console.log('Redirecting to:', entry.original_url);
  res.redirect(entry.original_url);
});

// GET - List URLs (for debugging)
app.get('/api/urls', (req, res) => {
  res.json({ count: urlDatabase.length, urls: urlDatabase });
});

// Static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Database cleared - fresh start');
});