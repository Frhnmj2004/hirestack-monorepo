# HireLens — Project Context

Full context for the HireLens platform: product, architecture, backend services, and Chrome extension.
Use this as the single source of truth when onboarding contributors or prompting AI assistants.

---

## 1. What HireLens Is

HireLens is an **AI-powered interview intelligence platform**. It helps companies:

1. **Shortlist resumes** — upload a JD + batch of resumes; system ranks candidates by skill fit.
2. **Run AI screening interviews** — automated AI interviewer conducts a pre-screen call (via LiveKit voice agent) before any human involvement.
3. **Assist human interviewers in real time** — when a human interviewer conducts a live call on Google Meet, a Chrome extension shows a dedicated sidebar with questions, follow-ups, resume alerts, candidate context, and insights.
4. **Generate post-interview reports** — structured summaries, skill signals, evaluation reports for comparing candidates.

---

## 2. Monorepo Layout

```
hirestack-monorepo/
├── backend/
│   ├── apps/
│   │   ├── api-gateway/          # NestJS REST API — frontend-facing
│   │   └── interview-service/    # NestJS — resume ingestion, ranking, AI interview orchestration
│   ├── services/
│   │   └── livekit-agent/        # Python — AI voice interviewer (LiveKit rooms)
│   ├── infra/
│   │   └── docker/               # docker-compose: PostgreSQL, Redis, NATS
│   ├── libs/                     # Shared NestJS libs
│   ├── prisma/                   # Prisma schema + migrations
│   └── migrations/
├── frontend/                     # Web dashboard (Next.js or similar)
├── hirelens-extension/           # Chrome extension (this document's main focus)
├── docs/
│   ├── PROJECT_CONTEXT.md        # ← this file
│   ├── architecture.md
│   └── hirelens-chrome-extension-plan.md
├── scripts/
└── README.md
```

---

## 3. Backend Services

### 3.1 API Gateway (`backend/apps/api-gateway`)
- **Runtime**: NestJS (Node.js)
- **Role**: Single REST entrypoint for the frontend and extension.
- **Responsibilities**: Auth, job role CRUD, candidate management, interview session management, proxying to interview-service.
- **Publishes events to NATS** for async processing (e.g. `interview.dynamic.start`).
- **Database**: PostgreSQL via Prisma.
- **Cache**: Redis.
- **Port**: Typically `3000`.

### 3.2 Interview Service (`backend/apps/interview-service`)
- **Runtime**: NestJS
- **Role**: Core AI logic — resume parsing, JD-resume ranking, interview question generation, follow-up generation, resume–answer comparison.
- **Subscribes to NATS** events from API Gateway.
- **Exposes internal endpoints** consumed by API Gateway (service-to-service, not public).

### 3.3 LiveKit Agent (`backend/services/livekit-agent`)
- **Runtime**: Python
- **Role**: AI voice interviewer. Subscribes to NATS `interview.dynamic.start`, joins a LiveKit room as the AI participant, conducts structured voice interviews.
- **Dependencies**: LiveKit SDK, Whisper/STT, LLM for question generation.
- **Required env vars**: LiveKit URL, LiveKit API key/secret, OpenAI or other LLM key, NATS URL.

### 3.4 Infrastructure (`backend/infra/docker`)
- `docker-compose.yml` starts: **PostgreSQL**, **Redis**, **NATS**.
- Start with: `cd backend/infra/docker && docker compose up -d`

### 3.5 Key API Endpoints (current/planned)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | OAuth / session auth |
| `GET` | `/interview/active` | Active interview for current user |
| `POST` | `/interview/session/start` | Start a copilot session → returns `session_id` |
| `GET` | `/interview/questions?session_id=` | Questions for session |
| `GET` | `/interview/topics?session_id=` | Interview topics |
| `GET` | `/interview/coverage?session_id=` | Covered/missing competencies |
| `GET` | `/interview/score?session_id=` | Live score |
| `GET` | `/interview/status?session_id=` | Duration, questions asked |
| `POST` | `/interview/end` | End session |
| `GET` | `/candidate/profile?id=` | Candidate profile |
| `GET` | `/candidate/highlights?id=` | Resume highlights |
| `POST` | `/interview/analyze-answer` | On-demand answer analysis |
| `POST` | `/resume/verify-claim` | Resume claim verification |
| `POST` | `/interview/followups` | Generate follow-up questions |

