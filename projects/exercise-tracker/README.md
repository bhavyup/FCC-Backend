# KINETIC — Exercise Telemetry System

[![FCC Backend](https://img.shields.io/badge/FCC-Backend_Certification-0a0a0a?style=flat-square)](https://www.freecodecamp.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-0a0a0a?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-0a0a0a?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-0a0a0a?style=flat-square&logo=vercel)](https://vercel.com)

A brutalist, motion-first exercise tracking API that rejects the purple-gradient AI aesthetic in favor of thermal receipt nostalgia and Swiss typography.

## Design Philosophy

**KINETIC** treats data like telemetry from a high-performance machine. No gradients. No shadows. Just raw information density with kinetic (motion) feedback.

- **Visual Language**: Thermal printer receipts meets Swiss brutalism
- **Color Palette**: Thermal Black (#0a0a0a), Receipt White (#fafafa), Alert Orange (#ff3d00)
- **Typography**: IBM Plex Mono (data) + Space Grotesk (headings)
- **Interactions**: Spring physics, stagger animations, receipt printing effects

## Features

- ✅ **Create Athletes** — Minimal identifier-based user creation
- ✅ **Log Activities** — Track exercises with duration and date
- ✅ **Thermal Receipts** — Data outputs look like printed receipts with serrated edges
- ✅ **Query System** — Filter logs by date range and limit results
- ✅ **Real-time Clock** — System status indicator
- ✅ **Physics UI** — Spring-based button interactions and staggered list animations
- ✅ **Clipboard Integration** — One-click ID copying
- ✅ **Auto-fill** — Smart form population between sections

## API Endpoints

### `POST /api/users`
Create a new athlete.

**Body**: `username` (form-data)

**Response**:
```json
{
  "username": "john_doe",
  "_id": "507f1f77bcf86cd799439011"
}
```

### `GET /api/users`
List all registered athletes.

**Response**:
```json
[
  { "username": "john_doe", "_id": "507f1f77bcf86cd799439011" }
]
```

### `POST /api/users/:_id/exercises`
Log an activity for an athlete.

**Body**: 
- `description` (string, required)
- `duration` (number, required)
- `date` (string, optional, format: YYYY-MM-DD)

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "description": "Running",
  "duration": 30,
  "date": "Mon Jan 01 2024"
}
```

### `GET /api/users/:_id/logs`
Retrieve activity logs with optional filtering.

**Query Parameters**:
- `from` (date, format: YYYY-MM-DD)
- `to` (date, format: YYYY-MM-DD)
- `limit` (number)

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "count": 2,
  "log": [
    {
      "description": "Running",
      "duration": 30,
      "date": "Mon Jan 01 2024"
    }
  ]
}
```

## Installation

```bash
# Clone repository
git clone <repo-url>
cd kinetic-exercise-tracker

# Install dependencies
npm install

# Environment variables
cp .env.example .env
# Edit .env with your MongoDB URI:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/kinetic_tracker

# Run development server
npm run dev

# Production
npm start
```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Add environment variable in Vercel Dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string

The included `vercel.json` handles all routing configuration automatically.

### MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com](https://www.mongodb.com/)
2. Database Access → Create User
3. Network Access → Allow from anywhere (0.0.0.0/0)
4. Clusters → Connect → Drivers → Node.js → Copy URI
5. Replace `<password>` with your user password

## FCC Certification Requirements

This implementation passes all 16 FreeCodeCamp Backend Certification tests:

1. ✅ POST `/api/users` creates user with username
2. ✅ Returns object with `username` and `_id`
3. ✅ GET `/api/users` returns array
4. ✅ Array contains user objects
5. ✅ User objects have `username` and `_id`
6. ✅ POST `/api/users/:_id/exercises` accepts description, duration, optional date
7. ✅ Returns user object with exercise fields added
8. ✅ GET `/api/users/:_id/logs` retrieves full log
9. ✅ Returns user object with `count` property
10. ✅ Returns user object with `log` array
11. ✅ Log items have `description`, `duration`, `date`
12. ✅ `description` is string
13. ✅ `duration` is number
14. ✅ `date` is string (dateString format)
15. ✅ Supports `from`, `to`, `limit` query parameters
16. ✅ Date parameters in `yyyy-mm-dd` format

## Technical Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB Atlas with native driver
- **Styling**: Vanilla CSS (no frameworks)
- **Typography**: Google Fonts (IBM Plex Mono, Space Grotesk)
- **Deployment**: Vercel Serverless Functions

## Design Decisions

### Why No Frameworks?
This project demonstrates mastery of vanilla web technologies. Every animation, every transition, every physics calculation is hand-coded to show deep understanding of the platform.

### Why Thermal Receipts?
Receipts are honest. They don't try to look pretty—they present information with clarity and authority. The thermal printer aesthetic (monospace, high contrast, serrated edges) creates an immediate visual metaphor: "This is your data, printed in reality."

### Why Brutalism?
Most "modern" web apps look identical. KINETIC rejects the soft shadows, rounded corners, and purple gradients in favor of asymmetric grids, stark contrasts, and functional beauty.

## License

MIT License — Built for the FreeCodeCamp Backend Certification.

---

**[KINETIC]** Exercise Telemetry System v1.0.0