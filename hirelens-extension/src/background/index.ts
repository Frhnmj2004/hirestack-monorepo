/**
 * Service worker: messaging and future API/SSE. Session is stored in chrome.storage.session;
 * content script reads it and listens for HIRELENS_START_SESSION.
 */

// When extension is loaded/reloaded, tell all tabs so old content scripts can show "Refresh this page"
chrome.tabs.query({}, (tabs) => {
  for (const tab of tabs) {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "HIRELENS_EXTENSION_RELOADED" }).catch(() => {});
    }
  }
});

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
