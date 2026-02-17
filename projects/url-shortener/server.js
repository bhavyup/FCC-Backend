/**
 * Bolt — URL Compression Engine
 * Production-grade URL shortening microservice.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
const { promisify } = require('util');
const path = require('path');

const dnsLookup = promisify(dns.lookup);

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// STORAGE ABSTRACTION
// ============================================

class MemoryStore {
  constructor() {
    this.urls = new Map();
    this.counter = 0;
  }
  async findByOriginal(url) {
    for (const [, doc] of this.urls) {
      if (doc.original_url === url) return doc;
    }
    return null;
  }
  async findByShort(id) {
    return this.urls.get(Number(id)) || null;
  }
  async create(originalUrl) {
    this.counter++;
    const doc = { original_url: originalUrl, short_url: this.counter };
    this.urls.set(this.counter, doc);
    return doc;
  }
  async list() {
    return [...this.urls.values()].reverse();
  }
  async count() {
    return this.counter;
  }
}

class MongoStore {
  constructor(db) {
    this.db = db;
  }
  async findByOriginal(url) {
    return this.db.collection('urls').findOne({ original_url: url });
  }
  async findByShort(id) {
    return this.db.collection('urls').findOne({ short_url: Number(id) });
  }
  async create(originalUrl) {
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: 'url_counter' },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    const doc = { original_url: originalUrl, short_url: counter.count };
    await this.db.collection('urls').insertOne(doc);
    return doc;
  }
  async list() {
    return this.db.collection('urls').find({}).sort({ short_url: -1 }).limit(50).toArray();
  }
  async count() {
    const c = await this.db.collection('counters').findOne({ _id: 'url_counter' });
    return c ? c.count : 0;
  }
}

let store;

async function initStore() {
  const uri = process.env.MONGO_URI;
  if (uri) {
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(uri);
      await client.connect();
      store = new MongoStore(client.db('urlshortener'));
      console.log('  Storage:     MongoDB Atlas');
    } catch (err) {
      console.warn('  MongoDB failed, falling back to memory:', err.message);
      store = new MemoryStore();
    }
  } else {
    store = new MemoryStore();
    console.log('  Storage:     In-memory (set MONGO_URI for persistence)');
  }
}

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "*"],
      scriptSrc: ["'self'", "https://cdn.freecodecamp.org"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}));

// ============================================
// URL VALIDATION
// ============================================

async function validateUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }
  try {
    await dnsLookup(parsed.hostname);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: NODE_ENV
  });
});

app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Bolt',
    version: '2.0.0',
    description: 'URL compression engine',
    endpoints: {
      'POST /api/shorturl': {
        description: 'Shorten a URL',
        body: { url: 'string — full URL with http/https protocol' },
        response: '{ original_url, short_url }',
        errors: '{ error: "invalid url" }'
      },
      'GET /api/shorturl/:id': {
        description: 'Redirect to original URL (302)'
      },
      'GET /api/urls': {
        description: 'List all shortened URLs with count'
      },
      'GET /health': {
        description: 'Service health check'
      }
    },
    rateLimit: '100 requests per 15 minutes'
  });
});

// Create short URL
app.post('/api/shorturl', async (req, res) => {
  try {
    const originalUrl = req.body.url;

    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.json({ error: 'invalid url' });
    }

    const trimmed = originalUrl.trim();
    const valid = await validateUrl(trimmed);
    if (!valid) {
      return res.json({ error: 'invalid url' });
    }

    // Return existing entry if URL was already shortened
    const existing = await store.findByOriginal(trimmed);
    if (existing) {
      return res.json({
        original_url: existing.original_url,
        short_url: existing.short_url
      });
    }

    const doc = await store.create(trimmed);
    res.json({
      original_url: doc.original_url,
      short_url: doc.short_url
    });
  } catch (err) {
    console.error('POST /api/shorturl error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect
app.get('/api/shorturl/:id', async (req, res) => {
  try {
    const doc = await store.findByShort(req.params.id);
    if (!doc) {
      return res.json({ error: 'No short URL found for the given input' });
    }
    res.redirect(doc.original_url);
  } catch (err) {
    console.error('GET /api/shorturl/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all URLs
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await store.list();
    const count = await store.count();
    res.json({ count, urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: ['/', '/api/shorturl', '/api/urls', '/api/docs', '/health']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message
  });
});

// ============================================
// START
// ============================================

initStore().then(() => {
  const server = app.listen(PORT, () => {
    console.log('\n  ┌───────────────────────────────┐');
    console.log('  │  Bolt — Server Running          │');
    console.log('  └───────────────────────────────┘\n');
    console.log(`  Environment: ${NODE_ENV}`);
    console.log(`  Port:        ${PORT}`);
    console.log(`  URL:         http://localhost:${PORT}`);
    console.log(`  Health:      http://localhost:${PORT}/health\n`);
  });

  process.on('SIGTERM', () => {
    console.log('\nSIGTERM received. Shutting down...');
    server.close(() => process.exit(0));
  });
}).catch(err => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});