import { useState, useEffect, useCallback } from "react";
import { endAssistSession } from "../shared/api";
import type { SessionPayload } from "../shared/types";
import "./popup.css";

const STORAGE_KEY = "hirelens_session";
const store = chrome.storage.local;

async function getMeetTab() {
  const tabs = await chrome.tabs.query({ url: "https://meet.google.com/*" });
  return tabs[0] ?? null;
}

async function injectAndSend(tabId: number, windowId: number, msgType: string, payload?: SessionPayload) {
  await chrome.tabs.update(tabId, { active: true });
  await chrome.windows.update(windowId, { focused: true });
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  } catch { /* already injected */ }
  await new Promise((r) => setTimeout(r, 800));
  for (let i = 0; i < 4; i++) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: msgType, payload });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
}

const DEBUG_KEY = "hirelens_debug";

export function PopupApp() {
  const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);
  const [activeCandidate, setActiveCandidate] = useState("");
  const [activeRole, setActiveRole] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "capturing" | "done" | "error">("idle");
  const [captureError, setCaptureError] = useState<string | null>(null);

  /**
   * Called when the popup opens during an active interview.
   * Uses chrome.tabCapture.getMediaStreamId() from the popup context (which counts as
   * extension "invocation") to get a stream ID that the Meet content script can use
   * with getUserMedia({ audio: { mandatory: { chromeMediaSource: 'tab', ... } } }).
   * This captures ALL tab audio including Google Meet's WebRTC remote audio streams,
   * which getDisplayMedia from a content script cannot access.
   */
  const captureTabAudio = useCallback(async (meetTabId: number) => {
    setCaptureStatus("capturing");
    setCaptureError(null);
    // #region agent log
    fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',location:'PopupApp.tsx:captureTabAudio',message:'Starting tabCapture.getMediaStreamId',data:{meetTabId},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const streamId = await new Promise<string>((resolve, reject) => {
        chrome.tabCapture.getMediaStreamId(
          { targetTabId: meetTabId, consumerTabId: meetTabId },
          (id) => {
            if (chrome.runtime.lastError) {
              // #region agent log
              fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',location:'PopupApp.tsx:getMediaStreamId-callback',message:'tabCapture FAILED',data:{error:chrome.runtime.lastError.message},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              reject(new Error(chrome.runtime.lastError.message));
            } else if (id) {
              // #region agent log
              fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',location:'PopupApp.tsx:getMediaStreamId-callback',message:'tabCapture stream ID obtained',data:{streamIdLen:id.length},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              resolve(id);
            } else {
              reject(new Error("Empty stream ID returned"));
            }
          }
        );
      });
      // Send stream ID to content script so it can start audio capture
      await chrome.tabs.sendMessage(meetTabId, { type: "HIRELENS_TAB_STREAM_ID", streamId });
      // #region agent log
      fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',location:'PopupApp.tsx:captureTabAudio',message:'Stream ID sent to content script successfully',data:{meetTabId},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setCaptureStatus("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setCaptureError(msg);
      setCaptureStatus("error");
      // Still notify content script so it can show an error
      try {
        await chrome.tabs.sendMessage(meetTabId, { type: "HIRELENS_TAB_STREAM_ID", error: msg });
      } catch { /* content script might not be ready */ }
    }
  }, []);

  useEffect(() => {
    store.get(STORAGE_KEY, async (result) => {
      const payload = (result ?? {})[STORAGE_KEY] as SessionPayload | undefined;
      if (payload?.session) {
        setHasActiveSession(true);
        setActiveCandidate(payload.session.candidate.name);
        setActiveRole(payload.session.jobRole.title);

        // Check if the content script is waiting for tab audio capture
        const meet = await getMeetTab();
        if (meet?.id) {
          try {
            const resp = await chrome.tabs.sendMessage(meet.id, { type: "HIRELENS_PING" }) as { awaitingTabCapture?: boolean } | undefined;
            if (resp?.awaitingTabCapture) {
              // Auto-start tab capture — popup opening IS the extension invocation
              await captureTabAudio(meet.id);
            }
          } catch { /* content script not ready, user can click button */ }
        }
      } else {
        setHasActiveSession(false);
      }
    });
    store.get(DEBUG_KEY, (r) => setDebugMode(!!(r && (r as Record<string, boolean>)[DEBUG_KEY])));
  }, [captureTabAudio]);

  const setDebug = (on: boolean) => {
    setDebugMode(on);
    store.set({ [DEBUG_KEY]: on });
  };

  const handleShowSidebar = async () => {
    const result = await store.get(STORAGE_KEY);
    const payload = (result ?? {})[STORAGE_KEY] as SessionPayload | undefined;
    if (!payload) return;
    const meet = await getMeetTab();
    if (!meet?.id) return;
    await injectAndSend(meet.id, meet.windowId!, "HIRELENS_START_SESSION", payload);
  };

  const handleEndSession = async () => {
    const result = await store.get(STORAGE_KEY);
    const payload = (result ?? {})[STORAGE_KEY] as SessionPayload | undefined;
    if (payload?.session?.sessionId) {
      await endAssistSession(payload.session.sessionId);
    }
    await store.remove(STORAGE_KEY);
    setHasActiveSession(false);
    setActiveCandidate("");
    setActiveRole("");
    const meet = await getMeetTab();
    if (meet?.id) {
      try { await chrome.tabs.sendMessage(meet.id, { type: "HIRELENS_CLOSE" }); } catch { /* ignore */ }
    }
  };

  const handleOpenMeet = () => {
    chrome.tabs.create({ url: "https://meet.google.com" });
  };

  // Loading state
  if (hasActiveSession === null) {
    return (
      <div className="hl-popup">
        <div className="hl-popup__glass hl-popup__glass--center">
          <div className="hl-popup__spinner" />
        </div>
      </div>
    );
  }

  // Active session
  if (hasActiveSession) {
    const handleCaptureAudio = async () => {
      const meet = await getMeetTab();
      if (!meet?.id) { setCaptureError("No active Meet tab found."); setCaptureStatus("error"); return; }
      await captureTabAudio(meet.id);
    };

    return (
      <div className="hl-popup">
        <div className="hl-popup__glass">
          <header className="hl-popup__header">
            <div className="hl-popup__brand">
              <span className="hl-popup__logo-dot" />
              <h1 className="hl-popup__title">HireLens</h1>
            </div>
            <span className="hl-popup__live-badge">LIVE</span>
          </header>

          <div className="hl-popup__active-panel">
            <p className="hl-popup__active-label">Session active</p>
            <p className="hl-popup__active-candidate">{activeCandidate}</p>
            <p className="hl-popup__active-role">{activeRole}</p>
            {captureStatus === "done" ? (
              <p className="hl-popup__active-hint" style={{ color: "#34c759" }}>
                ✓ Candidate audio capture active
              </p>
            ) : captureStatus === "capturing" ? (
              <p className="hl-popup__active-hint">Activating audio capture…</p>
            ) : captureStatus === "error" ? (
              <p className="hl-popup__active-hint" style={{ color: "#ff453a" }}>
                Audio capture failed: {captureError}
              </p>
            ) : (
              <p className="hl-popup__active-hint">Switch to your Meet tab to see the copilot sidebar.</p>
            )}
          </div>

          {(captureStatus === "idle" || captureStatus === "error") && (
            <button
              type="button"
              className="hl-popup__btn"
              style={{ marginBottom: 8, background: "rgba(52,199,89,0.2)", border: "1px solid rgba(52,199,89,0.5)" }}
              onClick={handleCaptureAudio}
            >
              🎤 Capture Candidate Audio
            </button>
          )}

          <div className="hl-popup__active-actions">
            <button type="button" className="hl-popup__btn" onClick={handleShowSidebar}>
              Show sidebar on Meet
            </button>
            <button type="button" className="hl-popup__btn hl-popup__btn--danger" onClick={handleEndSession}>
              End session
            </button>
          </div>
          <label className="hl-popup__debug-toggle">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebug(e.target.checked)}
            />
            <span>Debug mode (log all steps in Meet tab console)</span>
          </label>
        </div>
      </div>
    );
  }

  // No session — clean landing
  return (
    <div className="hl-popup">
      <div className="hl-popup__glass">
        <header className="hl-popup__header">
          <div className="hl-popup__brand">
            <span className="hl-popup__logo-dot" />
            <h1 className="hl-popup__title">HireLens</h1>
          </div>
          <span className="hl-popup__subtitle">Interview Copilot</span>
        </header>

        <div className="hl-popup__landing">
          <div className="hl-popup__landing-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,122,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="hl-popup__landing-title">Start an interview</p>
          <p className="hl-popup__landing-sub">
            Open Google Meet and use the HireLens sidebar to create a new interview — upload JD + Resume and AI generates tailored questions instantly.
          </p>
          <button type="button" className="hl-popup__open-meet-btn" onClick={handleOpenMeet}>
            Open Google Meet
          </button>
        </div>

        <div className="hl-popup__auth-badge">
          <span className="hl-popup__auth-dot" />
          <span>Interviewer mode</span>
        </div>
        <label className="hl-popup__debug-toggle">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebug(e.target.checked)}
          />
          <span>Debug mode (log in Meet tab console)</span>
        </label>
      </div>
    </div>
  );
}
