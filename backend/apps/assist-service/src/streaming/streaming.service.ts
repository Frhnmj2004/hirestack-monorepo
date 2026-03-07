import { Injectable } from '@nestjs/common';
import { DeepgramClient } from '@deepgram/sdk';
import { withRetry } from '../common/retry.util';

export interface StreamCallbacks {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onTurnDone?: (transcript: string) => void;
}

const TURN_SILENCE_MS = 2000;
const DEFAULT_MODEL = 'nova-2';
/** Max audio chunks to buffer before Deepgram socket is open (~5s at 50 chunks/5s) */
const MAX_AUDIO_BUFFER_CHUNKS = 150;

interface SocketLike {
  on(event: string, cb: (...args: unknown[]) => void): void;
  sendMedia(data: ArrayBufferLike | Blob | ArrayBufferView): void;
  close(): void;
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
    const connection = await withRetry(() =>
      this.deepgram.listen.v1.connect({
        model: (process.env.DEEPGRAM_MODEL as 'nova-2') || 'nova-2',
        language: 'en-US',
        smart_format: 'true',
        interim_results: 'true',
        encoding: 'linear16',
        sample_rate: 16000,
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      }),
    );

    const state = {
      socket: connection as SocketLike,
      socketReady: false,
      audioBuffer: [] as Buffer[],
      buffer: '',
      lastActivity: Date.now(),
      timer: null as ReturnType<typeof setTimeout> | null,
      callbacks,
      activeQuestion,
    };
    this.sessions.set(sessionId, state);

    connection.on('open', () => {
      state.socketReady = true;
      if (state.audioBuffer.length > 0) {
        console.log('[StreamingService] Deepgram socket open — flushing', state.audioBuffer.length, 'buffered chunks for session', sessionId);
        for (const chunk of state.audioBuffer) state.socket.sendMedia(chunk);
        state.audioBuffer.length = 0;
      }
    });

    connection.on('message', (data: unknown) => {
      const msg = data as { channel?: { alternatives?: Array<{ transcript?: string; is_final?: boolean }> } };
      const alt = msg.channel?.alternatives?.[0];
      const text = alt?.transcript?.trim();
      const isFinal = alt?.is_final ?? false;
      if (!text) return;
      state.lastActivity = Date.now();
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
      console.error('[StreamingService] Deepgram error:', err);
    });

    connection.on('close', () => {
      state.timer && clearTimeout(state.timer);
      this.sessions.delete(sessionId);
    });

    connection.connect();
  }

  sendAudio(sessionId: string, audioBuffer: Buffer): void {
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
    state.socket.close();
    this.sessions.delete(sessionId);
  }
}
