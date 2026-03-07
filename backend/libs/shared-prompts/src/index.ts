import * as fs from 'fs';
import * as path from 'path';

/** Resolve prompts dir: from apps/assist-service cwd, ../../libs/shared-prompts; else __dirname/.. */
function getPromptsDir(): string {
  const fromCwd = path.join(process.cwd(), '..', '..', 'libs', 'shared-prompts');
  if (fs.existsSync(path.join(fromCwd, 'answer-analysis.txt'))) return fromCwd;
  return path.join(__dirname, '..');
}

export function loadPrompt(name: string): string {
  const dir = getPromptsDir();
  const p = path.join(dir, `${name}.txt`);
  return fs.readFileSync(p, 'utf-8');
}

export const PROMPT_NAMES = {
  ANSWER_ANALYSIS: 'answer-analysis',
  CLAIM_EXTRACTION: 'claim-extraction',
  CONTRADICTION_CLARIFY: 'contradiction-clarify',
} as const;

export function getAnswerAnalysisPrompt(activeQuestion: string, candidateAnswer: string): string {
  const tpl = loadPrompt(PROMPT_NAMES.ANSWER_ANALYSIS);
  return tpl
    .replace(/\{\{\s*active_question\s*\}\}/g, activeQuestion)
    .replace(/\{\{\s*candidate_answer\s*\}\}/g, candidateAnswer);
}

export function getClaimExtractionPrompt(candidateAnswer: string): string {
  const tpl = loadPrompt(PROMPT_NAMES.CLAIM_EXTRACTION);
  return tpl.replace(/\{\{\s*candidate_answer\s*\}\}/g, candidateAnswer);
}

export function getContradictionClarifyPrompt(
  claim: string,
  resumeEvidence: string,
  contradictionType: string,
): string {
  const tpl = loadPrompt(PROMPT_NAMES.CONTRADICTION_CLARIFY);
  return tpl
    .replace(/\{\{\s*claim\s*\}\}/g, claim)
    .replace(/\{\{\s*resume_evidence\s*\}\}/g, resumeEvidence)
    .replace(/\{\{\s*contradiction_type\s*\}\}/g, contradictionType);
}
