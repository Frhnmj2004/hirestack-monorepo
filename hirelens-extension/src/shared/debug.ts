/**
 * Debug mode for HireLens — log every step to console and to on-screen panel when enabled.
 * Enable: popup "Debug mode" or window.__HIRELENS_DEBUG = true or chrome.storage.local hirelens_debug.
 */

export type LogLevel = "action" | "ws" | "audio" | "state" | "error";

export interface LogEntry {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

const MAX_ENTRIES = 200;
const logBuffer: LogEntry[] = [];
let logListener: ((entries: LogEntry[]) => void) | null = null;

let _debug = false;

export function setDebug(enabled: boolean): void {
  _debug = !!enabled;
}

export function isDebug(): boolean {
  if (typeof (window as unknown as { __HIRELENS_DEBUG?: boolean }).__HIRELENS_DEBUG === "boolean") {
    return (window as unknown as { __HIRELENS_DEBUG: boolean }).__HIRELENS_DEBUG;
  }
  return _debug;
}

/** Push a log entry to the buffer (always). Panel shows buffer when debug is on. */
export function addLog(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    time: new Date().toISOString().split("T")[1].slice(0, 12),
    level,
    message,
    data,
  };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_ENTRIES) logBuffer.shift();
  if (logListener) logListener([...logBuffer]);
}

export function getLogEntries(): LogEntry[] {
  return [...logBuffer];
}

export function setLogListener(cb: ((entries: LogEntry[]) => void) | null): void {
  logListener = cb;
}

export function clearLogBuffer(): void {
  logBuffer.length = 0;
  if (logListener) logListener([]);
}

export function debugLog(level: LogLevel, message: string, data?: unknown): void {
  addLog(level, message, data);
  if (!isDebug()) return;
  const prefix = `[HireLens ${level}]`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}
