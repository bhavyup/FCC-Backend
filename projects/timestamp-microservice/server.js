/**
 * Epoch — Precision Timestamp Instrument
 * A production-grade timestamp conversion microservice.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3010;
const router = express.Router();
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// SECURITY & MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://api.github.com", "*"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://freecodecamp.org", "https://cdn.freecodecamp.org", "unsafe-eval"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  // origin: NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
  optionsSuccessStatus: 200,
  // credentials: true
}));

// Request logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Compression for responses
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/timestamp', express.static(path.join(__dirname, 'public')));

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validates and parses date input
 * @param {string} dateInput - Date string or Unix timestamp
 * @returns {Date|null} Parsed date or null if invalid
 */
const parseDate = (dateInput) => {
  if (!dateInput) return null;

  // Check if it's a Unix timestamp (milliseconds or seconds)
  if (/^\d+$/.test(dateInput)) {
    const timestamp = parseInt(dateInput, 10);
    // Handle both milliseconds and seconds
    const date = timestamp > 10000000000 
      ? new Date(timestamp) 
      : new Date(timestamp * 1000);
    return date.toString() !== 'Invalid Date' ? date : null;
  }

  // Try parsing as date string
  const date = new Date(dateInput);
  return date.toString() !== 'Invalid Date' ? date : null;
};

/**
 * Formats date response with additional metadata
 * @param {Date} date - Date object to format
 * @returns {Object} Formatted response object
 */
const formatDateResponse = (date) => ({
  unix: date.getTime(),
  utc: date.toUTCString(),
  iso: date.toISOString(),
  timestamp: Math.floor(date.getTime() / 1000),
  readable: date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  })
});

// ============================================
// ROUTES
// ============================================

// Home page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: NODE_ENV
  });
});

// API documentation
router.get('/api/docs', (req, res) => {
  res.json({
    name: 'Epoch',
    version: '2.0.0',
    description: 'Precision timestamp conversion instrument',
    endpoints: {
      'GET /api': {
        description: 'Get current timestamp',
        returns: 'Current time in multiple formats'
      },
      'GET /api/:date': {
        description: 'Convert date to timestamp',
        parameters: {
          date: 'ISO date string, Unix timestamp (ms or s), or natural date'
        },
        examples: [
          '/api/2024-01-15',
          '/api/1705276800000',
          '/api/1705276800',
          '/api/December%2025,%202024'
        ]
      },
      'GET /health': {
        description: 'Service health check',
        returns: 'Service status and uptime'
      }
    },
    rateLimit: '100 requests per 15 minutes'
  });
});

// Current timestamp endpoint
router.get('/api', (req, res) => {
  try {
    const now = new Date();
    res.json(formatDateResponse(now));
  } catch (error) {
    console.error('Error in /api endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate timestamp'
    });
  }
});

// Date conversion endpoint
router.get('/api/:date', (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate input
    if (!date || date.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid Date',
        message: 'Date parameter cannot be empty'
      });
    }

    const parsedDate = parseDate(date);

    if (!parsedDate) {
      return res.status(400).json({ 
        error: 'Invalid Date',
        message: 'Unable to parse the provided date format',
        hint: 'Try: ISO date (2024-01-15), Unix timestamp (1705276800000), or natural language'
      });
    }

    res.json(formatDateResponse(parsedDate));
  } catch (error) {
    console.error('Error in /api/:date endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process date conversion'
    });
  }
});

app.use('/', router);
app.use('/timestamp', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: ['/', '/api', '/api/:date', '/api/docs', '/health']
  });
});

// Global error handler
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
// SERVER INITIALIZATION
// ============================================

const server = app.listen(PORT, () => {
  console.log('\n  ┌───────────────────────────────┐');
  console.log('  │  Epoch — Server Running       │');
  console.log('  └───────────────────────────────┘\n');
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Port:        ${PORT}`);
  console.log(`  URL:         http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/health`);
  console.log(`  API Docs:    http://localhost:${PORT}/api/docs\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;