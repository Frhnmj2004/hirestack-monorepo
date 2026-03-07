import { useState, useEffect, useRef } from "react";
import type {
  InterviewSession,
  QuestionItem,
  InterviewTopic,
  FollowUpItem,
  AlertItem,
} from "../../shared/types";
import {
  listInterviews,
  createInterview,
  parseDocument,
  startAssistSession,
  buildSessionFromInterview,
  openInterview,
  type InterviewListItem,
} from "../../shared/api";
import "./RightSidebar.css";

type Tab = "home" | "interview" | "insights" | "flags";

interface RightSidebarProps {
  session: InterviewSession | null;
  currentIndex: number;
  durationSeconds: number;
  onClose: () => void;
  onSelectQuestion: (index: number) => void;
  onMarkAnswered: (questionId: string, score?: number) => void;
  onStartInterview: () => void;
  onSessionCreated: (session: InterviewSession) => void;
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconMic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconSpark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconFlag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="hl-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const IconUpload = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const IconFile = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getTopicQuestions(topic: InterviewTopic, questions: QuestionItem[]) {
  return questions.filter((q) => topic.questionIds.includes(q.id));
}

function topicProgress(topic: InterviewTopic, questions: QuestionItem[]): number {
  const qs = getTopicQuestions(topic, questions);
  if (!qs.length) return 0;
  return qs.filter((q) => q.answered).length / qs.length;
}

function topicAvgScore(topic: InterviewTopic, questions: QuestionItem[]): number | null {
  const scored = getTopicQuestions(topic, questions).filter((q) => q.answered && q.score !== undefined);
  if (!scored.length) return null;
  return scored.reduce((s, q) => s + (q.score ?? 0), 0) / scored.length;
}

function QTypeChip({ type }: { type: QuestionItem["type"] }) {
  return <span className={`hl-sb__chip hl-sb__chip--${type}`}>{type}</span>;
}

