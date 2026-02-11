const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3004;

// Configure multer for file uploads (store in memory, not disk)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
// FILE UPLOAD ROUTE
// ============================================

// POST /api/fileanalyse - Upload and analyze file
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  console.log('POST /api/fileanalyse');

  // Check if file was uploaded
  if (!req.file) {
    return res.json({ error: 'No file uploaded' });
  }

  console.log('File received:', {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });

  // Return file metadata
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 File Metadata Microservice running on port ${PORT}`);
});