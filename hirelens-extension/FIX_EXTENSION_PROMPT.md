# HireLens Chrome Extension — Fix Prompt (full context for Claude / any coder)

Use this document when asking an AI or a developer to fix the extension so the **dedicated sidebar actually appears** on Google Meet. It includes **project context**, **scope**, **detailed feature list**, and **flow-wise** behaviour.

---

## 1. Project context and scope

### What HireLens is
- **Product**: HireLens is an AI-powered interview intelligence platform. It helps companies shortlist resumes, run structured AI interviews, and detect mismatches between resumes and spoken answers. The **Chrome extension** is the “human interview copilot” part: when an interviewer conducts a live call (e.g. on Google Meet), the extension shows a **dedicated sidebar** with questions, follow-ups, resume alerts, and candidate context.
- **Extension role**: The extension is a **thin client**. It does not run AI locally. It:
  - Captures/sends meeting context to backend (when wired),
  - Displays backend responses (questions, insights, alerts),
  - Lets the interviewer act (next question, follow-up, end session).
- **Platform**: Primary target is **Google Meet** in the browser (Chrome/Brave). Same pattern could later apply to Zoom Web / Teams Web.
- **Monorepo**: The extension lives at **`hirestack-monorepo/hirelens-extension/`**. The rest of the repo has backend (NestJS, LiveKit agent) and docs; the extension is self-contained under `hirelens-extension/`.

### Scope of the extension (in scope for “fix”)
- **In scope**: Extension loads on Meet; popup accepts session code and starts a session; **a dedicated right sidebar** (our own panel, not Meet’s Add-ons/Chat) appears on the Meet tab with all sections; Dynamic Island shows current question; no console errors (`process is not defined`, “Receiving end does not exist”).
- **Out of scope for this fix doc**: Real backend API (currently mock), Zoom/Teams, audio capture, WebSocket live stream. Focus is **making the existing UI flow work** (build, load, inject, show sidebar).

---

## 2. Repo layout

```
hirestack-monorepo/hirelens-extension/
  public/
    manifest.json                 # MV3; content_scripts run content.js on meet.google.com
  src/
    popup/
      main.tsx, PopupApp.tsx      # Session code input, Start interview, End session, Show sidebar
      popup.css
    content/
      index.tsx                   # Entry: mount(), createRoot(), ContentApp (session, listener, UI)
      content.css
      components/
        DynamicIsland.tsx/.css     # Top-center pill: current question, prev/next
        RightSidebar.tsx/.css     # Full sidebar: all sections below
    background/
      index.ts                    # Service worker (minimal; messaging)
    shared/
      api.ts                      # Mock: getSessionByCode, postInterviewEnd, etc.
      types.ts                    # InterviewSession, QuestionItem, AlertItem, etc.
  popup.html
  vite.config.ts                  # Builds popup + background only
  vite.content.config.ts          # Builds content.js as single IIFE + process shim
  tsconfig.json                   # App code (src only)
  tsconfig.node.json              # Vite config files; "types": ["node"] so path/url resolve
  dist/                           # Load this as unpacked extension
    content.js                    # Single IIFE, first line = process shim
    popup.html, background.js, assets/*
```

---

## 3. Detailed feature list (extension)

### Popup (extension icon click)
- **No session**: Show “Session code” input, “Start interview” button, hint “Use DEMO, 1234, or TEST”.
- **Session active**: Show “Session active. Switch to your Meet tab…” and buttons “Show sidebar on Meet tab”, “End session”. Do **not** show the code form again while session is active.
- **Start interview**: Validate code (mock: DEMO, 1234, TEST), store session in `chrome.storage.session`, focus Meet tab, inject content script if needed, send `HIRELENS_START_SESSION` with payload. Show success or error (e.g. “Open a Google Meet tab first”).
- **Show sidebar on Meet tab**: Focus Meet tab, inject content.js, send session payload (from storage) so sidebar opens.
- **End session**: Clear storage, send `HIRELENS_CLOSE` to content script, popup returns to “no session” state.

