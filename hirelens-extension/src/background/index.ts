/**
 * Service worker: messaging and future API/SSE. Session is stored in chrome.storage.session;
 * content script reads it and listens for HIRELENS_START_SESSION.
 */

chrome.runtime.onMessage.addListener(
  (
    msg: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (r?: unknown) => void
  ) => {
    if (msg.type === "HIRELENS_PING") {
      sendResponse({ ok: true });
    }
    return true;
  }
);
