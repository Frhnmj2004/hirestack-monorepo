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
import type { InterviewSession, SessionPayload, FollowUpItem, FollowUpType, EvidenceCard, ExtractedTopic, AnswerScore } from "../shared/types";
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
const SIDEBAR_COLLAPSED_WIDTH_PX = 48;
const ROOT_ID = "hirelens-copilot-root";

const store = chrome.storage.local;

// Suppress known unhandled rejection from Google Meet's page scripts (vendor.js)
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const msg = event.reason?.message ?? String(event.reason ?? "");
    if (msg.includes("No Listener: tabs:outgoing") || msg.includes("tabs:outgoing.message.ready")) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

function isContextInvalidatedError(err: unknown): boolean {
  return err instanceof Error && String(err.message).includes("Extension context invalidated");
}

function applyMeetShrink(visible: boolean, collapsed?: boolean) {
  const styleId = "hirelens-body-style";
  let el = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = styleId;
    document.head.appendChild(el);
  }
  if (!visible) {
    el.textContent = "";
    return;
  }
  const marginPx = collapsed ? SIDEBAR_COLLAPSED_WIDTH_PX : SIDEBAR_WIDTH_PX;
  el.textContent = `body { margin-right: ${marginPx}px !important; transition: margin-right 0.25s ease; }`;
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

