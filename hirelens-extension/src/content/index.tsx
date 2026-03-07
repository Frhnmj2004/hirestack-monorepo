import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { DynamicIsland } from "./components/DynamicIsland";
import { DebugPanel } from "./components/DebugPanel";
import { FlagToast } from "./components/FlagToast";
import { LiveStreamPanel } from "./components/LiveStreamPanel";
import { RightSidebar } from "./components/RightSidebar";
import {
  endAssistSession,
  InterviewRealtimeManager,
} from "../shared/api";
import type { InterviewSession, SessionPayload, FollowUpItem } from "../shared/types";
import { setDebug, debugLog, getLogEntries, setLogListener, clearLogBuffer } from "../shared/debug";
import type { LogEntry } from "../shared/debug";
import contentCss from "./content.css?raw";
import islandCss from "./components/DynamicIsland.css?raw";
import debugPanelCss from "./components/DebugPanel.css?raw";
import flagToastCss from "./components/FlagToast.css?raw";
import liveStreamCss from "./components/LiveStreamPanel.css?raw";
import sidebarCss from "./components/RightSidebar.css?raw";

const STORAGE_KEY = "hirelens_session";
const SIDEBAR_WIDTH_PX = 400;
const ROOT_ID = "hirelens-copilot-root";

const store = chrome.storage.local;

function applyMeetShrink(enable: boolean) {
  const styleId = "hirelens-body-style";
  let el = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = styleId;
    document.head.appendChild(el);
  }
  el.textContent = enable
    ? `body { margin-right: ${SIDEBAR_WIDTH_PX}px !important; transition: margin-right 0.25s ease; }`
    : "";
}

function ensureHost(): HTMLDivElement {
  let host = document.getElementById(ROOT_ID) as HTMLDivElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = ROOT_ID;
    host.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483645;pointer-events:none;background:transparent;";
    document.documentElement.appendChild(host);
  }
  return host;
}

