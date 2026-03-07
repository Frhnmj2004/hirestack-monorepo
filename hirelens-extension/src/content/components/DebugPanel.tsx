import { useEffect, useRef } from "react";
import type { LogEntry, LogLevel } from "../../shared/debug";
import "./DebugPanel.css";

interface DebugPanelProps {
  entries: LogEntry[];
  onClear?: () => void;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  action: "#6eb5ff",
  ws: "#5ac8fa",
  audio: "#af52de",
  state: "#34c759",
  error: "#ff3b30",
};

export function DebugPanel({ entries, onClear }: DebugPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  return (
    <div className="hl-dbg" role="log" aria-label="HireLens debug log">
      <div className="hl-dbg__header">
        <span className="hl-dbg__title">DEBUG — Logs &amp; actions</span>
        {onClear && (
          <button type="button" className="hl-dbg__clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      <div className="hl-dbg__scroll" ref={scrollRef}>
        {entries.length === 0 ? (
          <p className="hl-dbg__empty">No entries yet. Actions and WS events will appear here.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="hl-dbg__row" data-level={e.level}>
              <span className="hl-dbg__time">{e.time}</span>
              <span
                className="hl-dbg__level"
                style={{ color: LEVEL_COLORS[e.level] }}
              >
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
  );
}
