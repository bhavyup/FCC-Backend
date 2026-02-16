# Signal

Request identity instrument. Reads your IP address, preferred language, and client software from the HTTP request headers through a single endpoint.

Built with Node.js and Express. Production-grade with security headers, rate limiting, compression, and structured logging.

## API

Base URL: `http://req-head-parser.bhavyupreti.me`

### `GET /api/whoami`

Returns the client's identity from the request headers.

```json
{
  "ipaddress": "159.20.14.100",
  "language": "en-US,en;q=0.9,fr;q=0.8",
  "software": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ..."
}
```

| Field | Source |
|-------|--------|
| `ipaddress` | `req.ip` / `X-Forwarded-For` header |
| `language` | `Accept-Language` header |
| `software` | `User-Agent` header |

### `GET /health`

Service health check.

### `GET /api/docs`

Returns API documentation as JSON.

## Stack

- Express 4.18 with Helmet, Morgan, Compression, CORS
- Rate limiting: 100 requests / 15 min per IP
- Trust proxy enabled for accurate IP behind reverse proxies
- Graceful shutdown on SIGTERM
- Vanilla HTML/CSS/JS frontend with Space Grotesk + IBM Plex Mono

## Setup

```bash
cd projects/request-header-parser
npm install
npm run dev     # development with nodemon
npm start       # production
```

Server starts at `http://localhost:3001`.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |

## Deploy

Includes `vercel.json` for Vercel deployment:

```bash
vercel deploy
```

Works on any Node.js host (Render, Railway, Fly.io) with `npm start`.

## License

MIT

