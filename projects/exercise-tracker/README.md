<div align="center">

# 🏋️ Exercise Tracker

Track users, log workouts, and retrieve exercise history.

[Live API](https://fcc-exercise-tracker-rrfr.onrender.com) · [Dashboard](../../dashboard)

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

</div>

---

## 📡 API Reference

### Create User

```http
POST /api/users
Content-Type: application/x-www-form-urlencoded

username=johndoe
```

```json
{
  "username": "johndoe",
  "_id": "507f1f77bcf86cd799439011"
}
```

### Get All Users

```http
GET /api/users
```

```json
[
  { "username": "johndoe", "_id": "507f..." },
  { "username": "janedoe", "_id": "508f..." }
]
```

### Add Exercise

```http
POST /api/users/:_id/exercises
Content-Type: application/x-www-form-urlencoded

description=Running
duration=30
date=2024-01-15  (optional)
```

```json
{
  "_id": "507f...",
  "username": "johndoe",
  "description": "Running",
  "duration": 30,
  "date": "Mon Jan 15 2024"
}
```

### Get Exercise Log

```http
GET /api/users/:_id/logs?from=2024-01-01&to=2024-12-31&limit=10
```

| Query Param | Type | Description |
|-------------|------|-------------|
| `from` | `date` | Start date (yyyy-mm-dd) |
| `to` | `date` | End date (yyyy-mm-dd) |
| `limit` | `number` | Max exercises to return |

```json
{
  "_id": "507f...",
  "username": "johndoe",
  "count": 2,
  "log": [
    {
      "description": "Running",
      "duration": 30,
      "date": "Mon Jan 15 2024"
    }
  ]
}
```

---

## 🗄️ Database Schema

```javascript
// Users Collection
{
  _id: ObjectId,
  username: String
}

// Exercises Collection
{
  _id: ObjectId,
  userId: String,
  description: String,
  duration: Number,
  date: Date
}
```

---

## 🚀 Local Development

```bash
cd projects/exercise-tracker
npm install

# Create .env file
echo "MONGO_URI=your_mongodb_uri" > .env

npm run dev
```

Server runs at `http://localhost:3003`

---

## 📁 Structure

```
exercise-tracker/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js
├── .env
├── nodemon.json
└── package.json
```

---

## 🧪 Test Flow

```bash
# 1. Create user
curl -X POST -d "username=testuser" https://your-api.com/api/users

# 2. Add exercise (use _id from step 1)
curl -X POST -d "description=Push-ups&duration=15" \
  https://your-api.com/api/users/USER_ID/exercises

# 3. Get logs
curl https://your-api.com/api/users/USER_ID/logs
```

---

<div align="center">

**Part of [API Hub](../../README.md)**

</div>
