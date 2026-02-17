# Bolt

URL compression engine. Shortens URLs into clean, redirect-ready links with protocol and DNS validation.

Built with Node.js and Express. Uses MongoDB for persistent storage with an in-memory fallback for local development.

## API

Base URL: `http://localhost:3002`

### `POST /api/shorturl`

Shorten a URL. Send as form-encoded or JSON body with a `url` field.

```bash
curl -X POST -d "url=https://example.com" localhost:3002/api/shorturl
```

```json
{
  "original_url": "https://example.com",
  "short_url": 1
}
```

Invalid URLs return:

```json
{
  "error": "invalid url"
}
```

### `GET /api/shorturl/:id`

Redirects (302) to the original URL.

### `GET /api/urls`

Lists all shortened URLs with total count.

### `GET /health`

Service health check.

## Validation

URLs must use `http://` or `https://` protocol and resolve via DNS lookup.

| Input | Valid |
|-------|:-----:|
| `https://www.example.com` | Yes |
| `http://example.com/path` | Yes |
| `ftp://files.com` | No |
| `www.example.com` | No |
| `not-a-url` | No |

## Stack

- Express 4.18 with Helmet, Morgan, Compression, CORS
- MongoDB Atlas (persistent) / In-memory (fallback)
- Rate limiting: 100 requests / 15 min per IP
- DNS validation via `dns.lookup`
- Vanilla HTML/CSS/JS frontend with Sora + Inconsolata

## Setup

```bash
cd projects/url-shortener
npm install

# Optional: create .env for persistence
echo "MONGO_URI=your_mongodb_uri" > .env

npm run dev     # development with nodemon
npm start       # production
```

Server starts at `http://localhost:3002`. Without `MONGO_URI`, URLs are stored in memory (lost on restart).

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3002` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGO_URI` | — | MongoDB connection string |

## Deploy

Includes `vercel.json` for Vercel deployment. Set `MONGO_URI` in Vercel environment variables.

```bash
vercel deploy
```

## License

MIT
