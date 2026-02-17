# Epoch

Precision timestamp conversion instrument. Converts dates, Unix timestamps, and ISO strings through a clean REST interface.

Built with Node.js and Express. Production-grade with security headers, rate limiting, compression, and structured logging.

## API

Base URL: `http://timestamp.bhavyupreti.me`

### `GET /api`

Returns current server time.

```json
{
  "unix": 1708099200000,
  "utc": "Fri, 16 Feb 2024 16:00:00 GMT",
  "iso": "2024-02-16T16:00:00.000Z",
  "timestamp": 1708099200,
  "readable": "Friday, February 16, 2024 at 4:00:00 PM UTC"
}
```

### `GET /api/:date`

Converts any date input to multiple formats. Accepts ISO dates, Unix timestamps (ms or seconds), and natural language.

```bash
curl localhost:3010/api/2024-12-25
curl localhost:3010/api/1735084800000
curl localhost:3010/api/December%2025,%202024
```

```json
{
  "unix": 1735084800000,
  "utc": "Wed, 25 Dec 2024 00:00:00 GMT",
  "iso": "2024-12-25T00:00:00.000Z",
  "timestamp": 1735084800,
  "readable": "Wednesday, December 25, 2024 at 12:00:00 AM UTC"
}
```

Invalid input returns:

```json
{
  "error": "Invalid Date",
  "message": "Unable to parse the provided date format",
  "hint": "Try: ISO date (2024-01-15), Unix timestamp (1705276800000), or natural language"
}
```

### `GET /api/docs`

Returns API documentation as JSON.

### `GET /health`

Service health check. Returns uptime, status, and environment.

```json
{
  "status": "operational",
  "uptime": 3600.5,
  "timestamp": 1708099200000,
  "environment": "production"
}
```

## Stack

- Express 4.18 with Helmet, Morgan, Compression, CORS
- Rate limiting: 100 requests / 15 min per IP
- Graceful shutdown on SIGTERM
- Vanilla HTML/CSS/JS frontend with Space Grotesk + IBM Plex Mono

## Setup

```bash
cd projects/timestamp-microservice
npm install
npm run dev     # development with nodemon
npm start       # production
```

Server starts at `http://localhost:3010`.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3010` | Server port |
| `NODE_ENV` | `development` | Environment mode |

## Deploy

Includes `vercel.json` for Vercel deployment:

```bash
vercel deploy
```

Works on any Node.js host (Render, Railway, Fly.io) with `npm start`.

## License

MIT
