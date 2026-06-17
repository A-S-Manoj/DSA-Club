# DSA Club — Backend Development Plan

## Tech Stack
- **Runtime & Framework**: Node.js, Express.js
- **Database**: MongoDB, Mongoose (ODM)
- **Authentication**: JWT (Stateless), passport-google-oauth20, bcryptjs
- **AI & Speech**: Google Gemini API (`gemini-1.5-flash`), Azure Speech SDK (frontend transcribes, backend receives text)
- **Validation**: Zod (request schema validation)
- **Logging & Rate Limiting**: Winston (app logs), Morgan (HTTP logs), express-rate-limit

---

## Folder Structure
```
server/
├── src/
│   ├── routes/          — Route endpoints definitions
│   ├── controllers/     — Request/Response handlers (calls services)
│   ├── services/        — Business logic, database/AI operations
│   ├── models/          — Mongoose schemas (User, Problem, Session)
│   ├── middleware/      — Authentication, rate limiter, error handlers
│   ├── validators/      — Zod validation schemas
│   ├── prompts/         — Gemini system prompts (JS string exports)
│   ├── config/          — Central database and environment configuration
│   └── utils/           — AppError, logger, catchAsync wrapper, retry logic
├── .env.example
├── package.json
└── server.js
```

---

## Environment Variables
Create a `.env` file in the server root:
```bash
PORT=
NODE_ENV=
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
CLIENT_URL=
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_AUTH=5
RATE_LIMIT_MAX_MESSAGE=30
RATE_LIMIT_MAX_IMPORT=10
RATE_LIMIT_MAX_GENERAL=60
```

---

## Database Schema Design

### 1. User Schema (`src/models/User.model.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, default: null }, // Null if Google OAuth
  authProvider: { type: String, enum: ["local", "google"], required: true },
  authProviderId: { type: String, default: null }, // Google User ID
  totalSolved: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}
