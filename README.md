# DSA Club

An AI-powered platform for practicing Data Structures & Algorithms the way an interview actually works: no spoiled solutions, no copy-pasted code — just Socratic hints while you're stuck, and a simulated technical interview once you've solved it.

Import a problem from LeetCode/GeeksforGeeks (or add one manually), talk through your approach in a guided hint chat, then defend your solution out loud in a voice-based mock interview that scores your clarity and technical depth.

---

## Why

Most practice trackers just log what you solved. DSA Club focuses on *how* you got there — pushing you to reason before revealing anything, and grading your ability to explain a solution, not just produce one.

- **Socratic hints, not answers** — the AI never writes code or names the algorithm until you're genuinely close.
- **Voice mock interviews** — explain your solution out loud; the AI asks real follow-ups (complexity, edge cases, alternatives) and scores you.
- **Guardrails** — a classification layer detects pasted solutions, off-topic messages, and abuse before they ever reach the main prompts.
- **Streaks & stats** — daily streak tracking, topic/difficulty breakdowns, and session history.

---

## How It Works

1. **Add a problem** — paste a LeetCode/GFG URL (auto-scraped and topic-tagged) or enter one manually.
2. **Work through it in Hint Mode** — describe your approach; the AI asks guiding questions and only gets more specific the more hints you use.
3. **Mark it solved** — you're moved into Interview Mode.
4. **Explain it out loud** — speak your solution via the browser mic (Azure Speech-to-Text); the AI asks up to 4 follow-up questions.
5. **Get scored** — clarity and technical scores, strengths, improvements, and a written summary.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v6 |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT (HttpOnly cookies), Google OAuth 2.0 (Passport), bcrypt |
| AI | Google Gemini API |
| Speech | Azure Speech SDK (browser-side transcription) |
| Validation | Zod |
| Scraping | Cheerio, Axios |
| Observability | Winston, Morgan, express-rate-limit |

---

## Architecture

```
DSA-Club/
├── dsa-club-backend/
│   └── src/
│       ├── routes/          Route definitions
│       ├── controllers/     Request/response handlers
│       ├── services/        Business logic, DB & AI operations
│       ├── models/          Mongoose schemas (User, Problem, Session)
│       ├── middleware/      Auth, rate limiting, validation, error handling
│       ├── validators/      Zod schemas
│       ├── prompts/         Gemini prompt templates
│       ├── config/          DB & environment configuration
│       └── utils/           AppError, logger, catchAsync, retry logic
│
└── dsa-club-frontend/
    └── src/
        ├── context/          Global Auth & Toast state (Context + useReducer)
        ├── hooks/            useAuth, useToast
        ├── services/         Fetch wrapper (credentials: 'include')
        ├── pages/            Landing, Auth, Dashboard, Problem, Session, Interview, Result, History
        └── components/       Shared, reusable UI components
```

**Request flow:** `routes → controllers → services → models`, with Zod validating every mutating request and a centralized error handler normalizing all failures into `{ success, error: { code, message } }`.

**AI layer:** every inbound chat message first passes through a **guard classifier** (catches pasted solutions, off-topic messages, and toxicity) before reaching the hint, interview, or feedback prompts — keeping the tutoring on-topic and cheap to run.

---

## Core Features

### Hint Mode
Guidance escalates with usage instead of giving everything away up front:
- **1–2 hints** — clarifying questions about constraints and inputs
- **3–4 hints** — nudges toward a data-structure category, without naming it
- **5+ hints** — the algorithm/structure may be named, but never written out

Every response is capped at one question and three sentences — no walls of text, no code.

### Interview Mode
A four-round follow-up interview rotating through **complexity, edge cases, optimization, and alternatives**, followed by an AI-generated scorecard (clarity, technical depth, strengths, improvements).

### Streaks & Dashboard
Daily-solve streaks, topic and difficulty breakdowns, and recent-session history, computed from UTC-normalized session dates.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- API keys: [Google Gemini](https://ai.google.dev/), [Azure Speech](https://azure.microsoft.com/products/ai-services/ai-speech), Google OAuth credentials

### 1. Clone the repo
```bash
git clone https://github.com/A-S-Manoj/DSA-Club.git
cd DSA-Club
```

### 2. Backend setup
```bash
cd dsa-club-backend
npm install
```
Create a `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_AUTH=5
RATE_LIMIT_MAX_MESSAGE=30
RATE_LIMIT_MAX_IMPORT=10
RATE_LIMIT_MAX_GENERAL=60
```
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd dsa-club-frontend
npm install
```
Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

All endpoints are prefixed with `/api/v1`. Every response follows a consistent envelope:
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "SESSION_ALREADY_SOLVED", "message": "..." } }
```

| Resource | Endpoints |
|---|---|
| **Auth** | Register, login, logout, Google OAuth, profile, forgot/reset password |
| **Problems** | Import from URL (scrape + AI topic inference), create manually, fetch by ID |
| **Sessions** | Create, list, fetch, send message, update status, interview follow-up, delete |
| **Dashboard** | Aggregated stats — streaks, topic/difficulty breakdown, recent sessions |
| **Config** | Short-lived Azure Speech token issuance |

Errors are raised as a typed `AppError` and normalized centrally, covering validation failures, Mongoose errors, duplicate keys, and JWT issues — so every endpoint returns predictable, machine-readable error codes.

---

## Roadmap

- [ ] Public API documentation
- [ ] Contest/company-tagged problem sets
- [ ] Multi-language code snippet support in Hint Mode
- [ ] Deployment guide (Docker + CI)

---

## License

No license has been set yet — all rights reserved by default until one is added.

## Author

Built by [A-S-Manoj](https://github.com/A-S-Manoj).
