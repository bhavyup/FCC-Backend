<div align="center">

# ⏰ Temporal API

**Production-grade timestamp conversion service**

Modern, secure, and scalable timestamp microservice built with Node.js & Express

[Live Demo](#) · [API Documentation](#api-reference) · [Features](#features)

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## 🎯 Overview

Temporal API is a modern timestamp conversion service designed for developers who value reliability, security, and simplicity. Convert dates, Unix timestamps, and ISO strings with a clean REST API and beautiful web interface.

### Key Highlights

- 🚀 **Lightning Fast** - Sub-millisecond response times
- 🔒 **Secure** - Helmet.js security headers, rate limiting, CORS
- 📊 **Multiple Formats** - Unix, UTC, ISO 8601, human-readable
- 🎨 **Modern UI** - Clean, minimalistic web interface
- ⚡ **Production Ready** - Proper error handling, logging, health checks

---

## 📡 API Reference

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Get Current Timestamp
Returns the current server time in multiple formats.

```http
GET /api
```

**Response:**
```json
{
  "unix": 1708099200000,
  "utc": "Fri, 16 Feb 2024 16:00:00 GMT",
  "iso": "2024-02-16T16:00:00.000Z",
  "timestamp": 1708099200,
  "readable": "Friday, February 16, 2024 at 4:00:00 PM UTC"
}
```

#### 2. Convert Date to Timestamp
Converts any date format to timestamp.

```http
GET /api/:date
```

**Parameters:**
- `date` (string) - ISO date, Unix timestamp (ms or s), or natural language date

**Examples:**
```bash
# ISO Date
curl http://localhost:3000/api/2024-12-25

# Unix Timestamp (milliseconds)
curl http://localhost:3000/api/1735084800000

# Unix Timestamp (seconds)
curl http://localhost:3000/api/1735084800

# Natural Language
curl http://localhost:3000/api/December%2025,%202024
```

**Response:**
```json
{
  "unix": 1735084800000,
  "utc": "Wed, 25 Dec 2024 00:00:00 GMT",
  "iso": "2024-12-25T00:00:00.000Z",
  "timestamp": 1735084800,
  "readable": "Wednesday, December 25, 2024 at 12:00:00 AM UTC"
}
```

**Error Response:**
```json
{
  "error": "Invalid Date",
  "message": "Unable to parse the provided date format",
  "hint": "Try: ISO date (2024-01-15), Unix timestamp (1705276800000), or natural language"
}
```

#### 3. API Documentation
Get comprehensive API documentation in JSON format.

```http
GET /api/docs
```

#### 4. Health Check
Check service health and uptime.

```http
GET /health
```

**Response:**
```json
{
  "status": "operational",
  "uptime": 3600.5,
  "timestamp": 1708099200000,
  "environment": "production"
}
```

---

## ⚙️ Features

### Security
- **Helmet.js** - Security headers (CSP, XSS protection, etc.)
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS** - Configurable cross-origin resource sharing
- **Input Validation** - Comprehensive date validation and sanitization

### Performance
- **Compression** - Gzip compression for responses
- **Caching Headers** - Efficient static asset caching
- **Optimized Parsing** - Fast date parsing algorithms

### Developer Experience
- **Comprehensive Logging** - Morgan HTTP request logging
- **Error Handling** - Graceful error responses with helpful messages
- **TypeScript Ready** - Easy to extend with TypeScript
- **Environment Config** - Flexible configuration via environment variables

### Monitoring
- Health check endpoint
- Process uptime tracking
- Graceful shutdown handling
- Detailed error logging

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd projects/timestamp-microservice
```

2. **Install dependencies**
```bash
npm install
```

3. **Run in development mode**
```bash
npm run dev
```

4. **Run in production mode**
```bash
npm start
```

The server will start at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration (comma-separated origins for production)
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

---

## 📂 Project Structure

```
timestamp-microservice/
├── public/
│   ├── index.html          # Modern web interface
│   ├── styles.css          # Minimalistic styling
│   └── script.js           # Interactive functionality
├── server.js               # Express server with production features
├── package.json            # Dependencies and scripts
├── vercel.json            # Vercel deployment configuration
└── README.md              # This file
```

---

## 🧪 Testing

### Manual Testing

Use the interactive web interface at `http://localhost:3000` or test with curl:

```bash
# Test current timestamp
curl http://localhost:3000/api

# Test specific date
curl http://localhost:3000/api/2024-01-01

# Test Unix timestamp
curl http://localhost:3000/api/1704067200000

# Test invalid date
curl http://localhost:3000/api/invalid-date

# Test health check
curl http://localhost:3000/health
```

### Expected Behaviors

| Input | Expected Output |
|-------|-----------------|
| Empty | Current timestamp in all formats |
| `2024-01-01` | Timestamp for January 1, 2024 |
| `1704067200000` | Parsed Unix timestamp (ms) |
| `1704067200` | Parsed Unix timestamp (seconds) |
| `December 25, 2024` | Natural language parsing |
| `invalid-string` | Error response with hints |

---

## 🎨 Design Philosophy

Temporal API features a modern, minimalistic design inspired by companies like Vercel, Linear, and GitHub:

- **Clean & Spacious** - Generous whitespace and clear hierarchy
- **Brutalist Minimalism** - Functional, no unnecessary elements
- **Dark Theme** - Easy on the eyes with cyan accents
- **Micro-interactions** - Subtle animations and feedback
- **Mobile-First** - Fully responsive design

---

## 🔧 Technology Stack

- **Backend:** Node.js, Express
- **Security:** Helmet.js, Express Rate Limit
- **Optimization:** Compression, Morgan logging
- **Frontend:** Vanilla HTML/CSS/JS
- **Fonts:** Inter, JetBrains Mono
- **Hosting:** Vercel, Render, or any Node.js host

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "cors": "^2.8.5",
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5"
}
```

---

## 🚀 Deployment

### Vercel

The project includes a `vercel.json` configuration file:

```bash
vercel deploy
```

### Render / Heroku

Simply deploy the repository and ensure `npm start` is set as the start command.

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ♥ for developers**

</div>

