import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import * as crypto from 'crypto';
import { withRetry } from '../common/retry.util';
import type { EvidenceCardDto } from '@hirelens/shared-types';

const EMBEDDING_DIM = 1536;
const TOP_K = 5;
const TTL_EMBEDDING = 60 * 60 * 24; // 24h

@Injectable()
export class RagService {
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is required');
    this.openai = new OpenAI({ apiKey: key });
  }

  private cacheKey(text: string): string {
    return `emb:${crypto.createHash('sha256').update(text).digest('hex')}`;
  }

  async embed(text: string): Promise<number[]> {
    const key = this.cacheKey(text);
    const cached = await this.cache.get<number[]>(key);
    if (cached) return cached;
    const result = await withRetry(() =>
      this.openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
        input: text,
      }),
    );
    const vector = result.data[0]?.embedding;
    if (!vector || vector.length !== EMBEDDING_DIM) throw new Error('Invalid embedding');
    await this.cache.set(key, vector, TTL_EMBEDDING);
    return vector;
  }

  async search(
    candidateId: string,
    queryEmbedding: number[],
    k: number = TOP_K,
  ): Promise<Array<{ id: string; textChunk: string; similarity: number }>> {
    const vecStr = `[${queryEmbedding.join(',')}]`;
    const sql = Prisma.sql`
      SELECT id, text_chunk, (1 - (embedding <=> ${Prisma.raw(vecStr)}::vector))::float AS similarity
      FROM resume_chunks
      WHERE candidate_id = ${candidateId} AND embedding IS NOT NULL
      ORDER BY embedding <=> ${Prisma.raw(vecStr)}::vector
      LIMIT ${k}
    `;
    const rows = await this.prisma.$queryRaw<
      Array<{ id: string; text_chunk: string; similarity: number }>
    >(sql);
    return rows.map((r) => ({ id: r.id, textChunk: r.text_chunk, similarity: Number(r.similarity) }));
  }

  /**
   * Classify results into evidence cards by threshold.
   * >= 0.80 strong, 0.65-0.80 possible, < 0.65 new_info (not returned as evidence).
   */
  resultsToEvidenceCards(
    results: Array<{ textChunk: string; similarity: number }>,
    claimText?: string,
  ): EvidenceCardDto[] {
    const cards: EvidenceCardDto[] = [];
    for (const r of results) {
      if (r.similarity >= 0.8) cards.push({ type: 'strong', resumeSnippet: r.textChunk, similarity: r.similarity, claimText });
      else if (r.similarity >= 0.65) cards.push({ type: 'possible', resumeSnippet: r.textChunk, similarity: r.similarity, claimText });
      // < 0.65: new info, skip or add as new_info if needed
    }
    return cards;
  }

  /** Store resume chunk (called by ingestion pipeline). */
  async storeChunk(candidateId: string, textChunk: string, metadata?: Record<string, unknown>): Promise<string> {
    const embedding = await this.embed(textChunk);
    const vecStr = `[${embedding.join(',')}]`;
    const metaJson = metadata ? JSON.stringify(metadata) : null;
    await this.prisma.$executeRaw(
      Prisma.sql`
      INSERT INTO resume_chunks (id, candidate_id, text_chunk, embedding, metadata, created_at)
      VALUES (gen_random_uuid(), ${candidateId}, ${textChunk}, ${Prisma.raw(vecStr)}::vector, ${metaJson}::jsonb, now())
      `,
    );
    const row = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM resume_chunks WHERE candidate_id = ${candidateId} ORDER BY created_at DESC LIMIT 1
    `;
    return row[0]?.id ?? '';
  }
}
