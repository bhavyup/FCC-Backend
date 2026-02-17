/**
 * KINETIC Exercise Tracker API
 * Production-grade Express + MongoDB implementation
 * 
 * FCC Requirements Compliance:
 * - POST /api/users: Create user, returns {username, _id}
 * - GET /api/users: Returns array of users
 * - POST /api/users/:_id/exercises: Add exercise, returns user obj + exercise fields
 * - GET /api/users/:_id/logs: Returns user obj with count and log array
 * - Query params: from, to, limit for filtering
 * - Date format: dateString (e.g., "Mon Jan 01 2024")
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3003;

// Environment validation
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('[FATAL] MONGO_URI environment variable required');
    process.exit(1);
}

// Database connection
let db = null;
let client = null;

async function connectDatabase() {
    try {
        client = new MongoClient(MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        await client.connect();
        db = client.db('kinetic_tracker');
        
        // Ensure indexes
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        await db.collection('exercises').createIndex({ userId: 1, date: -1 });
        
        console.log('[DB] Connected to MongoDB Atlas');
        return true;
    } catch (error) {
        console.error('[DB] Connection failed:', error.message);
        return false;
    }
}

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/exercise-tracker', express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES
// ============================================

// Health check
router.get('/api/health', (req, res) => {
    res.json({ 
        status: 'operational', 
        database: db ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

router.get('/api/docs', (req, res) => {
    res.json({
        name: 'KINETIC Exercise Tracker API',
        version: '1.0.0',
        description: 'API for tracking user exercises with MongoDB backend',
        endpoints: {
            'GET /api/docs': {
                description: 'Returns API documentation',
                example: '/api/docs'
            },
            'GET /api/users': {
                description: 'Returns list of all users',
                example: '/api/users'
            },
            'POST /api/users': {
                description: 'Creates a new user',
                example: '/api/users'
            },
            'POST /api/users/:_id/exercises': {
                description: 'Adds an exercise for a specific user',
                example: '/api/users/1234567890abcdef12345678/exercises'
            },
            'GET /api/users/:_id/logs': {
                description: 'Returns exercise logs for a specific user',
                example: '/api/users/1234567890abcdef12345678/logs'
            }
        }
    });
}); 

// GET /api/users - List all users
router.get('/api/users', async (req, res) => {
    try {
        if (!db) throw new Error('Database not connected');
        
        const users = await db.collection('users')
            .find({}, { projection: { username: 1 } })
            .sort({ username: 1 })
            .toArray();
        
        // Format: array of {username, _id}
        const formattedUsers = users.map(user => ({
            username: user.username,
            _id: user._id.toString()
        }));
        
        res.json(formattedUsers);
    } catch (error) {
        console.error('[ERROR] GET /api/users:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/users - Create new user
router.post('/api/users', async (req, res) => {
    try {
        if (!db) throw new Error('Database not connected');
        
        const { username } = req.body;
        
        if (!username || typeof username !== 'string' || username.trim() === '') {
            return res.status(400).json({ error: 'Username is required' });
        }
        
        const cleanUsername = username.trim();
        
        // Check if user exists
        const existingUser = await db.collection('users').findOne({ 
            username: cleanUsername 
        });
        
        if (existingUser) {
            return res.json({ 
                username: existingUser.username, 
                _id: existingUser._id.toString(),
                existing: true
            });
        }
        
        // Create new user
        const result = await db.collection('users').insertOne({
            username: cleanUsername,
            createdAt: new Date()
        });
        
        res.json({
            username: cleanUsername,
            _id: result.insertedId.toString()
        });
        
    } catch (error) {
        console.error('[ERROR] POST /api/users:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/users/:_id/exercises - Add exercise
router.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        if (!db) throw new Error('Database not connected');
        
        const { _id } = req.params;
        const { description, duration, date } = req.body;
        
        // Validation
        if (!description || typeof description !== 'string' || description.trim() === '') {
            return res.status(400).json({ error: 'Description is required' });
        }
        
        if (!duration || isNaN(parseInt(duration))) {
            return res.status(400).json({ error: 'Duration must be a number' });
        }
        
        // Validate ObjectId
        let userId;
        try {
            userId = new ObjectId(_id);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        // Find user
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Parse date - if invalid or not provided, use current date
        let exerciseDate;
        if (date && date.trim() !== '') {
            exerciseDate = new Date(date);
            if (isNaN(exerciseDate.getTime())) {
                exerciseDate = new Date();
            }
        } else {
            exerciseDate = new Date();
        }
        
        // Create exercise
        const exercise = {
            userId: _id, // Store as string for easier querying
            description: description.trim(),
            duration: parseInt(duration),
            date: exerciseDate,
            createdAt: new Date()
        };
        
        await db.collection('exercises').insertOne(exercise);
        
        // Return user object with exercise fields added (FCC requirement)
        res.json({
            _id: user._id.toString(),
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exerciseDate.toDateString() // FCC: dateString format
        });
        
    } catch (error) {
        console.error('[ERROR] POST /api/users/:_id/exercises:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/users/:_id/logs - Get exercise logs
router.get('/api/users/:_id/logs', async (req, res) => {
    try {
        if (!db) throw new Error('Database not connected');
        
        const { _id } = req.params;
        const { from, to, limit } = req.query;
        
        // Validate ObjectId
        let userId;
        try {
            userId = new ObjectId(_id);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        // Find user
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Build query
        const query = { userId: _id };
        
        // Date filtering
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
                    // Set to end of day for inclusive "to" date
                    toDate.setHours(23, 59, 59, 999);
                    query.date.$lte = toDate;
                }
            }
            
            // Remove empty date object
            if (Object.keys(query.date).length === 0) {
                delete query.date;
            }
        }
        
        // Build aggregation pipeline
        let pipeline = [
            { $match: query },
            { $sort: { date: -1 } } // Newest first
        ];
        
        // Apply limit if provided
        if (limit) {
            const limitNum = parseInt(limit);
            if (!isNaN(limitNum) && limitNum > 0) {
                pipeline.push({ $limit: limitNum });
            }
        }
        
        // Get exercises
        const exercises = await db.collection('exercises').aggregate(pipeline).toArray();
        
        // Format log array per FCC requirements:
        // - description: string
        // - duration: number
        // - date: string (dateString format)
        const log = exercises.map(ex => ({
            description: ex.description,
            duration: ex.duration,
            date: ex.date.toDateString()
        }));
        
        // Return user object with count and log
        res.json({
            _id: user._id.toString(),
            username: user.username,
            count: log.length,
            log: log
        });
        
    } catch (error) {
        console.error('[ERROR] GET /api/users/:_id/logs:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve frontend
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/', router);
app.use('/exercise-tracker', router);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[FATAL]', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[SYSTEM] SIGTERM received, shutting down gracefully');
    if (client) await client.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[SYSTEM] SIGINT received, shutting down gracefully');
    if (client) await client.close();
    process.exit(0);
});

// Start server
async function startServer() {
    const connected = await connectDatabase();
    if (!connected) {
        console.error('[FATAL] Could not connect to database');
        process.exit(1);
    }
    
    app.listen(PORT, () => {
        console.log(`[SERVER] KINETIC API running on port ${PORT}`);
        console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

startServer();

module.exports = app;