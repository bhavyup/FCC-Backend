/**
 * Knot — URL Shortener
 * Production-grade microservice with craft-inspired UX.
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
// STORAGE
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
    const doc = { 
      original_url: originalUrl, 
      short_url: this.counter,
      created_at: new Date().toISOString()
    };
    this.urls.set(this.counter, doc);
    return doc;
  }
  
  async list(limit = 50) {
    const items = [...this.urls.values()];
    return items.slice(-limit).reverse();
  }
  
  async count() {
    return this.counter;
  }
}

class MongoStore {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('urls');
    this.counters = db.collection('counters');
  }
  
  async findByOriginal(url) {
    return this.collection.findOne({ original_url: url });
  }
  
  async findByShort(id) {
    return this.collection.findOne({ short_url: Number(id) });
  }
  
  async create(originalUrl) {
    const counter = await this.counters.findOneAndUpdate(
      { _id: 'url_counter' },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    const doc = { 
      original_url: originalUrl, 
      short_url: counter.count,
      created_at: new Date().toISOString()
    };
    await this.collection.insertOne(doc);
    return doc;
  }
  
  async list(limit = 50) {
    return this.collection
      .find({})
      .sort({ short_url: -1 })
      .limit(limit)
      .toArray();
  }
  
  async count() {
    const c = await this.counters.findOne({ _id: 'url_counter' });
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
      store = new MongoStore(client.db('knot'));
      console.log('[Knot] Connected to MongoDB');
    } catch (err) {
      console.warn('[Knot] MongoDB failed, using memory:', err.message);
      store = new MemoryStore();
    }
  } else {
    store = new MemoryStore();
    console.log('[Knot] Using in-memory storage');
  }
}

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "*"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));
app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Rate limit exceeded. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0
}));

// ============================================
// VALIDATION
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
    service: 'knot',
    uptime: Math.floor(process.uptime()),
    timestamp: Date.now()
  });
});

// fCC Test 2: POST /api/shorturl
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

// fCC Test 3: GET /api/shorturl/:id (redirect)
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

app.get('/api/urls', async (req, res) => {
  try {
    const urls = await store.list();
    const count = await store.count();
    res.json({ count, urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal error' : err.message
  });
});

// ============================================
// START
// ============================================

initStore().then(() => {
  app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════╗
    ║  Knot                              ║
    ║  URL Shortener                     ║
    ╚════════════════════════════════════╝
    Port: ${PORT}
    Env:  ${NODE_ENV}
    `);
  });
}).catch(err => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});