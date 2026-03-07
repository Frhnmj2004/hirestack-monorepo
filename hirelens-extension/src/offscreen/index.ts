/**
 * HireLens Offscreen Document — Tab Audio Capture
 *
 * Runs at the extension origin (chrome-extension://...), so getUserMedia with
 * chromeMediaSource:'tab' works correctly and captures real WebRTC audio from
 * Google Meet (unlike content scripts which run at meet.google.com origin and
 * receive all-zeros audio from tab capture).
 *
 * Flow:
 *  background → HL_OFFSCREEN_START  → getUserMedia, AudioWorklet → send chunks → background
 *  background → HL_OFFSCREEN_STOP   → cleanup
 */

let audioCtx: AudioContext | null = null;
let workletNode: AudioWorkletNode | null = null;
let micStream: MediaStream | null = null;
const float32Buffer: number[] = [];
const CHUNK_SAMPLES = 4096;
let chunkCount = 0;
let activeSessionId = "";
let consecutiveSilent = 0;

// ── Message listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (msg: { type: string; streamId?: string; sessionId?: string }, _sender, sendResponse) => {
    if (msg.type === "HL_OFFSCREEN_START") {
      startCapture(msg.streamId!, msg.sessionId!)
        .then(() => sendResponse({ ok: true }))
        .catch((err: Error) => {
          console.error("[HireLens Offscreen] Start error:", err.message);
          sendResponse({ ok: false, error: err.message });
        });
      return true;
    }
    if (msg.type === "HL_OFFSCREEN_STOP") {
      stopCapture();
      sendResponse({ ok: true });
      return true;
    }
    if (msg.type === "HL_OFFSCREEN_PING") {
      sendResponse({ ok: true, active: !!audioCtx });
      return true;
    }
  }
);

// ── Capture lifecycle ─────────────────────────────────────────────────────────

async function startCapture(streamId: string, sessionId: string): Promise<void> {
  stopCapture(); // clean up any previous capture

  activeSessionId = sessionId;
  float32Buffer.length = 0;
  chunkCount = 0;
  consecutiveSilent = 0;

  // This works because offscreen document has EXTENSION origin (chrome-extension://...)
  // Service worker obtained the stream ID via chrome.tabCapture.getMediaStreamId
  const stream = await (navigator.mediaDevices as any).getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    video: false,
  });

  const tracks = stream.getAudioTracks() as MediaStreamTrack[];
  if (!tracks.length) {
    (stream as MediaStream).getTracks().forEach((t: MediaStreamTrack) => t.stop());
    throw new Error("No audio track in tab capture stream");
  }

  // Log the track settings so we can verify audio format
  const settings = tracks[0].getSettings();
  console.log("[HireLens Offscreen] Tab audio track settings:", settings);

  micStream = stream as MediaStream;
  audioCtx = new AudioContext({ sampleRate: 16000 });

  // Load AudioWorklet from extension resources
  const processorUrl = chrome.runtime.getURL("audio-worklet-processor.js");
  const script = await fetch(processorUrl).then((r) => r.text());
  const blob = new Blob([script], { type: "application/javascript" });
  const workletUrl = URL.createObjectURL(blob);
  try {
    await audioCtx.audioWorklet.addModule(workletUrl);
  } finally {
    URL.revokeObjectURL(workletUrl);
  }

  const source = audioCtx.createMediaStreamSource(micStream);
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 3.0; // mild boost
  const node = new AudioWorkletNode(audioCtx, "capture-processor");
  workletNode = node;

  source.connect(gainNode);
  gainNode.connect(node);
  // No destination connection — offscreen docs have no speaker output to worry about

  node.port.onmessage = (e: MessageEvent<{ samples: Float32Array }>) => {
    const samples = e.data?.samples;
    if (!samples?.length) return;
    for (let i = 0; i < samples.length; i++) float32Buffer.push(samples[i]);
    while (float32Buffer.length >= CHUNK_SAMPLES) {
      const chunk = new Float32Array(CHUNK_SAMPLES);
      for (let i = 0; i < CHUNK_SAMPLES; i++) chunk[i] = float32Buffer.shift()!;
      sendChunk(chunk);
    }
  };

  console.log("[HireLens Offscreen] Tab capture STARTED for session:", sessionId);
  // Log diagnostic info to the debug endpoint
  // #region agent log
  fetch("http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "104cc8" },
    body: JSON.stringify({
      sessionId: "104cc8",
      runId: "offscreen-capture",
      hypothesisId: "OFFSCREEN",
      location: "offscreen/index.ts:startCapture",
      message: "Offscreen tab capture started",
      data: { sessionId, trackSettings: settings, streamId: streamId.slice(0, 20) + "..." },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

function stopCapture(): void {
  workletNode?.disconnect();
  workletNode = null;
  float32Buffer.length = 0;
  micStream?.getTracks().forEach((t) => t.stop());
  micStream = null;
  audioCtx?.close().catch(() => {});
  audioCtx = null;
  console.log("[HireLens Offscreen] Tab capture stopped");
}

// ── Audio chunk encoding & sending ───────────────────────────────────────────

function computeRms(samples: Float32Array): number {
  if (!samples.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

function sendChunk(float32: Float32Array): void {
  const rms = computeRms(float32);
  const hasContent = rms >= 0.0005;

  if (hasContent) {
    consecutiveSilent = 0;
  } else {
    consecutiveSilent++;
  }

  // Log every 50 chunks so we can monitor audio levels
  if (chunkCount % 50 === 0) {
    const msg = hasContent
      ? `[HireLens Offscreen] Audio rms=${rms.toFixed(6)} (has content), chunk#${chunkCount}`
      : `[HireLens Offscreen] Audio rms=${rms.toFixed(6)} (silent), consecutiveSilent=${consecutiveSilent}, chunk#${chunkCount}`;
    console.log(msg);

    // #region agent log
    fetch("http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "104cc8" },
      body: JSON.stringify({
        sessionId: "104cc8",
        runId: "offscreen-capture",
        hypothesisId: "OFFSCREEN-RMS",
        location: "offscreen/index.ts:sendChunk",
        message: hasContent ? "Audio has content" : "Audio silent",
        data: { rms: rms.toFixed(6), chunkCount, consecutiveSilent },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  // Convert Float32 → Int16 PCM → Base64
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
  }
  const uint8 = new Uint8Array(int16.buffer);
  let b64 = "";
  for (let i = 0; i < uint8.length; i++) b64 += String.fromCharCode(uint8[i]);

  chunkCount++;

  // Forward to background script which routes to content script's WebSocket
  chrome.runtime.sendMessage({
    type: "HL_AUDIO_CHUNK",
    sessionId: activeSessionId,
    chunk: btoa(b64),
    encoding: "linear16",
    chunkCount,
  });
}