function ContentApp() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const sessionRef = useRef<InterviewSession | null>(null);
  const currentIndexRef = useRef(0);
  const [flagToast, setFlagToast] = useState<{ count: number } | null>(null);
  const [debugOn, setDebugOn] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const wsManager = useRef(new InterviewRealtimeManager());
  currentIndexRef.current = currentIndex;

  function applySession(payload: SessionPayload) {
    sessionRef.current = payload.session;
    setSession(payload.session);
    setCurrentIndex(payload.session.currentQuestionIndex ?? 0);
    setDurationSeconds(payload.session.durationSeconds ?? 0);
  }

  function clearSession() {
    sessionRef.current = null;
    setSession(null);
    setDurationSeconds(0);
    setCurrentIndex(0);
  }

  // ── 0. Debug mode from storage (console + red debug panel) ───────────────────
  useEffect(() => {
    store.get("hirelens_debug", (r) => {
      const on = !!(r && (r as { hirelens_debug?: boolean }).hirelens_debug);
      setDebug(on);
      setDebugOn(on);
    });
    const onChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && "hirelens_debug" in changes) {
        const on = !!changes.hirelens_debug?.newValue;
        setDebug(on);
        setDebugOn(on);
      }
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, []);

  useEffect(() => {
    if (!debugOn) return;
    setLogListener((entries) => setLogEntries(entries));
    setLogEntries(getLogEntries());
    return () => setLogListener(null);
  }, [debugOn]);

  // ── 1. Read storage on mount ─────────────────────────────────────────────────
  useEffect(() => {
    store.get(STORAGE_KEY, (result) => {
      if (chrome.runtime.lastError) return;
      const payload = (result ?? {})[STORAGE_KEY] as SessionPayload | undefined;
      if (payload?.session) {
        applySession(payload);
        debugLog("state", "Session loaded from storage", { sessionId: payload.session.sessionId });
      }
    });
  }, []);

  // ── 2. Poll 30s fallback ─────────────────────────────────────────────────────
  useEffect(() => {
    let ticks = 0;
    const id = setInterval(() => {
      ticks++;
      if (ticks > 30 || sessionRef.current) { clearInterval(id); return; }
      store.get(STORAGE_KEY, (result) => {
        if (chrome.runtime.lastError || sessionRef.current) return;
        const payload = (result ?? {})[STORAGE_KEY] as SessionPayload | undefined;
        if (payload?.session) applySession(payload);
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── 3. Storage change ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== "local" || !(STORAGE_KEY in changes)) return;
      const newVal = changes[STORAGE_KEY].newValue as SessionPayload | undefined;
      if (newVal?.session) { applySession(newVal); } else { clearSession(); }
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  // ── 4. Direct message listener ───────────────────────────────────────────────
  useEffect(() => {
    const listener = (
      msg: { type: string; payload?: SessionPayload },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (r?: unknown) => void
    ) => {
      if (msg.type === "HIRELENS_START_SESSION" && msg.payload?.session) {
        applySession(msg.payload);
        sendResponse({ ok: true });
      } else if (msg.type === "HIRELENS_CLOSE") {
        clearSession();
        sendResponse({ ok: true });
      } else if (msg.type === "HIRELENS_PING") {
        sendResponse({ ok: true, hasSession: !!sessionRef.current });
      } else {
        sendResponse({ ok: false });
      }
      return true;
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // ── 5. Sidebar always visible on Meet ───────────────────────────────────────
  useEffect(() => {
    applyMeetShrink(true);
    return () => applyMeetShrink(false);
  }, []);

  // ── 6. Interview timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.interviewStarted) return;
    const id = setInterval(() => setDurationSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [session?.sessionId, session?.interviewStarted]);

  // ── 6b. Persist progress (transcript, insights, alerts, answered, scores) ─────
  useEffect(() => {
    if (!session?.sessionId) return;
    const payload: SessionPayload = {
      session: {
        ...session,
        currentQuestionIndex: currentIndex,
        durationSeconds,
      },
      authorizedAt: Date.now(),
    };
    const t = setTimeout(() => store.set({ [STORAGE_KEY]: payload }), 300);
    return () => clearTimeout(t);
  }, [session, currentIndex, durationSeconds]);

  // ── 7. Cleanup WS on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => { wsManager.current.disconnect(); };
  }, []);

  // ── Real-time WebSocket connection ───────────────────────────────────────────
  function connectRealtime(sess: InterviewSession) {
    debugLog("ws", "Connecting realtime", { sessionId: sess.sessionId, candidateId: sess.candidate.id });
    wsManager.current.connect(sess.sessionId, sess.candidate.id, {
      onTranscript: (text, isFinal, speaker) => {
        const who = speaker ?? "candidate";
        debugLog("ws", "Transcript received", { speaker: who, text: text.slice(0, 80), isFinal });
        if (!text.trim()) return;
        setSession((prev) => {
          if (!prev) return prev;
          const entry = {
            id: `tx-${Date.now()}`,
            speaker: who,
            text,
            timestamp: new Date().toISOString(),
          };
          const transcript = [...prev.transcript, entry];
          if (isFinal) {
            const idx = currentIndexRef.current;
            const q = prev.questions[idx];
            if (q && !q.answered) {
              debugLog("state", "Question marked answered (from transcript)", { questionId: q.id });
              const questions = prev.questions.map((qu) =>
                qu.id === q.id ? { ...qu, answered: true } : qu
              );
              return { ...prev, transcript, questions };
            }
            return { ...prev, transcript };
          }
          return { ...prev, transcript };
        });
      },
      onInsights: (data, questionId) => {
        const followUpCount = (data.followUpQuestions?.length ?? 0) + (data.competencyQuestions?.length ?? 0);
        debugLog("ws", followUpCount > 0 ? "Insights received (follow-ups)" : "Insights received (no follow-ups)", { questionId, followUpCount, keyInsights: (data.keyInsights?.length ?? 0) });
        const followUps: FollowUpItem[] = [
          ...(data.followUpQuestions || []).map((f, i) => ({
            id: `fu-${Date.now()}-${i}`,
            question: f.question,
            type: (f.type === "competency" ? "competency" : "follow_up") as FollowUpItem["type"],
            questionId,
          })),
          ...(data.competencyQuestions || []).map((f, i) => ({
            id: `fuc-${Date.now()}-${i}`,
            question: f.question,
            type: "competency" as const,
            questionId,
          })),
        ];
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            followUps: [...prev.followUps, ...followUps],
            insights: [...prev.insights, ...(data.keyInsights || [])],
            skillSignals: [...new Set([...prev.skillSignals, ...(data.skillSignals || [])])],
          };
        });
      },
      onAlerts: (alerts) => {
        debugLog("ws", "Alerts (flags) received", { count: alerts?.length ?? 0, alerts });
        setSession((prev) => {
          if (!prev) return prev;
          const existingIds = new Set(prev.alerts.map((a) => a.id));
          const fresh = (alerts || []).filter((a) => !existingIds.has(a.id));
          if (fresh.length > 0) setFlagToast({ count: fresh.length });
          return { ...prev, alerts: [...prev.alerts, ...fresh] };
        });
      },
      onEvidence: (cards) => {
        setSession((prev) => {
          if (!prev) return prev;
          return { ...prev, evidenceCards: [...prev.evidenceCards, ...cards] };
        });
      },
      onScores: (payload) => {
        debugLog("ws", "Scores received", { questionId: payload.questionId, scores: payload.scores });
        setSession((prev) => {
          if (!prev || !payload.scores?.length) return prev;
          const byLabel = new Map(prev.scores.map((s) => [s.label, { ...s }]));
          for (const { label, score, outOf } of payload.scores) {
            const existing = byLabel.get(label);
            byLabel.set(label, {
              label,
              score,
              outOf: outOf ?? existing?.outOf ?? 10,
            });
          }
          const scores = Array.from(byLabel.values());
          let questions = prev.questions;
          if (payload.questionId && payload.scores.length > 0) {
            const avg = payload.scores.reduce((a, s) => a + s.score, 0) / payload.scores.length;
            questions = prev.questions.map((q) =>
              q.id === payload.questionId ? { ...q, score: avg, answered: true } : q
            );
          }
          return { ...prev, scores, questions };
        });
      },
      onError: (msg) => {
        debugLog("error", "WebSocket error", msg);
        console.error("[HireLens WS]", msg);
      },
    });
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSessionCreated = (newSession: InterviewSession) => {
    sessionRef.current = newSession;
    setSession(newSession);
    setCurrentIndex(0);
    setDurationSeconds(0);
    store.set({ [STORAGE_KEY]: { session: newSession, authorizedAt: Date.now() } });
  };

  const pushInterviewerQuestion = (questionText: string) => {
    debugLog("action", "Interviewer question added to transcript (e.g. follow-up asked)", { questionText: questionText.slice(0, 60) });
    setSession((prev) => {
      if (!prev) return prev;
      const entry = {
        id: `tx-q-${Date.now()}`,
        speaker: "interviewer" as const,
        text: questionText,
        timestamp: new Date().toISOString(),
      };
      return { ...prev, transcript: [...prev.transcript, entry] };
    });
  };

  const handleStartInterview = () => {
    if (!session) return;
    debugLog("action", "Start interview", { sessionId: session.sessionId });
    const q = session.questions[currentIndex];
    const firstTranscript = q
      ? [...session.transcript, { id: `tx-q-${Date.now()}`, speaker: "interviewer" as const, text: q.text, timestamp: new Date().toISOString() }]
      : session.transcript;
    const updated: InterviewSession = { ...session, interviewStarted: true, transcript: firstTranscript };
    sessionRef.current = updated;
    setSession(updated);
    store.set({ [STORAGE_KEY]: { session: updated, authorizedAt: Date.now() } });
    connectRealtime(updated);
    wsManager.current.startMic(updated.sessionId);
    debugLog("audio", "Mic start requested for session", { sessionId: updated.sessionId });
    if (q) wsManager.current.setActiveQuestion(updated.sessionId, q.id, q.text);
  };

  const handleSelectQuestion = (i: number) => {
    debugLog("action", "Select question", { index: i });
    setCurrentIndex(i);
    const sess = sessionRef.current;
    if (sess?.interviewStarted) {
      const q = sess.questions[i];
      if (q) {
        wsManager.current.setActiveQuestion(sess.sessionId, q.id, q.text);
        pushInterviewerQuestion(q.text);
      }
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;
    handleSelectQuestion(Math.min(currentIndex + 1, session.questions.length - 1));
  };

  const handlePrevQuestion = () => {
    handleSelectQuestion(Math.max(0, currentIndex - 1));
  };

  const handleMarkAnswered = (questionId: string, score?: number) => {
    if (!session) return;
    debugLog("action", "Mark question answered (manual)", { questionId, score });
    const updated: InterviewSession = {
      ...session,
      questions: session.questions.map((q) => {
        if (q.id !== questionId) return q;
        const nowAnswered = !q.answered;
        return { ...q, answered: nowAnswered, score: nowAnswered ? score : undefined };
      }),
    };
    sessionRef.current = updated;
    setSession(updated);
  };

  const handleClose = async () => {
    wsManager.current.disconnect();
    const sess = sessionRef.current;
    if (sess?.sessionId && !sess.sessionId.startsWith("mock-") && !sess.sessionId.startsWith("local-")) {
      try { await endAssistSession(sess.sessionId); } catch { /* ignore */ }
    }
    store.remove(STORAGE_KEY, () => { /* ignore */ });
    clearSession();
  };

  const currentQuestion = session?.questions[currentIndex];
  const answeredCount = session?.questions.filter((q) => q.answered).length ?? 0;
  const totalQuestions = session?.questions.length ?? 0;
  const followUpsForCurrent = currentQuestion
    ? (session?.followUps ?? []).filter((f) => f.questionId === currentQuestion.id)
    : [];

  return (
    <>
      {debugOn && (
        <DebugPanel
          entries={logEntries}
          onClear={() => {
            clearLogBuffer();
            setLogEntries([]);
          }}
        />
      )}
      {session?.interviewStarted && (
        <DynamicIsland
          question={currentQuestion?.text ?? ""}
          jobTitle={session.jobRole.title}
          candidateName={session.candidate.name}
          questionIndex={currentIndex + 1}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          answeredByIndex={session.questions.map((q) => q.answered)}
          alertCount={session.alerts.length}
          followUps={followUpsForCurrent}
          onAskFollowUp={(text) => pushInterviewerQuestion(text)}
          onNext={handleNextQuestion}
          onPrev={handlePrevQuestion}
          canNext={currentIndex < session.questions.length - 1}
          canPrev={currentIndex > 0}
        />
      )}
      {session?.interviewStarted && (
        <LiveStreamPanel
          transcript={session.transcript}
          currentQuestion={currentQuestion?.text}
          followUps={session.followUps}
          onAskFollowUp={(questionText) => pushInterviewerQuestion(questionText)}
        />
      )}
      {flagToast && (
        <FlagToast
          count={flagToast.count}
          onDismiss={() => setFlagToast(null)}
        />
      )}
      <RightSidebar
        session={session}
        currentIndex={currentIndex}
        durationSeconds={durationSeconds}
        onClose={handleClose}
        onSelectQuestion={handleSelectQuestion}
        onMarkAnswered={handleMarkAnswered}
        onStartInterview={handleStartInterview}
        onSessionCreated={handleSessionCreated}
      />
    </>
  );
}

function mount() {
  if (document.getElementById(ROOT_ID)) return;

  const host = ensureHost();
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = [contentCss, islandCss, debugPanelCss, flagToastCss, liveStreamCss, sidebarCss].join("\n");
  shadow.appendChild(style);

  const inner = document.createElement("div");
  inner.id = "hirelens-inner";
  inner.style.cssText = "width:100%;height:100%;pointer-events:none;display:block;";
  shadow.appendChild(inner);

  ReactDOM.createRoot(inner).render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>
  );
}

mount();
