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
    object: string | number | boolean,
    options?: { startDate?: Date; endDate?: Date; confidence?: number; source?: string },
  ): Promise<string> {
    const objectStr = object == null ? '' : String(object);
    const triple = await this.prisma.knowledgeTriple.create({
      data: {
        candidateId,
        predicate,
        object: objectStr,
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
        if (this.looksContradictoryWithTriple(t, existingObj, obj)) {
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

  private looksContradictoryWithTriple(
    existingTriple: { object: string; startDate?: Date | null; endDate?: Date | null },
    existingObj: string,
    newObj: string,
  ): boolean {
    const numA = this.parseNumber(existingObj);
    const numB = this.parseNumber(newObj);
    if (numA != null && numB != null && numA !== numB) return true;
    const dateRangeA =
      existingTriple.startDate != null && existingTriple.endDate != null
        ? ([existingTriple.startDate, existingTriple.endDate] as [Date, Date])
        : this.parseDateRange(existingObj);
    const dateRangeB = this.parseDateRange(newObj);
    if (dateRangeA && dateRangeB && !this.dateRangesOverlap(dateRangeA, dateRangeB)) return true;
    return false;
  }

  private parseNumber(s: string): number | null {
    const m = s.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  }

  /**
   * Parse a date range from text (e.g. "2019-2023", "2019 to 2023", "2018", "Jan 2019 - Mar 2023").
   * Returns [start, end] or null if no parseable range.
   */
  private parseDateRange(s: string): [Date, Date] | null {
    if (!s || typeof s !== 'string') return null;
    const trimmed = s.trim();
    // Four-digit year or two ranges: 2019-2023, 2019–2023 (en dash), 2019 to 2023
    const rangeMatch = trimmed.match(
      /(\d{4})\s*[-–to]\s*(\d{4})/i,
    );
    if (rangeMatch) {
      const y1 = parseInt(rangeMatch[1], 10);
      const y2 = parseInt(rangeMatch[2], 10);
      if (y1 <= y2) {
        return [new Date(y1, 0, 1), new Date(y2, 11, 31)];
      }
      return [new Date(y2, 0, 1), new Date(y1, 11, 31)];
    }
    // Single year
    const singleYear = trimmed.match(/\b(19|20)\d{2}\b/);
    if (singleYear) {
      const y = parseInt(singleYear[0], 10);
      return [new Date(y, 0, 1), new Date(y, 11, 31)];
    }
    return null;
  }

  /**
   * True if the two ranges overlap (share any day). False = no overlap = potential contradiction.
   */
  private dateRangesOverlap(a: [Date, Date], b: [Date, Date]): boolean {
    const [startA, endA] = a;
    const [startB, endB] = b;
    return startA.getTime() <= endB.getTime() && startB.getTime() <= endA.getTime();
  }
}