// ── File Drop Zone ─────────────────────────────────────────────────────────────
function FileDropZone({
  label,
  hint,
  file,
  onFile,
  accept,
}: {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File) => void;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      className={`hl-sb__drop-zone${file ? " hl-sb__drop-zone--done" : ""}${dragging ? " hl-sb__drop-zone--drag" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      {file ? (
        <div className="hl-sb__drop-done">
          <span className="hl-sb__drop-check"><IconCheckCircle /></span>
          <div>
            <p className="hl-sb__drop-label">{label}</p>
            <p className="hl-sb__drop-filename"><IconFile /> {file.name}</p>
          </div>
        </div>
      ) : (
        <div className="hl-sb__drop-idle">
          <span className="hl-sb__drop-icon"><IconUpload /></span>
          <p className="hl-sb__drop-label">{label}</p>
          <p className="hl-sb__drop-hint">{hint}</p>
        </div>
      )}
    </div>
  );
}

// ── Tab 0: Home — No session (interview list + create) ────────────────────────
function NoSessionHomePanel({ onSessionCreated }: { onSessionCreated: (s: InterviewSession) => void }) {
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createStep, setCreateStep] = useState("");
  const [createError, setCreateError] = useState("");

  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    roleTitle: "",
    department: "Engineering",
    level: "Mid",
  });

  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    listInterviews().then((list) => {
      setInterviews(list);
      setLoading(false);
    });
  }, []);

  const handleOpen = async (item: InterviewListItem) => {
    setOpening(item.interviewId);
    const session = await openInterview(item);
    setOpening(null);
    if (session) onSessionCreated(session);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidateName.trim() || !form.roleTitle.trim()) {
      setCreateError("Candidate name and role title are required.");
      return;
    }
    if (!jdFile || !resumeFile) {
      setCreateError("Please upload both the Job Description and Resume files.");
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      setCreateStep("Parsing documents…");
      const [jdText, resumeText] = await Promise.all([
        parseDocument(jdFile),
        parseDocument(resumeFile),
      ]);

      setCreateStep("Generating AI interview plan…");
      const interview = await createInterview({
        candidateName: form.candidateName.trim(),
        candidateEmail: form.candidateEmail.trim() || undefined,
        resumeText,
        jdText,
        roleTitle: form.roleTitle.trim(),
        department: form.department.trim(),
        level: form.level,
      });

      if (!interview) {
        setCreateError("Failed to create interview. Check the backend is running.");
        setCreating(false);
        setCreateStep("");
        return;
      }

      setCreateStep("Starting session…");
      const sessionRes = await startAssistSession({
        candidateId: interview.candidateId,
        interviewerId: "default-interviewer",
        interviewId: interview.interviewId,
      });

      if (!sessionRes) {
        setCreateError("Interview created but could not start session.");
        setCreating(false);
        setCreateStep("");
        return;
      }

      const session = buildSessionFromInterview(interview, sessionRes.sessionId);
      setCreating(false);
      setCreateStep("");
      onSessionCreated(session);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unexpected error. Try again.");
      setCreating(false);
      setCreateStep("");
    }
  };

  if (showCreate) {
    return (
      <div className="hl-sb__panel-content">
        <button type="button" className="hl-sb__back-btn" onClick={() => { setShowCreate(false); setCreateError(""); setJdFile(null); setResumeFile(null); }}>
          <IconBack /> Back
        </button>

        <p className="hl-sb__section-title">New Interview</p>
        <p className="hl-sb__section-sub">Upload JD + Resume — AI generates tailored questions.</p>

        <form className="hl-sb__create-form" onSubmit={handleCreate}>
          <FileDropZone
            label="Job Description"
            hint="PDF, DOCX, or TXT · drag or click"
            file={jdFile}
            onFile={setJdFile}
            accept=".pdf,.docx,.doc,.txt"
          />
          <FileDropZone
            label="Candidate Resume"
            hint="PDF, DOCX, or TXT · drag or click"
            file={resumeFile}
            onFile={setResumeFile}
            accept=".pdf,.docx,.doc,.txt"
          />

          <div className="hl-sb__create-divider"><span>Candidate details</span></div>

          <label className="hl-sb__field">
            <span>Name *</span>
            <input
              type="text"
              placeholder="e.g. Aryan Kapoor"
              value={form.candidateName}
              onChange={(e) => setForm((f) => ({ ...f, candidateName: e.target.value }))}
            />
          </label>
          <label className="hl-sb__field">
            <span>Email (optional)</span>
            <input
              type="email"
              placeholder="candidate@email.com"
              value={form.candidateEmail}
              onChange={(e) => setForm((f) => ({ ...f, candidateEmail: e.target.value }))}
            />
          </label>
          <div className="hl-sb__field-row">
            <label className="hl-sb__field">
              <span>Role *</span>
              <input
                type="text"
                placeholder="e.g. Senior Engineer"
                value={form.roleTitle}
                onChange={(e) => setForm((f) => ({ ...f, roleTitle: e.target.value }))}
              />
            </label>
            <label className="hl-sb__field">
              <span>Level</span>
              <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                {["Junior", "Mid", "Senior", "Lead", "Principal"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="hl-sb__field">
            <span>Department</span>
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
          </label>

          {createError && <p className="hl-sb__create-error">{createError}</p>}

          <button type="submit" className="hl-sb__create-btn" disabled={creating}>
            {creating
              ? <><IconSpinner /> {createStep || "Working…"}</>
              : <>Generate Interview Plan</>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="hl-sb__panel-content">
      <button type="button" className="hl-sb__new-interview-btn" onClick={() => setShowCreate(true)}>
        <IconPlus />
        <div>
          <span>New Interview</span>
          <span className="hl-sb__new-interview-sub">Upload JD + Resume → AI generates questions</span>
        </div>
      </button>

      <p className="hl-sb__section-title" style={{ marginTop: 20 }}>Recent Interviews</p>

      {loading ? (
        <div className="hl-sb__loading"><IconSpinner /> Loading…</div>
      ) : interviews.length === 0 ? (
        <p className="hl-sb__empty-state">No interviews yet. Create one above.</p>
      ) : (
        <div className="hl-sb__interview-list">
          {interviews.map((item) => (
            <div key={item.interviewId} className="hl-sb__interview-card">
              <div className="hl-sb__ic-left">
                <div className="hl-sb__ic-avatar">{item.candidateName[0]}</div>
                <div className="hl-sb__ic-info">
                  <p className="hl-sb__ic-name">{item.candidateName}</p>
                  <p className="hl-sb__ic-role">{item.roleTitle} · <span className="hl-sb__ic-level">{item.level}</span></p>
                  <div className="hl-sb__ic-skills">
                    {item.candidateSkills.slice(0, 3).map((s) => (
                      <span key={s} className="hl-sb__ic-skill">{s}</span>
                    ))}
                    {item.candidateSkills.length > 3 && (
                      <span className="hl-sb__ic-skill hl-sb__ic-skill--more">+{item.candidateSkills.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="hl-sb__ic-right">
                <span className="hl-sb__ic-time">{timeAgo(item.createdAt)}</span>
                <span className="hl-sb__ic-meta">{item.questionCount}Q · {item.topicCount} topics</span>
                <button
                  type="button"
                  className="hl-sb__ic-open-btn"
                  disabled={opening === item.interviewId}
                  onClick={() => handleOpen(item)}
                >
                  {opening === item.interviewId ? <IconSpinner /> : "Open →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 1: Home — With session (candidate briefing) ───────────────────────────
function BriefingPanel({ session, onStart }: { session: InterviewSession; onStart: () => void }) {
  const { candidate, jobRole } = session;
  const [highlightsOpen, setHighlightsOpen] = useState(false);

  return (
    <div className="hl-sb__panel-content">
      <div className="hl-sb__briefing-hero">
        <div className="hl-sb__avatar-wrap">
          <div className="hl-sb__avatar">{candidate.name[0]}</div>
          {candidate.resumeScore !== undefined && (
            <div className="hl-sb__score-badge">
              <span className="hl-sb__score-badge-val">{candidate.resumeScore}</span>
              <span className="hl-sb__score-badge-lbl">Match</span>
            </div>
          )}
        </div>
        <div className="hl-sb__briefing-info">
          <p className="hl-sb__briefing-name">{candidate.name}</p>
          <p className="hl-sb__briefing-role">
            {candidate.currentRole ?? jobRole.title}
            {candidate.currentCompany && <span className="hl-sb__briefing-company"> · {candidate.currentCompany}</span>}
          </p>
          {candidate.experience && <p className="hl-sb__briefing-exp">{candidate.experience} experience</p>}
        </div>
      </div>

      {candidate.summary && <p className="hl-sb__briefing-summary">{candidate.summary}</p>}

      <div className="hl-sb__skill-row">
        {candidate.key_skills.map((s) => (
          <span key={s} className="hl-sb__skill-pill">{s}</span>
        ))}
      </div>

      {candidate.previous_companies.length > 0 && (
        <p className="hl-sb__prev-co">
          <span className="hl-sb__dim">Previously: </span>
          {candidate.previous_companies.join(", ")}
        </p>
      )}

      <div className="hl-sb__section-block">
        <p className="hl-sb__block-title">JD match — {jobRole.title}</p>
        <div className="hl-sb__jd-grid">
          {jobRole.requiredSkills.map((skill) => {
            const match = candidate.key_skills.some(
              (s) => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase())
            );
            return (
              <div key={skill} className={`hl-sb__jd-row ${match ? "hit" : "miss"}`}>
                <span className="hl-sb__jd-dot" />
                <span>{skill}</span>
              </div>
            );
          })}
        </div>
      </div>

      {candidate.highlights && (
        <div className="hl-sb__section-block">
          <button type="button" className="hl-sb__block-title-btn" onClick={() => setHighlightsOpen((v) => !v)}>
            <span className="hl-sb__block-title">Resume highlights</span>
            <span className="hl-sb__block-chevron">{highlightsOpen ? "▼" : "▶"}</span>
          </button>
          {highlightsOpen && (
            <div className="hl-sb__highlights-body">
              <p className="hl-sb__hl-label">Projects</p>
              {candidate.highlights.top_projects.map((p, i) => (
                <div key={i} className="hl-sb__hl-item">
                  <span className="hl-sb__hl-bullet blue" />
                  <span>{p}</span>
                </div>
              ))}
              <p className="hl-sb__hl-label" style={{ marginTop: 10 }}>Achievements</p>
              {candidate.highlights.key_achievements.map((a, i) => (
                <div key={i} className="hl-sb__hl-item">
                  <span className="hl-sb__hl-bullet green" />
                  <span>{a}</span>
                </div>
              ))}
              <div className="hl-sb__tech-pills">
                {candidate.highlights.technologies.map((t) => (
                  <span key={t} className="hl-sb__tech-pill">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="hl-sb__section-block">
        <p className="hl-sb__block-title">Interview plan</p>
        <p className="hl-sb__dim" style={{ fontSize: 12, padding: "2px 0 6px" }}>
          {session.questions.length} questions across {session.topics.length} topics
        </p>
        {session.topics.map((t) => (
          <div key={t.id} className="hl-sb__plan-topic">
            <span className="hl-sb__plan-dot" />
            <span>{t.name}</span>
            <span className="hl-sb__dim" style={{ marginLeft: "auto", fontSize: 11 }}>
              {t.questionIds.length}Q
            </span>
          </div>
        ))}
      </div>

      <button type="button" className="hl-sb__start-btn" onClick={onStart}>
        Start Interview
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
      </button>
    </div>
  );
}

// ── Tab 2: Interview (Active) ─────────────────────────────────────────────────
function InterviewPanel({
  session, currentIndex, durationSeconds, onSelectQuestion, onMarkAnswered,
}: {
  session: InterviewSession;
  currentIndex: number;
  durationSeconds: number;
  onSelectQuestion: (i: number) => void;
  onMarkAnswered: (id: string, score?: number) => void;
}) {
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set([session.topics[0]?.id ?? ""]));
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleTopic = (id: string) => {
    setOpenTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const answered = session.questions.filter((q) => q.answered).length;
  const total = session.questions.length;
  const overallPct = total > 0 ? (answered / total) * 100 : 0;
  const currentQ = session.questions[currentIndex];

  return (
    <>
      <div className="hl-sb__interview-header">
        <div className="hl-sb__ih-top">
          <div className="hl-sb__ih-info">
            <span className="hl-sb__ih-name">{session.candidate.name}</span>
            <span className="hl-sb__ih-sep">·</span>
            <span className="hl-sb__ih-role">{session.jobRole.title}</span>
          </div>
          <span className="hl-sb__ih-timer">{formatDuration(durationSeconds)}</span>
        </div>
        <div className="hl-sb__ih-stats">
          <span className="hl-sb__ih-stat">{answered}/{total} covered</span>
          <span className="hl-sb__ih-stat hl-sb__ih-stat--topics">
            {session.topics.filter((t) => topicProgress(t, session.questions) === 1).length}/{session.topics.length} topics done
          </span>
        </div>
        <div className="hl-sb__ih-bar-wrap">
          <div className="hl-sb__ih-bar" style={{ width: `${overallPct}%` }} />
        </div>
        {currentQ && (
          <div className="hl-sb__ih-current">
            <span className="hl-sb__ih-current-label">Now asking</span>
            <p className="hl-sb__ih-current-text">{currentQ.text}</p>
          </div>
        )}
      </div>

      <div className="hl-sb__panel-content" ref={scrollRef}>
        {session.topics.map((topic) => {
          const prog = topicProgress(topic, session.questions);
          const avgScore = topicAvgScore(topic, session.questions);
          const topicQs = getTopicQuestions(topic, session.questions);
          const isOpen = openTopics.has(topic.id);

          return (
            <div key={topic.id} className="hl-sb__topic-block">
              <button type="button" className="hl-sb__topic-hd" onClick={() => toggleTopic(topic.id)}>
                <div className="hl-sb__topic-hd-fill" style={{ width: `${prog * 100}%` }} />
                <div className="hl-sb__topic-hd-body">
                  <span className="hl-sb__topic-hd-chevron">{isOpen ? "▼" : "▶"}</span>
                  <span className="hl-sb__topic-hd-name">{topic.name}</span>
                  <div className="hl-sb__topic-hd-right">
                    {avgScore !== null && <span className="hl-sb__topic-hd-score">{avgScore.toFixed(1)}</span>}
                    <span className="hl-sb__topic-hd-count">
                      {topicQs.filter((q) => q.answered).length}/{topicQs.length}
                    </span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="hl-sb__topic-questions">
                  {topicQs.map((q) => {
                    const qIdx = session.questions.findIndex((x) => x.id === q.id);
                    const isActive = qIdx === currentIndex;
                    return (
                      <div key={q.id} className={`hl-sb__topic-q ${isActive ? "active" : ""} ${q.answered ? "answered" : ""}`}>
                        <button type="button" className="hl-sb__topic-q-btn" onClick={() => onSelectQuestion(qIdx)}>
                          <span className="hl-sb__topic-q-num">{qIdx + 1}</span>
                          <div className="hl-sb__topic-q-body">
                            <p className="hl-sb__topic-q-text">{q.text}</p>
                            <div className="hl-sb__topic-q-meta">
                              <QTypeChip type={q.type} />
                              {q.answered && q.score !== undefined && (
                                <div className="hl-sb__q-score-wrap">
                                  <div className="hl-sb__q-score-bar" style={{ width: `${(q.score / 10) * 100}%` }} />
                                  <span className="hl-sb__q-score-val">{q.score.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          className={`hl-sb__topic-q-mark ${q.answered ? "done" : ""}`}
                          onClick={() => onMarkAnswered(q.id, q.answered ? undefined : parseFloat((5 + Math.random() * 4.5).toFixed(1)))}
                          title={q.answered ? "Mark unanswered" : "Mark answered"}
                        >
                          {q.answered ? "✓" : "○"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Tab 3: Insights ───────────────────────────────────────────────────────────
function InsightsPanel({ session, currentIndex }: { session: InterviewSession; currentIndex: number }) {
  const currentQ = session.questions[currentIndex];
  const followUps = session.followUps.filter((f: FollowUpItem) => f.questionId === currentQ?.id);

  return (
    <div className="hl-sb__panel-content">
      <div className="hl-sb__section-block">
        <p className="hl-sb__block-title">
          Follow-ups
          {currentQ && <span className="hl-sb__block-subtitle"> — Q{currentIndex + 1}: {currentQ.competency}</span>}
        </p>
        {followUps.length === 0 && session.followUps.length === 0 ? (
          <p className="hl-sb__empty-state">No follow-ups yet. AI generates these after each candidate answer is transcribed.</p>
        ) : followUps.length === 0 ? (
          <>
            <p className="hl-sb__empty-state" style={{ marginBottom: 8 }}>No follow-ups for this question yet.</p>
            <p className="hl-sb__block-title" style={{ marginTop: 12 }}>All generated follow-ups</p>
            <div className="hl-sb__followup-list">
              {session.followUps.map((f: FollowUpItem) => (
                <div key={f.id} className={`hl-sb__followup hl-sb__followup--${f.type}`}>
                  <span className="hl-sb__followup-type">{f.type === "follow_up" ? "Follow-up" : "Competency probe"}</span>
                  <p className="hl-sb__followup-text">{f.question}</p>
                  {f.reason && <span className="hl-sb__followup-reason">{f.reason}</span>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="hl-sb__followup-list">
            {followUps.map((f: FollowUpItem) => (
              <div key={f.id} className={`hl-sb__followup hl-sb__followup--${f.type}`}>
                <span className="hl-sb__followup-type">{f.type === "follow_up" ? "Follow-up" : "Competency probe"}</span>
                <p className="hl-sb__followup-text">{f.question}</p>
                {f.reason && <span className="hl-sb__followup-reason">{f.reason}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {session.insights.length > 0 && (
        <div className="hl-sb__section-block">
          <p className="hl-sb__block-title">Key Insights</p>
          {session.insights.map((ins, i) => (
            <div key={i} className="hl-sb__insight-item">{ins}</div>
          ))}
        </div>
      )}

      {session.skillSignals.length > 0 && (
        <div className="hl-sb__section-block">
          <p className="hl-sb__block-title">Skill Signals</p>
          <div className="hl-sb__signal-wrap">
            {session.skillSignals.map((s, i) => (
              <span key={i} className="hl-sb__signal">{s}</span>
            ))}
          </div>
        </div>
      )}

      {session.scores.some((s) => s.score > 0) && (
        <div className="hl-sb__section-block">
          <p className="hl-sb__block-title">Competency Scores</p>
          {session.scores.map((s) => s.score > 0 ? (
            <div key={s.label} className="hl-sb__score-row">
              <span className="hl-sb__score-name">{s.label}</span>
              <div className="hl-sb__score-track">
                <div className="hl-sb__score-fill" style={{ width: `${(s.score / s.outOf) * 100}%` }} />
              </div>
              <span className="hl-sb__score-num">{s.score.toFixed(1)}</span>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}

// ── Tab 4: Flags ──────────────────────────────────────────────────────────────
function FlagsPanel({ session }: { session: InterviewSession }) {
  const [openId, setOpenId] = useState<string | null>(session.alerts[0]?.id ?? null);

  if (session.alerts.length === 0) {
    return (
      <div className="hl-sb__panel-content">
        <div className="hl-sb__flags-empty">
          <span className="hl-sb__flags-empty-icon">⚑</span>
          <p>No flags detected yet.</p>
          <p className="hl-sb__dim">Contradictions and evidence mismatches appear here as the interview progresses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hl-sb__panel-content">
      <p className="hl-sb__block-title" style={{ padding: "14px 16px 0" }}>
        {session.alerts.length} flag{session.alerts.length !== 1 ? "s" : ""} detected
      </p>
      {session.alerts.map((alert: AlertItem) => {
        const isOpen = openId === alert.id;
        return (
          <div key={alert.id} className={`hl-sb__flag hl-sb__flag--${alert.type}`}>
            <button type="button" className="hl-sb__flag-hd" onClick={() => setOpenId(isOpen ? null : alert.id)}>
              <div className="hl-sb__flag-hd-left">
                <span className={`hl-sb__flag-type-dot hl-sb__flag-type-dot--${alert.type}`} />
                <span className="hl-sb__flag-type">{alert.type}</span>
                <span className="hl-sb__flag-conf">{Math.round(alert.confidence * 100)}%</span>
              </div>
              <span className="hl-sb__flag-chevron">{isOpen ? "▼" : "▶"}</span>
            </button>
            {isOpen && (
              <div className="hl-sb__flag-body">
                <p className="hl-sb__flag-summary">{alert.claim}</p>
                <div className="hl-sb__flag-compare">
                  <div className="hl-sb__flag-col hl-sb__flag-col--resume">
                    <span className="hl-sb__flag-col-label">Resume says</span>
                    <p className="hl-sb__flag-col-text">{alert.resumeEvidence}</p>
                  </div>
                  {alert.transcriptSnippet && (
                    <div className="hl-sb__flag-col hl-sb__flag-col--said">
                      <span className="hl-sb__flag-col-label">Candidate said</span>
                      <p className="hl-sb__flag-col-text">"{alert.transcriptSnippet}"</p>
                    </div>
                  )}
                </div>
                {alert.explanation && (
                  <div className="hl-sb__flag-explain">
                    <span className="hl-sb__flag-explain-label">Analysis</span>
                    <p className="hl-sb__flag-explain-text">{alert.explanation}</p>
                  </div>
                )}
                <div className="hl-sb__flag-suggestion">
                  <span className="hl-sb__flag-suggestion-label">Suggested clarification</span>
                  <p className="hl-sb__flag-suggestion-q">{alert.suggestedQuestion}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Sidebar ───────────────────────────────────────────────────────────────
export function RightSidebar({
  session,
  currentIndex,
  durationSeconds,
  onClose,
  onSelectQuestion,
  onMarkAnswered,
  onStartInterview,
  onSessionCreated,
}: RightSidebarProps) {
  const [tab, setTab] = useState<Tab>("home");

  useEffect(() => {
    if (session?.interviewStarted && tab === "home") setTab("interview");
  }, [session?.interviewStarted]);

  const flagCount = session?.alerts.length ?? 0;
  const followUpCount = session?.followUps.length ?? 0;
  const interviewLocked = !session?.interviewStarted;

  const tabTitle = { home: session ? "Briefing" : "Interviews", interview: "Interview", insights: "Insights", flags: "Flags" }[tab];

  return (
    <aside className="hl-sb" role="complementary" aria-label="HireLens Copilot">
      <nav className="hl-sb__rail">
        <div className="hl-sb__rail-top">
          <div className="hl-sb__rail-logo">
            <span className="hl-sb__rail-logo-dot" />
          </div>

          <button type="button" className={`hl-sb__rail-btn ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")} title={session ? "Briefing" : "Interviews"}>
            <IconHome />
          </button>

          <button
            type="button"
            className={`hl-sb__rail-btn ${tab === "interview" ? "active" : ""} ${interviewLocked ? "locked" : ""}`}
            onClick={() => !interviewLocked && setTab("interview")}
            title={interviewLocked ? "Start interview first" : "Interview"}
          >
            <IconMic />
          </button>

          <button
            type="button"
            className={`hl-sb__rail-btn ${tab === "insights" ? "active" : ""} ${interviewLocked ? "locked" : ""}`}
            onClick={() => !interviewLocked && setTab("insights")}
            title={interviewLocked ? "Start interview first" : "Insights & Follow-ups"}
          >
            <IconSpark />
            {followUpCount > 0 && !interviewLocked && (
              <span className="hl-sb__rail-badge">{followUpCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`hl-sb__rail-btn ${tab === "flags" ? "active" : ""} ${interviewLocked ? "locked" : ""}`}
            onClick={() => !interviewLocked && setTab("flags")}
            title={interviewLocked ? "Start interview first" : "Flags"}
          >
            <IconFlag />
            {flagCount > 0 && !interviewLocked && (
              <span className="hl-sb__rail-badge hl-sb__rail-badge--warn">{flagCount}</span>
            )}
          </button>
        </div>

        <div className="hl-sb__rail-bottom">
          <button type="button" className="hl-sb__rail-btn hl-sb__rail-btn--close" onClick={onClose} title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="hl-sb__content">
        <div className="hl-sb__content-header">
          <span className="hl-sb__content-title">{tabTitle}</span>
          {session?.interviewStarted && <span className="hl-sb__live-dot" title="Interview in progress" />}
        </div>

        <div className="hl-sb__scroll">
          {tab === "home" && (
            session
              ? <BriefingPanel session={session} onStart={onStartInterview} />
              : <NoSessionHomePanel onSessionCreated={onSessionCreated} />
          )}
          {tab === "interview" && session && (
            <InterviewPanel
              session={session}
              currentIndex={currentIndex}
              durationSeconds={durationSeconds}
              onSelectQuestion={onSelectQuestion}
              onMarkAnswered={onMarkAnswered}
            />
          )}
          {tab === "insights" && session && <InsightsPanel session={session} currentIndex={currentIndex} />}
          {tab === "flags" && session && <FlagsPanel session={session} />}
        </div>
      </div>
    </aside>
  );
}
