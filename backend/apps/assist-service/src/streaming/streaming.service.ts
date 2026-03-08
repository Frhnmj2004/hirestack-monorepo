import { Injectable } from '@nestjs/common';
import { DeepgramClient } from '@deepgram/sdk';

export interface StreamCallbacks {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onTurnDone?: (transcript: string) => void;
}

const TURN_SILENCE_MS = 4000;
/** Max audio chunks to buffer before Deepgram socket is open (~5s at 50 chunks/5s) */
const MAX_AUDIO_BUFFER_CHUNKS = 150;
/** Send KeepAlive every 4s to prevent Deepgram 10s timeout (NET-0001) during silence */
const KEEP_ALIVE_INTERVAL_MS = 4000;

interface SocketLike {
  on(event: string, cb: (...args: unknown[]) => void): void;
  sendMedia(data: ArrayBufferLike | Blob | ArrayBufferView): void;
  close(): void;
  connect?: () => unknown;
  readyState?: number;
  waitForOpen?: () => Promise<unknown>;
  sendKeepAlive?: (msg: { type: string }) => void;
  sendCloseStream?: (msg: { type: string }) => void;
}

@Injectable()
export class StreamingService {
  private readonly deepgram: DeepgramClient;
  private readonly sessions = new Map<
    string,
    {
      socket: SocketLike;
      socketReady: boolean;
      audioBuffer: Buffer[];
      buffer: string;
      lastActivity: number;
      timer: ReturnType<typeof setTimeout> | null;
      keepAliveInterval: ReturnType<typeof setInterval> | null;
      callbacks: StreamCallbacks;
      activeQuestion: string;
    }
  >();

