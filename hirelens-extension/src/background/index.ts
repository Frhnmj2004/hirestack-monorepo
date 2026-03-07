/**
 * HireLens Service Worker (background.js)
 *
 * Responsibilities:
 *  1. Notify tabs when extension reloads
 *  2. Manage the offscreen document for tab audio capture
 *     - Gets stream ID via chrome.tabCapture.getMediaStreamId (Chrome 116+, no invocation needed)
 *     - Creates offscreen document with USER_MEDIA reason
 *     - Passes stream ID to offscreen doc
 *     - Forwards audio chunks from offscreen → content script (which sends to WebSocket)
 */

// Track which tab we are capturing so we can route audio chunks back to it
let captureTabId: number | null = null;

// ── Extension reload notification ─────────────────────────────────────────────
chrome.tabs.query({}, (tabs) => {
  for (const tab of tabs) {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "HIRELENS_EXTENSION_RELOADED" }).catch(() => {});
    }
  }
});

// ── Offscreen document management ────────────────────────────────────────────

async function ensureOffscreenDocument(): Promise<void> {
  // Check if an offscreen document already exists
  try {
    const contexts = await (chrome.offscreen as any).getContexts({
      documentUrls: [chrome.runtime.getURL("offscreen.html")],
    });
    if (contexts && contexts.length > 0) return; // already exists
  } catch {
    // getContexts not available in older Chrome, proceed to create
  }

  await (chrome.offscreen as any).createDocument({
    url: chrome.runtime.getURL("offscreen.html"),
    reasons: ["USER_MEDIA"],
    justification: "Capture Google Meet tab audio for live speech transcription",
  });
}

async function closeOffscreenDocument(): Promise<void> {
  try {
    await (chrome.offscreen as any).closeDocument();
  } catch {
    // ignore — may not exist
  }
}

// ── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    msg: {
      type: string;
      sessionId?: string;
      chunk?: string;
      encoding?: string;
      chunkCount?: number;
    },
    sender: chrome.runtime.MessageSender,
    sendResponse: (r?: unknown) => void
  ) => {
    // ── Basic ping ────────────────────────────────────────────────────────────
    if (msg.type === "HIRELENS_PING") {
      sendResponse({ ok: true });
      return true;
    }

    // ── Start tab audio capture via offscreen document ────────────────────────
    // Called by content script when the interview starts.
    // Service workers CAN call getMediaStreamId without user invocation since Chrome 116.
    if (msg.type === "HIRELENS_START_TAB_CAPTURE") {
      const tabId = sender.tab?.id;
      const sessionId = msg.sessionId;
      if (!tabId || !sessionId) {
        sendResponse({ error: "Missing tabId or sessionId" });
        return true;
      }
      captureTabId = tabId;

      // #region agent log
      fetch("http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "104cc8" },
        body: JSON.stringify({
          sessionId: "104cc8",
          runId: "bg-capture",
          hypothesisId: "BG-CAPTURE",
          location: "background/index.ts:HIRELENS_START_TAB_CAPTURE",
          message: "Requesting tab capture stream ID",
          data: { tabId, sessionId },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      // Get stream ID — no consumerTabId means it can be used in extension contexts (offscreen)
      chrome.tabCapture.getMediaStreamId(
        { targetTabId: tabId },
        async (streamId: string) => {
          if (chrome.runtime.lastError || !streamId) {
            const errMsg = chrome.runtime.lastError?.message ?? "getMediaStreamId failed";
            console.error("[HireLens BG] tabCapture.getMediaStreamId error:", errMsg);
            sendResponse({ error: errMsg });
            return;
          }

          // #region agent log
          fetch("http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "104cc8" },
            body: JSON.stringify({
              sessionId: "104cc8",
              runId: "bg-capture",
              hypothesisId: "BG-STREAM-ID",
              location: "background/index.ts:getMediaStreamId callback",
              message: "Got stream ID, creating offscreen document",
              data: { streamIdPrefix: streamId.slice(0, 20), sessionId },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion

          try {
            await ensureOffscreenDocument();

            // Send stream ID + session to offscreen document
            await chrome.runtime.sendMessage({
              type: "HL_OFFSCREEN_START",
              streamId,
              sessionId,
            });

            sendResponse({ ok: true });
          } catch (e) {
            console.error("[HireLens BG] Failed to start offscreen capture:", e);
            sendResponse({ error: String(e) });
          }
        }
      );
      return true; // keep message channel open for async sendResponse
    }

    // ── Stop tab audio capture ────────────────────────────────────────────────
    if (msg.type === "HIRELENS_STOP_TAB_CAPTURE") {
      chrome.runtime.sendMessage({ type: "HL_OFFSCREEN_STOP" }).catch(() => {});
      closeOffscreenDocument().catch(() => {});
      captureTabId = null;
      sendResponse({ ok: true });
      return true;
    }

    // ── Audio chunk forwarding: offscreen → content script ────────────────────
    // Offscreen sends HL_AUDIO_CHUNK → background forwards → content script → WebSocket
    if (msg.type === "HL_AUDIO_CHUNK") {
      if (captureTabId) {
        chrome.tabs
          .sendMessage(captureTabId, {
            type: "HL_TAB_AUDIO_CHUNK",
            sessionId: msg.sessionId,
            chunk: msg.chunk,
            encoding: msg.encoding,
            chunkCount: msg.chunkCount,
          })
          .catch(() => {});
      }
      // No sendResponse needed for fire-and-forget audio chunks
      return false;
    }

    return true;
  }
);
