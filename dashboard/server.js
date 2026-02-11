const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to get project status (can be extended)
app.get('/api/projects', (req, res) => {
  res.json({
    projects: [
      { id: 'timestamp', name: 'Timestamp', status: 'live' },
      { id: 'header-parser', name: 'Header Parser', status: 'live' },
      { id: 'url-shortener', name: 'URL Shortener', status: 'live' },
      { id: 'exercise-tracker', name: 'Exercise Tracker', status: 'live' },
      { id: 'file-metadata', name: 'File Metadata', status: 'live' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Dashboard running on port ${PORT}`);
});