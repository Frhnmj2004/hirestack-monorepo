# HireLens Extension — Manual Testing Guide

This guide walks through testing the extension end-to-end. The extension adds a **dedicated HireLens sidebar** (like Sider.ai) on the right side of the Google Meet page — a custom dark panel that shrinks the meeting area. It is **not** the native Google Meet “Add-ons” panel.

---

## Prerequisites

- Chrome or Brave (or any Chromium-based browser).
- Built extension: run `npm run build` in `hirelens-extension/` and load the `dist` folder as an unpacked extension.

---

## 1. Load the extension

1. Open `chrome://extensions` (or `brave://extensions`).
2. Turn **Developer mode** ON (top-right).
3. Click **Load unpacked**.
4. Select the **`dist`** folder inside `hirelens-extension` (the folder that contains `manifest.json`, `popup.html`, `content.js`, `background.js`).
5. Confirm the extension **HireLens Interview Copilot** appears in the list and is enabled.
6. Optional: Pin the extension so the icon shows in the toolbar (click the puzzle icon → pin HireLens).

---

## 2. Open Google Meet (before starting a session)

1. Open a new tab and go to **https://meet.google.com**.
2. Either:
   - Join an existing meeting (e.g. use a meet link like `https://meet.google.com/xxx-xxxx-xxx`), or  
   - Start a new meeting (e.g. “New meeting” → “Start an instant meeting”).
3. Allow camera/mic if prompted.
4. Wait until the meeting UI is fully loaded (you see yourself and/or others, and the bottom bar with mute/camera/leave).

**Check:** The meeting fills the window. There is no HireLens sidebar yet — that appears only after you start a session from the extension.

---

## 3. Start a session from the extension (first time)

1. With the **Meet tab** still active (and in focus), click the **HireLens** extension icon in the toolbar.
2. The extension **popup** opens (small dark glass-style window).
3. You should see:
   - Title: **HireLens**
   - Subtitle: **Interview Copilot**
   - A **Session code** input.
   - Blue **Start interview** button.
   - Hint: “Use DEMO, 1234, or TEST for mock.”
4. Enter a valid mock code, e.g. **1234** (or **DEMO** or **TEST**).
5. Click **Start interview**.
6. Expected:
   - Button may show “Authorizing…” briefly.
   - Then a green message: **“Session started. Look for the HireLens sidebar on the right of the Meet tab.”**
   - Popup may stay open or you can click away to close it.

**Check:** No red error. If you see “Refresh the Google Meet tab and try again,” refresh the Meet tab (F5 or Cmd+R) and repeat from step 1 of this section.

---

## 4. Confirm the dedicated HireLens sidebar (Sider.ai–style panel)

1. After “Session started,” focus the **Google Meet tab** (click on the meeting area).
2. Look at the **right side** of the browser window.
3. You should see:
   - The **meeting video area has shifted left** (it is no longer full width). The main content has a margin on the right.
   - A **dark panel** on the far right, full height, with:
     - Header: **“HireLens”** and a **“Copilot”** badge.
     - A **close (✕)** button in the header.
     - Sections below: Candidate, Resume highlights, Topics, Questions, Transcript, Insights, Alerts, Follow-ups, Coverage, Score, Status, Controls.
4. At the **top center** of the page you should see a **floating dark “pill”** (Dynamic Island) with the **current question** and prev/next arrows.

**Important:** This right panel is the **HireLens sidebar**, not the native Google “Add-ons” / “Activities” panel. If you also have Meet’s own sidebar open, you will see two panels: Meet’s (e.g. Chat, Add-ons) and ours (HireLens — Copilot). Ours is the one with “HireLens” in the header and the sections listed above.

**Check:**  
- Meet content is visibly shrunk (margin on the right).  
- HireLens sidebar is visible with Candidate, Questions, etc.  
- Dynamic Island shows at top center with a question.

---

## 5. Interact with the sidebar and island

1. **Questions list**
   - In the sidebar, find the **Questions** section.
   - Click a different question row.
   - The **Dynamic Island** at the top should update to show that question’s text.
   - The selected row should be highlighted (e.g. blue tint).

2. **Prev/Next**
   - In the Dynamic Island, click the **→** (next) button.
   - The current question should advance; the sidebar’s highlighted question and the island text should match.
   - Click **←** (prev) and confirm it goes back.

3. **Topics**
   - In the sidebar, find **Topics**.
   - Click a topic (e.g. “Technical knowledge”).
   - The topic should expand and show its questions.

4. **Other sections**
   - Scroll the sidebar and confirm you see mock data for:
     - Candidate (name, experience, skills).
     - Resume highlights (projects, achievements).
     - Transcript (interviewer/candidate lines).
     - Insights (bullets).
     - Alerts (e.g. experience mismatch).
     - Follow-ups (suggested questions).
     - Coverage (missing competencies, suggested question).
     - Score (bars for technical, communication, etc.).
     - Status (duration, questions asked).
     - Controls (Next question, Generate follow-up, Mark strong/weak).

