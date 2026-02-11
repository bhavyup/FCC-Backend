
<div align="center">

# ⚡ API Hub

### Backend Microservices Collection

A suite of production-ready REST APIs built for the freeCodeCamp Backend Certification.

[Live Dashboard](https://bhavyup.github.io/FCC-Backend/) · [View APIs](#-projects) · [Tech Stack](#-built-with)

---

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

## 📋 Overview

This repository contains **5 backend microservices** and a **unified dashboard** to showcase them all. Each service is independently deployable, well-documented, and follows REST best practices.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ⚡ API Hub Dashboard                                      │
│   ├── 🕐 Timestamp Microservice                            │
│   ├── 👤 Request Header Parser                             │
│   ├── 🔗 URL Shortener (MongoDB)                           │
│   ├── 🏋️ Exercise Tracker (MongoDB)                        │
│   └── 📁 File Metadata Analyzer                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Projects

| # | Project | Description | Live Demo | Status |
|:-:|---------|-------------|:---------:|:------:|
| 1 | **Timestamp** | Unix & UTC date converter | [Open →](https://fcc-timestamp-microservice-6b1s.onrender.com) | ✅ |
| 2 | **Header Parser** | Request metadata extractor | [Open →](https://fcc-header-parser-ap2o.onrender.com) | ✅ |
| 3 | **URL Shortener** | Link shortening service | [Open →](https://fcc-url-shortener-2pdh.onrender.com) | ✅ |
| 4 | **Exercise Tracker** | Workout logging API | [Open →](https://fcc-exercise-tracker-rrfr.onrender.com) | ✅ |
| 5 | **File Metadata** | File analysis service | [Open →](https://fcc-file-metadata-xvgc.onrender.com) | ✅ |

---

## 🏗️ Architecture

```
FCC-Backend/
│
├── dashboard/                    # Unified dashboard UI
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   ├── server.js
│   └── package.json
│
├── projects/
│   ├── timestamp-microservice/   # Project 1
│   ├── request-header-parser/    # Project 2
│   ├── url-shortener/            # Project 3 (MongoDB)
│   ├── exercise-tracker/         # Project 4 (MongoDB)
│   └── file-metadata/            # Project 5
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Built With

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=nodejs" width="48" height="48" alt="Node.js" />
      <br>Node.js
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=express" width="48" height="48" alt="Express" />
      <br>Express
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=mongodb" width="48" height="48" alt="MongoDB" />
      <br>MongoDB
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=js" width="48" height="48" alt="JavaScript" />
      <br>JavaScript
    </td>
  </tr>
</table>

**Additional Tools:**
- **Multer** — File upload handling
- **CORS** — Cross-origin resource sharing
- **DNS** — URL validation
- **dotenv** — Environment configuration

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (for URL Shortener & Exercise Tracker)

### Installation

```bash
# Clone the repository
git clone https://github.com/bhavyup/FCC-Backend.git
cd FCC-Backend

# Install root dependencies
npm install

# Run any project
npm run dev:timestamp
npm run dev:header-parser
npm run dev:url-shortener
npm run dev:exercise-tracker
npm run dev:file-metadata
npm run dev:dashboard
```

### Environment Variables

For projects using MongoDB, create `.env` files:

```env
# projects/url-shortener/.env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/

# projects/exercise-tracker/.env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
```

---

## 📡 API Endpoints

### Timestamp Microservice
```http
GET /api/:date?
```

### Request Header Parser
```http
GET /api/whoami
```

### URL Shortener
```http
POST /api/shorturl
GET  /api/shorturl/:short_url
```

### Exercise Tracker
```http
POST /api/users
GET  /api/users
POST /api/users/:_id/exercises
GET  /api/users/:_id/logs
```

### File Metadata
```http
POST /api/fileanalyse
```

---

## 🌐 Deployment

All services are deployed on **Render** with automatic deployments from the `main` branch.

| Service | Platform | Status |
|---------|----------|--------|
| Dashboard | Render | 🟢 Live |
| All APIs | Render | 🟢 Live |
| Database | MongoDB Atlas | 🟢 Connected |
| Monitoring | UptimeRobot | 🟢 Active |

---

## 📊 Features

- ✅ RESTful API design
- ✅ Input validation & error handling
- ✅ CORS enabled
- ✅ MongoDB integration
- ✅ File upload support
- ✅ Real-time status monitoring
- ✅ Responsive dashboard UI
- ✅ Dark/Light mode support
- ✅ Mobile-friendly design

---

## 🎓 Certification

These projects are part of the **freeCodeCamp Backend Development and APIs** certification.

<div align="center">

[![freeCodeCamp](https://img.shields.io/badge/freeCodeCamp-0A0A23?style=for-the-badge&logo=freecodecamp&logoColor=white)](https://www.freecodecamp.org/certification/your-username/back-end-development-and-apis)

</div>

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ☕ and dedication**

[Back to Top](#-api-hub)

</div>