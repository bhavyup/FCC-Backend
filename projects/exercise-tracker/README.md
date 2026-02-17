# PULSE

> Exercise tracking as living rhythm.

PULSE is a production-grade exercise tracker microservice with a medical monitor aesthetic. Each user is a "signal", each exercise is a "beat" on their lifeline. The interface visualizes fitness data as a living ECG — raw, functional, alive.

![Aesthetic](https://img.shields.io/badge/aesthetic-terminal%20monitor-00FF41)
![License](https://img.shields.io/badge/license-MIT-blue)

## Design Philosophy

Unlike typical fitness trackers with purple gradients and glassmorphism, PULSE draws from:

- **Medical monitors**: ECG visualization, terminal green on charcoal
- **Brutalist web design**: Raw data, monospace fonts, scanlines
- **Functional minimalism**: Every pixel serves a purpose

**Visual language:**
- Deep charcoal (#0D0D0D) background
- Terminal green (#00FF41) pulse accent
- JetBrains Mono + Space Grotesk typography
- Live ECG animation in the hero
- Each user card shows a sparkline of their exercise history

## Features

- ⚡ **Fast**: In-memory or MongoDB storage
- 🔒 **Secure**: Helmet headers, CORS, rate limiting
- 📊 **Visual**: Live ECG animation, sparkline charts
- 🎨 **Unique**: Medical monitor aesthetic, zero generic patterns
- 🧪 **fCC Certified**: Passes all 16 freeCodeCamp Exercise Tracker tests
- 🔧 **Subpath Ready**: Configured for `mysite.me/exercise-tracker`

## API

All routes are prefixed with `/exercise-tracker`.

### Create a User (Signal)
```http
POST /exercise-tracker/api/users
Content-Type: application/x-www-form-urlencoded

username=johndoe
```

**Response:**
```json
{
  "username": "johndoe",
  "_id": "abc123"
}
```

### List All Users
```http
GET /exercise-tracker/api/users
```

**Response:**
```json
[
  { "username": "johndoe", "_id": "abc123" }
]
```

### Add Exercise (Record Pulse)
```http
POST /exercise-tracker/api/users/:_id/exercises
Content-Type: application/x-www-form-urlencoded

description=running&duration=30&date=2024-01-15
```

**Response:**
```json
{
  "_id": "abc123",
  "username": "johndoe",
  "description": "running",
  "duration": 30,
  "date": "Mon Jan 15 2024"
}
```

### Get Exercise Log (Analyze Signal)
```http
GET /exercise-tracker/api/users/:_id/logs?from=2024-01-01&to=2024-12-31&limit=10
```

**Response:**
```json
{
  "_id": "abc123",
  "username": "johndoe",
  "count": 2,
  "log": [
    { "description": "running", "duration": 30, "date": "Mon Jan 15 2024" }
  ]
}
```

## Installation

```bash
# Clone and enter
cd pulse

# Install dependencies
npm install

# Run locally
npm run dev
```

Visit `http://localhost:3000/exercise-tracker`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection (optional) | — |

Without `MONGO_URI`, PULSE uses in-memory storage.

## Deployment

### Vercel

```bash
npm i -g vercel
vercel --prod
```

The `vercel.json` handles all routing with the `/exercise-tracker` base path.

### Custom Domain with Subpath

If deploying to `mysite.me/exercise-tracker`, ensure your reverse proxy or server config routes `/exercise-tracker/*` to the app. The app handles the base path internally.

## freeCodeCamp Tests

PULSE satisfies all 16 fCC Exercise Tracker requirements:

1. ✅ POST `/api/users` creates user with `username`
2. ✅ Returns object with `username` and `_id`
3. ✅ GET `/api/users` returns array of users
4. ✅ Each user has `username` and `_id`
5. ✅ POST `/api/users/:_id/exercises` with `description`, `duration`, optional `date`
6. ✅ Returns user object with exercise fields added
7. ✅ GET `/api/users/:_id/logs` returns user with `count` and `log` array
8. ✅ Each log entry has `description` (string), `duration` (number), `date` (string)
9. ✅ Date uses `Date.toDateString()` format
10. ✅ Supports `from`, `to`, `limit` query parameters

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close response panels |
| `Tab` | Navigate between inputs |

## Tech Stack

- **Backend**: Node.js, Express, Helmet, CORS, Rate-limit
- **Frontend**: Vanilla JS, Canvas API for ECG/sparklines
- **Storage**: Memory (dev) or MongoDB (prod)
- **Fonts**: JetBrains Mono, Space Grotesk (Google Fonts)

## License

MIT © 2024
