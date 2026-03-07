import { useState, useEffect } from "react";
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

export function PopupApp() {
  const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);
  const [activeCandidate, setActiveCandidate] = useState("");
  const [activeRole, setActiveRole] = useState("");

  useEffect(() => {
    store.get(STORAGE_KEY, (result) => {
      const payload = (result ?? {})[STORAGE_KEY] as SessionPayload | undefined;
      if (payload?.session) {
        setHasActiveSession(true);
        setActiveCandidate(payload.session.candidate.name);
        setActiveRole(payload.session.jobRole.title);
      } else {
        setHasActiveSession(false);
      }
    });
  }, []);

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
            <p className="hl-popup__active-hint">Switch to your Meet tab to see the copilot sidebar.</p>
          </div>

          <div className="hl-popup__active-actions">
            <button type="button" className="hl-popup__btn" onClick={handleShowSidebar}>
              Show sidebar on Meet
            </button>
            <button type="button" className="hl-popup__btn hl-popup__btn--danger" onClick={handleEndSession}>
              End session
            </button>
          </div>
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
      </div>
    </div>
  );
}