```

### 2. Problem Schema (`src/models/Problem.model.js`)
```javascript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  topic: {
    type: String,
    enum: ["arrays", "strings", "linked-lists", "trees", "graphs", "dynamic-programming", "backtracking", "binary-search", "stack-queue", "heap", "greedy", "other"],
    default: null
  },
  url: { type: String, default: null }, // Null if manual
  source: { type: String, enum: ["leetcode", "gfg", "manual"], required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### 3. Session Schema (`src/models/Session.model.js`)
```javascript
{
  userId: { type: ObjectId, ref: "User", required: true },
  problemId: { type: ObjectId, ref: "Problem", required: true },
  status: { type: String, enum: ["in_progress", "solved", "abandoned"], default: "in_progress" },
  mode: { type: String, enum: ["hint", "interview"], required: true },
  hintsUsed: { type: Number, default: 0 },
  timeSpentSeconds: { type: Number, default: 0 }, // SolvedAt - StartedAt
  conversation: [{
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["approach", "hint", "clarification", "question", "feedback"], required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  interviewFeedback: {
    clarityScore: { type: Number, min: 1, max: 10, default: null },
    technicalScore: { type: Number, min: 1, max: 10, default: null },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    summary: { type: String, default: null }
  },
  startedAt: { type: Date, default: Date.now },
  solvedAt: { type: Date, default: null }
}
```

### Database Indexes
- `{ userId: 1, status: 1 }` (for dashboard)
- `{ userId: 1, problemId: 1 }` (check if solved before creating)
- `{ userId: 1, solvedAt: -1 }` (calculating streaks)

### Streak Calculation (Inside updateStreak service)
Triggered when a session status updates to `solved`. Dates compared in UTC normalized to start of day:
- daysDiff === 0  → streak unchanged, totalSolved++
- daysDiff === 1  → currentStreak++, update longestStreak if exceeded
- daysDiff > 1    → currentStreak = 1

---

## API Endpoints (`/api/v1`)

### Response Format
- **Success (200/201)**: `{ "success": true, "data": { ... } }`
- **Error (4xx/5xx)**: `{ "success": false, "error": { "code": "MACHINE_READABLE_CODE", "message": "Description" } }`

### 1. Auth Endpoint (`/auth`)
- **POST `/auth/register`**: `{ name, email, password }` → Returns `201` + sets HttpOnly cookie.
- **POST `/auth/login`**: `{ email, password }` → Returns `200` + sets HttpOnly cookie.
- **POST `/auth/logout`**: Clears HttpOnly cookie.
- **GET `/auth/google`**: Redirects browser to Google consent.
- **GET `/auth/google/callback`**: Sets cookie, redirects browser to `{CLIENT_URL}/auth/success`.
- **GET `/auth/profile`**: Returns authenticated user profile + statistics.
- **PUT `/auth/profile`**: `{ name }` → Updates and returns user info.
- **POST `/auth/forgot-password`**: `{ email }` → Sends reset token to email. Always returns 200 to prevent user enumeration.
- **POST `/auth/reset-password`**: `{ token, newPassword }` → Resets password.

### 2. Problems Endpoint (`/problems`)
- **POST `/problems/import`**: `{ url }` → Scrapes LeetCode/GFG page, runs Gemini topic inference, and returns transient preview.
- **POST `/problems`**: Saves scraped or manual problem details to DB.
- **GET `/problems/:problemId`**: Retrieves details of a single problem.

### 3. Sessions Endpoint (`/sessions`)
- **POST `/sessions`**: `{ problemId, mode: "hint" | "interview" }` → Creates a new session. Returns `409 SESSION_ALREADY_SOLVED` if solved previously.
- **GET `/sessions`**: Query params: `status`, `topic`, `limit`, `page`. Retrieves user's session list.
- **GET `/sessions/:sessionId`**: Retrieves session details + conversation.
- **POST `/sessions/:sessionId/message`**: `{ content, type: "approach" | "clarification" }`
  - Runs message through **Guard Classifier**.
  - If toxic or off-topic, returns canned message (does not increment `hintsUsed`).
  - If approach, calls Gemini hint engine, appends user & AI messages, increments `hintsUsed` (if type is `hint`), and returns reply.
- **PATCH `/sessions/:sessionId/status`**: `{ status: "solved" | "abandoned" }` → updates status. If `solved`, sets `timeSpentSeconds` and updates streak.
- **POST `/sessions/:sessionId/interview`**: `{ explanation }` → receives voice transcript from client. Asks up to 4 follow-up questions sequentially. On the 5th step, runs feedback generator, updates `interviewFeedback`, sets `interviewComplete: true`, and returns scores.
- **DELETE `/sessions/:sessionId`**: Removes session. If it was solved, decrements user's `totalSolved`.

### 4. Config Endpoint (`/config`)
- **GET `/config/speech-token`**: Returns Azure Speech token credentials (`{ key, region }`) to authenticated users.

### 5. Dashboard Endpoint (`/dashboard`)
- **GET `/dashboard/stats`**: Returns streak counts, total solved, average hints, breakdowns (topic, difficulty), and up to 5 recent sessions.

---

## Prompt Engineering & AI Layer

All prompts use model `gemini-1.5-flash` with a central retry-on-failure utility (retries once after 1s delay on transient errors; otherwise throws `AI_SERVICE_UNAVAILABLE`).

### Truncation Strategy (Context Management)
If conversation exceeds 10 messages:
- Keep the first 2 messages (original approach).
- Replace middle messages with a summary string: `"[Earlier in session: student explored ... and was redirected]"`.
- Keep the last 6 messages (immediate context).

### Prompt 0: Guard Classifier (`src/prompts/guard.prompt.js`)
Categorizes user messages into one of:
- `VALID_APPROACH` / `HINT_REQUEST` / `ANSWER_REQUEST` → Forward to Gemini hint prompt.
- `PASTED_SOLUTION` / `OFF_TOPIC` / `TOXIC` → Returns corresponding canned response immediately without calling Gemini:
  - **PASTED_SOLUTION**: *"I can see you have found a solution. But working through it yourself is what builds interview skills. Set that aside and tell me — what was your own initial instinct when you read the problem?"*
  - **OFF_TOPIC**: *"I am here specifically to help you with this DSA problem. Let us stay focused — where are you currently stuck?"*
  - **TOXIC**: *"I am here to help you learn. Let us keep things focused on the problem."*

### Prompt 1: Hint Mode Prompt (`src/prompts/hint.prompt.js`)
Generates Socratic guidance. Rules:
1. **One question only**: Maximum 3 sentences total.
2. **Never reveal algorithm** or data structures unless student mentions them.
3. **No code or pseudocode** ever.
4. **Calibrate specificity** by `hintsUsed`:
   - 1-2 hints: Ask about problem constraints, inputs, or relationships.
   - 3-4 hints: Guide toward a data structure category without naming it (e.g. "constant time lookups").
   - 5+ hints: Can name the algorithm/DS, but do not write it out.
5. **Acknowledge** correct elements of approach before redirecting.

### Prompt 2: Interview Mode Prompt (`src/prompts/interview.prompt.js`)
Simulates a technical interviewer. Rules:
- **Phase 1 (Opening)**: First message is strictly *"Walk me through your solution."*
- **Phase 2 (Follow-up)**: Ask exactly 1 question per turn rotating through categories: `COMPLEXITY`, `EDGE CASES`, `OPTIMISATION`, `ALTERNATIVES`, `TRACE THROUGH`.
- Keep tone neutral. Do not reveal if answers are correct.
- **Phase 3 (Closing)**: After 4 follow-ups, output strictly: *"Thank you. That concludes our session."*

### Prompt 3: Feedback Mode Prompt (`src/prompts/feedback.prompt.js`)
Runs once when interview ends. Evaluates performance across the transcript. Returns raw JSON:
```json
{
  "clarityScore": 1..10,
  "technicalScore": 1..10,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "summary": "2-3 sentence assessment"
}
```

### Prompt 4: Topic Inference (`src/prompts/topicInference.prompt.js`)
Infers topic on import. Returns one value from the enum: `arrays`, `strings`, `linked-lists`, `trees`, `graphs`, `dynamic-programming`, `backtracking`, `binary-search`, `stack-queue`, `heap`, `greedy`, `other`.

---

## Error & Request Handling

### Error Codes
These are used by services when throwing errors and by the frontend when handling responses:
```
AUTH_VALIDATION_ERROR       400
AUTH_EMAIL_EXISTS           409
AUTH_INVALID_CREDENTIALS    401
AUTH_TOKEN_MISSING          401
AUTH_TOKEN_INVALID          401
AUTH_TOKEN_EXPIRED          401
AUTH_FORBIDDEN              403
PROBLEM_INVALID_URL         400
PROBLEM_SCRAPE_FAILED       422
PROBLEM_NOT_FOUND           404
SESSION_NOT_FOUND           404
SESSION_FORBIDDEN           403
SESSION_ALREADY_SOLVED      409
SESSION_ALREADY_COMPLETED   400
AI_SERVICE_UNAVAILABLE      503
AI_RATE_LIMITED             429
AI_INVALID_RESPONSE         500
VALIDATION_ERROR            400
INTERNAL_SERVER_ERROR       500
RATE_LIMIT_EXCEEDED         429
```

### Centralized Error Middleware (`src/middleware/errorHandler.middleware.js`)
All errors throw a custom `AppError` class which extends `Error`:
```javascript
class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}
```
The error handler intercepts `AppError`, Mongoose validation errors, MongoDB duplicate keys (11000 -> `AUTH_EMAIL_EXISTS`), Mongoose cast formats, and JWT signature/expiration errors. It logs the full stack trace and details via Winston, but returns clean JSON error codes to the client.

### Controllers Async Wrapper (`src/utils/catchAsync.js`)
Avoids try/catch blocks in every controller:
```javascript
export const catchAsync = fn => (req, res, next) => {
  fn(req, res, next).catch(next);
};
```
Wrap controllers: `export const getSession = catchAsync(async (req, res) => { ... });`

### Zod Validator Middleware (`src/middleware/validate.middleware.js`)
```javascript
export const validate = schema => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new AppError(400, 'VALIDATION_ERROR', message);
    }
    next(err);
  }
};
```

---

## Git Strategy
- **Branches**: `main`, `dev`, `feature/<name>`
- **Commits**: `feat` | `fix` | `chore` | `refactor` | `test` | `prompt` | `ci`
- **Format**: `<type>(<scope>): <description>` (e.g. `feat(session): add guard classifier before hint call`)

# DSA Club — Frontend Development Plan

## Tech Stack
- **Core**: React 18, Vite, React Router v6
- **State**: React Context API + `useReducer` (Global Auth & Toast), `useState` (Local page states)
- **Speech**: Azure Speech SDK (transcription runs browser-side, sends plain text to backend)
- **HTTP**: Native Fetch API wrapped in `api.js` (uses `credentials: 'include'` for HttpOnly cookie auth)
- **Styling**: CSS Modules + CSS custom properties (variables for colors/spacing, dark theme)

---

## Project Structure
```
src/
├── main.jsx                 — App entry point
├── App.jsx                  — Client-side routes & layout
├── context/
│   ├── AuthContext.jsx      — { user, isAuthenticated, isLoading }
│   └── ToastContext.jsx     — { toasts: [] }
├── hooks/
│   ├── useAuth.js           — Global auth consumer
│   └── useToast.js          — Global toast trigger
├── services/
│   └── api.js               — Fetch wrapper with credentials: 'include'
├── styles/
│   ├── global.css           — CSS reset and base variables
│   ├── tokens.css           — Design tokens (colors, margins)
│   └── theme.css            — Dark/edgy Fight Club theme variables
├── pages/
│   ├── Landing/             — Hero & CTA
│   ├── Auth/                — Login, Register, Forgot/Reset Password, OAuthSuccess
│   ├── Dashboard/           — Profile statistics & recent attempts
│   ├── Problem/             — Scrape/Import or manual problem creator
│   ├── Session/             — Socratic hint chat mode
│   ├── Interview/           — Azure SDK voice follow-up page
│   ├── Result/              — Score breakdown and feedback
│   └── History/             — Paginated list of all past attempts
└── components/              — Reusable modular UI components (shared, auth, dashboard, problem, session, interview, result)
```

---

## Environment & Local Setup

### 1. Configure `.env`
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
*(Azure Speech credentials are retrieved dynamically from `GET /api/v1/config/speech-token`, so they are not stored in the client's `.env`).*

### 2. Install & Run
```bash
npm install
npm run dev
```

---

## Global State Management

### AuthContext (`src/context/AuthContext.jsx`)
- **State**: `{ user, isAuthenticated, isLoading }`
- **Actions**:
  - `AUTH_LOADING`: Triggered on boot during auth verification.
  - `AUTH_SUCCESS`: Set user profile details.
  - `AUTH_FAILURE`: Unauthenticated state (redirects to `/login`).
  - `UPDATE_USER`: Updates user metadata (profile edits).
  - `LOGOUT`: Resets auth state to unauthenticated.

### ToastContext (`src/context/ToastContext.jsx`)
- **State**: `{ toasts: [] }`
- **Actions**:
  - `ADD_TOAST`: `{ id, message, type: 'success' | 'error' | 'info' }`
  - `REMOVE_TOAST`: Triggered automatically after 3000ms.

---

## HTTP Client & Authentication

### Fetch Wrapper (`src/services/api.js`)
Configured to forward cookies automatically:
```javascript
const request = async (method, path, body = null) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Automatically sends HttpOnly JWT cookies
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json();
  if (!data.success) throw { code: data.error.code, message: data.error.message };
  return data.data;
};
```

### Auth Flows
1. **Local Signup/Login**: POST `/auth/register` or `/auth/login` → Server sets HttpOnly cookie → Dispatch `AUTH_SUCCESS` → Navigate `/dashboard`.
2. **Google OAuth**: GET `/auth/google` → Google consent → backend sets cookie → redirect `/auth/success` → GET `/auth/profile` → `AUTH_SUCCESS` → `/dashboard`.
3. **ProtectedRoute**:
   On mount, if `isLoading` is true, calls `GET /auth/profile`. Shows `PageLoader` during verification. Redirects to `/login` if auth fails.

---

## Page Implementation & Data Flows

### 1. Dashboard (`/dashboard`)
- **API Call**: `GET /dashboard/stats` (retrieves streak, solved count, time spent, topic/difficulty breakdown, and recent sessions).
- **Greeting Logic**: Renders dynamic greeting based on time of day:
  - 5am–12pm  → "Good morning"
  - 12pm–5pm  → "Good afternoon"
  - 5pm–12am  → "Good evening"
  - 12am–5am  → "Still grinding?"
- **Subcomponents**: `StatsGrid` (metrics layout), `TopicBreakdown` (horizontal bar ratios), `DifficultyBreakdown` (easy/medium/hard progress tracker).

### 2. Add Problem (`/problems/new`)
- **Import Tab**:
  - Submit target URL → `POST /problems/import` → Renders `ProblemPreview`.
  - Confirm → `POST /problems` (creates problem) → `POST /sessions` (initiates hint session).
- **Manual Tab**:
  - Fields: title, description, difficulty.
  - Submit → `POST /problems` → `POST /sessions`.
- **Already Solved Check**:
  - `409 SESSION_ALREADY_SOLVED` → show `AlreadySolvedModal`:
    - Option 1: `POST /sessions` with `mode: "interview"`
    - Option 2: `POST /sessions` as new attempt

### 3. Session Page (`/sessions/:id`)
- **API Calls**:
  - Mount: `GET /sessions/:id` (session, messages) & `GET /problems/:problemId` (details).
  - Messaging: `POST /sessions/:id/message` (body: `{ content, type: "approach" | "clarification" }`).
- **Hint Indicator**: Renders 5-dot `HintLevelIndicator` mapped to `hintsUsed`:
  - 0     → ○○○○○  "Start your approach"
  - 1-2   → ●●○○○  "Broad direction"
  - 3-4   → ●●●○○  "Getting more specific"
  - 5+    → ●●●●●  "Algorithm revealed"
- **Timer**: Triggers a local interval timer on mount (formatted as `mm:ss` via `SessionStats`); stops when solved/abandoned.
- **Optimistic Update**: Append user message to conversation immediately on send, remove on API failure.
- **ChatInput Behaviour**:
  - Enter      → send message
  - Shift+Enter → newline
  - Disabled when `isAIResponding` is true
- **Actions**:
  - Solve: `PATCH /sessions/:id/status` with `{ status: "solved" }` → redirects to interview.
  - Abandon: `PATCH /sessions/:id/status` with `{ status: "abandoned" }` → redirects to dashboard.

### 4. Interview Page (`/sessions/:id/interview`)
- **Azure Integration**:
  - Mount: Fetch auth config via `GET /config/speech-token`.
  - Initialize `SpeechRecognizer` (Azure SDK) and persist instance in `useRef`.
- **Mic Operations**:
  - Start: Begins continuous transcription and updates `liveTranscript` in real time.
  - Stop: Terminates recording, sends final `liveTranscript` to `POST /sessions/:id/interview` as `{ explanation }`.
- **AI Round-trip**: Appends messages to UI; if response has `interviewComplete: true`, redirects to result screen. Releases recognizer resource on unmount.

### 5. Result Page (`/sessions/:id/result`)
- **API Call**: `GET /sessions/:id` to retrieve final `interviewFeedback`.
- **Displays**: Clarity score, technical score, lists of strengths/improvements, AI summary, and total solve time.

### 6. History Page (`/history`)
- **API Call**: `GET /sessions?page=X&limit=Y` (paginated list of past sessions).
- **Fallback**: Shows `EmptyState` component with CTA to add a new problem if history is empty.