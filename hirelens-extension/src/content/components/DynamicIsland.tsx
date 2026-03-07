import { useState } from "react";
import "./DynamicIsland.css";

interface DynamicIslandProps {
  question: string;
  jobTitle: string;
  candidateName: string;
  questionIndex: number;
  totalQuestions: number;
  alertCount?: number;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
}

export function DynamicIsland({
  question,
  jobTitle,
  candidateName,
  questionIndex,
  totalQuestions,
  alertCount = 0,
  onNext,
  onPrev,
  canNext,
  canPrev,
}: DynamicIslandProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="hl-di-wrapper">
      <div className={`hl-di ${expanded ? "hl-di--expanded" : "hl-di--pill"}`}>
        {/* Collapsed pill */}
        {!expanded && (
          <button
            type="button"
            className="hl-di__pill-btn"
            onClick={() => setExpanded(true)}
            aria-label="Expand question"
          >
            <span className="hl-di__pill-dot" />
            <span className="hl-di__pill-label">Q{questionIndex}/{totalQuestions}</span>
            <span className="hl-di__pill-preview">
              {question.slice(0, 48)}{question.length > 48 ? "…" : ""}
            </span>
            {alertCount > 0 && (
              <span className="hl-di__pill-alert">{alertCount}</span>
            )}
          </button>
        )}

        {/* Expanded card */}
        {expanded && (
          <div className="hl-di__body">
            <div className="hl-di__top">
              <div className="hl-di__meta">
                <span className="hl-di__badge">{jobTitle}</span>
                <span className="hl-di__sep">·</span>
                <span className="hl-di__candidate">{candidateName}</span>
              </div>
              <button
                type="button"
                className="hl-di__collapse"
                onClick={() => setExpanded(false)}
                aria-label="Collapse"
              >
                ▲
              </button>
            </div>

            <p className="hl-di__question">{question}</p>

            <div className="hl-di__bottom">
              <div className="hl-di__progress-wrap">
                <div className="hl-di__dots">
                  {Array.from({ length: totalQuestions }).map((_, i) => (
                    <div
                      key={i}
                      className={`hl-di__dot ${
                        i === questionIndex - 1
                          ? "hl-di__dot--active"
                          : i < questionIndex - 1
                          ? "hl-di__dot--done"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="hl-di__counter">{questionIndex} / {totalQuestions}</span>
              </div>
              <div className="hl-di__nav">
                <button
                  type="button"
                  className="hl-di__nav-btn"
                  onClick={onPrev}
                  disabled={!canPrev}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="hl-di__nav-btn hl-di__nav-btn--next"
                  onClick={onNext}
                  disabled={!canNext}
                  aria-label="Next"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
