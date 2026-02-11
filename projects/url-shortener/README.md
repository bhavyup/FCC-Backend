<div align="center">

# 🔗 URL Shortener

Shorten long URLs and track redirects.

[Live API](https://fcc-url-shortener-2pdh.onrender.com) · [Dashboard](../../dashboard)

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

</div>

---

## 📡 API Reference

### Create Short URL

```http
POST /api/shorturl
Content-Type: application/x-www-form-urlencoded

url=https://www.example.com
```

#### Response

```json
{
  "original_url": "https://www.example.com",
  "short_url": 1
}
```

### Redirect

```http
GET /api/shorturl/:short_url
```

Redirects to the original URL.

### Error Response

```json
{
  "error": "invalid url"
}
```

---

## ✅ Valid URL Formats

| URL | Valid |
|-----|:-----:|
| `https://www.example.com` | ✅ |
| `http://example.com/path` | ✅ |
| `ftp://files.com` | ❌ |
| `www.example.com` | ❌ |

---

## 🗄️ Database

Uses **MongoDB Atlas** for persistent storage.

```javascript
// Collections
urls: { original_url, short_url }
counters: { _id, count }
```

---

## 🚀 Local Development

```bash
cd projects/url-shortener
npm install

# Create .env file
echo "MONGO_URI=your_mongodb_uri" > .env

npm run dev
```

Server runs at `http://localhost:3002`

---

## 📁 Structure

```
url-shortener/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js
├── .env              # MongoDB URI (not in git)
└── package.json
```

---

## 🧪 Test with cURL

```bash
# Create short URL
curl -X POST -d "url=https://google.com" https://your-api.com/api/shorturl

# Test redirect
curl -I https://your-api.com/api/shorturl/1
```

---

<div align="center">

**Part of [API Hub](../../README.md)**

</div>

