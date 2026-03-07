# HireLens Extension — Manual Testing Guide (from start)

End-to-end manual testing from a clean slate. The extension adds a **dedicated right sidebar** on Google Meet (Sider.ai–style) and a **Dynamic Island** for the current question. All flows can be tested with the **demo fallback** when the backend is offline.

---

## Prerequisites

- **Chrome or Brave** (Chromium-based).
- **Built extension**: from repo root:
  ```bash
  cd hirelens-extension
  npm install
  npm run build
  ```
- **Optional**: Backend (API gateway + assist-service) running for real interview creation and live pipeline. If backend is down, the sidebar still shows **demo interview(s)** so you can test the full UI.

---

## Part 1 — Install and first load

### 1.1 Load the extension

1. Open **`chrome://extensions`** (or **`brave://extensions`**).
2. Turn **Developer mode** ON (top-right).
3. Click **Load unpacked**.
4. Select the **`dist`** folder inside **`hirelens-extension`** (must contain `manifest.json`, `popup.html`, `content.js`, `background.js`).
5. Confirm **HireLens** appears in the list and is **enabled**.
6. Optional: Pin the extension (puzzle icon → pin HireLens) so the icon stays in the toolbar.

**Check:** No errors on the extensions page; extension card shows name and version.

### 1.2 Open the popup (no session)

1. Click the **HireLens** extension icon.
2. You should see:
   - **HireLens** title and **Interview Copilot** subtitle.
   - **“Start an interview”** and short description.
   - **“Open Google Meet”** button.
   - **“Interviewer mode”** badge at the bottom.
3. There is **no session code** field at this stage — sessions are created from the **sidebar on the Meet tab**.

**Check:** Popup shows the landing view with “Open Google Meet” and no code input.

### 1.3 Open Google Meet

