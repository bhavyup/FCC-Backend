const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3003;

// Database file path
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Initialize database
function initDatabase() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], exercises: [] }));
  }
}

// Read database
function readDatabase() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { users: [], exercises: [] };
  }
}

// Write database
function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Initialize
initDatabase();

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
app.post('/api/users', (req, res) => {
  const { username } = req.body;

  console.log('POST /api/users:', username);

  if (!username) {
    return res.json({ error: 'Username is required' });
  }

  const db = readDatabase();

  // Check if username already exists
  const existingUser = db.users.find(u => u.username === username);
  if (existingUser) {
    return res.json({
      username: existingUser.username,
      _id: existingUser._id
    });
  }

  // Create new user
  const newUser = {
    username: username,
    _id: generateId()
  };

  db.users.push(newUser);
  writeDatabase(db);

  console.log('Created user:', newUser);

  res.json({
    username: newUser.username,
    _id: newUser._id
  });
});

// GET /api/users - Get all users
app.get('/api/users', (req, res) => {
  console.log('GET /api/users');

  const db = readDatabase();

  const users = db.users.map(u => ({
    username: u.username,
    _id: u._id
  }));

  res.json(users);
});

// ============================================
// EXERCISE ROUTES
// ============================================

// POST /api/users/:_id/exercises - Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  console.log('POST /api/users/:_id/exercises:', { _id, description, duration, date });

  if (!description) {
    return res.json({ error: 'Description is required' });
  }

  if (!duration) {
    return res.json({ error: 'Duration is required' });
  }

  const db = readDatabase();

  // Find user
  const user = db.users.find(u => u._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Parse date - use current date if not provided
  let exerciseDate;
  if (date) {
    exerciseDate = new Date(date);
  } else {
    exerciseDate = new Date();
  }

  // Check if date is valid
  if (isNaN(exerciseDate.getTime())) {
    exerciseDate = new Date();
  }

  // Create exercise
  const newExercise = {
    userId: _id,
    description: description,
    duration: parseInt(duration),
    date: exerciseDate.toISOString()
  };

  db.exercises.push(newExercise);
  writeDatabase(db);

  console.log('Created exercise:', newExercise);

  // Return user object with exercise fields
  res.json({
    _id: user._id,
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: exerciseDate.toDateString()
  });
});

// ============================================
// LOG ROUTES
// ============================================

// GET /api/users/:_id/logs - Get exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  console.log('GET /api/users/:_id/logs:', { _id, from, to, limit });

  const db = readDatabase();

  // Find user
  const user = db.users.find(u => u._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Get user's exercises
  let exercises = db.exercises.filter(e => e.userId === _id);

  // Filter by 'from' date
  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      exercises = exercises.filter(e => new Date(e.date) >= fromDate);
    }
  }

  // Filter by 'to' date
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      exercises = exercises.filter(e => new Date(e.date) <= toDate);
    }
  }

  // Sort by date
  exercises.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Apply limit
  if (limit) {
    const limitNum = parseInt(limit);
    if (!isNaN(limitNum) && limitNum > 0) {
      exercises = exercises.slice(0, limitNum);
    }
  }

  // Format log
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
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json(readDatabase());
});

// Start server
app.listen(PORT, () => {
  console.log(`Exercise Tracker running on port ${PORT}`);
});