### Content script (runs on meet.google.com)
- **Injection**: Single script `content.js` (IIFE, no top-level `import`). Runs at `document_idle`.
- **Root node**: Create `#hirelens-copilot-root`, append to `document.documentElement`. Style: `position: fixed; right: 0; top: 0; width: 400px; height: 100vh; z-index: 2147483645; background: #121214`.
- **Shadow DOM**: One shadow root; inject CSS (from `?raw` imports); mount React into `#hirelens-inner`.
- **Body shrink**: When panel is active, add a style to `document.head`: `body { margin-right: 400px !important }`.
- **Session source**: (1) On load, read `chrome.storage.session` with retries (0, 200, 500 ms). (2) On message `HIRELENS_START_SESSION`, set session from payload. (3) On `HIRELENS_CLOSE`, clear session and remove body margin.
- **Loading state**: If session is null, render a “Loading session…” panel (same 400px strip) so the strip is never blank.
- **Full UI when session set**: Render Dynamic Island + RightSidebar.

### Dynamic Island (top center of page)
- Liquid-glass style pill: job title, candidate name, **current question** text, “Question X of Y”, prev/next buttons.
- Updates when user selects another question in the sidebar or clicks prev/next.

### Right sidebar (dedicated 400px panel, our own — not Meet’s)
- **Header**: “HireLens” + “Copilot” badge, close (✕) button.
- **Sections** (in order): Candidate overview, Resume highlights, Interview topics (expandable), Mandatory questions (list; current highlighted), Transcript, Insights, Resume alerts, Follow-ups, Coverage, Score (bars), Status (duration, questions asked), Controls (Next question, Generate follow-up, Mark strong/weak).
- **Styling**: Dark glass (e.g. `#121214`), white/light text, scrollable body.
- **Close**: On ✕, call `postInterviewEnd(sessionId)` (mock), clear session, remove body margin.

### Background
- Minimal service worker; can respond to `HIRELENS_PING` or future API/SSE.

### Mock API (shared/api.ts)
- `getSessionByCode(code)` → full `InterviewSession` for DEMO/1234/TEST.
- `postInterviewEnd(sessionId)` → `{ ok: true }`.
- Types in `shared/types.ts` align with backend spec (candidate profile, highlights, questions, transcript, insights, alerts, coverage, score, status).

---

## 4. Flow-wise list (user and system)

1. **User**: Installs extension (Load unpacked → `dist`), opens Google Meet tab (join or start call).
2. **System**: Content script loads on Meet (if not already loaded). If no session in storage, sidebar shows “Loading session…” and body gets margin-right 400px.
3. **User**: Clicks extension icon → popup opens. If no session: enters **1234** → **Start interview**.
4. **System**: Popup validates code, stores session in `chrome.storage.session`, focuses Meet tab, runs `chrome.scripting.executeScript({ files: ["content.js"] })`, waits ~300 ms, sends `HIRELENS_START_SESSION` with payload. Popup shows “Session active…”.
5. **System**: Content script (either already on page or just injected) receives message or reads session from storage; sets `session` state; re-renders: Dynamic Island + full RightSidebar with mock data. Body already has margin-right.
6. **User**: Sees dedicated right panel (HireLens) and top-center pill; can change question, close sidebar, or open popup again.
7. **User**: Clicks “End session” in popup or ✕ in sidebar.
8. **System**: Storage cleared; `HIRELENS_CLOSE` sent if needed; content script clears session and removes body margin; sidebar disappears.

---

## 5. What’s already been done

- **Content script as IIFE**: Built with `vite.content.config.ts` as a **single IIFE** (no ES module imports). Main `vite build` does **not** include content (only popup + background).
- **Manifest**: `content_scripts` run `content.js` with no `type: "module"`.
- **Panel injection**: Root on `document.documentElement`; shadow root; CSS injected as strings; React mounts ContentApp. Loading state when session is null; full UI when session is set.
- **Process shim**: Custom plugin in `vite.content.config.ts` uses `generateBundle` to prepend `var process = { env: { NODE_ENV: 'production' } };` (or equivalent) at the start of `content.js` so React/deps never see “process is not defined”.
- **Vite config TypeScript**: `tsconfig.json` includes `vite.config.ts` and `vite.content.config.ts` and `"types": ["node"]` so `path` and `url` resolve (no “Cannot find module 'path'” in IDE). `@types/node` in devDependencies.

---

## 6. Current problems (what to fix)

- **Sidebar not showing** on the Meet tab (or only black/empty strip).
- **Console errors**:
  - `Uncaught ReferenceError: process is not defined at content.js:39` → content script crashes before React mounts or message listener is registered.
  - `Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.` → content script not running or not listening.