1. Click **“Open Google Meet”** in the popup (or manually open **https://meet.google.com** in a new tab).
2. Either **join** an existing meeting (paste a meet link) or **start** a new one (e.g. “New meeting” → “Start an instant meeting”).
3. Allow camera/mic if prompted.
4. Wait until the meeting UI is fully loaded.

**Check:** Meet tab is open and the main meeting area is visible.

---

## Part 2 — Sidebar on Meet (first time)

### 2.1 Sidebar appears

1. With the **Meet tab** in focus, look at the **right side** of the window.
2. You should see:
   - The **meeting area shifted left** (margin on the right).
   - A **dark vertical panel** (HireLens sidebar) on the far right with:
     - Left rail: icons (Home, Mic, Spark, Flag, Close).
     - Main area: **“INTERVIEWS”** (or **“Briefing”** if a session is already loaded).
3. If the sidebar shows **“Loading session…”**, wait a moment or refresh the Meet tab once; the content script may be loading.

**Check:** Dedicated HireLens panel on the right; Meet is shrunk. This is **not** Meet’s native “Add-ons” / “Activities” panel.

### 2.2 Home tab — interview list

1. In the sidebar, the **Home** (first) rail icon should be active; the main area is the **Interviews** view.
2. You should see:
   - **“New Interview”** button (Upload JD + Resume → AI generates questions).
   - Either a **list of interviews** (if backend returned data) or **one demo interview** card (e.g. “Demo Candidate”, “Demo” badge) when backend is down or returns no data.
3. Each card shows: candidate name, role, level, skills, “Open →”.

**Check:** At least one interview is available (real or demo). “New Interview” is visible.

### 2.3 Open an interview (demo or existing)

1. Click **“Open →”** on one interview card.
2. The card may show a brief loading state, then the view should switch to **Briefing**.
3. You should see:
   - **Briefing** in the header.
   - Candidate name and job role.
   - **“Start interview”** (or similar) primary button.
   - Optional: resume highlights, topics, etc., depending on data.

**Check:** Briefing panel is visible; “Start interview” is available.

### 2.4 Start the interview

1. Click **“Start interview”** in the sidebar.
2. Expected:
   - The sidebar switches to the **Interview** tab (second rail icon).
   - **Dynamic Island** appears at the **top center** of the page (dark glass pill with current question, job/candidate, progress dots, prev/next).
   - **Live Q&A** panel may appear at the **top-left** (glass style) with “Now asking” and transcript area.
   - Interview header in sidebar: candidate name, role, **timer**, **“X/Y covered”**, **“X/Y topics done”**, progress bar, and **“Now asking”** with the current question text.
   - **Topic tree** at the top: topics with ▶/▼; each topic shows questions (Q1, Q2, …) with ○/✓ to mark answered.
   - Below: **Topics & questions** accordion with the same questions.

**Check:** Dynamic Island and Live Q&A visible; sidebar shows Interview tab with progress and topic tree.

---

## Part 3 — Interview tab behaviour

### 3.1 Question progress and “Now asking”

1. In the **Topic tree** or in **Topics & questions**, click a **different question** (e.g. Q2 or Q3).
2. **Dynamic Island** should update to show that question’s text.
3. **“Now asking”** in the sidebar should show the same question.
4. The selected row should be **highlighted** (e.g. blue).

**Check:** Changing the selected question updates the island and “Now asking” in sync.

### 3.2 Mark question as answered

1. Click the **○** (circle) next to the **current** question (or any question) to mark it answered.
2. It should turn into **✓** and the question row may look slightly dimmed (answered state).
3. **Header stats** should update: **“X/Y covered”** and **“X/Y topics done”** increase when enough questions in a topic are answered.
4. **Dynamic Island** progress dots: the corresponding dot should appear **filled** (done), and the label should show “X answered · Qn/total”.

**Check:** Progress (covered, topics done, island dots) updates when you mark questions answered.

### 3.3 Topic tree expand/collapse

1. In the **Topic tree** section, click a **topic row** (e.g. “Microservices Architecture”).
2. The chevron should toggle **▶** ↔ **▼** and the list of questions under that topic should **show or hide**.
3. Toggle another topic and confirm each topic expands/collapses independently.

**Check:** Topic tree expands and collapses per topic; state is independent.

### 3.4 Prev/Next in Dynamic Island

1. Click **›** (next) in the Dynamic Island.
2. The current question should advance; sidebar and island should stay in sync.
3. Click **‹** (prev) and confirm it goes back.

**Check:** Prev/Next in the island change the current question and sidebar selection.

### 3.5 Live Q&A stream

1. After starting the interview, the **top-left** panel should show **“Live Q&A”**.
2. **“Now asking”** should show the current question.
3. When the backend sends **transcript** (or in mock), **candidate (A)** lines can appear in the scrollable area.
4. When you **change the question** (click or prev/next), a new **interviewer (Q)** line can be added for the new “Now asking” question.

**Check:** Live Q&A panel shows current question and transcript lines when available.

---

## Part 4 — Insights, follow-ups, flags

### 4.1 Insights tab

1. Click the **Insights** (Spark) rail icon in the sidebar.
2. You should see:
   - **Follow-ups** (for the current question; or “No follow-ups yet” if none).
   - **Follow-up topics** (if any), grouped by competency.
   - **Key insights**, **Skill signals**, **Competency scores** when data exists.

**Check:** Insights tab opens; follow-ups and follow-up topics render when present.

### 4.2 Flags tab

1. Click the **Flags** (Flag) rail icon.
2. If there are **no** flags: “No flags detected yet” and short explanation.
3. If the backend has sent **alerts**: list of flags with type, confidence, claim, “Resume says”, “Candidate said”, analysis, suggested question.
4. When **new flags** arrive (backend sends new alerts), a **toast** should appear at the **top center**: “New flag(s) detected — check Flags tab”, then auto-dismiss after a few seconds.

**Check:** Flags tab shows existing flags; new flags trigger the toast (if backend sends alerts).

---

## Part 5 — Persistence and popup

### 5.1 Persist progress (refresh)

1. With an **active interview** (Interview tab, timer running), mark **one or two questions** as answered and/or change the current question.
2. **Refresh the Meet tab** (F5 or Cmd+R).
3. After the page reloads, the **sidebar and Dynamic Island** should reappear.
4. **Progress** (X/Y covered, topics done, which questions are answered) and **current question** should be **restored** (persisted to `chrome.storage.local`).

**Check:** After refresh, session and progress are restored without re-opening or re-starting.

### 5.2 Popup when session is active

1. With the interview still running (or after refresh with session restored), click the **HireLens** extension icon.
2. You should see:
   - **“Session active”**
   - Candidate name and role.
   - **“Show sidebar on Meet”** button.
   - **“End session”** button.
3. There is **no** session code input in this state.

**Check:** Popup shows “Session active” and the two buttons, not the landing or code form.

### 5.3 Show sidebar on Meet (from popup)

1. If you had closed the Meet tab or switched to another tab, open the **Meet tab** again (same or new meeting).
2. Click the extension icon and click **“Show sidebar on Meet”**.
3. The **sidebar and island** should appear on the Meet tab (session is sent from storage).

**Check:** “Show sidebar on Meet” brings the copilot back on the correct tab.

### 5.4 End session (from popup)

1. Click the extension icon and click **“End session”**.
2. Popup should return to the **landing** view (“Start an interview”, “Open Google Meet”).
3. On the **Meet tab**, the HireLens sidebar and Dynamic Island should **disappear** and the meeting area should expand to full width.

**Check:** End session clears state and removes UI from Meet.

### 5.5 Close sidebar only (✕)

1. Start again: open Meet, open an interview from the list, **Start interview**.
2. In the **sidebar**, click the **✕** (close) in the header.
3. Sidebar and Dynamic Island should **disappear**; Meet expands.
4. Click the extension icon again: popup should still show **“Session active”** (session remains in storage).
5. You can click **“Show sidebar on Meet”** to bring the sidebar back, or **“End session”** to clear everything.

**Check:** Closing the sidebar does not clear the session; popup still shows “Session active” until “End session”.

---

## Part 6 — New interview (with backend)

*(Skip if backend is not running; demo flow is enough for UI testing.)*

### 6.1 Create new interview

1. On the **Meet tab**, in the sidebar **Home** tab, click **“New Interview”**.
2. Upload **Job Description** (PDF/DOCX/TXT) and **Candidate Resume** (PDF/DOCX/TXT).
3. Fill **Candidate details**: Name, Email (optional), Role, Level, Department.
4. Click **“Generate Interview Plan”**.
5. If the backend is up: progress messages, then the new interview is created and you are taken to **Briefing** (or session is set). If the backend is down: error “Failed to create interview. Check the backend is running.”

**Check:** With backend running, a new interview is created and you can start it; without backend, a clear error is shown.

---

## Part 7 — Quick checklist

| # | Step | Expected |
|---|------|----------|
| 1 | Load unpacked from `dist` | Extension appears and is enabled |
| 2 | Open popup (no session) | Landing: “Start an interview”, “Open Google Meet” |
| 3 | Open Google Meet (join or start) | Meet loads |
| 4 | Focus Meet tab | HireLens sidebar on the right; Meet area shrunk |
| 5 | Home tab | “New Interview” + at least one interview (or demo) |
| 6 | Open an interview → Briefing | “Start interview” visible |
| 7 | Start interview | Interview tab, Dynamic Island, Live Q&A, topic tree, progress |
| 8 | Select another question | Island and “Now asking” update |
| 9 | Mark a question answered (○ → ✓) | Progress (X/Y covered, dots) updates |
| 10 | Toggle topic in tree (▶/▼) | Topic expands/collapses |
| 11 | Prev/Next in island | Current question changes |
| 12 | Insights tab | Follow-ups, follow-up topics, insights |
| 13 | Flags tab | List or “No flags”; new flags → toast |
| 14 | Refresh Meet (with session) | Sidebar reappears; progress restored |
| 15 | Popup with session active | “Session active”, Show sidebar, End session |
| 16 | End session | Popup → landing; sidebar and island disappear |

---

## Troubleshooting

- **Sidebar not visible after opening Meet**  
  Refresh the Meet tab once. The content script runs on `meet.google.com`; if the tab was opened before the extension was loaded, refresh so the script injects.

- **“Loading session…” forever**  
  No session in storage and no message from popup. Open the popup and click “Open Google Meet” if needed; then from the sidebar open or create an interview. If you expect a session from a previous run, click “Show sidebar on Meet” from the popup.

- **No interviews in the list**  
  Backend may be down or returning an empty list. You should still see **one demo interview** (“Demo Candidate” with “Demo” badge) so you can test the full flow.

- **Create interview fails**  
  “Failed to create interview. Check the backend is running.” → Ensure API gateway and assist-service are up and reachable (e.g. `http://localhost:3000`, `http://localhost:3001` for WebSocket).

- **Console errors on Meet tab**  
  Open DevTools (F12) on the Meet tab → Console. Fix any red errors (e.g. missing `content.js`, WebSocket or CORS issues).

- **HireLens vs Meet’s sidebar**  
  HireLens: header “HireLens”, rail with Home/Mic/Spark/Flag, sections like Interview, Insights, Flags. Meet’s panel: “Add-ons”, “Activities”, “Timer”, etc.
