const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;

// Database
const DB_FILE = path.join(__dirname, 'data', 'urls.json');

function initDatabase() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ urls: [], counter: 0 }));
  }
}

function readDatabase() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { urls: [], counter: 0 };
  }
}

function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

initDatabase();

// Enable ALL CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  console.log('POST:', originalUrl);

  // 1. Validate format using the URL constructor
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // 2. Validate Protocol (must be http or https)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  // 3. DNS Lookup to verify domain exists
  dns.lookup(parsedUrl.hostname, (err, address) => {
    // If err exists or address is missing, it's invalid
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    }

    const db = readDatabase();

    // Check existing
    const existing = db.urls.find(u => u.original_url === originalUrl);
    if (existing) {
      return res.json({
        original_url: existing.original_url,
        short_url: existing.short_url
      });
    }

    // Create new
    db.counter++;
    const newEntry = {
      original_url: originalUrl,
      short_url: db.counter
    };
    db.urls.push(newEntry);
    writeDatabase(db);

    res.json({
      original_url: originalUrl,
      short_url: db.counter
    });
  });
});

// GET - Redirect with explicit headers
app.get('/api/shorturl/:short_url', (req, res) => {
  const shorturl = req.params.short_url;
  const db = readDatabase();
  
  // Ensure we compare numbers to numbers (your JSON stores short_url as number)
  const urlDoc = db.urls.find(u => u.short_url === Number(shorturl));

  if (!urlDoc) {
    return res.json({ error: 'No short URL found' });
  }

  // Express handles the headers and status code automatically
  res.redirect(urlDoc.original_url); 
});

app.get('/api/urls', (req, res) => {
  res.json(readDatabase());
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});