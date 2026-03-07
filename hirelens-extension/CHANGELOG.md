# HireLens Extension — Changelog

All notable changes to the Chrome extension are documented here.
Format: `[version] YYYY-MM-DD — summary`

---

## [Unreleased] — 2026-03-07

### Backend fix (interview creation 500)

- **"Failed to create interview. Check the backend is running."** — The 500 on `POST /interviews` was caused by the assist-service storing knowledge triples with a numeric `object` (e.g. `api_requests_per_day: 2000000`) while the DB column expects a string. Fixed in backend: `KnowledgeService.storeFact()` now coerces `object` to string; `AnalysisService.extractClaims()` normalizes LLM output to string. Date-range contradiction detection in the knowledge graph (previously stubs) is now implemented so timeline contradictions (e.g. "worked at Acme in 2018" when resume says 2019–2023) are detected.

---

### Critical fixes (session detection / sidebar not showing)

#### Root cause identified and fixed
- **`chrome.storage.session` is inaccessible from content scripts** — replaced with `chrome.storage.local` everywhere. `session` storage area throws `"Access to storage is not allowed from this context"` in content scripts; `local` is universally accessible across all extension contexts (content scripts, popup, background service worker).
- All previous attempts to read/write `chrome.storage.session` in `content/index.tsx` were silently failing and returning `undefined`, causing crashes like `TypeError: Cannot read properties of undefined (reading 'hirelens_session')`.

#### `process is not defined` crash
- **Problem**: Content script crashed at line 39 with `Uncaught ReferenceError: process is not defined`. React internals reference bare `process` identifiers that were not covered by the Vite `define` config.
- **Fix**: Added `"process": JSON.stringify({ env: { NODE_ENV: "production" } })` to `vite.content.config.ts` define block, covering all bare `process` references after `process.env.NODE_ENV` and `process.env` replacements.
- Verified: `grep -c "process\." dist/content.js` returns `0`; first line of `dist/content.js` is the prepended process shim.

#### Double-mount / `attachShadow` crash
- **Problem**: Manifest injects `content.js` at `document_idle`; popup's `executeScript` also injects it. With `mode: "closed"` shadow, `root.shadowRoot` returned `null` on the existing host, causing `attachShadow` to throw `"Shadow root cannot be created on a host which already hosts a shadow tree"`.
- **Fix**:
  - Added guard at top of `mount()`: `if (document.getElementById(ROOT_ID)) return;` — re-injection is a no-op; the existing React app's listeners handle everything.
  - Changed shadow root to `{ mode: "open" }`.

#### Loading state cluttering Meet on every page load
- **Problem**: Sidebar showed "Loading session…" and applied `margin-right: 400px` to Meet's body on every page load, even for users with no session.
- **Fix**: `ContentApp` returns `null` when session is `null`. `applyMeetShrink` is only called when session is truthy.

---

### Reliability improvements

#### 4-layer session detection (bulletproof)
`ContentApp` now detects session through four independent channels — any one is sufficient:

1. **Immediate storage read** on mount via `chrome.storage.local.get`
2. **1-second polling for 30 seconds** — catches delayed injection, timing gaps, and Chrome builds where `storage.onChanged` is unreliable. Uses a `useRef` to avoid stale closure bugs in `setInterval`.
3. **`chrome.storage.onChanged` listener** (area: `"local"`) — fires instantly the instant popup calls `storage.local.set`.
4. **Direct message listener** — handles `HIRELENS_START_SESSION`, `HIRELENS_CLOSE`, and `HIRELENS_PING`.

#### Popup: always search Meet tab by URL
- `getMeetTab()` uses `chrome.tabs.query({ url: "https://meet.google.com/*" })` instead of assuming the currently-active tab is Meet.
- Prevents the "Show sidebar" button from silently doing nothing when the popup is opened from a different tab (e.g. the Extensions page).

#### Popup: message retry
- `injectAndSend()` retries `chrome.tabs.sendMessage` up to 4 times with 400 ms gaps.
- Session is always stored to `chrome.storage.local` BEFORE sending the message, so the `storage.onChanged` path fires regardless of message delivery.