All endpoints are currently mocked in `hirelens-extension/src/shared/api.ts`. Set `API_BASE` to enable real calls.

---

## 4. Chrome Extension

### 4.1 Purpose
The extension is the **"human interview copilot"** component. When an interviewer conducts a live interview on Google Meet, the extension injects a dedicated right-side panel (400px) into the Meet tab with:
- Current question + prev/next navigation (Dynamic Island)
- Candidate profile, resume highlights
- Expandable topic list
- Question list (click to jump)
- Live transcript
- AI insights
- Resume mismatch alerts
- Follow-up suggestions
- Competency coverage
- Live score bars
- Session status
- Action controls

### 4.2 Extension Layout

```
hirelens-extension/
├── public/
│   └── manifest.json             # MV3; matches meet.google.com; no type:"module"
├── src/
│   ├── popup/
│   │   ├── main.tsx              # React entry for popup
│   │   ├── PopupApp.tsx          # Session code input, session active state, test button
│   │   └── popup.css
│   ├── content/
│   │   ├── index.tsx             # Entry: mount(), shadow DOM, ContentApp, 4-layer session detection
│   │   ├── content.css
│   │   └── components/
│   │       ├── DynamicIsland.tsx  # Collapsible top-center question pill (Apple Intelligence style)
│   │       ├── DynamicIsland.css
│   │       ├── RightSidebar.tsx   # Full 400px sidebar with all 12 sections
│   │       └── RightSidebar.css
│   ├── background/
│   │   └── index.ts              # Minimal service worker; responds to HIRELENS_PING
│   └── shared/
│       ├── api.ts                # Mock API (replace with real fetch when backend is ready)
│       └── types.ts              # InterviewSession, SessionPayload, QuestionItem, AlertItem, etc.
├── popup.html
├── vite.config.ts                # Builds popup + background (emptyOutDir: true)
├── vite.content.config.ts        # Builds content.js as IIFE + process shim plugin
├── tsconfig.json                 # App code (src only); module: bundler
├── tsconfig.node.json            # Vite configs; types: ["node"] for path/url
└── CHANGELOG.md
```

### 4.3 Build System

```bash
cd hirelens-extension

# Install
npm install

# Build (TypeScript check + popup/background build + content IIFE build)
npm run build

# Output
dist/
  manifest.json        # copied from public/
  content.js           # IIFE: process shim (line 1) + bundled React app
  background.js        # service worker
  popup.html
  assets/              # popup JS + CSS chunks
  style.css            # content build side-effect (not loaded by extension; safe to ignore)
```

**Two separate Vite builds:**
- `vite build` → popup + background (standard ES chunks)
- `vite build --config vite.content.config.ts` → `content.js` as a single IIFE

**Why IIFE for content script**: Content scripts run as classic scripts. ES module imports would cause Chrome to try chunk loading from `chrome-extension://` URLs, which fails. A single IIFE bundles everything inline.

**`process` shim**: React and some dependencies reference `process.env.NODE_ENV`. The content script has no Node environment. `vite.content.config.ts` uses a `generateBundle` plugin to prepend `var process = typeof process !== 'undefined' ? process : { env: { NODE_ENV: 'production' } };` as the very first line of `content.js`, and also adds `define` entries for `process`, `process.env`, and `process.env.NODE_ENV`.

### 4.4 Critical Architecture Decisions

#### `chrome.storage.local` (not `.session`)
**`chrome.storage.session` is NOT accessible from content scripts.** It throws `"Access to storage is not allowed from this context"`. Always use `chrome.storage.local` for any data that needs to be read in a content script.

`chrome.storage.local` is accessible from:
- Content scripts ✓
- Popup ✓
- Background service worker ✓
- Options page ✓

`chrome.storage.session` is accessible from:
- Background service worker ✓
- Popup ✓
- Content scripts ✗ (throws error)

