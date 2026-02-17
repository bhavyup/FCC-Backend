/**
 * PULSE — Exercise Tracker
 * Fitness visualized as living rhythm.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;
const NODE_ENV = process.env.NODE_ENV || 'development';
const BASE_PATH = '';

// ============================================
// STORAGE
// ============================================

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.exercises = new Map();
    this.userCounter = 0;
    this.exerciseCounter = 0;
  }

  async createUser(username) {
    this.userCounter++;
    const _id = this.userCounter.toString();
    const user = { _id, username };
    this.users.set(_id, user);
    return user;
  }

  async findUserById(_id) {
    return this.users.get(_id) || null;
  }

  async findUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  async getAllUsers() {
    return Array.from(this.users.values());
  }

  async createExercise(userId, description, duration, date) {
    this.exerciseCounter++;
    const _id = this.exerciseCounter.toString();
    const exercise = {
      _id,
      userId,
      description: String(description),
      duration: parseInt(duration),
      date: date || new Date()
    };
    this.exercises.set(_id, exercise);
    return exercise;
  }

  async getExercisesByUser(userId, from, to, limit) {
    let exercises = [];
    for (const ex of this.exercises.values()) {
      if (ex.userId === userId) exercises.push(ex);
    }

    // Sort by date ascending
    exercises.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Date filtering
    if (from) {
      const fromDate = new Date(from);
      exercises = exercises.filter(e => new Date(e.date) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      exercises = exercises.filter(e => new Date(e.date) <= toDate);
    }

    // Limit
    if (limit && parseInt(limit) > 0) {
      exercises = exercises.slice(0, parseInt(limit));
    }

    return exercises;
  }
}

class MongoStore {
  constructor(db) {
    this.db = db;
    this.users = db.collection('users');
    this.exercises = db.collection('exercises');
  }

  async createUser(username) {
    const result = await this.users.insertOne({ username });
    return { _id: result.insertedId.toString(), username };
  }

  async findUserById(_id) {
    const { ObjectId } = require('mongodb');
    try {
      const user = await this.users.findOne({ _id: new ObjectId(_id) });
      return user ? { _id: user._id.toString(), username: user.username } : null;
    } catch {
      return null;
    }
  }

  async findUserByUsername(username) {
    const user = await this.users.findOne({ username });
    return user ? { _id: user._id.toString(), username: user.username } : null;
  }

  async getAllUsers() {
    const users = await this.users.find({}).toArray();
    return users.map(u => ({ _id: u._id.toString(), username: u.username }));
  }

  async createExercise(userId, description, duration, date) {
    const exercise = {
      userId,
      description: String(description),
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    };
    const result = await this.exercises.insertOne(exercise);
    return { _id: result.insertedId.toString(), ...exercise };
  }

  async getExercisesByUser(userId, from, to, limit) {
    const query = { userId };
    
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    let cursor = this.exercises.find(query).sort({ date: 1 });
    
    if (limit && parseInt(limit) > 0) {
      cursor = cursor.limit(parseInt(limit));
    }

    const exercises = await cursor.toArray();
    return exercises.map(e => ({
      _id: e._id.toString(),
      userId: e.userId,
      description: e.description,
      duration: e.duration,
      date: e.date
    }));
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
      store = new MongoStore(client.db('pulse'));
      console.log('[PULSE] Connected to MongoDB');
    } catch (err) {
      console.warn('[PULSE] MongoDB failed, using memory:', err.message);
      store = new MemoryStore();
    }
  } else {
    store = new MemoryStore();
    console.log('[PULSE] Using in-memory storage');
  }
}

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "*"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://freecodecamp.org", "https://cdn.freecodecamp.org", "unsafe-eval"],
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
  message: { error: 'Rate limit exceeded' },
});
app.use(`${BASE_PATH}/api/`, limiter);

// Static files with base path
app.use(BASE_PATH, express.static(path.join(__dirname, 'public'), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0
}));

// ============================================
// ROUTES
// ============================================

// Health check
app.get(`${BASE_PATH}/health`, (req, res) => {
  res.json({ status: 'operational', service: 'pulse', timestamp: Date.now() });
});

// fCC Test 2 & 3: POST /api/users — Create user
app.post(`${BASE_PATH}/api/users`, async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.json({ error: 'Username is required' });
    }

    // Check existing
    const existing = await store.findUserByUsername(username);
    if (existing) {
      return res.json({ username: existing.username, _id: existing._id });
    }

    const user = await store.createUser(username.trim());
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// fCC Test 4, 5, 6: GET /api/users — List all users
app.get(`${BASE_PATH}/api/users`, async (req, res) => {
  try {
    const users = await store.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// fCC Test 7 & 8: POST /api/users/:_id/exercises — Add exercise
app.post(`${BASE_PATH}/api/users/:_id/exercises`, async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    // Validate user exists
    const user = await store.findUserById(_id);
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    // Validate required fields
    if (!description) {
      return res.json({ error: 'Description is required' });
    }
    if (!duration || isNaN(parseInt(duration))) {
      return res.json({ error: 'Duration must be a number' });
    }

    // Create exercise
    const exercise = await store.createExercise(_id, description, duration, date);

    // Return user object with exercise fields added
    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString()
    });
  } catch (err) {
    console.error('Add exercise error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// fCC Test 9-16: GET /api/users/:_id/logs — Get exercise log
app.get(`${BASE_PATH}/api/users/:_id/logs`, async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    // Validate user exists
    const user = await store.findUserById(_id);
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    // Get exercises with optional filters
    const exercises = await store.getExercisesByUser(_id, from, to, limit);

    // Format log entries
    const log = exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: new Date(e.date).toDateString()
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log
    });
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve index.html for root
app.get(`${BASE_PATH}*`, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal error' });
});

// ============================================
// START
// ============================================

initStore().then(() => {
  app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════╗
    ║  PULSE                             ║
    ║  Exercise Tracker                  ║
    ╚════════════════════════════════════╝
    Port: ${PORT}
    Base: ${BASE_PATH}
    Env:  ${NODE_ENV}
    `);
  });
}).catch(err => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});