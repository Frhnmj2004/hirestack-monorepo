/**
 * HireLens Service Worker (background.js)
 *
 * Responsibilities:
 *  1. Notify tabs when extension reloads
 *  2. Tab audio capture: get stream ID via chrome.tabCapture.getMediaStreamId with
 *     consumerTabId so the content script can call getUserMedia to get real WebRTC audio.
 */

// Track which tab we are capturing
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
  try {
    const contexts = await (chrome.offscreen as any).getContexts({
      documentUrls: [chrome.runtime.getURL("offscreen.html")],
    });
    if (contexts && contexts.length > 0) return;
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
      streamId?: string;
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

    // ── Start tab audio capture via offscreen document ───────────────────────
    // Called by content script when the interview starts.
    // Background SW can call getMediaStreamId without user invocation (Chrome 116+).
    // The offscreen document captures ALL tab audio including Google Meet's WebRTC streams.
    if (msg.type === "HIRELENS_START_TAB_CAPTURE") {
      const tabId = sender.tab?.id;
      const sessionId = msg.sessionId;
      if (!tabId || !sessionId) {
        sendResponse({ error: "Missing tabId or sessionId" });
        return true;
      }
      captureTabId = tabId;
      console.log("[HireLens BG] Getting tab capture stream ID for tab", tabId, "session", sessionId);

      const startCapture = async (retry = false): Promise<void> => {
        // Release any existing tab capture first so getMediaStreamId doesn't see "active stream"
        if (!retry) {
          await closeOffscreenDocument();
        }
        chrome.tabCapture.getMediaStreamId(
          { targetTabId: tabId },
          async (streamId: string) => {
            if (chrome.runtime.lastError || !streamId) {
              const errMsg = chrome.runtime.lastError?.message ?? "getMediaStreamId failed";
              console.error("[HireLens BG] tabCapture.getMediaStreamId error:", errMsg);
              if (!retry && /active stream|cannot capture/i.test(errMsg)) {
                console.log("[HireLens BG] Active stream detected — closing offscreen and retrying…");
                await closeOffscreenDocument();
                setTimeout(() => {
                  captureTabId = tabId;
                  startCapture(true);
                }, 600);
                return;
              }
              sendResponse({ error: errMsg });
              return;
            }
            console.log("[HireLens BG] Stream ID obtained, starting offscreen capture for session:", sessionId);
            try {
              await ensureOffscreenDocument();
              const offscreenResponse = (await chrome.runtime.sendMessage({
                type: "HL_OFFSCREEN_START",
                streamId,
                sessionId,
              })) as { ok?: boolean; error?: string } | undefined;

              if (offscreenResponse?.error) {
                console.error("[HireLens BG] Offscreen start error:", offscreenResponse.error);
                sendResponse({ error: offscreenResponse.error });
              } else {
                sendResponse({ ok: true });
              }
            } catch (e) {
              console.error("[HireLens BG] Failed to start offscreen capture:", e);
              sendResponse({ error: String(e) });
            }
          }
        );
      };
      startCapture();
      return true; // keep message channel open for async sendResponse
    }

    // ── Stop tab audio capture ────────────────────────────────────────────────
    if (msg.type === "HIRELENS_STOP_TAB_CAPTURE") {
      closeOffscreenDocument().catch(() => {});
      captureTabId = null;
      sendResponse({ ok: true });
      return true;
    }

    // ── Audio chunk forwarding: offscreen → content script ────────────────────
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
      return false;
    }

    return true;
  }
);
