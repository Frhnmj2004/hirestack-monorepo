# HireLens Extension — Implemented vs Pending

## Implemented in this pass

### 1. Dynamic question & topic progress
- **Progress from answers**: Sidebar header shows "X/Y covered" and "X/Y topics done" from actual `answered` state (not just current index). Topic progress bar and per-topic counts (e.g. "1/2") update when you mark questions answered.
- **Dynamic Island**: Shows "X answered · Qn/total" and dots: **filled** = answered, **active** = current question, **empty** = pending. Driven by `answeredByIndex` and `answeredCount`.
- **Auto-mark from backend**: When the WebSocket receives `insights` for a question, that question is auto-marked answered so progress updates without clicking. When `onTranscript` receives a **final** segment, the current question is also marked answered.

### 2. Mark question as “being asked”
- **Click to set**: Clicking a question in the list or in the **Topic tree** sets it as the current “Now asking” question and sends it to the backend via `setActiveQuestion`. The sidebar “Now asking” block and the Dynamic Island both show that question.
- **Mark as answered**: Each question row has a ○/✓ control; click to toggle answered and (when marking answered) assign a score. Tooltip: “Mark as answered” / “Mark unanswered”.

### 3. Live Q&A stream (glassmorphism)
- **Position**: Fixed top-left (so it doesn’t overlap the Dynamic Island in the middle).
- **Content**: “Live Q&A” header, optional “Now asking” line, then a scrollable list of **Q** (interviewer) and **A** (candidate) entries from the transcript.
- **Data**: When you start the interview or change question, the current question is appended as an interviewer line. When the WebSocket sends transcript (final or not), candidate lines are appended. Uses `session.transcript` (array of `TranscriptEntry`).

### 4. Topic tree (graph-style view)
- **Location**: Top of the Interview tab in the sidebar, under the header and progress bar.
- **Layout**: Each **topic** is a vertical block with a left border; under it, **questions** are indented with a dashed border (tree-style). Each row shows “Qn” + truncated text and a ○/✓ to mark answered. The active question is highlighted.
- **Interaction**: Click a question to set it as “Now asking”; click ○/✓ to mark answered. Topic progress (e.g. “1/2”) is shown per topic.

### 5. Follow-up generation & by-topic view
- **Source**: Follow-ups still come from the WebSocket `insights` event (backend pipeline A). They’re appended to `session.followUps` with `questionId`.
- **UI**: “Follow-ups” block shows follow-ups for the **current** question. New **“Follow-up topics”** block groups all follow-ups by **competency** (from the question they’re tied to) so you can see “by topic” suggestions.

### 6. Flag detection
- **Source**: Alerts come from the WebSocket `alerts` event (backend pipeline B: contradictions, evidence, etc.). They’re merged into `session.alerts` by id.
- **UI**: Flags tab shows count in the rail badge and lists each flag with type, confidence, claim, resume evidence, transcript snippet, explanation, and suggested question. Added short note: “Flag detection is active — contradictions and evidence mismatches from the pipeline appear here.”

---

## Backend / wiring requirements

- **WebSocket**: Extension expects the assist-service WebSocket to emit:
  - `transcript` — `{ text, isFinal }` so the live stream and auto-mark can run.
  - `insights` — `{ keyInsights, skillSignals, followUpQuestions, competencyQuestions }` plus the backend associating the turn with a `questionId` (so we can auto-mark and show follow-ups per question).
  - `alerts` — array of `AlertItem` with unique `id` so flags show and dedupe.
  - `scores` — (optional) `{ questionId?: string, scores: Array<{ label, score, outOf? }> }` so competency scores from the backend are merged into `session.scores` and the question's score is set when `questionId` is provided.
- **Session**: After “Start interview”, the extension sends the active question via `set_question` and streams audio. The backend must run the pipeline and emit the events above for progress, follow-ups, and flags to update live.

---

## Optional / future — implemented

- **Toast on new flag**: When `alerts` length increases, show a short “New flag” toast near the Dynamic Island (currently only the rail badge updates).
- **Persist progress**: When transcript/insights/alerts update, optionally write `session` back to `chrome.storage.local` so a refresh doesn’t lose progress (currently only start/session-created is persisted).
- **Tree expand/collapse**: Topic tree has per-topic expand/collapse; click the topic row (chevron ▶/▼) to toggle. All topics start expanded.
- **Scoring from backend**: Extension listens for WebSocket `scores` event. Payload: `{ questionId?: string, scores: Array<{ label, score, outOf? }> }`. Merges into session.scores by label and, when questionId is set, marks that question answered and sets its score to the average of the payload scores.
