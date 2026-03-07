import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import { StreamingService } from '../../streaming/streaming.service';
import { PipelineService } from '../../pipeline.service';

// Log to .cursor in cwd (run backend from monorepo root so this is <repo>/.cursor/debug-104cc8.log)
const DEBUG_LOG_PATH = path.join(process.cwd(), '.cursor', 'debug-104cc8.log');

function agentLog(payload: Record<string, unknown>) {
  try {
    const line = JSON.stringify({ ...payload, timestamp: Date.now() }) + '\n';
    const dir = path.dirname(DEBUG_LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(DEBUG_LOG_PATH, line);
  } catch (_) {}
}

@WebSocketGateway({ cors: true })
export class AssistGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly clientSession = new Map<string, { sessionId: string; candidateId: string }>();

  constructor(
    private readonly streaming: StreamingService,
    private readonly pipeline: PipelineService,
  ) {}

  handleConnection(client: { id: string }) {
    // #region agent log
    agentLog({
      sessionId: '104cc8',
      runId: 'ws-flow',
      hypothesisId: 'H2-H5',
      location: 'assist.gateway.ts:handleConnection',
      message: 'Backend WS client connected',
      data: { clientId: client.id },
    });
    // #endregion
    console.log('[AssistGateway] Client connected — clientId:', client.id);
    this.clientSession.set(client.id, { sessionId: '', candidateId: '' });
  }

  handleDisconnect(client: { id: string }) {
    const state = this.clientSession.get(client.id);
    if (state?.sessionId) this.streaming.stopStream(state.sessionId);
    this.clientSession.delete(client.id);
  }

  @SubscribeMessage('session')
  handleSession(
    client: { id: string; emit: (event: string, data: unknown) => void },
    payload: { sessionId: string; candidateId: string; interviewerId?: string; activeQuestion?: string },
  ) {
    const { sessionId, candidateId, activeQuestion = '' } = payload;
    this.clientSession.set(client.id, { sessionId, candidateId });
    console.log('[AssistGateway] Session registered — sessionId:', sessionId, 'clientId:', client.id);
    this.streaming.startStream(sessionId, activeQuestion, {
      onTranscript: (text, isFinal) => {
        client.emit('transcript', { text, isFinal, speaker: 'candidate' });
      },
      onTurnDone: async (transcript) => {
        const q = this.streaming.getActiveQuestion(sessionId);
        try {
          const result = await this.pipeline.processTurn({
            sessionId,
            candidateId,
            activeQuestion: q,
            candidateAnswer: transcript,
          });
          client.emit('insights', result.pipelineA);
          client.emit('evidence', result.pipelineB.evidenceCards);
          client.emit('new_claims', result.pipelineB.newClaims);
          if (result.pipelineB.contradictions?.length) {
            client.emit('alerts', result.pipelineB.contradictions);
          }
        } catch (err) {
          client.emit('error', { message: err instanceof Error ? err.message : 'Pipeline failed' });
        }
      },
    });
  }

  @SubscribeMessage('set_question')
  handleSetQuestion(
    _client: { id: string },
    payload: { sessionId: string; activeQuestion: string },
  ) {
    this.streaming.setActiveQuestion(payload.sessionId, payload.activeQuestion);
  }

  @SubscribeMessage('audio')
  handleAudio(_client: { id: string }, payload: Buffer | { chunk: string }) {
    const state = this.clientSession.get(_client.id);
    if (!state?.sessionId) {
      console.warn('[AssistGateway] Audio received but no session for client', _client.id);
      return;
    }
    const buf = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(payload.chunk, 'base64');
    this.streaming.sendAudio(state.sessionId, buf);
    this.logAudioReceived(state.sessionId, buf.length);
  }

  private audioChunkLogCounter = 0;
  private lastAudioLogAt = 0;
  private lastAudioLogCount = 0;
  private logAudioReceived(sessionId: string, bytes: number): void {
    this.audioChunkLogCounter += 1;
    if (this.audioChunkLogCounter === 1) {
      console.log('[AssistGateway] First audio chunk received — sessionId:', sessionId, 'bytes:', bytes);
    }
    const now = Date.now();
    if (now - this.lastAudioLogAt >= 5000) {
      console.log(
        '[AssistGateway] Audio received — sessionId:',
        sessionId,
        'chunks in last 5s:',
        this.audioChunkLogCounter - this.lastAudioLogCount,
        'bytes this chunk:',
        bytes,
      );
      this.lastAudioLogAt = now;
      this.lastAudioLogCount = this.audioChunkLogCounter;
    }
  }
}
