import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { ClaimDto } from '@hirelens/shared-types';

export type TripleMatch = 'match' | 'new_information' | 'contradiction';

export interface CompareResult {
  match: TripleMatch;
  existingTriple?: { predicate: string; object: string; startDate?: Date; endDate?: Date };
  claim: ClaimDto;
}

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async storeFact(
    candidateId: string,
    predicate: string,
    object: string,
    options?: { startDate?: Date; endDate?: Date; confidence?: number; source?: string },
  ): Promise<string> {
    const triple = await this.prisma.knowledgeTriple.create({
      data: {
        candidateId,
        predicate,
        object,
        startDate: options?.startDate,
        endDate: options?.endDate,
        confidence: options?.confidence,
        source: options?.source ?? 'resume',
      },
    });
    return triple.id;
  }

  async compareClaims(candidateId: string, claims: ClaimDto[]): Promise<CompareResult[]> {
    const results: CompareResult[] = [];
    for (const claim of claims) {
      const predicate = claim.predicate || claim.claimText.slice(0, 50).replace(/\s+/g, '_').toLowerCase();
      const existing = await this.prisma.knowledgeTriple.findMany({
        where: { candidateId, predicate: { contains: predicate, mode: 'insensitive' } },
        take: 5,
      });
      if (existing.length === 0) {
        results.push({ match: 'new_information', claim });
        continue;
      }
      const obj = (claim.object ?? claim.claimText).toString().trim();
      let foundMatch = false;
      let contradiction: CompareResult | null = null;
      for (const t of existing) {
        const existingObj = t.object.trim();
        if (existingObj === obj || existingObj.includes(obj) || obj.includes(existingObj)) {
          results.push({
            match: 'match',
            existingTriple: {
              predicate: t.predicate,
              object: t.object,
              startDate: t.startDate ?? undefined,
              endDate: t.endDate ?? undefined,
            },
            claim,
          });
          foundMatch = true;
          break;
        }
        if (this.looksContradictory(predicate, existingObj, obj)) {
          contradiction = {
            match: 'contradiction',
            existingTriple: {
              predicate: t.predicate,
              object: t.object,
              startDate: t.startDate ?? undefined,
              endDate: t.endDate ?? undefined,
            },
            claim,
          };
          break;
        }
      }
      if (contradiction) results.push(contradiction);
      else if (!foundMatch) results.push({ match: 'new_information', claim });
    }
    return results;
  }

  private looksContradictory(predicate: string, existingObj: string, newObj: string): boolean {
    const numA = this.parseNumber(existingObj);
    const numB = this.parseNumber(newObj);
    if (numA != null && numB != null && numA !== numB) return true;
    const dateRangeA = this.parseDateRange(existingObj);
    const dateRangeB = this.parseDateRange(newObj);
    if (dateRangeA && dateRangeB && this.dateRangesOverlap(dateRangeA, dateRangeB) === false) return true;
    return false;
  }

  private parseNumber(s: string): number | null {
    const m = s.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  }

  private parseDateRange(_s: string): [Date, Date] | null {
    return null;
  }

  private dateRangesOverlap(_a: [Date, Date], _b: [Date, Date]): boolean {
    return true;
  }
}
