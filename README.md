# ResumeAI – AI-Powered Résumé Validator

> Match your résumé against any job description in seconds. Get an AI-generated score, skill gap analysis, and a live coaching chat — powered by Google Gemini.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- **PDF Upload** — Drag-and-drop or browse; processed in-memory, never stored on disk
- **ATS Match Score** — 0–100 score with colour-coded feedback ring
- **Skill Gap Analysis** — Side-by-side matched vs. missing skills
- **Strength & Improvement Cards** — AI-generated, actionable advice
- **AI Chat Coach** — Ask follow-up questions powered by Gemini 1.5 Flash
- **Privacy First** — No résumé text stored; sessions auto-delete after 24 hours
- **Responsive** — Works on desktop and mobile

---

## 🏗️ Architecture

```
RESUME FILTER/
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── app.js          # Express application
│   │   ├── server.js       # Entry point
│   │   ├── config/
│   │   │   └── database.js # MongoDB connection
│   │   ├── models/
│   │   │   └── AnalysisSession.js  # Mongoose schema (TTL 24h)
│   │   ├── middleware/
│   │   │   ├── upload.js   # Multer (memory only)
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── analysis.js # POST/GET/DELETE /api/analysis
│   │   │   ├── chat.js     # POST /api/chat/:sessionId
│   │   │   └── health.js   # GET /api/health
│   │   └── services/
│   │       ├── aiService.js  # Google Gemini integration
│   │       └── pdfService.js # pdf-parse extraction
│   ├── tests/
│   │   ├── api.test.js
│   │   └── pdfService.test.js
│   ├── .env.example
│   └── package.json
│
└── frontend/               # React + Vite SPA
    ├── src/
    │   ├── api/client.js   # Fetch wrapper
    │   ├── components/
    │   │   ├── Navbar.*
    │   │   ├── UploadZone.*
    │   │   ├── ScoreRing.*
    │   │   ├── SkillsPanel.*
    │   │   └── ChatAssistant.*
    │   ├── pages/
    │   │   ├── LandingPage.*
    │   │   └── AnalysisPage.*
    │   ├── App.jsx
    │   └── index.css       # Design system
    ├── .env.example
    └── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB Atlas account (free tier) or local MongoDB
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))

---

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/resume-ai.git
cd resume-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

#### Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

| Variable | How to obtain |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) → Create API key (free) |
| `MONGODB_URI` | [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free cluster → Connect → Drivers → copy connection string |
| `CORS_ORIGIN` | Set to your frontend URL in production (e.g. `https://your-app.vercel.app`) |

#### Frontend (`frontend/.env`)

```bash
cp frontend/.env.example frontend/.env
```

The default value `http://localhost:5000/api` works for local development.

---

### 3. Run Locally

Open two terminals:

```bash
# Terminal 1 – Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 – Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

### 4. Run Tests

```bash
cd backend
npm test
```

---

## 📦 What Is Stored in MongoDB?

| Data | Stored? | Why | Retention |
|---|---|---|---|
| Raw résumé text | ❌ No | Processed in memory only | N/A |
| Personal information | ❌ No | Never extracted | N/A |
| Job description | ✅ Yes | Required for follow-up chat | 24 hours (TTL) |
| Extracted skill keywords | ✅ Yes | For chat context | 24 hours (TTL) |
| Analysis scores & lists | ✅ Yes | For chat context | 24 hours (TTL) |
| Chat history | ✅ Yes | Conversation continuity | 24 hours (TTL) |

**To remove your data immediately:** Click "Delete Now" on the results page, or call:

```bash
curl -X DELETE http://localhost:5000/api/analysis/YOUR_SESSION_ID
```

---

## 🚢 Deployment

### Frontend → Vercel

1. Push the `frontend/` folder (or the whole repo) to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
5. Click **Deploy**

### Backend → Railway / Render (Free Tier)

**Railway:**
1. Connect your GitHub repo at [railway.app](https://railway.app)
2. Add a new service, select the `backend/` directory
3. Set start command: `npm start`
4. Add environment variables from `.env`
5. Deploy

**Render:**
1. Create a new **Web Service** at [render.com](https://render.com)
2. Connect GitHub, set **Root Directory** to `backend`
3. Build command: `npm install`; Start command: `npm start`
4. Add environment variables
5. Deploy

---

## 🔒 Security

- API keys stored server-side only (never in frontend)
- Helmet.js sets security headers
- CORS restricted to configured origins
- Rate limiting: 50 requests per 15 min per IP
- PDF size limit: 5 MB; text truncated to 15,000 characters
- PDF pages limited to 20 to prevent DoS
- No file writes to disk
- Input validation on all endpoints

---

## 📄 License

MIT