#### Shadow DOM full-screen overlay (Sider.ai pattern)
The shadow host element is a full-screen transparent overlay:
```css
position: fixed; top: 0; left: 0; width: 100%; height: 100%;
pointer-events: none; z-index: 2147483645;
```
Interactive children (sidebar, island) set `pointer-events: auto` individually. This ensures Meet's UI receives all clicks outside our panels, and our panels remain fully interactive.

#### Double-injection guard
Manifest injects `content.js` at `document_idle`; popup's `executeScript` may inject it again. The guard `if (document.getElementById(ROOT_ID)) return;` at the top of `mount()` makes re-injection a safe no-op. The existing React app's listeners continue handling messages and storage changes.

### 4.5 Session Flow

```
User joins Google Meet
        │
        ▼
content.js injected (document_idle) → mount() → ContentApp renders null (no session yet)
        │
        ▼ (user opens extension popup)
Popup: enter "1234" → Start interview
        │
        ├─1. chrome.storage.local.set({ hirelens_session: payload })
        │    └─→ ContentApp's storage.onChanged fires immediately → setSession() → sidebar appears
        │
        ├─2. chrome.tabs.query(meet.google.com) → focus Meet tab
        │
        ├─3. chrome.scripting.executeScript(content.js) → guard returns early (already mounted)
        │
        └─4. chrome.tabs.sendMessage(HIRELENS_START_SESSION, payload) [with 4 retries]
             └─→ ContentApp's message listener → setSession() (redundant but safe)

When session set:
  - body gets margin-right: 400px
  - DynamicIsland renders at top-center (right: 400px to center over video area)
  - RightSidebar renders on the right

User clicks End session / sidebar ✕:
  - chrome.storage.local.remove(hirelens_session)
  - storage.onChanged fires → clearSession() → sidebar disappears
  - margin-right removed
```

### 4.6 Message Types

| Type | Direction | Payload | Effect |
|------|-----------|---------|--------|
| `HIRELENS_START_SESSION` | popup → content | `SessionPayload` | Set session, show sidebar |
| `HIRELENS_CLOSE` | popup → content | — | Clear session, hide sidebar |
| `HIRELENS_PING` | popup → content | — | Returns `{ ok, hasSession }` |

### 4.7 Mock API (current state)

`src/shared/api.ts` returns fully populated mock data for codes `DEMO`, `1234`, `TEST`.

To connect to real backend:
1. Set `API_BASE = "https://api.hirelens.ai"` in `api.ts`
2. Uncomment the `fetch()` calls in each function
3. Add auth token headers (from `chrome.storage.local` where background service worker stores them)

### 4.8 Permissions

```json
{
  "permissions": ["storage", "scripting", "activeTab", "tabs", "windows"],
  "host_permissions": ["https://meet.google.com/*"]
}
```

No `identity` permission yet (auth is mock). Add when implementing real OAuth.

---

## 5. Dynamic Island

The Dynamic Island is a top-center floating pill rendered inside the shadow DOM. It displays the current interview question in a liquid-glass style inspired by Apple's Dynamic Island and Apple Intelligence UI.

### States
- **Expanded** (default): Full card — job/candidate meta, question text, progress dots, prev/next buttons.
- **Collapsed**: Compact pill — pulsing blue dot, `Q{n}/{total}` counter, truncated question preview. Click to expand.

### Key CSS properties
- `backdrop-filter: saturate(200%) blur(32px)` for true liquid glass
- Layered `box-shadow` with inset highlights
- Active progress dot is a pill shape with blue gradient + glow
- Pulsing dot via `@keyframes hl-pulse`
- Centered over video area via `right: 400px` (accounts for sidebar)

---

## 6. Right Sidebar

The sidebar is a 400px-wide `position: fixed; right: 0; top: 0; height: 100vh` panel rendered inside shadow DOM.

### Sections (in order)
1. **Header** — "HireLens" + "Copilot" badge + close (✕) button
2. **Candidate** — name, experience, skill tags, previous companies
3. **Resume highlights** — top projects, achievements, technologies
4. **Topics** — expandable list (▶/▼ toggle)
5. **Questions** — numbered list; active question highlighted in blue
6. **Transcript** — scrollable interview transcript (interviewer/candidate labeled)
7. **Insights** — AI-generated insights
8. **Alerts** — resume mismatch warnings (info/warning/error severity)
9. **Follow-ups** — suggested follow-up questions for current question
10. **Coverage** — missing competencies + suggested question
11. **Score** — bar chart per competency (out of 10)
12. **Status** — duration, questions asked, remaining topics
13. **Controls** — Next question, Generate follow-up, Mark strong/weak

