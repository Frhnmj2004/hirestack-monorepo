import { useEffect } from "react";
import "./FlagToast.css";

interface FlagToastProps {
  count: number;
  onDismiss: () => void;
  autoHideMs?: number;
}

export function FlagToast({ count, onDismiss, autoHideMs = 3500 }: FlagToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(t);
  }, [onDismiss, autoHideMs]);

  return (
    <div className="hl-flag-toast" role="status" aria-live="polite">
      <span className="hl-flag-toast__icon">⚑</span>
      <span className="hl-flag-toast__text">
        New flag{count !== 1 ? "s" : ""} detected — check Flags tab
      </span>
    </div>
  );
}
