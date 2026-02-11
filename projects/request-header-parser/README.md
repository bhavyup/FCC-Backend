<div align="center">

# 👤 Request Header Parser

Extract client information from HTTP request headers.

[Live API](https://fcc-header-parser-ap2o.onrender.com) · [Dashboard](../../dashboard)

</div>

---

## 📡 API Reference

### Who Am I

```http
GET /api/whoami
```

### Response

```json
{
  "ipaddress": "159.20.14.100",
  "language": "en-US,en;q=0.9",
  "software": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

---

## 🔍 Headers Parsed

| Header | Response Key | Description |
|--------|--------------|-------------|
| `X-Forwarded-For` | `ipaddress` | Client IP address |
| `Accept-Language` | `language` | Preferred languages |
| `User-Agent` | `software` | Browser/OS info |

---

## 🚀 Local Development

```bash
cd projects/request-header-parser
npm install
npm run dev
```

Server runs at `http://localhost:3001`

---

## 📁 Structure

```
request-header-parser/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js
└── package.json
```

---

## 🧪 Test with cURL

```bash
curl https://your-api.com/api/whoami
```

---

<div align="center">

**Part of [API Hub](../../README.md)**

</div>