---

### Architectural changes

#### Root element: narrow strip → full-screen overlay
- **Before**: Shadow host was a 400px-wide fixed strip. Dynamic Island (centered via `left: 50%`) could be mis-positioned or clipped.
- **After**: Host is `position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none`. This is the Sider.ai / Parakeet pattern — a transparent full-screen overlay; sidebar and island inside shadow DOM use their own `position: fixed` declarations relative to the viewport.

#### Shadow root: `"closed"` → `"open"`
Allows `host.shadowRoot` to return the actual shadow root (needed for the double-mount guard to work correctly).

#### CSS: `pointer-events: auto` on `.hl-sidebar`
Shadow host has `pointer-events: none` for click-through. The sidebar explicitly opts in to `pointer-events: auto` so it remains interactive.

---

### Dynamic Island redesign

#### Collapsible pill ↔ expanded card
- **Expanded** (default): liquid glass card with question text, job/candidate meta, progress dots, prev/next nav.
- **Collapsed**: compact pill showing `Q{n}/{total}` + truncated question preview; click to expand.
- Collapse button (▲) in top-right of expanded card.

#### Apple Intelligence liquid glass
- `backdrop-filter: saturate(200%) blur(32px)` — true frosted glass, not flat transparency.
- Layered `box-shadow`: inset highlight + inset inner shadow + outer drop + outer ambient.
- Pulsing blue dot (via `@keyframes hl-pulse`) in collapsed pill.
- Question text gets subtle `text-shadow` glow.
- Progress indicator: active question is a pill-shaped dot (`width: 18px`) with blue gradient + glow; past questions are filled blue; future questions are dim.

#### Centered in Meet video area
`right: 400px` on `.hl-di-wrapper` offsets the center calculation to account for the sidebar, keeping the island visually centered over the video area rather than over the full viewport.

---

### Testing

#### "Test Dynamic Island" button added to popup
- Available both when a session is active and on the initial no-session screen.
- Injects a mock `SessionPayload` with 3 sample questions directly to the Meet tab without requiring a session code.
- Useful for visual testing of the Dynamic Island without going through the full auth flow.
- Green-styled button to distinguish from primary actions.

---

## [Initial build] — 2026-03-06

### Extension scaffolded from scratch

- Manifest V3 with `content_scripts` on `meet.google.com`, `scripting`, `storage`, `tabs`, `windows` permissions.
- `vite.config.ts` builds popup + background.
- `vite.content.config.ts` builds `content.js` as a single IIFE (no ES module imports, `lib.formats: ["iife"]`).
- `tsconfig.node.json` with `"types": ["node"]` covering both Vite config files, fixing `Cannot find module 'path'` / `'url'` IDE errors.
- `@types/node` in devDependencies.

### Content script: shadow DOM + React
- Creates `#hirelens-copilot-root` on `document.documentElement` (not `body`) so Meet wrapper elements can't hide it.
- Attaches shadow root; injects CSS from `?raw` imports (avoids external file loading).
- Mounts React `ContentApp` into `#hirelens-inner`.

### Popup: session code flow
- Input + "Start interview" button; validates against mock codes `DEMO`, `1234`, `TEST`.
- Session active state: "Show sidebar on Meet tab" + "End session".
- Stores `SessionPayload` in storage; sends `HIRELENS_START_SESSION` message to content script.

### Shared mock API (`src/shared/api.ts`)
- `getSessionByCode(code)` returns full `InterviewSession` mock for `DEMO`/`1234`/`TEST`.
- `postInterviewEnd(sessionId)` → `{ ok: true }`.
- Full type definitions in `src/shared/types.ts` aligned with backend spec.

### Right sidebar
- All 12 sections: Candidate overview, Resume highlights, Topics (expandable), Questions, Transcript, Insights, Alerts, Follow-ups, Coverage, Score bars, Status, Controls.
- Dark glass styling (`#121214`), scrollable body, collapsible topic rows.

### Dynamic Island (original)
- Fixed top-center pill; job title, candidate name, question text, prev/next buttons.
- `backdrop-filter` glass style.
