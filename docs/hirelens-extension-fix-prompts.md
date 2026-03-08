# HireLens Extension — Fix Prompts & Context

Use this when asking an AI (e.g. Claude Code) to fix or extend the HireLens Chrome extension. Copy the relevant section into your prompt.

---

## 1. Context: What the extension does

- **HireLens** is a Chrome extension that runs on **Google Meet** (`meet.google.com`). It acts as an interview copilot: sidebar with questions, follow-ups, resume alerts, live transcript, insights, and scores.
- **Tab audio**: The extension captures **candidate audio from the Meet tab** (not the interviewer’s microphone) via Chrome’s **tab capture** and an **offscreen document**. That audio is sent to the backend for real-time STT (e.g. Deepgram) and analysis.
- **Stack**: Manifest V3, content script (React) on Meet, background service worker, offscreen document for audio, WebSocket to backend.

---

## 2. Prompt: Fix CSP / Worklet / Tab-capture errors

Use this when you see:

- **CSP**: `Loading the script 'blob:chrome-extension://...' violates the following Content Security Policy directive: "script-src 'self'"` in `offscreen.html`.
- **Worklet**: `[HireLens Offscreen] Start error: Unable to load a worklet's module.`
- **Tab capture**: `[HireLens BG] tabCapture.getMediaStreamId error: Cannot capture a tab with an active stream.`

**Prompt:**

```
The HireLens Chrome extension uses an offscreen document to capture tab audio from Google Meet. The offscreen page loads an AudioWorklet by fetching the processor script and passing a blob URL to audioWorklet.addModule(workletUrl). Chrome blocks this because the extension’s CSP only allows script-src 'self', and blob: URLs are not allowed.

Fix the following:

1. **CSP**: In hirelens-extension/public/manifest.json, update content_security_policy.extension_pages so that extension pages (including the offscreen document) can load scripts from blob URLs. Add blob: to script-src (e.g. script-src 'self' blob:; object-src 'self').

2. **Offscreen response**: In hirelens-extension/src/background/index.ts, when sending HL_OFFSCREEN_START to the offscreen document, capture the response from chrome.runtime.sendMessage (the offscreen replies with { ok: true } or { ok: false, error: "..." }). If the offscreen returns an error (e.g. worklet failed to load), forward that error to the content script via sendResponse({ error: ... }) instead of sendResponse({ ok: true }).

3. **Tab capture "active stream"**: When getMediaStreamId fails with "Cannot capture a tab with an active stream", the content script should show a clear message: e.g. "This tab is already being captured. Refresh the Google Meet tab, then try Start Interview again." Handle this in the HIRELENS_START_TAB_CAPTURE response handler in hirelens-extension/src/content/index.tsx (set a user-facing micError string when the error message matches "active stream" or "cannot capture").

4. **Worklet/CSP error in UI**: When the error from tab capture or offscreen start contains worklet/CSP-related text (e.g. "worklet", "module", "blob"), show a message like: "Audio worklet failed to load. Reload the HireLens extension (chrome://extensions) and try again."

Do not remove or change the existing flow: content script sends HIRELENS_START_TAB_CAPTURE → background gets getMediaStreamId → creates offscreen doc → offscreen starts capture and replies → background must forward that reply to content script.
```

---

## 3. Architecture: Tab audio flow (for reference)

1. **Content script** (Meet page): User clicks “Start Interview” → sends `HIRELENS_START_TAB_CAPTURE` with `sessionId` to **background**.
2. **Background**: Gets `chrome.tabCapture.getMediaStreamId({ targetTabId })`, creates offscreen document if needed, sends `HL_OFFSCREEN_START` with `streamId` and `sessionId` to **offscreen**.
3. **Offscreen document**: `getUserMedia({ audio: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId } } })`, then AudioContext + AudioWorklet (processor from `audio-worklet-processor.js`), encodes chunks and sends `HL_AUDIO_CHUNK` to background. Replies to `HL_OFFSCREEN_START` with `{ ok: true }` or `{ ok: false, error }`.
4. **Background**: Forwards `HL_AUDIO_CHUNK` to content script as `HL_TAB_AUDIO_CHUNK`. Must forward offscreen start response to content script (success or error).
5. **Content script**: On `HL_TAB_AUDIO_CHUNK`, calls `wsManager.sendEncodedChunk(...)` to send audio to the backend WebSocket.

Key files:

- `hirelens-extension/public/manifest.json` — CSP, permissions (tabCapture, offscreen).
- `hirelens-extension/src/background/index.ts` — offscreen lifecycle, getMediaStreamId, message routing.
- `hirelens-extension/src/offscreen/index.ts` — getUserMedia(tab), AudioWorklet, chunk encoding, sendResponse to HL_OFFSCREEN_START.
- `hirelens-extension/src/content/index.tsx` — Start Interview handler, HL_TAB_AUDIO_CHUNK handler, mic error toasts.
- `hirelens-extension/public/audio-worklet-processor.js` — worklet code (stereo→mono, etc.).

---

## 4. Changelog reference

Recent fixes are in `hirelens-extension/CHANGELOG.md` under **Extension: CSP + Offscreen tab audio + error handling (2026-03-07)**:

- CSP: `script-src 'self' blob:` for extension_pages.
- Tab capture “active stream” → user message to refresh Meet tab.
- Offscreen start response forwarded from background to content; worklet/CSP errors show “reload extension” message.
- Tab audio flow documented (offscreen document, not content script, captures tab audio).

Use this plus the prompt above when debugging or re-applying these fixes in another branch or fork.

---

## 5. Backend: No Deepgram transcripts despite “Audio received”

**Symptom:** Gateway logs show `[AssistGateway] Audio received` and `First audio chunk received` with 8192 bytes, but no `[StreamingService] Deepgram socket open` or `First audio chunk sent to Deepgram` or any transcript. Frontend never gets transcript events.

**Cause:** The gateway does not await `streaming.startStream()`. So when the client sends "session" then immediately sends "audio", `startStream()` is still in `await conn.waitForOpen()` and has not yet run `this.sessions.set(sessionId, state)`. So `sendAudio(sessionId, buf)` does `this.sessions.get(sessionId)` → `undefined` and returns without buffering or sending. All early audio is dropped; Deepgram never receives it.

**Fix (assist-service):** In `streaming.service.ts`, register the session in the map **as soon as** the Deepgram connection object exists (with `socketReady: false`), then attach event handlers, then `await conn.waitForOpen()`. After `waitForOpen()` resolves, set `socketReady = true` and flush `state.audioBuffer` to Deepgram. This way audio that arrives while the socket is opening is buffered and sent once the socket is open.
