"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT_NAMES = void 0;
exports.loadPrompt = loadPrompt;
exports.getAnswerAnalysisPrompt = getAnswerAnalysisPrompt;
exports.getClaimExtractionPrompt = getClaimExtractionPrompt;
exports.getContradictionClarifyPrompt = getContradictionClarifyPrompt;
exports.getQuestionGenerationPrompt = getQuestionGenerationPrompt;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getPromptsDir() {
    const fromCwd = path.join(process.cwd(), '..', '..', 'libs', 'shared-prompts');
    if (fs.existsSync(path.join(fromCwd, 'answer-analysis.txt')))
        return fromCwd;
    return path.join(__dirname, '..');
}
function loadPrompt(name) {
    const dir = getPromptsDir();
    const p = path.join(dir, `${name}.txt`);
    return fs.readFileSync(p, 'utf-8');
}
exports.PROMPT_NAMES = {
    ANSWER_ANALYSIS: 'answer-analysis',
    CLAIM_EXTRACTION: 'claim-extraction',
    CONTRADICTION_CLARIFY: 'contradiction-clarify',
    QUESTION_GENERATION: 'question-generation',
};
function getAnswerAnalysisPrompt(activeQuestion, candidateAnswer) {
    const tpl = loadPrompt(exports.PROMPT_NAMES.ANSWER_ANALYSIS);
    return tpl
        .replace(/\{\{\s*active_question\s*\}\}/g, activeQuestion)
        .replace(/\{\{\s*candidate_answer\s*\}\}/g, candidateAnswer);
}
function getClaimExtractionPrompt(candidateAnswer) {
    const tpl = loadPrompt(exports.PROMPT_NAMES.CLAIM_EXTRACTION);
    return tpl.replace(/\{\{\s*candidate_answer\s*\}\}/g, candidateAnswer);
}
function getContradictionClarifyPrompt(claim, resumeEvidence, contradictionType) {
    const tpl = loadPrompt(exports.PROMPT_NAMES.CONTRADICTION_CLARIFY);
    return tpl
        .replace(/\{\{\s*claim\s*\}\}/g, claim)
        .replace(/\{\{\s*resume_evidence\s*\}\}/g, resumeEvidence)
        .replace(/\{\{\s*contradiction_type\s*\}\}/g, contradictionType);
}
function getQuestionGenerationPrompt(jdText, resumeText, roleLevel) {
    const tpl = loadPrompt(exports.PROMPT_NAMES.QUESTION_GENERATION);
    return tpl
        .replace(/\{\{\s*jd_text\s*\}\}/g, jdText)
        .replace(/\{\{\s*resume_text\s*\}\}/g, resumeText)
        .replace(/\{\{\s*role_level\s*\}\}/g, roleLevel);
}
//# sourceMappingURL=index.js.map