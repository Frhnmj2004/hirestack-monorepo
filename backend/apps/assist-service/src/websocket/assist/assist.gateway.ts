import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { StreamingService } from '../../streaming/streaming.service';
import { PipelineService } from '../../pipeline.service';

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
    if (!state?.sessionId) return;
    const buf = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(payload.chunk, 'base64');
    this.streaming.sendAudio(state.sessionId, buf);
  }
}
