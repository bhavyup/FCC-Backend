require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3003;

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
    db = client.db('exercisetracker');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// USER ROUTES
// ============================================

// POST /api/users - Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;

    console.log('POST /api/users:', username);

    if (!username) {
      return res.json({ error: 'Username is required' });
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return res.json({
        username: existingUser.username,
        _id: existingUser._id.toString()
      });
    }

    // Create new user
    const result = await db.collection('users').insertOne({ username });

    console.log('Created user:', { username, _id: result.insertedId });

    res.json({
      username: username,
      _id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.json({ error: 'Server error' });
  }
});

// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
  try {
    console.log('GET /api/users');

    const users = await db.collection('users').find({}).toArray();

    const result = users.map(u => ({
      username: u.username,
      _id: u._id.toString()
    }));

    res.json(result);
  } catch (error) {
    console.error('Error getting users:', error);
    res.json({ error: 'Server error' });
  }
});

// ============================================
// EXERCISE ROUTES
// ============================================

// POST /api/users/:_id/exercises - Add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    console.log('POST exercise:', { _id, description, duration, date });

    if (!description) {
      return res.json({ error: 'Description is required' });
    }

    if (!duration) {
      return res.json({ error: 'Duration is required' });
    }

    // Find user
    let user;
    try {
      user = await db.collection('users').findOne({ _id: new ObjectId(_id) });
    } catch (e) {
      return res.json({ error: 'Invalid user ID format' });
    }

    if (!user) {
      return res.json({ error: 'User not found' });
    }

    // Parse date
    let exerciseDate;
    if (date && date !== '') {
      exerciseDate = new Date(date);
      if (isNaN(exerciseDate.getTime())) {
        exerciseDate = new Date();
      }
    } else {
      exerciseDate = new Date();
    }

    // Create exercise
    const exercise = {
      userId: _id,
      description: String(description),
      duration: parseInt(duration),
      date: exerciseDate
    };

    await db.collection('exercises').insertOne(exercise);

    console.log('Created exercise:', exercise);

    res.json({
      _id: user._id.toString(),
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exerciseDate.toDateString()
    });
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.json({ error: 'Server error' });
  }
});

// ============================================
// LOG ROUTES
// ============================================

// GET /api/users/:_id/logs - Get exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    console.log('GET logs:', { _id, from, to, limit });

    // Find user
    let user;
    try {
      user = await db.collection('users').findOne({ _id: new ObjectId(_id) });
    } catch (e) {
      return res.json({ error: 'Invalid user ID format' });
    }

    if (!user) {
      return res.json({ error: 'User not found' });
    }

    // Build query
    let query = { userId: _id };

    // Date filters
    if (from || to) {
      query.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          query.date.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          query.date.$lte = toDate;
        }
      }
      // Remove empty date query
      if (Object.keys(query.date).length === 0) {
        delete query.date;
      }
    }

    // Get exercises
    let exercisesQuery = db.collection('exercises')
      .find(query)
      .sort({ date: 1 });

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        exercisesQuery = exercisesQuery.limit(limitNum);
      }
    }

    const exercises = await exercisesQuery.toArray();

    // Format log
    const log = exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: new Date(e.date).toDateString()
    }));

    res.json({
      _id: user._id.toString(),
      username: user.username,
      count: log.length,
      log: log
    });
  } catch (error) {
    console.error('Error getting logs:', error);
    res.json({ error: 'Server error' });
  }
});

// Debug endpoint
app.get('/api/debug', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    const exercises = await db.collection('exercises').find({}).toArray();
    res.json({ 
      usersCount: users.length,
      exercisesCount: exercises.length,
      users, 
      exercises 
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
    console.log(`🚀 Exercise Tracker running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});