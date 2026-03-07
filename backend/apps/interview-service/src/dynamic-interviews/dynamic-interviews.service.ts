import { Injectable, Logger } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { connect, NatsConnection, StringCodec } from 'nats';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';

@Injectable()
export class DynamicInterviewsService {
  private readonly logger = new Logger(DynamicInterviewsService.name);
  private nc: NatsConnection;
  private readonly sc = StringCodec();
  private openai: OpenAI;
  private readonly dbPool: Pool;

  constructor() {
    this.dbPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://hirelens:hirelens@localhost:5432/hirelens',
    });
    this.init();
  }

  private async init() {
    try {
      this.nc = await connect({ servers: process.env.NATS_URL || 'nats://localhost:4222' });
      this.logger.log('Connected to NATS');
    } catch (err) {
      this.logger.error('Failed to connect to NATS', err);
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async startDynamicInterview(resumeText: string, jobDescription: string) {
    // 1. Generate Interview Plan (Questions & System Prompt) via OpenAI
    let questions: string[] = [];
    let systemPrompt = "You are a professional AI interviewer conducting a structured interview. Be warm but focused. Ask one question at a time and listen carefully. When the candidate finishes answering, ask the next question.";
    
    try {
      if (process.env.OPENAI_API_KEY) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an HR expert. Generate exactly 5 interview questions based on the resume and job description. Also generate a concise system prompt for an AI interviewer. Return JSON with keys "questions" (array of strings) and "systemPrompt" (string).',
            },
            {
              role: 'user',
              content: `Resume: ${resumeText}\n\nJob Description: ${jobDescription}`,
            },
          ],
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message?.content;
        const parsed = content ? JSON.parse(content) : {};
        questions = parsed.questions || [];
        systemPrompt = parsed.systemPrompt || systemPrompt;
      } else {
        questions = [
          "Can you tell me briefly about yourself?",
          "How does your experience align with the job description?",
          "What is your greatest strength?",
          "Can you describe a challenging situation you overcame at work?",
          "Do you have any questions for us?"
        ];
      }
    } catch (err) {
      this.logger.error('Error generating questions with OpenAI', err);
      questions = [
        "Can you tell me briefly about yourself?",
        "How does your experience align with the job description?",
        "What is your greatest strength?",
        "Can you describe a challenging situation you overcame at work?",
        "Do you have any questions for us?"
      ];
    }

    // 2. Setup LiveKit Room and Token
    const sessionId = randomUUID();
    const livekitRoom = `dynamic-interview-${sessionId}`;
    const participantName = `candidate-${sessionId.substring(0, 8)}`;

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY || 'devkey',
      process.env.LIVEKIT_API_SECRET || 'secret',
      {
        identity: participantName,
        name: participantName,
      },
    );

    at.addGrant({ roomJoin: true, room: livekitRoom });
    const token = await at.toJwt();

    // 3. Publish to NATS for agent.py
    if (this.nc && !this.nc.isClosed()) {
      const payload = {
        session_id: sessionId,
        interview_id: `int-${randomUUID()}`,
        livekit_room: livekitRoom,
        system_prompt: systemPrompt,
        first_message: "Hello! I'm your interviewer today. Are you ready to begin?",
        questions: JSON.stringify(questions),
        total_questions: questions.length,
      };

      this.nc.publish('interview.dynamic.start', this.sc.encode(JSON.stringify(payload)));
      this.logger.log(`Published interview.dynamic.start for session ${sessionId}`);
    } else {
      this.logger.warn('NATS connection is closed, could not publish event.');
    }

    // 4. Return connection info to frontend
    return {
      session_id: sessionId,
      livekit_room: livekitRoom,
      token,
      ws_url: process.env.LIVEKIT_URL || 'ws://localhost:7880',
    };
  }

  async saveInterviewResult(data: any) {
    const { session_id, interview_id, duration_seconds, transcript_text, turn_count } = data;
    
    let scores = { Technical: 0.0, Communication: 0.0, ProblemSolving: 0.0, recommendation: "Needs Review", detailed_report: "" };

    if (process.env.OPENAI_API_KEY && transcript_text) {
      try {
         const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an AI interviewer evaluator. Read the transcript and grade the candidate. Return a JSON object with strictly these properties: "Technical" (0.0-10.0), "Communication" (0.0-10.0), "ProblemSolving" (0.0-10.0), "recommendation" (string summarizing the candidate), and "detailed_report" (a comprehensive markdown text report detailing their strengths, weaknesses, and performance on the dynamic follow-ups).',
              },
              {
                role: 'user',
                content: `Transcript:\n\n${transcript_text}`,
              },
            ],
            response_format: { type: 'json_object' },
         });

         const content = response.choices[0].message?.content;
         if (content) {
             const parsed = JSON.parse(content);
             scores = {
               Technical: typeof parsed.Technical === 'number' ? parsed.Technical : 0.0,
               Communication: typeof parsed.Communication === 'number' ? parsed.Communication : 0.0,
               ProblemSolving: typeof parsed.ProblemSolving === 'number' ? parsed.ProblemSolving : 0.0,
               recommendation: parsed.recommendation || "Needs Review",
               detailed_report: parsed.detailed_report || "No detailed report generated. Please check transcript."
             };
         }
      } catch (err) {
         this.logger.error('Error generating evaluation with OpenAI', err);
      }
    } else {
        this.logger.warn('Skipping OpenAI evaluation, API key missing or transcript empty.');
    }

    // Check if table exists, if not, create it
    const client = await this.dbPool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS dynamic_interview_evaluations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id VARCHAR(255) NOT NULL,
                interview_id VARCHAR(255),
                transcript TEXT,
                technical_score DECIMAL(5,2),
                communication_score DECIMAL(5,2),
                problem_solving_score DECIMAL(5,2),
                recommendation TEXT,
                detailed_report TEXT,
                duration_seconds INT,
                turn_count INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Because we might have rows from earlier tests without 'detailed_report', safely add column if it is missing
        await client.query(`ALTER TABLE dynamic_interview_evaluations ADD COLUMN IF NOT EXISTS detailed_report TEXT`);

        // Insert the evaluation
        await client.query(
            `INSERT INTO dynamic_interview_evaluations
            (session_id, interview_id, transcript, technical_score, communication_score, problem_solving_score, recommendation, detailed_report, duration_seconds, turn_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                session_id,
                interview_id,
                transcript_text,
                scores.Technical,
                scores.Communication,
                scores.ProblemSolving,
                scores.recommendation,
                scores.detailed_report,
                duration_seconds,
                turn_count,
            ]
        );
        this.logger.log(`Successfully saved evaluation for session ${session_id}`);
    } catch (err) {
        this.logger.error(`Failed to save evaluation to DB for session ${session_id}`, err);
    } finally {
        client.release();
    }
  }
}
