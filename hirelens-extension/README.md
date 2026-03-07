# HireLens Chrome Extension

Thin frontend client for **Google Meet** (and later Zoom Web, Teams Web). Session-code auth, **Dynamic Island** (liquid glass) for the current question, and a **dedicated right sidebar** that shrinks the meeting and shows the full spec UI. All heavy logic (LLM, RAG, scoring) lives in the backend; the extension only captures context, sends data, and displays backend responses.

## Flow (aligned with spec)

1. **Meet open** — Recruiter opens a Google Meet. Extension can call `GET /interview/active` when the page loads (mock included).
2. **Session code** — In the extension popup, recruiter enters the session code and clicks **Start interview**. Extension calls session-by-code (mock: `DEMO`, `1234`, `TEST`) and stores the session.
3. **Connection** — If the content script wasn’t loaded (e.g. tab opened before extension), the popup injects it, then sends the session so the sidebar opens without “Receiving end does not exist.”
4. **Meet shrunk** — `body` gets `margin-right: 400px`; the **dedicated right sidebar** (400px, full height) is our own panel with all sections below.
5. **Dynamic Island** — Liquid-glass pill at top center: current question, job/candidate, prev/next.
6. **End** — Closing the sidebar calls `POST /interview/end` (mock) and clears the session.

## Dedicated right sidebar sections

1. **Candidate** — Name, experience, key skills, previous companies (from `GET /candidate/profile`).
2. **Resume highlights** — Top projects, achievements, technologies (`GET /candidate/highlights`).
3. **Topics** — Expandable interview topics and their questions (`GET /interview/topics`).
4. **Questions** — Mandatory questions list; current one highlighted (`GET /interview/questions`).
5. **Transcript** — Streaming transcript (mock entries; real: WebSocket).
6. **Insights** — Extracted insights from answers (backend `POST /interview/analyze-answer`).
7. **Alerts** — Resume verification alerts, e.g. experience mismatch (`POST /resume/verify-claim`).
8. **Follow-ups** — Dynamic follow-up suggestions (`POST /interview/followups`).
9. **Coverage** — Missing competencies and suggested question (`GET /interview/coverage`).
10. **Score** — Live competency scores (`GET /interview/score`).
11. **Status** — Duration, questions asked, remaining topics (`GET /interview/status`).
12. **Controls** — Next question, Generate follow-up, Mark strong/weak (placeholders for backend).

## UI style

- **Dark glassmorphism / Apple liquid glass** across the extension: popup, Dynamic Island, and sidebar use dark semi-transparent backgrounds, `backdrop-filter: blur`, and subtle borders.
- Popup: dark background, glass card, dark inputs and primary button.
- Sidebar: dark glass panel; cards and lists use the same aesthetic.

## Build & load

```bash
npm install
npm run build
```

Load unpacked in Chrome: **Extensions** → **Load unpacked** → select the `dist` folder. Open a **Google Meet** tab, click the extension, enter **DEMO** (or **1234** / **TEST**), click **Start interview**. If you see “Receiving end does not exist,” refresh the Meet tab and try again (or the popup will inject the script and retry).

## Mock vs real API

- **Mock:** `src/shared/api.ts` implements the full flow with mock data: `getInterviewActive`, `postSessionStart`, `getSessionByCode`, `getCandidateProfile`, `getCandidateHighlights`, `getInterviewTopics`, `getInterviewQuestions`, `getInterviewCoverage`, `getInterviewScore`, `getInterviewStatus`, `postInterviewEnd`. One `getSessionByCode(code)` returns a full `InterviewSession` with all of the above for the sidebar.
- **Real:** Set `API_BASE` in `api.ts`, add your origin to `host_permissions` in `public/manifest.json`, and replace each function body with the corresponding `fetch` call. Types in `src/shared/types.ts` match the spec (ActiveInterview, SessionStartResponse, CandidateProfile, ResumeHighlights, InterviewTopic, TranscriptEntry, CoverageResponse, InterviewScore, InterviewStatus, etc.).

## Project layout

```
hirelens-extension/
  public/manifest.json
  src/
    popup/             # Session code, Start interview (dark glass)
    content/           # Injected on meet.google.com
      components/
        DynamicIsland  # Liquid glass question pill
        RightSidebar   # All 12 sections above
    background/        # Service worker (messaging, future API/SSE)
    shared/
      api.ts           # Mock API; swap for fetch
      types.ts         # Spec types
  popup.html
  dist/                # Load unpacked in Chrome
```

## Icons (optional)

Add `public/icons/icon16.png`, `icon48.png`, `icon128.png` and reference them in `manifest.json` under `action.default_icon`.