function ContextInvalidatedBanner() {
  return (
    <div
      className="hl-context-invalidated"
      role="alert"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2147483646,
        padding: "12px 16px",
        background: "rgba(180, 60, 60, 0.95)",
        color: "#fff",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        pointerEvents: "auto",
      }}
    >
      <span>HireLens was updated. Refresh this page to continue.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          padding: "6px 14px",
          background: "#fff",
          color: "#333",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Refresh page
      </button>
    </div>
  );
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
  const [wsConnected, setWsConnected] = useState(false);
  const [micStatus, setMicStatus] = useState<"pending" | "ok" | "error">("pending");
  const [micError, setMicError] = useState<string | null>(null);
  const [micToast, setMicToast] = useState(false);
  const [contextInvalidated, setContextInvalidated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState<{ speaker: "candidate" | "interviewer"; text: string } | null>(null);
  const captureActiveRef = useRef(false);
  const wsManager = useRef(new InterviewRealtimeManager());
  currentIndexRef.current = currentIndex;

  function handleContextInvalidated(): void {
    setContextInvalidated(true);
    wsManager.current.disconnect();
  }

  function applySession(payload: SessionPayload) {
    sessionRef.current = payload.session;
    setSession(payload.session);
    setCurrentIndex(payload.session.currentQuestionIndex ?? 0);
    setDurationSeconds(payload.session.durationSeconds ?? 0);
    setSidebarVisible(true);
  }

  function clearSession() {
    sessionRef.current = null;
    setSession(null);
    setDurationSeconds(0);
    setCurrentIndex(0);
    setSidebarVisible(false);
  }

  // ── 0. Debug mode from storage (console + red debug panel) ───────────────────
  useEffect(() => {
    try {
      store.get("hirelens_debug", (r) => {
        try {
          const on = !!(r && (r as { hirelens_debug?: boolean }).hirelens_debug);
          setDebug(on);
          setDebugOn(on);
        } catch (e) {
          if (isContextInvalidatedError(e)) handleContextInvalidated();
        }
      });
    } catch (e) {
      if (isContextInvalidatedError(e)) handleContextInvalidated();
    }
    const onChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      try {
        if (area === "local" && "hirelens_debug" in changes) {
          const on = !!changes.hirelens_debug?.newValue;
          setDebug(on);
          setDebugOn(on);
        }
      } catch (e) {
        if (isContextInvalidatedError(e)) handleContextInvalidated();
      }
    };
    try {
      chrome.storage.onChanged.addListener(onChange);
    } catch (e) {
      if (isContextInvalidatedError(e)) handleContextInvalidated();
    }
    return () => {
      try {
        chrome.storage.onChanged.removeListener(onChange);
      } catch (_) {}
    };
  }, []);

  useEffect(() => {
    if (!debugOn) return;
    setLogListener((entries) => setLogEntries(entries));
    setLogEntries(getLogEntries());
    return () => setLogListener(null);
  }, [debugOn]);

  // ── 1. Read storage on mount ─────────────────────────────────────────────────
  useEffect(() => {
    try {
      store.get(STORAGE_KEY, (result) => {
        try {
          if (chrome.runtime.lastError) return;
          const payload = (result ?? {})[STORAGE_KEY] as SessionPayload | undefined;
          if (payload?.session) {
            applySession(payload);
            debugLog("state", "Session loaded from storage", { sessionId: payload.session.sessionId });
            // Auto-reconnect WS if interview was in progress (e.g. page reload mid-interview).
            if (payload.session.interviewStarted) {
              connectRealtime(payload.session);
              captureActiveRef.current = false;
              setMicStatus("pending");
              chrome.runtime.sendMessage({ type: "HIRELENS_START_TAB_CAPTURE", sessionId: payload.session.sessionId })
                .then((resp: { ok?: boolean; error?: string }) => {
                  if (resp?.error) {
                    setMicStatus("error");
                    setMicError("Audio capture failed. Reload the page to try again.");
                    setMicToast(true);
                    return;
                  }
                  captureActiveRef.current = true;
                  setMicStatus("ok");
                  setMicError(null);
                })
                .catch(() => {
                  setMicStatus("error");
                  setMicError("Audio capture failed. Reload the page to try again.");
                  setMicToast(true);
                });
            }
          }
        } catch (e) {
          if (isContextInvalidatedError(e)) handleContextInvalidated();
        }
      });
    } catch (e) {
      if (isContextInvalidatedError(e)) handleContextInvalidated();
    }
  }, []);

  // ── 2. Poll 30s fallback ─────────────────────────────────────────────────────
  useEffect(() => {
    let ticks = 0;
    const id = setInterval(() => {
      try {
        ticks++;
        if (ticks > 30 || sessionRef.current) { clearInterval(id); return; }
        store.get(STORAGE_KEY, (result) => {
          try {
            if (chrome.runtime.lastError || sessionRef.current) return;
            const payload = (result ?? {})[STORAGE_KEY] as SessionPayload | undefined;
            if (payload?.session) applySession(payload);
          } catch (e) {
            if (isContextInvalidatedError(e)) handleContextInvalidated();
          }
        });
      } catch (e) {
        if (isContextInvalidatedError(e)) handleContextInvalidated();
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── 3. Storage change ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      try {
        if (area !== "local" || !(STORAGE_KEY in changes)) return;
        const newVal = changes[STORAGE_KEY].newValue as SessionPayload | undefined;
        if (newVal?.session) { applySession(newVal); } else { clearSession(); }
      } catch (e) {
        if (isContextInvalidatedError(e)) handleContextInvalidated();
      }
    };
    try {
      chrome.storage.onChanged.addListener(handler);
    } catch (e) {
      if (isContextInvalidatedError(e)) handleContextInvalidated();
    }
    return () => {
      try {
        chrome.storage.onChanged.removeListener(handler);
      } catch (_) {}
    };
  }, []);

  // ── 4. Direct message listener ───────────────────────────────────────────────
  useEffect(() => {
    const listener = (
      msg: {
        type: string;
        payload?: SessionPayload;
        sessionId?: string;
        chunk?: string;
        encoding?: string;
        chunkCount?: number;
        error?: string;
      },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (r?: unknown) => void
    ) => {
      try {
        if (msg.type === "HIRELENS_EXTENSION_RELOADED") {
          handleContextInvalidated();
          sendResponse({ ok: true });
          return true;
        }
        if (msg.type === "HIRELENS_START_SESSION" && msg.payload?.session) {
          applySession(msg.payload);
          sendResponse({ ok: true });
        } else if (msg.type === "HIRELENS_CLOSE") {
          clearSession();
          sendResponse({ ok: true });
        } else if (msg.type === "HIRELENS_PING") {
          sendResponse({
            ok: true,
            hasSession: !!sessionRef.current,
          });
        } else if (msg.type === "HL_TAB_AUDIO_CHUNK") {
          // Audio chunk from offscreen doc via background → send to WebSocket
          if (msg.chunk && msg.encoding) {
            wsManager.current.sendEncodedChunk(msg.chunk, msg.encoding, msg.chunkCount ?? 0);
          }
          return false;
        } else {
          sendResponse({ ok: false });
        }
      } catch (e) {
        if (isContextInvalidatedError(e)) handleContextInvalidated();
        sendResponse({ ok: false });
      }
      return true;
    };
    try {
      chrome.runtime.onMessage.addListener(listener);
    } catch (e) {
      if (isContextInvalidatedError(e)) handleContextInvalidated();
    }
    return () => {
      try {
        chrome.runtime.onMessage.removeListener(listener);
      } catch (_) {}
    };
  }, []);

  // ── 5. Sidebar margin (expanded vs collapsed) ────────────────────────────────
  useEffect(() => {
    applyMeetShrink(sidebarVisible, sidebarCollapsed);
    return () => applyMeetShrink(false);
  }, [sidebarCollapsed, sidebarVisible]);

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
    const t = setTimeout(() => {
      try {
        store.set({ [STORAGE_KEY]: payload });
      } catch (e) {
        if (isContextInvalidatedError(e)) handleContextInvalidated();
      }
    }, 300);
    return () => clearTimeout(t);
  }, [session, currentIndex, durationSeconds]);

  // ── 7. Cleanup WS on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => { wsManager.current.disconnect(); };
  }, []);

  // ── Real-time WebSocket connection ───────────────────────────────────────────
  function connectRealtime(sess: InterviewSession) {
    setWsConnected(false);
    debugLog("ws", "Connecting realtime", { sessionId: sess.sessionId, candidateId: sess.candidate.id });
    wsManager.current.connect(sess.sessionId, sess.candidate.id, {
      onConnect: () => {
        setWsConnected(true);
        debugLog("ws", "WebSocket connected — audio can be sent");
      },
      onDisconnect: () => {
        setWsConnected(false);
        debugLog("ws", "WebSocket disconnected — audio will not reach backend");
      },
      onAudioChunkSent: (count) => {
        debugLog("audio", "Audio chunks sent to backend", { totalChunks: count });
      },
      onAudioSkipped: (reason) => {
        debugLog("audio", "Audio not sent", { reason });
        if (reason.includes("Tab audio silent")) {
          setMicError(reason);
          setMicToast(true);
        }
      },
      onTabAudioLevel: (rms, hasContent, consecutiveSilent) => {
        debugLog("audio", hasContent ? "Tab audio has content" : "Tab audio silent", { rms: rms.toFixed(6), hasContent, consecutiveSilent });
      },
      onTranscript: (text, isFinal, speaker) => {
        const who = speaker ?? "candidate";
        debugLog("ws", "Transcript chunk", { speaker: who, text: text.slice(0, 80), isFinal });
        if (!text.trim()) return;
        // Show the latest chunk (interim or final) as the live "typing" indicator.
        // We do NOT commit individual final chunks as separate transcript entries —
        // the full stitched utterance arrives via turn_complete.
        setInterimTranscript({ speaker: who, text });
      },
      onTurnComplete: (text, speaker) => {
        const who = speaker ?? "candidate";
        debugLog("ws", "Turn complete (stitched)", { speaker: who, text: text.slice(0, 120) });
        setInterimTranscript(null);
        setSession((prev) => {
          if (!prev) return prev;
          const entry = {
            id: `tx-${Date.now()}`,
            speaker: who,
            text: text.trim(),
            timestamp: new Date().toISOString(),
          };
          const transcript = [...prev.transcript, entry];
          const idx = currentIndexRef.current;
          const q = prev.questions[idx];
          if (q && !q.answered) {
            debugLog("state", "Question marked answered (from turn)", { questionId: q.id });
            const questions = prev.questions.map((qu) =>
              qu.id === q.id ? { ...qu, answered: true } : qu
            );
            return { ...prev, transcript, questions };
          }
          return { ...prev, transcript };
        });
      },
      onInsights: (data, questionId) => {
        const topicCount = data.extractedTopics?.length ?? 0;
        const followUpCount = (data.followUpQuestions?.length ?? 0) + (data.competencyQuestions?.length ?? 0);
        debugLog("ws", `Insights: ${topicCount} topics, ${followUpCount} follow-ups, score: ${data.answerScore?.overall ?? "-"}`, { questionId, topicCount, followUpCount, keyInsights: (data.keyInsights?.length ?? 0), score: data.answerScore?.overall });
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
        const newTopics: ExtractedTopic[] = (data.extractedTopics || []).map((t, i) => ({
          id: `et-${Date.now()}-${i}`,
          topic: t.topic,
          reason: t.reason,
          followUpQuestions: (t.followUpQuestions || []).map((q) => ({
            question: q.question,
            type: (q.type === "competency" ? "competency" : "follow_up") as FollowUpType,
          })),
          questionId,
        }));
        const newScore: AnswerScore | undefined = data.answerScore ? {
          relevance: data.answerScore.relevance,
          depth: data.answerScore.depth,
          specificity: data.answerScore.specificity,
          overall: data.answerScore.overall,
          feedback: data.answerScore.feedback,
        } : undefined;
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            followUps: [...prev.followUps, ...followUps],
            extractedTopics: [...prev.extractedTopics, ...newTopics],
            insights: [...prev.insights, ...(data.keyInsights || [])],
            skillSignals: [...new Set([...prev.skillSignals, ...(data.skillSignals || [])])],
            answerScores: newScore ? [...prev.answerScores, newScore] : prev.answerScores,
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
        debugLog("ws", "Evidence cards received", { count: cards?.length ?? 0 });
        setSession((prev) => {
          if (!prev) return prev;
          return { ...prev, evidenceCards: [...prev.evidenceCards, ...cards] };
        });
      },
      onNewClaims: (claims) => {
        debugLog("ws", "New claims (not in resume)", { count: claims?.length ?? 0, claims: claims?.map((c) => c.claimText?.slice(0, 60)) });
        setSession((prev) => {
          if (!prev) return prev;
          const newCards: EvidenceCard[] = (claims || []).map((c, i) => ({
            id: `nc-${Date.now()}-${i}`,
            type: "new_info" as const,
            resumeSnippet: c.claimText,
            claimText: c.claimText,
          }));
          return { ...prev, evidenceCards: [...prev.evidenceCards, ...newCards] };
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
    try {
      sessionRef.current = newSession;
      setSession(newSession);
      setCurrentIndex(0);
      setDurationSeconds(0);
      store.set({ [STORAGE_KEY]: { session: newSession, authorizedAt: Date.now() } });
    } catch (e) {
      if (isContextInvalidatedError(e)) handleContextInvalidated();
    }
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

  const handleStartInterview = async () => {
    if (!session) return;
    try {
      debugLog("action", "Start interview", { sessionId: session.sessionId });
      const q = session.questions[currentIndex];
      const firstTranscript = q
        ? [...session.transcript, { id: `tx-q-${Date.now()}`, speaker: "interviewer" as const, text: q.text, timestamp: new Date().toISOString() }]
        : session.transcript;
      const updated: InterviewSession = { ...session, interviewStarted: true, transcript: firstTranscript };
      sessionRef.current = updated;
      setSession(updated);
      try {
        store.set({ [STORAGE_KEY]: { session: updated, authorizedAt: Date.now() } });
      } catch (e) {
        if (isContextInvalidatedError(e)) { handleContextInvalidated(); return; }
        throw e;
      }
      connectRealtime(updated);

      // Request tab capture stream ID from background service worker.
      // Background calls getMediaStreamId with consumerTabId so content script can use getUserMedia.
      captureActiveRef.current = false;
      setMicStatus("pending");
      debugLog("audio", "Requesting tab capture stream from background", { sessionId: updated.sessionId });
      chrome.runtime.sendMessage({ type: "HIRELENS_START_TAB_CAPTURE", sessionId: updated.sessionId })
        .then((resp: { ok?: boolean; error?: string }) => {
          if (resp?.error) {
            setMicStatus("error");
            setMicError(`Audio capture failed: ${resp.error}`);
            setMicToast(true);
            return;
          }
          captureActiveRef.current = true;
          setMicStatus("ok");
          setMicError(null);
          setMicToast(false);
          debugLog("audio", "Tab audio capture started via offscreen doc", { sessionId: updated.sessionId });
        })
        .catch((e: Error) => {
          setMicStatus("error");
          setMicError(`Tab capture failed: ${e.message}`);
          setMicToast(true);
        });

      if (q) wsManager.current.setActiveQuestion(updated.sessionId, q.id, q.text);
    } catch (e) {
      if (isContextInvalidatedError(e)) handleContextInvalidated();
    }
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
    if (captureActiveRef.current) {
      captureActiveRef.current = false;
      chrome.runtime.sendMessage({ type: "HIRELENS_STOP_TAB_CAPTURE" }).catch(() => {});
    }
    const sess = sessionRef.current;
    if (sess?.sessionId && !sess.sessionId.startsWith("mock-") && !sess.sessionId.startsWith("local-")) {
      try { await endAssistSession(sess.sessionId); } catch { /* ignore */ }
    }
    try {
      store.remove(STORAGE_KEY, () => { /* ignore */ });
    } catch (e) {
      if (isContextInvalidatedError(e)) { handleContextInvalidated(); return; }
    }
    clearSession();
  };

  const currentQuestion = session?.questions[currentIndex];
  const answeredCount = session?.questions.filter((q) => q.answered).length ?? 0;
  const totalQuestions = session?.questions.length ?? 0;

  if (contextInvalidated) {
    return <ContextInvalidatedBanner />;
  }

  return (
    <>
      {debugOn && (
        <DebugPanel
          entries={logEntries}
          transcript={session?.transcript ?? []}
          interimTranscript={interimTranscript}
          wsConnected={wsConnected}
          micStatus={micStatus}
          micError={micError}
          sessionId={session?.sessionId}
          currentQuestionIndex={currentIndex}
          followUpCount={session?.followUps.length ?? 0}
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
          extractedTopics={session.extractedTopics}
          answerScore={session.answerScores[session.answerScores.length - 1]}
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
          interimTranscript={interimTranscript}
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
      {micToast && session?.interviewStarted && (
        <div className="hl-mic-toast" role="alert">
          <p className="hl-mic-toast__text">{micError ?? "Tab audio capture starting…"}</p>
          <div className="hl-mic-toast__actions">
            <button type="button" className="hl-mic-toast__dismiss" onClick={() => setMicToast(false)}>Dismiss</button>
          </div>
        </div>
      )}
      {/* Floating toggle button — shows when sidebar is hidden */}
      {!sidebarVisible && (
        <button
          type="button"
          title="Open HireLens Copilot"
          onClick={() => setSidebarVisible(true)}
          style={{
            position: "fixed",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2147483644,
            pointerEvents: "auto",
            width: 36,
            height: 56,
            borderRadius: "8px 0 0 8px",
            background: "rgba(0,122,255,0.92)",
            border: "1px solid rgba(0,122,255,0.4)",
            borderRight: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "-2px 0 12px rgba(0,122,255,0.3)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {sidebarVisible && (
        <RightSidebar
          session={session}
          currentIndex={currentIndex}
          durationSeconds={durationSeconds}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(true)}
          onExpand={() => setSidebarCollapsed(false)}
          onClose={handleClose}
          onSelectQuestion={handleSelectQuestion}
          onMarkAnswered={handleMarkAnswered}
          onStartInterview={handleStartInterview}
          onSessionCreated={handleSessionCreated}
        />
      )}
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