### Close behavior
- Calls `postInterviewEnd(sessionId)` (mock)
- Removes session from `chrome.storage.local`
- Removes `body { margin-right: 400px }` style

---

## 7. Development Guide

### Running the extension locally

```bash
# 1. Build
cd hirelens-extension
npm install
npm run build

# 2. Load in Chrome/Brave
# chrome://extensions → Enable Developer mode → Load unpacked → select hirelens-extension/dist

# 3. Open Google Meet (join or start any call)
# 4. Click extension icon → enter "1234" → Start interview
# OR: click "Test Dynamic Island (no session needed)" to test the island only
```

### After any code change
```bash
npm run build
# chrome://extensions → click reload ↺ on HireLens
# Refresh the Google Meet tab (⌘R)
```

### Debugging
- Meet tab DevTools → Console → filter by `content.js`
- Check `document.getElementById('hirelens-copilot-root')` exists
- Check `document.getElementById('hirelens-copilot-root').shadowRoot` is not null
- Check `chrome.storage.local.get('hirelens_session', console.log)` returns the session

### Common mistakes
| Mistake | Effect | Fix |
|---------|--------|-----|
| Using `chrome.storage.session` in content script | "Access to storage is not allowed" | Use `chrome.storage.local` |
| Not refreshing Meet tab after extension reload | Old injected script still running | ⌘R on Meet tab |
| `process is not defined` | Script crashes before React mounts | Rebuild; check first line of `dist/content.js` |
| `executeScript` + shadow mode `"closed"` | Double-injection throws attachShadow error | Shadow mode `"open"` + double-injection guard |

---

## 8. Roadmap

### Phase 1 — current (mock, local only)
- [x] Extension scaffolded and working
- [x] Session code auth flow
- [x] Dynamic Island (liquid glass, collapsible)
- [x] Full right sidebar (12 sections)
- [x] All bugs fixed (storage, process, shadow DOM, double-mount)
- [x] Mock API for `DEMO`/`1234`/`TEST`

### Phase 2 — backend integration
- [ ] Replace `API_BASE = ""` with real endpoint
- [ ] Add auth token storage in background service worker
- [ ] `chrome.identity.launchWebAuthFlow` OAuth in popup
- [ ] Token refresh in service worker
- [ ] Replace mock `getSessionByCode` with real `POST /interview/session/start`

### Phase 3 — real-time
- [ ] SSE or WebSocket connection for live questions/alerts
- [ ] `chrome.runtime.connect` long-lived port: content script ↔ service worker
- [ ] Live transcript via tab audio capture (offscreen document)
- [ ] Auto-advance questions based on transcript analysis

### Phase 4 — polish
- [ ] Zoom Web / Teams Web support (same content script pattern)
- [ ] Extension icon badge (session active indicator)
- [ ] Keyboard shortcuts for next question
- [ ] Dark/light mode toggle
- [ ] Chrome Web Store submission

---

## 9. Environment Variables (backend)

```env
# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/hirelens

# Redis
REDIS_URL=redis://localhost:6379

# NATS
NATS_URL=nats://localhost:4222

# LiveKit
LIVEKIT_URL=wss://your-livekit-server
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# LLM (for interview-service and livekit-agent)
OPENAI_API_KEY=...

# JWT
JWT_SECRET=...
JWT_EXPIRY=15m
```

See `backend/.env.example` for the full list.

---

## 10. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Extension | React 18, TypeScript, Vite, Shadow DOM, MV3 |
| Web frontend | (Next.js / React — `frontend/`) |
| API Gateway | NestJS, TypeScript, Prisma, NATS |
| Interview Service | NestJS, TypeScript |
| LiveKit Agent | Python, LiveKit SDK, Whisper STT |
| Database | PostgreSQL (via Prisma ORM) |
| Cache | Redis |
| Messaging | NATS |
| Infrastructure | Docker Compose |
