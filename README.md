# 🤖 AI Interviewer

<div align="center">

![AI Interviewer](https://img.shields.io/badge/AI-Interviewer-8b5cf6?style=for-the-badge&logo=openai&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-10b981?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=for-the-badge&logo=mongodb&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local_AI-ff6b35?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**An adaptive, AI-powered mock interview platform with real-time feedback, cognitive analysis, and daily practice challenges — powered by a local Ollama LLM.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Environment Variables](#-environment-variables) • [API Reference](#-api-reference)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI-Powered Interviews** | Dynamic question generation via local Ollama LLM (llama3.2) |
| 💬 **Real-time Feedback** | WebSocket-based live evaluation as you answer |
| 📊 **Detailed Analytics** | Score breakdowns across communication, technical, and behavioral domains |
| 🗓️ **Daily Practice** | 5-question daily challenges (Communication, Aptitude, General Knowledge) |
| 🏆 **Achievements & Streaks** | Gamified progress tracking with streak rewards |
| 🔐 **JWT Authentication** | Secure access + refresh token rotation |
| 🌐 **Adaptive Difficulty** | Questions scale with your performance over time |
| 🛡️ **Privacy First** | All AI runs locally — no data sent to external AI APIs |

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 18+ (ESM modules)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Real-time:** Socket.IO
- **AI Engine:** [Ollama](https://ollama.com) (local LLM — `llama3.2` or `gemma2`)
- **Auth:** JWT (access + refresh tokens)
- **Security:** Helmet, CORS, express-rate-limit

### Frontend
- **Framework:** React 18 + Vite
- **State:** Zustand
- **Routing:** React Router v6
- **Styling:** Tailwind CSS + custom Uiverse.io-inspired animations
- **HTTP:** Axios (with auto token refresh interceptor)
- **Carousel:** Swiper.js

### DevOps
- Docker + Docker Compose
- Google Cloud Run ready (`cloudbuild.yaml`)

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18.0.0 | Runtime |
| npm | ≥ 9.0.0 | Package manager |
| MongoDB | Atlas or local | Database |
| Ollama | Latest | Local AI model |

### 1. Install Ollama & pull a model

```bash
# Download Ollama from https://ollama.com or run the bundled OllamaSetup.exe
ollama pull llama3.2
# or for faster responses on low-end hardware:
ollama pull gemma2:2b
```

### 2. Clone & install dependencies

```bash
git clone https://github.com/your-username/AI-Interviewer.git
cd AI-Interviewer
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values — see [Environment Variables](#-environment-variables) below.

Also create `client/.env`:
```bash
cp client/.env.example client/.env  # if it exists, or create manually
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Seed daily practice questions (optional)

```bash
cd server
node seed_daily.js
```

### 5. Run in development

```bash
# From the root — starts both server and client concurrently
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |

---

## 📁 Project Structure

```
AI-Interviewer/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level pages
│   │   │   ├── Landing.jsx      # Marketing landing page
│   │   │   ├── Dashboard.jsx    # User dashboard
│   │   │   ├── DailyPractice.jsx
│   │   │   ├── interview/       # Interview flow pages
│   │   │   └── auth/            # Login / Register
│   │   ├── stores/              # Zustand state stores
│   │   │   ├── authStore.js
│   │   │   ├── interviewStore.js
│   │   │   └── dailyPracticeStore.js
│   │   ├── services/
│   │   │   └── api.js           # Axios instance + interceptors
│   │   └── index.css            # Global styles + animations
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Node.js + Express backend
│   └── src/
│       ├── config/              # Centralised config loading
│       ├── controllers/         # Route handlers
│       ├── models/              # Mongoose schemas
│       │   ├── User.js
│       │   ├── InterviewSession.js
│       │   ├── DailyQuestion.js
│       │   └── UserDailyProgress.js
│       ├── routes/              # Express routers
│       ├── services/
│       │   ├── ai/
│       │   │   └── ollamaService.js   # Ollama LLM integration
│       │   ├── dailyQuestionsService.js
│       │   └── analytics/
│       │       └── analyticsService.js
│       ├── websocket/
│       │   └── socketHandler.js      # Socket.IO events
│       └── middleware/          # Auth, error handling, rate limiting
│
├── .env.example                 # Template for environment variables
├── seed_daily.js                # Daily question seeder (in server/)
├── docker-compose.yml
├── Dockerfile
└── package.json                 # Root workspace config
```

---

## 🔐 Environment Variables

Create a `.env` file in the **root** directory:

```env
# ── Server ─────────────────────────────────────────
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# ── MongoDB ────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ai-interviewer

# ── JWT ────────────────────────────────────────────
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# ── Ollama (Local AI) ──────────────────────────────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# ── Rate Limiting ──────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ── Logging ────────────────────────────────────────
LOG_LEVEL=debug
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login + receive tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Invalidate refresh token |
| `GET` | `/api/auth/me` | Get current user profile |

### Interviews
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/interviews` | Create new interview session |
| `GET` | `/api/interviews` | List user's interview history |
| `GET` | `/api/interviews/:id` | Get session details + report |
| `PATCH` | `/api/interviews/:id/complete` | Mark session as complete |

### Daily Practice
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/daily-practice/questions` | Get today's questions + progress |
| `POST` | `/api/daily-practice/submit` | Submit an answer |
| `GET` | `/api/daily-practice/stats` | Get user stats |
| `GET` | `/api/daily-practice/streak` | Get streak info |
| `GET` | `/api/daily-practice/leaderboard` | Top users leaderboard |

### WebSocket Events
| Event | Direction | Description |
|---|---|---|
| `interview:start` | Client → Server | Begin an interview session |
| `interview:answer` | Client → Server | Submit answer to current question |
| `interview:question` | Server → Client | Receive next AI question |
| `interview:feedback` | Server → Client | Receive AI evaluation |
| `interview:complete` | Server → Client | Session end + final score |

---

## 🐳 Docker

```bash
# Build and start all services
npm run docker:up

# Stop all services
npm run docker:down
```

---

## 🧪 Development Scripts

```bash
# Root workspace
npm run dev           # Start client + server concurrently
npm run build         # Production build (client + server)
npm run lint          # Lint all workspaces

# Server only (cd server/)
npm run dev           # nodemon hot-reload
node seed_daily.js    # Seed today's daily questions
node check_db.js      # Verify MongoDB connection

# Client only (cd client/)
npm run dev           # Vite dev server on :3000
npm run build         # Production bundle
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Built with ❤️ for the GDG Hackathon 2026
</div>
#   A i - i n t e r v i e w e r -  
 