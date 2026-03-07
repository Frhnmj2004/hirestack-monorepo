# HireLens Chrome Extension — Implementation Plan

**Scope:** Chrome extension for **Google Meet overlay** (human interview copilot) with **live AI assistance**, **SSO**, and real-time features.

---

## 1. Extension Purpose & User Flow

| Actor | Flow |
|-------|------|
| **Recruiter** | Logs in via SSO → Opens extension popup → Starts "Interview mode" for a job role + candidate → Joins Google Meet → Extension overlay shows questions, follow-ups, resume alerts in real time. |
| **System** | Extension injects UI on `meet.google.com`; background/service worker talks to HireLens API; optional real-time channel (WebSocket/SSE) for live suggestions. |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Chrome Extension (Manifest V3)                                  │
├─────────────────────────────────────────────────────────────────┤
│  Popup (options, start interview, SSO)                           │
│  Content Script (meet.google.com) → Overlay UI (React or vanilla)│
│  Service Worker (background) → API calls, token refresh, SSE   │
│  Offscreen / optional → audio capture if needed for STT          │
└─────────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐   ┌──────────────────────────────────────────┐
│  HireLens API    │   │  Optional: WebSocket/SSE for live         │
│  (NestJS)        │   │  suggestions (questions, follow-ups,      │
│  - Auth / SSO    │   │  resume mismatch alerts)                  │
│  - Job roles     │   └──────────────────────────────────────────┘
│  - Candidates    │
│  - Session config│
└─────────────────┘
```

---

## 3. SSO (Single Sign-On)

### 3.1 Options

| Approach | Pros | Cons |
|----------|------|------|
| **A. OAuth in extension (popup)** | Same as web; no dependency on dashboard tab. | Need to host redirect URI for extension (e.g. `https://yourapp.com/extension-callback` or Chrome identity). |
| **B. Chrome Identity API** | Native `chrome.identity.getAuthToken` for Google Sign-In. | Tied to Google only; need to map Google user to HireLens user in backend. |
| **C. Session from dashboard** | User logs in on HireLens dashboard; extension reads session (e.g. cookie or message). | User must have dashboard open; cookie domain/cross-origin rules. |

**Recommendation for Phase 1:** **Option B (Chrome Identity)** if your primary users are on Google Workspace; else **Option A** with a proper OAuth2 provider (e.g. Auth0, Clerk, or your NestJS auth).

### 3.2 Implementation Outline (Option A — OAuth in extension)

1. **Backend (NestJS)**  
   - Add auth module: OAuth2 (e.g. Google + optional GitHub/Microsoft).  
   - Issue short-lived **access token** + **refresh token**; store refresh server-side or in encrypted form.  
   - Endpoints: `POST /auth/login` (redirect from provider), `POST /auth/refresh`, `GET /auth/me`.

2. **Extension**  
   - **Popup:** "Login with Google" opens `chrome.identity.launchWebAuthFlow` with your OAuth URL.  
   - Redirect URI: e.g. `https://api.hirelens.ai/auth/extension-callback` or a dedicated page that returns token in URL fragment/query and closes.  
   - Store **access_token** (and optionally **refresh_token**) in `chrome.storage.session` (or `chrome.storage.local` with care).  
   - Service worker: before each API call, check expiry; if expired, call refresh endpoint and update storage.

3. **Security**  
   - Use `chrome.storage.session` for tokens (cleared when browser closes) or encrypted local storage.  
   - Content Security Policy in manifest to restrict script sources.  
   - Backend: validate redirect_uri strictly for extension flow.

### 3.3 Implementation Outline (Option B — Chrome Identity)

1. **Backend**  
   - Accept **Google ID token** (JWT) on a dedicated endpoint (e.g. `POST /auth/google`).  
   - Verify JWT with Google’s certs; create or link HireLens user; return your access + refresh tokens.

2. **Extension**  
   - In popup: call `chrome.identity.getAuthToken({ interactive: true })` to get Google token.  
   - Send that token to `POST /auth/google`; store returned HireLens tokens in `chrome.storage.session`.  
   - Same refresh logic in service worker as in 3.2.

---

## 4. Overlay on Google Meet

### 4.1 Target Page & Injection

- **Match pattern:** `https://meet.google.com/*` (and optionally `*://*.meet.google.com/*`).  
- **Content script:**  
  - Runs at `document_idle` so Meet UI is ready.  
  - Injects a single **root** node (e.g. a div with a known id like `#hirelens-overlay-root`) into `document.body`.  
  - Overlay UI can be implemented as:  
    - **React** (bundled with your build) inside a shadow DOM to avoid Meet’s CSS affecting you and vice versa, or  
    - **Vanilla JS + shadow DOM** for smaller bundle and no React dependency.

### 4.2 Overlay UI Layout (Collapsible Sidebar)

