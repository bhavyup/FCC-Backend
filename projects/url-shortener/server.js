require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3002;

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables!');
  process.exit(1);
}

let db;

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db('urlshortener');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// URL SHORTENER ROUTES
// ============================================

// POST /api/shorturl - Create short URL
app.post('/api/shorturl', async (req, res) => {
  try {
    const originalUrl = req.body.url;
    console.log('POST /api/shorturl:', originalUrl);

    // 1. Validate format using URL constructor
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
    dns.lookup(parsedUrl.hostname, async (err, address) => {
      if (err || !address) {
        console.log('DNS lookup failed for:', parsedUrl.hostname);
        return res.json({ error: 'invalid url' });
      }

      try {
        // Check if URL already exists
        const existing = await db.collection('urls').findOne({ original_url: originalUrl });
        if (existing) {
          return res.json({
            original_url: existing.original_url,
            short_url: existing.short_url
          });
        }

        // Get next counter value
        const counterDoc = await db.collection('counters').findOneAndUpdate(
          { _id: 'url_counter' },
          { $inc: { count: 1 } },
          { upsert: true, returnDocument: 'after' }
        );

        const shortUrl = counterDoc.count;

        // Create new URL entry
        const newEntry = {
          original_url: originalUrl,
          short_url: shortUrl
        };

        await db.collection('urls').insertOne(newEntry);

        console.log('Created:', newEntry);

        res.json({
          original_url: originalUrl,
          short_url: shortUrl
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        res.json({ error: 'Server error' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({ error: 'Server error' });
  }
});

// GET /api/shorturl/:short_url - Redirect to original URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const shorturl = req.params.short_url;
    console.log('GET /api/shorturl/', shorturl);

    // Find URL in database
    const urlDoc = await db.collection('urls').findOne({ short_url: parseInt(shorturl) });

    if (!urlDoc) {
      return res.json({ error: 'No short URL found' });
    }

    console.log('Redirecting to:', urlDoc.original_url);
    res.redirect(urlDoc.original_url);
  } catch (error) {
    console.error('Error:', error);
    res.json({ error: 'Server error' });
  }
});

// GET /api/urls - Get all URLs (for debugging)
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await db.collection('urls').find({}).toArray();
    const counter = await db.collection('counters').findOne({ _id: 'url_counter' });
    res.json({ 
      count: urls.length,
      counter: counter ? counter.count : 0,
      urls 
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', db: db ? 'connected' : 'disconnected' });
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 URL Shortener running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});