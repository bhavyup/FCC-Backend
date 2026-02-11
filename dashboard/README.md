<div align="center">

# ⚡ API Hub Dashboard

### Modern Control Center for Backend Microservices

A sleek, responsive dashboard to monitor and access all API endpoints in one place.

[Live Demo](https://bhavyup.github.io/FCC-Backend/) · [Main Repo](../README.md)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔴🟢 **Real-time Status** | Live health checks for all APIs |
| 🌙 **Dark Mode** | Auto-detects system preference |
| 📱 **Responsive** | Works on all devices |
| ⌨️ **Keyboard Shortcuts** | Press `R` to refresh status |
| 🔗 **Quick Links** | One-click access to APIs & source code |

---

## 🖼️ Preview

```
┌──────────────────────────────────────────────────────────┐
│  ⚡ API Hub                          🟢 All systems up  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │  5 APIs │ │ 5 Live  │ │ 2 w/DB  │ │  100%   │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ 🕐 Timestamp     │  │ 👤 Header Parser │             │
│  │ [Open] [Code]    │  │ [Open] [Code]    │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# Navigate to dashboard
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

## 📁 Structure

```
dashboard/
├── public/
│   ├── index.html      # Main HTML
│   ├── styles.css      # Styling (dark/light mode)
│   └── script.js       # Status checks & interactions
├── server.js           # Express server
├── package.json
└── README.md
```

---

## ⚙️ Configuration

Update API URLs in `public/script.js`:

```javascript
const PROJECTS = {
  'timestamp': {
    url: 'https://your-timestamp-api.onrender.com',
    healthEndpoint: '/api',
    sourceCode: 'https://github.com/user/repo/tree/main/projects/timestamp'
  },
  // ... other projects
};
```

---

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css`:

```css
:root {
  --accent-blue: #2563eb;
  --accent-green: #16a34a;
  --accent-orange: #ea580c;
  /* ... */
}
```

### Adding New Projects
1. Add project config to `PROJECTS` object
2. Add HTML card in `index.html`
3. Deploy!

---

## 📡 Status Check Flow

```
Page Load
    │
    ▼
Check All APIs ──────┐
    │                │
    ▼                │
Update Badges        │
    │                │
    ▼                │
Update Header        │
    │                │
    ▼                │
Wait 60 seconds ─────┘
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Refresh all status checks |
| `Esc` | Close mobile sidebar |

---

<div align="center">

**Part of [API Hub](../README.md)**

</div>