- **Position:** Fixed sidebar on the right (or left), e.g. 320–400px width, collapsible to a narrow strip/tab so it doesn’t cover Meet.  
- **Sections:**  
  - **Interview context:** Job role name, candidate name (from HireLens session).  
  - **Mandatory questions:** List from job role; highlight “current” when the system infers which question is being answered (if you have real-time input).  
  - **Dynamic follow-ups:** Suggested follow-up questions (updated live if backend supports it).  
  - **Resume / inconsistency alerts:** e.g. “Candidate said X; resume says Y” when backend sends alerts.  
  - **Notes / actions:** Optional: “Mark as answered”, “Skip”, “Add note”.

### 4.3 Styling & Isolation

- Use **Shadow DOM** for the overlay so Meet’s global CSS doesn’t break your layout.  
- Use a **prefix** for all classes (e.g. `hirelens-`) to avoid clashes.  
- Optional: load a small CSS file from the extension or inline critical CSS in the content script.

### 4.4 Communication: Popup ↔ Content Script ↔ Service Worker

- **Popup** sets “current session” (job role, candidate, interview session id) in `chrome.storage.session` and tells the content script to “show overlay” (e.g. via `chrome.tabs.sendMessage`).  
- **Content script** listens for messages: e.g. `SHOW_OVERLAY`, `HIDE_OVERLAY`, `UPDATE_QUESTIONS`, `UPDATE_ALERTS`.  
- **Service worker** fetches from HireLens API (questions, session config, alerts) and sends messages to the content script.  
- Use **long-lived connection** (`chrome.runtime.connect`) from content script to background for streaming updates (e.g. SSE or WebSocket events pushed to content script).

---

## 5. Live Features (Real-Time)

### 5.1 What “Live” Means Here

- **Live questions / follow-ups:** Overlay updates as the “current question” or “suggested follow-ups” change.  
- **Live resume alerts:** When the system detects a possible inconsistency (e.g. experience mismatch), show it in the overlay immediately.  
- **Optional:** Live transcript of the candidate (would require capturing Meet’s audio or screen; see 5.4).

### 5.2 Backend Requirements (New or Existing)

- **Session for “human” interview:**  
  - When recruiter starts an interview from the extension, create an **interview session** of type “human_copilot” (not full AI interview).  
  - Store: job_role_id, candidate_id, meeting_link (optional), status.

- **Real-time channel:**  
  - **Option 1 — SSE (Server-Sent Events):** Extension opens `GET /v1/copilot-sessions/:sessionId/events` (with auth). Backend streams events: `current_question`, `follow_ups`, `resume_alert`.  
  - **Option 2 — WebSocket:** e.g. `wss://api.hirelens.ai/ws/copilot/:sessionId`. Same event types.  
  - **Option 3 — Polling:** Service worker polls `GET /v1/copilot-sessions/:sessionId/state` every 5–10 s. Simpler, less real-time.

For Phase 1, **polling** is enough; later replace with SSE or WebSocket.

### 5.3 Where Do “Live” Insights Come From?

- **Without candidate audio:** Recruiter can “mark current question” in the overlay (dropdown or “Next” button). Backend then returns suggested follow-ups and any static resume checks for that question.  
- **With candidate audio (later):** Extension would need to capture audio (e.g. from a tab or microphone). Chrome has restrictions; one approach is an **offscreen document** with `getUserMedia` or a tab capture. Audio is sent to your backend; you run STT + resume-matching and push events to the same SSE/WebSocket. This is a larger scope (privacy, permissions, backend pipeline).

**Phase 1 recommendation:**  
- **Manual “current question”** selection in overlay.  
- Backend returns **precomputed** follow-ups and **static** resume highlights per question (from job role + candidate resume).  
- **“Live”** = extension polls (or SSE) and overlay updates when recruiter moves to next question or when you add alerts from backend.

### 5.4 Optional: Live Transcript (Post–Phase 1)

- **Tab capture** of Meet tab → send audio to backend → STT → same pipeline as your existing LiveKit agent (resume comparison, follow-up generation).  
- Requires: `desktopCapture` or tab audio capture, user consent, backend endpoint that accepts audio stream and runs STT + NLP.  
- Privacy and compliance (recording, consent) must be handled explicitly.

---

## 6. Extension Project Structure

Implemented at **repo root** as `hirelens-extension/` (not under `apps/`):

```
hirestack-monorepo/
  hirelens-extension/            # Chrome extension (session code, Dynamic Island, right sidebar)
      public/
        manifest.json
        icons/
      src/
        popup/
          popup.html
          popup.tsx              # React or vanilla: login, job/candidate picker, “Start”
        content/
          content.ts             # Injected into meet.google.com
          overlay/
            overlay.tsx          # Overlay UI (React or vanilla)
            overlay.css
        background/
          service-worker.ts      # API, token refresh, SSE/polling, messaging
        shared/
          api.ts                # Fetch wrappers with auth
          storage.ts            # chrome.storage helpers
          types.ts
      package.json
      tsconfig.json
      (vite or webpack config for extension build)
```

