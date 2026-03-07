import { useState } from "react";
import type { TranscriptEntry, FollowUpItem } from "../../shared/types";
import "./LiveStreamPanel.css";

interface LiveStreamPanelProps {
  transcript: TranscriptEntry[];
  interimTranscript?: { speaker: "candidate" | "interviewer"; text: string } | null;
  currentQuestion?: string;
  followUps?: FollowUpItem[];
  onAskFollowUp?: (questionText: string) => void;
}

const MAX_VISIBLE = 8;

export function LiveStreamPanel({
  transcript,
  interimTranscript,
  currentQuestion,
  followUps = [],
  onAskFollowUp,
}: LiveStreamPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const withInterim = interimTranscript?.text
    ? [...transcript, { id: "interim", speaker: interimTranscript.speaker, text: interimTranscript.text, timestamp: "" }]
    : transcript;
  const visible = withInterim.slice(-MAX_VISIBLE);

  return (
    <div className={`hl-ls ${collapsed ? "hl-ls--collapsed" : ""}`} aria-label="Live Q&A stream">
      <div className="hl-ls__glass">
        {collapsed ? (
          <button
            type="button"
            className="hl-ls__pill"
            onClick={() => setCollapsed(false)}
            aria-label="Expand Live Q&A"
            title="Expand Live Q&A"
          >
            <span className="hl-ls__pill-dot" />
            <span className="hl-ls__pill-label">Live Q&A</span>
          </button>
        ) : (
          <>
            <div className="hl-ls__header">
              <span className="hl-ls__dot" />
              <span className="hl-ls__title">Live Q&A</span>
              <button
                type="button"
                className="hl-ls__collapse-btn"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse"
                title="Minimize to icon"
              >
                −
              </button>
            </div>
            {currentQuestion && (
              <div className="hl-ls__current">
                <span className="hl-ls__label">Now asking</span>
                <p className="hl-ls__question">{currentQuestion}</p>
              </div>
            )}
            <div className="hl-ls__scroll">
              {visible.map((entry) => (
                <div
                  key={entry.id}
                  className={`hl-ls__entry hl-ls__entry--${entry.speaker} ${entry.id === "interim" ? "hl-ls__entry--interim" : ""}`}
                >
                  <span className="hl-ls__entry-role">
                    {entry.speaker === "interviewer" ? "Q" : "A"}
                  </span>
                  <p className="hl-ls__entry-text">{entry.text}</p>
                </div>
              ))}
            </div>
            {followUps.length > 0 && (
              <div className="hl-ls__followups">
                <span className="hl-ls__followups-title">Follow-up topics</span>
                <p className="hl-ls__followups-hint">Click “Ask” to ask in real time; answer will appear below.</p>
                <ul className="hl-ls__followup-list">
                  {followUps.map((f) => (
                    <li key={f.id} className="hl-ls__followup-item">
                      <p className="hl-ls__followup-text">{f.question}</p>
                      {onAskFollowUp && (
                        <button
                          type="button"
                          className="hl-ls__ask-btn"
                          onClick={() => onAskFollowUp(f.question)}
                        >
                          Ask follow-up
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
