import { useEffect, useRef, useState } from "react";
import type { LogEntry, LogLevel } from "../../shared/debug";
import type { TranscriptEntry } from "../../shared/types";
import "./DebugPanel.css";

type TabId = "current" | "livestream";

interface DebugPanelProps {
  entries: LogEntry[];
  transcript: TranscriptEntry[];
  interimTranscript?: { speaker: "candidate" | "interviewer"; text: string } | null;
  wsConnected: boolean;
  micStatus?: "pending" | "ok" | "error";
  micError?: string | null;
  sessionId?: string;
  currentQuestionIndex?: number;
  followUpCount?: number;
  onClear?: () => void;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  action: "#6eb5ff",
  ws: "#5ac8fa",
  audio: "#af52de",
  state: "#34c759",
  error: "#ff3b30",
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toTimeString().slice(0, 12);
  } catch {
    return iso.slice(11, 23);
  }
}

export function DebugPanel({
  entries,
  transcript,
  interimTranscript,
  wsConnected,
  micStatus = "pending",
  micError,
  sessionId,
  currentQuestionIndex = 0,
  followUpCount = 0,
  onClear,
}: DebugPanelProps) {
  const [tab, setTab] = useState<TabId>("current");
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && tab === "current") el.scrollTop = el.scrollHeight;
  }, [entries.length, tab]);

  useEffect(() => {
    const el = streamRef.current;
    if (el && tab === "livestream") el.scrollTop = el.scrollHeight;
  }, [transcript.length, interimTranscript?.text, tab]);

  return (
    <div className="hl-dbg" role="log" aria-label="HireLens debug">
      <div className="hl-dbg__header">
        <span className="hl-dbg__title">DEBUG</span>
        {onClear && (
          <button type="button" className="hl-dbg__clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      <div className="hl-dbg__tabs">
        <button
          type="button"
          className={`hl-dbg__tab ${tab === "current" ? "hl-dbg__tab--active" : ""}`}
          onClick={() => setTab("current")}
        >
          Current
        </button>
        <button
          type="button"
          className={`hl-dbg__tab ${tab === "livestream" ? "hl-dbg__tab--active" : ""}`}
          onClick={() => setTab("livestream")}
        >
          Live stream (speaker)
        </button>
      </div>

      {tab === "current" && (
        <div className="hl-dbg__body">
          <div className="hl-dbg__state">
            <div className="hl-dbg__state-row">
              <span className="hl-dbg__state-label">WS</span>
              <span className={`hl-dbg__state-val ${wsConnected ? "hl-dbg__state-val--ok" : "hl-dbg__state-val--err"}`}>
                {wsConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="hl-dbg__state-row">
              <span className="hl-dbg__state-label">Mic</span>
              <span className={`hl-dbg__state-val ${
                micStatus === "ok" ? "hl-dbg__state-val--ok" : micStatus === "error" ? "hl-dbg__state-val--err" : ""
              }`}>
                {micStatus === "ok" ? "OK (live)" : micStatus === "error" ? (micError?.slice(0, 30) ?? "Error") + "…" : "Pending"}
              </span>
            </div>
            {sessionId && (
              <div className="hl-dbg__state-row">
                <span className="hl-dbg__state-label">Session</span>
                <span className="hl-dbg__state-val hl-dbg__state-val--mono">{sessionId.slice(0, 20)}…</span>
              </div>
            )}
            <div className="hl-dbg__state-row">
              <span className="hl-dbg__state-label">Q index</span>
              <span className="hl-dbg__state-val">{currentQuestionIndex + 1}</span>
            </div>
            <div className="hl-dbg__state-row">
              <span className="hl-dbg__state-label">Follow-ups</span>
              <span className="hl-dbg__state-val">{followUpCount}</span>
            </div>
          </div>
          <p className="hl-dbg__section-label">Actions &amp; events</p>
          <div className="hl-dbg__scroll" ref={scrollRef}>
            {entries.length === 0 ? (
              <p className="hl-dbg__empty">No entries yet.</p>
            ) : (
              entries.map((e) => (
                <div key={e.id} className="hl-dbg__row" data-level={e.level}>
                  <span className="hl-dbg__time">{e.time}</span>
                  <span className="hl-dbg__level" style={{ color: LEVEL_COLORS[e.level] }}>
                    {e.level}
                  </span>
                  <span className="hl-dbg__msg">{e.message}</span>
                  {e.data !== undefined && (
                    <pre className="hl-dbg__data">
                      {typeof e.data === "object" ? JSON.stringify(e.data, null, 0).slice(0, 300) : String(e.data)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "livestream" && (
        <div className="hl-dbg__body">
          <p className="hl-dbg__stream-hint">
            Who is talking — final lines plus one live interim (updates until speaker stops). Interviewer = Q; Candidate = A.
          </p>
          <div className="hl-dbg__stream" ref={streamRef}>
            {transcript.length === 0 && !interimTranscript?.text ? (
              <p className="hl-dbg__empty">
                No transcript yet. Candidate speech appears when tab audio is captured and backend sends transcript (STT).
              </p>
            ) : (
              <>
                {transcript.map((t) => (
                  <div
                    key={t.id}
                    className={`hl-dbg__stream-row hl-dbg__stream-row--${t.speaker}`}
                    title={t.timestamp}
                  >
                    <span className="hl-dbg__stream-time">{formatTime(t.timestamp)}</span>
                    <span className="hl-dbg__stream-speaker">
                      {t.speaker === "interviewer" ? "Q" : "A"}
                    </span>
                    <span className="hl-dbg__stream-label">
                      {t.speaker === "interviewer" ? "Interviewer" : "Candidate"}
                    </span>
                    <p className="hl-dbg__stream-text">{t.text}</p>
                  </div>
                ))}
                {interimTranscript?.text && (
                  <div
                    className={`hl-dbg__stream-row hl-dbg__stream-row--${interimTranscript.speaker} hl-dbg__stream-row--interim`}
                    title="Live interim (updating)"
                  >
                    <span className="hl-dbg__stream-time">—</span>
                    <span className="hl-dbg__stream-speaker">
                      {interimTranscript.speaker === "interviewer" ? "Q" : "A"}
                    </span>
                    <span className="hl-dbg__stream-label">
                      {interimTranscript.speaker === "interviewer" ? "Interviewer" : "Candidate"}
                    </span>
                    <p className="hl-dbg__stream-text">{interimTranscript.text}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