- **Build:** Use **Vite** or **Webpack** with an extension target (e.g. `webpack-extension-reloader` for dev). Output: `dist/` with `manifest.json`, `background.js`, `content.js`, `popup.js`, and assets.  
- **Manifest V3:** Use `service_worker` in manifest; no persistent background page.

---

## 7. Implementation Phases

### Phase 1 — Foundation (Weeks 1–2)

1. **Scaffold extension**  
   - Manifest V3, content script on `meet.google.com`, empty overlay (sidebar shell).  
   - Popup: placeholder UI.  
   - Load unpacked in Chrome and confirm overlay appears on Meet.

2. **SSO**  
   - Backend: Add auth module (e.g. Google OAuth or Chrome Identity as in 3.2/3.3).  
   - Extension: Login in popup; store tokens in `chrome.storage.session`; service worker attaches Bearer token to API requests.

3. **API integration**  
   - Backend: Endpoints for job roles list, candidates list, and “create copilot session” (job + candidate).  
   - Extension: Popup fetches job roles and candidates; user selects and starts a “copilot session”; store `sessionId` and send to content script.

4. **Overlay content**  
   - Content script receives sessionId; fetches (or gets from background) session config: job name, candidate name, mandatory questions.  
   - Render list of questions in overlay (no “live” yet).

### Phase 2 — Live Data (Weeks 2–3)

5. **Backend: copilot session state**  
   - `GET /v1/copilot-sessions/:id` returns current question index, suggested follow-ups, resume alerts (can be static per question at first).  
   - Optional: `PATCH /v1/copilot-sessions/:id` to set “current_question_index” (from overlay “Next” / selector).

6. **Extension: live updates**  
   - Service worker polls `GET /v1/copilot-sessions/:id` every 5–10 s (or connects to SSE if implemented).  
   - Sends messages to content script: `UPDATE_QUESTIONS`, `UPDATE_ALERTS`.  
   - Overlay highlights current question and shows follow-ups + alerts.

7. **Overlay UX**  
   - Collapse/expand sidebar; “Next question” / question selector; clear styling and error states.

### Phase 3 — Polish & Scale (Week 3–4)

8. **SSO polish**  
   - Token refresh in service worker; logout; optional “Remember me” with secure storage.

9. **Offline / errors**  
   - Handle no network; show “Reconnect” in overlay; don’t lose session id.

10. **Analytics & permissions**  
    - Request only needed permissions (identity, storage, script on meet.google.com).  
    - Optional: minimal analytics (e.g. “interview started”, “session id”) for product insights.

---

## 8. Manifest V3 Snippet (Reference)

```json
{
  "manifest_version": 3,
  "name": "HireLens Interview Copilot",
  "version": "1.0.0",
  "description": "AI-powered interview assistant for Google Meet",
  "permissions": [
    "storage",
    "identity",
    "scripting"
  ],
  "host_permissions": [
    "https://meet.google.com/*",
    "https://api.hirelens.ai/*",
    "https://your-auth-domain.com/*"
  ],
  "action": { "default_popup": "popup.html", "default_icon": "icons/icon.png" },
  "background": { "service_worker": "background.js" },
  "content_scripts": [{
    "matches": ["https://meet.google.com/*"],
    "js": ["content.js"],
    "css": [],
    "run_at": "document_idle"
  }],
  "web_accessible_resources": [{ "resources": ["overlay.css"], "matches": ["https://meet.google.com/*"] }]
}
```

Adjust `api.hirelens.ai` and auth domain to your actual URLs.

---

## 9. Summary Checklist

| Item | Owner | Phase |
|------|--------|--------|
| Extension scaffold (MV3, content script, overlay shell) | Frontend | 1 |
| Backend auth (OAuth or Google Identity) | Backend | 1 |
| Extension SSO (popup login, token storage, refresh) | Frontend | 1 |
| API: job roles, candidates, create copilot session | Backend | 1 |
| Overlay: show questions from session | Frontend | 1 |
| API: get copilot session state (current question, follow-ups, alerts) | Backend | 2 |
| Extension: polling (or SSE) + overlay updates | Frontend | 2 |
| Overlay: current question selector, follow-ups, alerts UI | Frontend | 2 |
| Token refresh, logout, error handling | Both | 3 |
| (Optional) SSE/WebSocket for real-time | Backend + Frontend | 3 |
| (Later) Audio capture + STT for full “live” transcript | Both | Post–Phase 3 |

This plan gets you to a working **Chrome extension with overlay on Google Meet**, **SSO**, and **live-ish** updates (polling or SSE) for questions, follow-ups, and resume alerts, with a clear path to add real-time transcript later.
