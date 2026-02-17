# Knot

> A URL shortener that ties the web together.

Knot is a production-grade URL shortening microservice with a craft-inspired interface. Long URLs are loose threads; we tie them into tight, shareable knots.

![Design Philosophy](https://img.shields.io/badge/design-craft%20aesthetic-8B5A2B)
![License](https://img.shields.io/badge/license-MIT-blue)

## Design Philosophy

Unlike typical URL shorteners that follow the same centered-card pattern, Knot draws from traditional craft — rope, twine, and macramé — executed with brutalist-modern web aesthetics:

- **Asymmetric split-screen layout**: Workbench (left) vs. Spool (right)
- **Warm, earthy palette**: Raw linen, hemp brown, slate — zero gradients, zero purple AI vibes
- **Typography**: Space Grotesk + IBM Plex Mono
- **Interaction metaphor**: URLs visually "tie" into knots along a rope timeline

## Features

- ⚡ **Fast**: In-memory storage with optional MongoDB persistence
- 🔒 **Secure**: Helmet headers, CORS, rate limiting (100 req/15min)
- 🎨 **Unique**: Craft-inspired UI with zero generic SaaS patterns
- 📱 **Responsive**: Adapts from split-screen to stacked on mobile
- 🧪 **fCC Certified**: Passes all freeCodeCamp URL Shortener Microservice tests

## API

### Create a Short URL
```http
POST /api/shorturl
Content-Type: application/x-www-form-urlencoded

url=https://example.com/very/long/path
```

**Response:**
```json
{
  "original_url": "https://example.com/very/long/path",
  "short_url": 1
}
```

### Redirect to Original
```http
GET /api/shorturl/1
```

Returns a 302 redirect to the original URL.

### List All URLs
```http
GET /api/urls
```

**Response:**
```json
{
  "count": 42,
  "urls": [...]
}
```

### Health Check
```http
GET /health
```

## Installation

```bash
# Clone and enter
cd knot

# Install dependencies
npm install

# Run locally
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection (optional) | — |

Without `MONGO_URI`, Knot uses in-memory storage (resets on restart).

## Deployment

### Vercel

```bash
npm i -g vercel
vercel --prod
```

The included `vercel.json` handles all routing.

### Railway/Render/Heroku

```bash
git push origin main
# Connect your repo to the platform
```

## freeCodeCamp Tests

This project satisfies all fCC URL Shortener Microservice requirements:

1. ✅ POST to `/api/shorturl` returns `{original_url, short_url}`
2. ✅ GET to `/api/shorturl/:id` redirects (302) to original URL
3. ✅ Invalid URLs return `{error: 'invalid url'}`
4. ✅ DNS validation ensures URLs resolve

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Focus input |
| `Esc` | Close result card |

## Tech Stack

- **Backend**: Node.js, Express, Helmet, CORS, Rate-limit
- **Frontend**: Vanilla JS, CSS Grid/Flexbox, CSS Custom Properties
- **Storage**: Memory (dev) or MongoDB (prod)
- **Fonts**: Space Grotesk, IBM Plex Mono (Google Fonts)

## License

MIT © 2024