  constructor() {
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) throw new Error('DEEPGRAM_API_KEY is required');
    this.deepgram = new DeepgramClient({ apiKey: key });
  }

  async startStream(
    sessionId: string,
    activeQuestion: string,
    callbacks: StreamCallbacks,
  ): Promise<void> {
    // Stop any existing stream for this session before creating a new one
    await this.stopStream(sessionId);

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) throw new Error('DEEPGRAM_API_KEY is required');
    // #region agent log
    fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run1',hypothesisId:'H2',location:'streaming.service.ts:PRE_CONNECT',message:'About to call deepgram.listen.v1.connect',data:{apiKeyExists:!!apiKey,apiKeyLen:apiKey?.length,apiKeyPrefix:apiKey?.slice(0,6)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const connection = await this.deepgram.listen.v1.connect({
      Authorization: `Token ${apiKey}`,
      model: (process.env.DEEPGRAM_MODEL as string) || 'nova-2',
      language: 'en-US',
      smart_format: 'true' as const,
      interim_results: 'true' as const,
      utterance_end_ms: '3000' as const,
      encoding: 'linear16',
      sample_rate: 16000,
    });

    const conn = connection as SocketLike;

    // SDK v5 creates the socket with startClosed:true — must call connect() to initiate the WS handshake
    if (typeof conn.connect === 'function') {
      conn.connect();
    }

    // #region agent log
    const connAny = connection as unknown as Record<string, unknown>;
    const innerSocket = connAny.socket as Record<string, unknown> | undefined;
    fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run2',hypothesisId:'H1-fix',location:'streaming.service.ts:POST_CONNECT',message:'After connect() call',data:{readyState:conn.readyState,innerSocketReadyState:innerSocket?.readyState,shouldReconnect:(innerSocket as any)?._shouldReconnect},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // Register session immediately so sendAudio() can buffer while we wait for Deepgram to open.
    // Previously we only set the session after waitForOpen(), so early audio was dropped.
    const state = {
      socket: conn,
      socketReady: false,
      audioBuffer: [] as Buffer[],
      buffer: '',
      lastActivity: Date.now(),
      timer: null as ReturnType<typeof setTimeout> | null,
      keepAliveInterval: null as ReturnType<typeof setInterval> | null,
      callbacks,
      activeQuestion,
    };
    this.sessions.set(sessionId, state);

    connection.on('open', () => {
      // #region agent log
      fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run1',hypothesisId:'H4',location:'streaming.service.ts:ON_OPEN',message:'connection.on(open) fired',data:{readyState:conn.readyState,buffered:state.audioBuffer.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      state.socketReady = true;
      if (state.audioBuffer.length > 0) {
        console.log('[StreamingService] Deepgram socket open — flushing', state.audioBuffer.length, 'buffered chunks for session', sessionId);
        for (const chunk of state.audioBuffer) state.socket.sendMedia(chunk);
        state.audioBuffer.length = 0;
      }
    });

    let firstMessageLogged = false;
    let firstTranscriptLogged = false;
    let emptyTranscriptLogged = false;
    connection.on('message', (data: unknown) => {
      const raw = typeof data === 'string' ? JSON.parse(data) : data;
      const msg = raw as {
        type?: string;
        is_final?: boolean;
        speech_final?: boolean;
        transcript?: string;
        channel?: { alternatives?: Array<{ transcript?: string; is_final?: boolean }> };
        alternatives?: Array<{ transcript?: string; is_final?: boolean }>;
      };
      if (!firstMessageLogged) {
        firstMessageLogged = true;
        console.log('[StreamingService] First Deepgram message type:', msg.type, 'keys:', Object.keys(msg).join(', '));
        const ch = msg.channel as Record<string, unknown> | undefined;
        if (ch) {
          const altArr = ch.alternatives;
          console.log('[StreamingService] channel keys:', Object.keys(ch).join(', '), 'alternatives type:', Array.isArray(altArr) ? `array[${(altArr as unknown[]).length}]` : typeof altArr);
          if (Array.isArray(altArr) && altArr.length > 0) console.log('[StreamingService] first alternative keys:', Object.keys((altArr[0] as Record<string, unknown>) || {}).join(', '));
        }
      }
      const alts = msg.channel?.alternatives ?? msg.alternatives;
      const alt = Array.isArray(alts) ? alts[0] : undefined;
      const rawTranscript = alt?.transcript ?? msg.transcript ?? '';
      const text = typeof rawTranscript === 'string' ? rawTranscript.trim() : String(rawTranscript).trim();
      const isFinal = msg.is_final ?? alt?.is_final ?? false;
      // UtteranceEnd: speaker paused (word-timing gap). Don't flush immediately —
      // reset the silence timer so short pauses between sentences don't split the turn.
      if (msg.type === 'UtteranceEnd') {
        if (state.buffer) {
          state.timer && clearTimeout(state.timer);
          state.timer = setTimeout(() => {
            state.timer = null;
            if (state.buffer) {
              state.callbacks.onTurnDone?.(state.buffer);
              state.buffer = '';
            }
          }, TURN_SILENCE_MS);
        }
        return;
      }
      if (!text) {
        if (msg.type === 'Results' && !emptyTranscriptLogged) {
          emptyTranscriptLogged = true;
          console.log('[StreamingService] Deepgram returned Results but empty transcript — audio may be silent, too quiet, or wrong format (expect 16kHz mono linear16). Check tab audio is audible.');
        }
        return;
      }
      state.lastActivity = Date.now();
      if (!firstTranscriptLogged) {
        firstTranscriptLogged = true;
        console.log('[StreamingService] First transcript to client:', isFinal ? 'final' : 'interim', text.slice(0, 80));
      }
      state.callbacks.onTranscript?.(text, isFinal);
      if (isFinal) {
        state.buffer = state.buffer ? `${state.buffer} ${text}` : text;
        state.timer && clearTimeout(state.timer);
        state.timer = setTimeout(() => {
          state.timer = null;
          if (state.buffer) {
            state.callbacks.onTurnDone?.(state.buffer);
            state.buffer = '';
          }
        }, TURN_SILENCE_MS);
      }
    });

    connection.on('error', (err: Error) => {
      // #region agent log
      fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run1',hypothesisId:'H3',location:'streaming.service.ts:ON_ERROR',message:'connection.on(error) fired',data:{err:String(err),errMsg:err?.message,readyState:conn.readyState},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error('[StreamingService] Deepgram error:', err);
    });

    connection.on('close', () => {
      // #region agent log
      fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run1',hypothesisId:'H5',location:'streaming.service.ts:ON_CLOSE',message:'connection.on(close) fired',data:{readyState:conn.readyState},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      state.timer && clearTimeout(state.timer);
      if (state.keepAliveInterval) clearInterval(state.keepAliveInterval);
      state.keepAliveInterval = null;
      this.sessions.delete(sessionId);
    });

    // #region agent log
    // Watchdog: poll readyState every 2s for 10s to see if socket ever transitions
    let watchdogCount = 0;
    const watchdog = setInterval(() => {
      watchdogCount++;
      const innerWs = (connAny.socket as any)?._ws;
      fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run1',hypothesisId:'H1',location:'streaming.service.ts:WATCHDOG',message:`Watchdog tick ${watchdogCount}`,data:{outerReadyState:conn.readyState,innerReadyState:innerSocket?.readyState,innerWsExists:!!innerWs,innerWsReadyState:innerWs?.readyState,innerWsUrl:typeof innerWs?.url === 'string' ? innerWs.url.slice(0,80) : undefined,socketReady:state.socketReady,bufferedChunks:state.audioBuffer.length,retryCount:(innerSocket as any)?.retryCount,connectLock:(innerSocket as any)?._connectLock,shouldReconnect:(innerSocket as any)?._shouldReconnect},timestamp:Date.now()})}).catch(()=>{});
      if (watchdogCount >= 5) clearInterval(watchdog);
    }, 2000);
    // #endregion

    // Wait for Deepgram WebSocket to open, then mark ready and flush any buffered audio.
    // Session is already in the map so sendAudio() has been buffering chunks.
    try {
      // #region agent log
      fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run1',hypothesisId:'H1',location:'streaming.service.ts:PRE_WAIT',message:'About to call waitForOpen',data:{readyState:conn.readyState,hasWaitForOpen:typeof conn.waitForOpen},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (typeof conn.waitForOpen === 'function') {
        await conn.waitForOpen();
      }
      // #region agent log
      clearInterval(watchdog);
      fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run1',hypothesisId:'H1',location:'streaming.service.ts:WAIT_RESOLVED',message:'waitForOpen resolved',data:{readyState:conn.readyState},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      state.socketReady = true;
      console.log('[StreamingService] Deepgram socket open for session', sessionId);
      if (state.audioBuffer.length > 0) {
        console.log('[StreamingService] Flushing', state.audioBuffer.length, 'buffered chunks to Deepgram for session', sessionId);
        for (const chunk of state.audioBuffer) state.socket.sendMedia(chunk);
        state.audioBuffer.length = 0;
      }
      if (typeof conn.sendKeepAlive === 'function') {
        state.keepAliveInterval = setInterval(() => {
          const s = this.sessions.get(sessionId);
          if (s?.socketReady && s.socket.readyState === 1) {
            try {
              conn.sendKeepAlive!({ type: 'KeepAlive' });
            } catch (_) {}
          }
        }, KEEP_ALIVE_INTERVAL_MS);
      }
    } catch (err) {
      // #region agent log
      clearInterval(watchdog);
      fetch('http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'104cc8'},body:JSON.stringify({sessionId:'104cc8',runId:'run1',hypothesisId:'H3',location:'streaming.service.ts:WAIT_REJECTED',message:'waitForOpen rejected',data:{err:String(err),errMsg:(err as any)?.message,readyState:conn.readyState},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error('[StreamingService] Deepgram waitForOpen failed for session', sessionId, err);
      this.sessions.delete(sessionId);
    }
  }

  private firstChunkSent = new Set<string>();

  sendAudio(sessionId: string, audioBuffer: Buffer): void {
    if (!audioBuffer?.length) return; // avoid sending empty bytes (can cause unexpected closures per Deepgram docs)
    const state = this.sessions.get(sessionId);
    if (!state?.socket) return;
    if (!state.socketReady) {
      if (state.audioBuffer.length === 0) {
        console.log('[StreamingService] Deepgram not open yet — buffering audio for session', sessionId);
      }
      if (state.audioBuffer.length < MAX_AUDIO_BUFFER_CHUNKS) {
        state.audioBuffer.push(Buffer.from(audioBuffer));
      }
      return;
    }
    if (!this.firstChunkSent.has(sessionId)) {
      this.firstChunkSent.add(sessionId);
      console.log('[StreamingService] First audio chunk sent to Deepgram for session', sessionId);
    }
    state.socket.sendMedia(audioBuffer);
  }

  setActiveQuestion(sessionId: string, activeQuestion: string): void {
    const state = this.sessions.get(sessionId);
    if (state) state.activeQuestion = activeQuestion;
  }

  getActiveQuestion(sessionId: string): string {
    return this.sessions.get(sessionId)?.activeQuestion ?? '';
  }

  async stopStream(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (!state) return;
    state.timer && clearTimeout(state.timer);
    if (state.keepAliveInterval) {
      clearInterval(state.keepAliveInterval);
      state.keepAliveInterval = null;
    }
    // Send CloseStream so Deepgram flushes remaining audio and returns final results before we close
    if (state.socket.readyState === 1 && typeof (state.socket as SocketLike).sendCloseStream === 'function') {
      try {
        (state.socket as SocketLike).sendCloseStream!({ type: 'CloseStream' });
      } catch (_) {}
    }
    state.socket.close();
    this.sessions.delete(sessionId);
    this.firstChunkSent.delete(sessionId);
  }
}
