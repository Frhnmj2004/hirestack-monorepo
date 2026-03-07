import { useState } from "react";
import type { FollowUpItem } from "../../shared/types";
import "./DynamicIsland.css";

interface DynamicIslandProps {
  question: string;
  jobTitle: string;
  candidateName: string;
  questionIndex: number;
  totalQuestions: number;
  answeredCount?: number;
  /** Whether each question index (0-based) is answered — used for dot progress */
  answeredByIndex?: boolean[];
  alertCount?: number;
  /** Follow-ups for the current question — shown in expandable "Follow-up topics" */
  followUps?: FollowUpItem[];
  onAskFollowUp?: (questionText: string) => void;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
}

const TOPIC_LABEL: Record<string, string> = { competency: "Competency", follow_up: "Follow-up" };

export function DynamicIsland({
  question,
  jobTitle,
  candidateName,
  questionIndex,
  totalQuestions,
  answeredCount = 0,
  answeredByIndex = [],
  alertCount = 0,
  followUps = [],
  onAskFollowUp,
  onNext,
  onPrev,
  canNext,
  canPrev,
}: DynamicIslandProps) {
  const [expanded, setExpanded] = useState(true);
  const [followUpTopicsOpen, setFollowUpTopicsOpen] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<Set<string>>(new Set(["competency", "follow_up"]));

  const byTopic = followUps.reduce<Record<string, FollowUpItem[]>>((acc, f) => {
    const t = f.type || "follow_up";
    if (!acc[t]) acc[t] = [];
    acc[t].push(f);
    return acc;
  }, {});
  const topicKeys = Object.keys(byTopic);
  const hasFollowUps = followUps.length > 0;

  const toggleTopic = (key: string) => {
    setExpandedTopic((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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

            <div className="hl-di__followups">
                <button
                  type="button"
                  className="hl-di__followups-toggle"
                  onClick={() => setFollowUpTopicsOpen((o) => !o)}
                  aria-expanded={followUpTopicsOpen}
                >
                  <span className="hl-di__followups-toggle-text">
                    Follow-up topics ({followUps.length})
                  </span>
                  <span className="hl-di__followups-chevron">{followUpTopicsOpen ? "▼" : "▶"}</span>
                </button>
                {followUpTopicsOpen && (
                  <div className="hl-di__followups-body">
                    {!hasFollowUps ? (
                      <p className="hl-di__followups-empty">
                        No follow-ups yet. Backend sends these after each candidate answer (insights event). Speak and wait for the pipeline to return follow-ups.
                      </p>
                    ) : topicKeys.map((topicKey) => (
                      <div key={topicKey} className="hl-di__followup-topic">
                        <button
                          type="button"
                          className="hl-di__followup-topic-btn"
                          onClick={() => toggleTopic(topicKey)}
                          aria-expanded={expandedTopic.has(topicKey)}
                        >
                          <span>{TOPIC_LABEL[topicKey] ?? topicKey}</span>
                          <span className="hl-di__followup-topic-count">{byTopic[topicKey].length}</span>
                          <span className="hl-di__followup-chevron">{expandedTopic.has(topicKey) ? "▼" : "▶"}</span>
                        </button>
                        {expandedTopic.has(topicKey) && (
                          <ul className="hl-di__followup-list">
                            {byTopic[topicKey].map((f) => (
                              <li key={f.id} className="hl-di__followup-item">
                                <p className="hl-di__followup-q">{f.question}</p>
                                {onAskFollowUp && (
                                  <button
                                    type="button"
                                    className="hl-di__followup-ask"
                                    onClick={() => onAskFollowUp(f.question)}
                                  >
                                    Ask follow-up
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="hl-di__bottom">
              <div className="hl-di__progress-wrap">
                <div className="hl-di__dots">
                  {Array.from({ length: totalQuestions }).map((_, i) => {
                    const isActive = i + 1 === questionIndex;
                    const isAnswered = answeredByIndex[i] === true;
                    return (
                      <div
                        key={i}
                        className={`hl-di__dot ${
                          isActive ? "hl-di__dot--active" : isAnswered ? "hl-di__dot--done" : ""
                        }`}
                        title={isActive ? "Now asking" : isAnswered ? "Answered" : "Pending"}
                      />
                    );
                  })}
                </div>
                <span className="hl-di__counter">
                  {answeredCount} answered · Q{questionIndex}/{totalQuestions}
                </span>
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