- **IDE**: “Cannot find module 'path'” / “Cannot find module 'url'” in `vite.content.config.ts` → fixed by adding `"types": ["node"]` and including the config files in `tsconfig.json`; ensure `@types/node` is installed.

---

## 7. What to fix (checklist)

1. **`process is not defined`**  
   Ensure `dist/content.js` **starts with** a line that defines `process` (e.g. `var process = { env: { NODE_ENV: 'production' } };`). Use the `generateBundle` plugin in `vite.content.config.ts` to prepend it. Rebuild and confirm the first line of `content.js` is that shim; confirm no `process is not defined` on the Meet tab.

2. **Content script = single classic script**  
   `dist/content.js` must be one file, starting with the process shim then an IIFE (e.g. `(function(){ ...`) and **no** `import` at top level. Build: `npx tsc --noEmit && vite build && vite build --config vite.content.config.ts`.

3. **Sidebar visibility**  
   Content script: create root, append to `document.documentElement`, set fixed position/size, shadow root, inject CSS, mount React. Apply `body { margin-right: 400px }` when the panel is active. If the script runs but UI is empty, check session shape and that RightSidebar/DynamicIsland get valid props.

4. **Message connection**  
   Content script must add `chrome.runtime.onMessage.addListener` early (in ContentApp useEffect). If the script crashes (e.g. process), the listener is never added → “Receiving end does not exist.” Fixing the crash fixes this.

5. **Vite config IDE errors (Cannot find module 'path' / 'url')**  
   These are Node built-ins. Fix: (1) Add `@types/node` to devDependencies. (2) Use **tsconfig.node.json** with `"include": ["vite.config.ts", "vite.content.config.ts"]` and `"compilerOptions": { "types": ["node"] }`. The IDE will use this config for the Vite files so `path` and `url` resolve.

---

## 8. How to test after changes

1. `cd hirelens-extension && npm install && npm run build`
2. Chrome/Brave → `chrome://extensions` → Load unpacked → `hirelens-extension/dist`
3. Open `https://meet.google.com` (join or start call)
4. Extension icon → enter **1234** → **Start interview** (or **Show sidebar on Meet tab** if session active)
5. **Expected**: Right-hand 400px HireLens panel and top-center question pill; no red errors in console (F12 on Meet tab)
6. If errors remain, fix the first one (e.g. process shim or reload/rebuild); then re-test

---

## 9. Key files to touch

| File | Purpose |
|------|--------|
| `vite.content.config.ts` | IIFE build for content.js; process shim plugin; `define` for process.env |
| `src/content/index.tsx` | createRoot(), mount(), ContentApp (session, listener, shrink, loading vs full UI) |
| `public/manifest.json` | content_scripts (matches, js: content.js, no type: module) |
| `package.json` | build script; devDependencies @types/node |
| `tsconfig.json` | App code (src only) |
| `tsconfig.node.json` | Vite configs; types: ["node"] for path/url |

---

## 10. Copy-paste prompt for the AI

```
I have a Chrome extension (HireLens) in hirestack-monorepo/hirelens-extension/. It should show a dedicated right sidebar on Google Meet (like Sider.ai). The sidebar is not showing. Console on the Meet tab shows:

1. Uncaught ReferenceError: process is not defined at content.js:39
2. Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.

Project context and scope:
- Extension is a thin client for “interview copilot” on Google Meet: session code in popup → sidebar on Meet with Candidate, Questions, Transcript, Insights, Alerts, Follow-ups, Coverage, Score, Controls; Dynamic Island at top for current question.
- Content script is built as a single IIFE (vite.content.config.ts); no ES modules. Process shim is prepended via generateBundle plugin. Manifest has no type: "module" for content_scripts.

Please:
1. Ensure "process is not defined" is fixed (dist/content.js must start with a process shim line).
2. Ensure content script remains one IIFE file (no top-level import).
3. Fix any IDE errors in vite.content.config.ts (Cannot find module 'path'/'url') by adding @types/node and tsconfig.node.json with include: ["vite.config.ts", "vite.content.config.ts"] and "types": ["node"].
4. After rebuild and reload, the sidebar should appear on the right of the Meet tab when the user starts a session (code 1234). No console errors.

Full context: hirelens-extension/FIX_EXTENSION_PROMPT.md (project context, feature list, flow, checklist).
```

---

End of document.