5. **Close sidebar**
   - Click the **✕** in the sidebar header.
   - Expected: The HireLens sidebar and the Dynamic Island disappear, and the Meet content expands back to full width (no right margin).

**Check:** All sections render without errors; closing the sidebar removes our UI and restores Meet width.

---

## 6. Reopen extension popup — session active (no code form)

1. After you have started a session (e.g. with **1234**), close the extension popup if it’s open.
2. Click the **HireLens** extension icon again.
3. Expected:
   - You **do not** see the Session code input or “Start interview.”
   - You see: **“Session active. Use the HireLens sidebar on your Google Meet tab (the dark panel on the right, not Meet’s Add-ons).”**
   - A button: **End session**.
4. This confirms: once a session is active, reopening the popup does **not** show the code prompt again.

**Check:** With an active session, the popup shows only the “Session active” message and “End session,” not the code form.

---

## 7. End session from popup

1. With the popup open in “Session active” state, click **End session**.
2. Expected:
   - Popup updates and now shows the **Session code** input and **Start interview** again (same as first time).
3. If the HireLens sidebar was still open on the Meet tab, it should close and Meet should expand to full width (the extension sends a close message to the content script).

**Check:** After “End session,” the popup resets to the code form and the sidebar closes if it was open.

---

## 8. End session from sidebar only

1. Start a session again (code **1234** → Start interview).
2. Confirm the HireLens sidebar is visible.
3. In the **sidebar**, click the **✕** (close) in the header.
4. Sidebar and Dynamic Island disappear; Meet expands.
5. Click the **extension icon** again.
6. Expected: Popup still shows **“Session active”** (session is still in storage). So you can either:
   - Click **End session** in the popup to clear it, or  
   - Leave it; the sidebar can be “reopened” by having the content script run again (e.g. refresh Meet and the script will load the session from storage and show the sidebar).

**Check:** Closing only the sidebar does not clear the session; the popup still shows “Session active” until you click “End session.”

---

## 9. Invalid session code

1. Open the extension popup (with or without an active session; if active, first click **End session**).
2. Enter an invalid code, e.g. **0000** or **WRONG**.
3. Click **Start interview**.
4. Expected: Red error message, e.g. **“Invalid or expired session code. Try DEMO, 1234, or TEST.”** No sidebar appears.

**Check:** Invalid codes are rejected and no session is stored.

---

## 10. Meet tab not active

1. End any active session (popup → End session).
2. Open a tab that is **not** Google Meet (e.g. a blank tab or any other site).
3. Click the HireLens extension icon.
4. Enter **1234** and click **Start interview**.
5. Expected: Red error: **“Open a Google Meet tab first, then try again.”**

**Check:** Session is not started when the current tab is not Meet.

---

## 11. Refresh Meet and persistence

1. Start a session on a Meet tab (e.g. **1234** → Start interview).
2. Confirm the HireLens sidebar is visible.
3. **Refresh the Meet tab** (F5 or Cmd+R).
4. Wait for the meeting to reload.
5. Expected: After the page loads, the content script runs again and reads the session from storage. The **HireLens sidebar and Dynamic Island should appear again** without you re-entering the code or clicking Start interview.

**Check:** Session survives a Meet tab refresh; sidebar reappears automatically.

---

## 12. Quick checklist

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Load unpacked from `dist` | Extension appears and is enabled |
| 2 | Open Meet, join/start meeting | Meet loads normally |
| 3 | Click extension, enter 1234, Start interview | Green “Session started” |
| 4 | Look at right side of Meet tab | Dedicated HireLens sidebar (dark panel) + Meet area shrunk; Dynamic Island at top |
| 5 | Use Questions, prev/next, Topics, scroll sections | All sections show mock data; island updates |
| 6 | Close sidebar (✕) | Sidebar and island disappear; Meet full width |
| 7 | Click extension again | “Session active” + End session (no code form) |
| 8 | End session in popup | Popup shows code form again; sidebar closes if open |
| 9 | Invalid code | Error message; no session |
| 10 | Start with non-Meet tab active | “Open a Google Meet tab first” |
| 11 | Refresh Meet with session active | Sidebar reappears without re-entering code |

---

## Troubleshooting

- **No sidebar after “Session started”**  
  Refresh the Meet tab once, then click the extension and click **Start interview** again (same code). If it still doesn’t appear, check the browser console (F12 → Console) on the Meet tab for errors.

- **“Receiving end does not exist”**  
  The content script wasn’t loaded on that tab. Refresh the Meet tab and try again, or ensure you clicked **Start interview** while the Meet tab was the active tab.

- **Popup still shows code form after 1234**  
  Session is stored in `chrome.storage.session`. If you see the form again immediately after starting, the popup may have opened before the storage write completed. Close and reopen the popup; it should then show “Session active.”

- **Can’t tell which is HireLens vs Meet’s sidebar**  
  HireLens sidebar has header **“HireLens”** and a **“Copilot”** badge, and sections like Candidate, Questions, Transcript, Insights, Alerts, etc. Google’s panel has “Add-ons,” “Timer,” “Record,” “Transcribe,” etc.
