const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3004;

// Configure multer - store in memory
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST /api/fileanalyse - Upload and analyze file
// The field name MUST be 'upfile'
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  console.log('POST /api/fileanalyse');
  console.log('File:', req.file);

  // Check if file was uploaded
  if (!req.file) {
    console.log('No file received');
    return res.json({ error: 'No file uploaded' });
  }

  // Return file metadata with exact field names FCC expects
  const response = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  };

  console.log('Response:', response);
  res.json(response);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 File Metadata running on port ${PORT}`);
});