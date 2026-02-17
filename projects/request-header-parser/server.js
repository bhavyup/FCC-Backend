/**
 * Signal — Request Identity Instrument
 * A production-grade HTTP header analysis microservice.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const router = express.Router();
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// SECURITY & MIDDLEWARE
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

// Trust proxy for accurate IP behind reverse proxies
app.set('trust proxy', true);

// Rate limiting
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
app.use('/request-header-parser', express.static(path.join(__dirname, 'public')));

// ============================================
// ROUTES
// ============================================

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
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
    name: 'Signal',
    version: '2.0.0',
    description: 'Request identity instrument — HTTP header analysis',
    endpoints: {
      'GET /api/whoami': {
        description: 'Returns client identity from HTTP headers',
        returns: {
          ipaddress: 'Client IP address',
          language: 'Accept-Language header value',
          software: 'User-Agent header value'
        }
      },
      'GET /health': {
        description: 'Service health check'
      }
    },
    rateLimit: '100 requests per 15 minutes'
  });
});

// Core endpoint — client identity
router.get('/api/whoami', (req, res) => {
  try {
    const ipaddress = req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    const language = req.headers['accept-language'] || 'unknown';
    const software = req.headers['user-agent'] || 'unknown';

    res.json({ ipaddress, language, software });
  } catch (error) {
    console.error('Error in /api/whoami:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to read request headers'
    });
  }
});

app.use('/', router);
app.use('/request-header-parser', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: ['/', '/api/whoami', '/api/docs', '/health']
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
  console.log('  │  Signal — Server Running       │');
  console.log('  └───────────────────────────────┘\n');
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Port:        ${PORT}`);
  console.log(`  URL:         http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/health`);
  console.log(`  API Docs:    http://localhost:${PORT}/api/docs\n`);
});

process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});