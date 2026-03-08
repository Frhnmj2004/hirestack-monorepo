import { useState } from "react";
import type { FollowUpItem, ExtractedTopic, AnswerScore } from "../../shared/types";
import "./DynamicIsland.css";

interface DynamicIslandProps {
  question: string;
  jobTitle: string;
  candidateName: string;
  questionIndex: number;
  totalQuestions: number;
  answeredCount?: number;
  answeredByIndex?: boolean[];
  alertCount?: number;
  followUps?: FollowUpItem[];
  extractedTopics?: ExtractedTopic[];
  answerScore?: AnswerScore;
  onAskFollowUp?: (questionText: string) => void;
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
  answeredCount = 0,
  answeredByIndex = [],
  alertCount = 0,
  extractedTopics = [],
  answerScore,
  onAskFollowUp,
  onNext,
  onPrev,
  canNext,
  canPrev,
}: DynamicIslandProps) {
  const [expanded, setExpanded] = useState(true);
  const [followUpTopicsOpen, setFollowUpTopicsOpen] = useState(false);
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);

  const currentQuestionTopics = extractedTopics.filter(
    (t) => t.questionId === `q-${questionIndex}` || extractedTopics.length > 0
  );
  const topicCount = currentQuestionTopics.length;

  return (
    <div className="hl-di-wrapper">
      <div className={`hl-di ${expanded ? "hl-di--expanded" : "hl-di--pill"}`}>
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

            {answerScore && (
              <div className="hl-di__score-bar">
                <div className="hl-di__score-row">
                  <span className="hl-di__score-label">Answer</span>
                  <div className="hl-di__score-track">
                    <div className="hl-di__score-fill" style={{ width: `${(answerScore.overall / 10) * 100}%` }} />
                  </div>
                  <span className="hl-di__score-num">{answerScore.overall}/10</span>
                </div>
                {answerScore.feedback && (
                  <p className="hl-di__score-feedback">{answerScore.feedback}</p>
                )}
              </div>
            )}

            <div className="hl-di__followups">
              <button
                type="button"
                className="hl-di__followups-toggle"
                onClick={() => setFollowUpTopicsOpen((o) => !o)}
                aria-expanded={followUpTopicsOpen}
              >
                <span className="hl-di__followups-toggle-text">
                  Follow-up topics ({topicCount})
                </span>
                <span className="hl-di__followups-chevron">{followUpTopicsOpen ? "▼" : "▶"}</span>
              </button>
              {followUpTopicsOpen && (
                <div className="hl-di__followups-body">
                  {topicCount === 0 ? (
                    <p className="hl-di__followups-empty">
                      Topics appear here after the candidate answers. Each topic has specific follow-up questions.
                    </p>
                  ) : currentQuestionTopics.map((topic) => {
                    const isOpen = openTopicId === topic.id;
                    return (
                      <div key={topic.id} className="hl-di__followup-topic">
                        <button
                          type="button"
                          className={`hl-di__followup-topic-btn ${isOpen ? "hl-di__followup-topic-btn--open" : ""}`}
                          onClick={() => setOpenTopicId(isOpen ? null : topic.id)}
                          aria-expanded={isOpen}
                        >
                          <span className="hl-di__topic-name">{topic.topic}</span>
                          <span className="hl-di__followup-topic-count">{topic.followUpQuestions.length}</span>
                          <span className="hl-di__followup-chevron">{isOpen ? "▼" : "▶"}</span>
                        </button>
                        {topic.reason && !isOpen && (
                          <p className="hl-di__topic-reason">{topic.reason}</p>
                        )}
                        {isOpen && (
                          <ul className="hl-di__followup-list">
                            {topic.followUpQuestions.map((f, fi) => (
                              <li key={fi} className="hl-di__followup-item">
                                <span className="hl-di__followup-type-tag">{f.type === "competency" ? "Competency" : "Follow-up"}</span>
                                <p className="hl-di__followup-q">{f.question}</p>
                                {onAskFollowUp && (
                                  <button
                                    type="button"
                                    className="hl-di__followup-ask"
                                    onClick={() => onAskFollowUp(f.question)}
                                  >
                                    Ask
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
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
