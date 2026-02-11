<div align="center">

# 🕐 Timestamp Microservice

Convert any date to Unix timestamp and UTC format instantly.

[Live API](https://fcc-timestamp-microservice-6b1s.onrender.com) · [Dashboard](../../dashboard)

</div>

---

## 📡 API Reference

### Get Timestamp

```http
GET /api/:date?
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `string` | Optional. Date string or Unix timestamp |

### Examples

```bash
# Current time
curl https://your-api.com/api

# Specific date
curl https://your-api.com/api/2024-01-15

# Unix timestamp
curl https://your-api.com/api/1451001600000
```

### Response

```json
{
  "unix": 1451001600000,
  "utc": "Fri, 25 Dec 2015 00:00:00 GMT"
}
```

### Error Response

```json
{
  "error": "Invalid Date"
}
```

---

## 🚀 Local Development

```bash
cd projects/timestamp-microservice
npm install
npm run dev
```

Server runs at `http://localhost:3000`

---

## 📁 Structure

```
timestamp-microservice/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js
└── package.json
```

---

## 🧪 Test Cases

| Input | Expected Output |
|-------|-----------------|
| (empty) | Current timestamp |
| `2015-12-25` | Unix + UTC for that date |
| `1451001600000` | Dec 25, 2015 |
| `invalid` | `{ "error": "Invalid Date" }` |

---

<div align="center">

**Part of [API Hub](../../README.md)**

</div>

