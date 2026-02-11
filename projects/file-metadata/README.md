
<div align="center">

# 📁 File Metadata Microservice

Upload files and extract metadata instantly.

[Live API](https://fcc-file-metadata-xvgc.onrender.com) · [Dashboard](../../dashboard)

</div>

---

## 📡 API Reference

### Analyze File

```http
POST /api/fileanalyse
Content-Type: multipart/form-data

upfile=@yourfile.png
```

| Field | Type | Description |
|-------|------|-------------|
| `upfile` | `file` | The file to analyze |

### Response

```json
{
  "name": "example.png",
  "type": "image/png",
  "size": 12345
}
```

---

## 📊 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Original filename |
| `type` | `string` | MIME type |
| `size` | `number` | Size in bytes |

---

## 🚀 Local Development

```bash
cd projects/file-metadata
npm install
npm run dev
```

Server runs at `http://localhost:3004`

---

## 📁 Structure

```
file-metadata/
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
# Create test file
echo "Hello World" > test.txt

# Upload and analyze
curl -F "upfile=@test.txt" https://your-api.com/api/fileanalyse
```

---

## 🔧 Technical Details

- Uses **Multer** for file handling
- Files stored in memory (not saved to disk)
- Max file size: 10MB

---

<div align="center">

**Part of [API Hub](../../README.md)**

</div>