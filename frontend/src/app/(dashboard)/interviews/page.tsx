'use client';

import { useEffect, useState, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { InterviewCard } from '@/components/features/interviews/InterviewCard';
import { Button } from '@/components/ui/button';
import { Video, X, Upload, Loader2, Copy, Check } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InterviewResult {
    id: string;
    session_id: string;
    candidateName: string;
    recommendation: string | null;
    technical_score: number | null;
    communication_score: number | null;
    problem_solving_score: number | null;
    duration_seconds: number | null;
    created_at: string;
    status: string | null;
}

interface ApiInterview {
    id: string;
    candidateName: string;
    jobTitle: string;
    date: string;
    duration: string;
    status: 'Completed' | 'Scheduled' | 'In Progress';
    score?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_DYNAMIC_INTERVIEW_API_URL || 'http://localhost:3000';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toInterviewCard(r: InterviewResult): ApiInterview {
    const avg = [r.technical_score, r.communication_score, r.problem_solving_score]
        .filter((n): n is number => n !== null && n !== undefined);
    const rawScore = avg.length > 0 ? avg.reduce((a, b) => a + b, 0) / avg.length : null;
    const score = rawScore !== null ? Math.round(rawScore * 10) : undefined;

    const date = r.created_at
        ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unknown';

    const duration = r.duration_seconds
        ? `${Math.round(r.duration_seconds / 60)} mins`
        : '--';

    const status: ApiInterview['status'] =
        r.status === 'ended' || score !== undefined ? 'Completed' : 'In Progress';

    return {
        id: r.id,
        candidateName: r.candidateName || r.session_id?.substring(0, 8) || 'Unknown',
        jobTitle: r.recommendation || 'AI Interview',
        date,
        duration,
        status,
        score,
    };
}

// ─── Start Interview Modal ────────────────────────────────────────────────────

function StartInterviewModal({ onClose }: { onClose: () => void }) {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await fetch(`${API_BASE}/v1/files/parse`, { method: 'POST', body: form });
            if (!res.ok) throw new Error('File parse failed');
            const data = await res.json();
            setResumeText(data.text || '');
        } catch {
            setError('Could not parse file. Paste resume text manually.');
        }
    };

    const handleStart = async () => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            setError('Please provide both resume text and job description.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/v1/dynamic-interviews/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, jobDescription }),
            });
            if (!res.ok) throw new Error(`Backend error ${res.status}`);
            const data = await res.json();
            const link = `${window.location.origin}/interview/dynamic/${data.session_id}`;
            setGeneratedLink(link);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start interview');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-xl rounded-3xl p-6 flex flex-col gap-5"
                style={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(90,70,218,0.15)',
                    boxShadow: '0 24px 64px rgba(90,70,218,0.15)',
                }}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#5A46DA] mb-0.5">Dynamic AI Interview</p>
                        <h2 className="text-lg font-bold text-gray-900">Start a New Interview</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {!generatedLink ? (
                    <>
                        {/* Resume */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-700">Candidate Resume</label>
                            <div className="flex gap-2">
                                <textarea
                                    value={resumeText}
                                    onChange={e => setResumeText(e.target.value)}
                                    placeholder="Paste resume text here..."
                                    rows={5}
                                    className="flex-1 text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-[#5A46DA]/30 focus:border-[#5A46DA]/40 transition-all"
                                />
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <Upload className="w-3 h-3" /> Upload
                                    </button>
                                    <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                                        onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-700">Job Description</label>
                            <textarea
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                rows={4}
                                className="text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-[#5A46DA]/30 focus:border-[#5A46DA]/40 transition-all"
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
                        )}

                        <button
                            onClick={handleStart}
                            disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 100%)', boxShadow: '0 4px 15px rgba(90,70,218,0.35)' }}
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating interview...</> : <><Video className="w-4 h-4" /> Start AI Interview</>}
                        </button>
                    </>
                ) : (
                    // Generated link view
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <Video className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-emerald-700">Interview Created!</p>
                                <p className="text-xs text-emerald-600">Share this link with the candidate</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 truncate font-mono">
                                {generatedLink}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                                style={copied
                                    ? { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#059669' }
                                    : { background: 'rgba(90,70,218,0.07)', borderColor: 'rgba(90,70,218,0.2)', color: '#5A46DA' }}
                            >
                                {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                            </button>
                        </div>

                        <button onClick={onClose}
                            className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function InterviewsPage() {
    const [interviews, setInterviews] = useState<ApiInterview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchInterviews = async () => {
        try {
            const res = await fetch(`${API_BASE}/v1/dynamic-sessions/results`);
            if (res.ok) {
                const data: InterviewResult[] = await res.json();
                setInterviews(data.map(toInterviewCard));
            }
        } catch {
            // backend may not be ready yet — silently fall through (empty list)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInterviews(); }, []);

    const handleModalClose = () => {
        setShowModal(false);
        // Refresh list after creating a new interview
        setLoading(true);
        fetchInterviews();
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="AI Interviews"
                description="Review completed AI interviews, read transcripts, and view candidate scores."
            >
                <Button
                    onClick={() => setShowModal(true)}
                    className="rounded-xl text-sm font-semibold text-white h-10 px-4 transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 100%)',
                        boxShadow: '0 4px 15px rgba(90,70,218,0.35)',
                    }}
                >
                    <Video className="w-4 h-4 mr-2" />
                    Start AI Interview
                </Button>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5A46DA]" />
                </div>
            ) : interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(90,70,218,0.07)' }}>
                        <Video className="w-7 h-7 text-[#5A46DA]/60" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">No interviews yet</p>
                        <p className="text-sm text-gray-400 mt-1">Click &ldquo;Start AI Interview&rdquo; to create one</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interviews.map((interview) => (
                        <InterviewCard key={interview.id} interview={interview} />
                    ))}
                </div>
            )}

            {showModal && <StartInterviewModal onClose={handleModalClose} />}
        </div>
    );
}
