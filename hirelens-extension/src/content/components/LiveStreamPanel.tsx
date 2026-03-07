import type { TranscriptEntry } from "../../shared/types";
import "./LiveStreamPanel.css";

interface LiveStreamPanelProps {
  transcript: TranscriptEntry[];
  currentQuestion?: string;
}

const MAX_VISIBLE = 8;

export function LiveStreamPanel({ transcript, currentQuestion }: LiveStreamPanelProps) {
  const visible = transcript.slice(-MAX_VISIBLE);

  return (
    <div className="hl-ls" aria-label="Live Q&A stream">
      <div className="hl-ls__glass">
        <div className="hl-ls__header">
          <span className="hl-ls__dot" />
          <span className="hl-ls__title">Live Q&A</span>
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
              className={`hl-ls__entry hl-ls__entry--${entry.speaker}`}
            >
              <span className="hl-ls__entry-role">
                {entry.speaker === "interviewer" ? "Q" : "A"}
              </span>
              <p className="hl-ls__entry-text">{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
