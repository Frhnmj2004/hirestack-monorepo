"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DynamicInterviewRoom from "@/components/dynamic-interview/DynamicInterviewRoom";
import { API_BASE_URL } from "@/utils/config";

const DYNAMIC_API_BASE =
    process.env.NEXT_PUBLIC_DYNAMIC_INTERVIEW_API_URL || API_BASE_URL;

export default function DynamicInterviewPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [pageState, setPageState] = useState<
        "loading" | "permission" | "ready" | "error" | "ended"
    >("loading");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setPageState("error");
            setErrorMsg("No session ID provided");
            return;
        }

        const checkSession = async () => {
            console.log(`[Dynamic Interview] Initializing session check for ID: ${sessionId}`);
            const apiUrl = `${DYNAMIC_API_BASE}/v1/dynamic-sessions/${sessionId}/status`;
            console.log(`[Dynamic Interview] Fetching: ${apiUrl}`);

            try {
                const token = localStorage.getItem("attendeeToken");
                const headers: Record<string, string> = {};

                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                } else {
                    console.warn("[Dynamic Interview] No attendeeToken found in localStorage. Proceeding without Authorization header.");
                }

                const res = await fetch(apiUrl, { headers });
                console.log(`[Dynamic Interview] Response HTTP Status: ${res.status}`);

                if (res.status === 404) {
                    setPageState("permission");
                    return;
                }

                const rawText = await res.text();
                console.log(`[Dynamic Interview] Response Body:`, rawText);

                if (!res.ok) {
                    let snippet = rawText.slice(0, 100);
                    throw new Error(`API Error (${res.status})\nURL: ${apiUrl}\nResponse: ${snippet}${rawText.length > 100 ? '...' : ''}`);
                }

                let json;
                try {
                    json = JSON.parse(rawText);
                } catch (parseError) {
                    console.error("[Dynamic Interview] Failed to parse JSON response:", parseError);
                    let snippet = rawText.slice(0, 100);
                    throw new Error(`Invalid JSON format (Status ${res.status})\nURL: ${apiUrl}\nResponse starts with: ${snippet}`);
                }

                const data = json.data ? json.data : json;
                const status = data.status || "unknown";

                if (status === "ended" || status === "transcript_fetched" || status === "report_triggered") {
                    setPageState("ended");
                    return;
                }

                if (status === "failed") {
                    setPageState("error");
                    setErrorMsg("This interview session has failed. Please contact support.");
                    return;
                }

                setPageState("permission");
            } catch (err) {
                console.error("[Dynamic Interview] Session Check Error:", err);
                console.warn("[Dynamic Interview] Backend unreachable. Dev mode enabled.");

                if (process.env.NODE_ENV === "development") {
                    setPageState("permission");
                    return;
                }

                setPageState("error");
                setErrorMsg(err instanceof Error ? err.message : "Failed to verify session");
            }
        };

        checkSession();
    }, [sessionId]);

    const handleStartInterview = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            stream.getTracks().forEach((track) => track.stop());
            setPageState("ready");
        } catch {
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioStream.getTracks().forEach((track) => track.stop());
                setPageState("ready");
            } catch {
                setErrorMsg("Microphone access is required for this interview. Please allow microphone access and try again.");
            }
        }
    };

    // ── LOADING ───────────────────────────────────────────────────────────────
    if (pageState === "loading") {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center relative overflow-hidden">
                {/* Ambient blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center space-y-6">
                    <div className="relative mx-auto w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
                        <div className="absolute inset-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-white font-semibold text-lg">Preparing your interview</p>
                        <p className="text-gray-500 text-sm">Verifying session credentials...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── ERROR ─────────────────────────────────────────────────────────────────
    if (pageState === "error") {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-md w-full mx-4">
                    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/15 rounded-2xl flex items-center justify-center ring-1 ring-red-500/30">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3">Unable to Load Interview</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">{errorMsg || "An unexpected error occurred."}</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── ENDED ─────────────────────────────────────────────────────────────────
    if (pageState === "ended") {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-md w-full mx-4">
                    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
                        <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/15 rounded-2xl flex items-center justify-center ring-1 ring-blue-500/30">
                            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3">Interview Already Completed</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            This interview session has already been completed. If you believe this is an error, please contact the hiring team.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── PERMISSION / LOBBY ────────────────────────────────────────────────────
    if (pageState === "permission") {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center relative overflow-hidden">
                {/* Ambient glows */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

                {/* Faint grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }}
                />

                <div className="relative z-10 max-w-lg w-full mx-4">
                    {/* Logo bar */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <span className="text-white text-sm font-bold">H</span>
                        </div>
                        <span className="text-white/70 text-sm font-medium tracking-wide">HireStack AI Interview</span>
                    </div>

                    {/* Main card */}
                    <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden">
                        {/* Top accent stripe */}
                        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

                        <div className="p-8 space-y-7">
                            {/* Hero icon */}
                            <div className="text-center space-y-4">
                                <div className="relative mx-auto w-24 h-24">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-xl" />
                                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10 flex items-center justify-center">
                                        <svg className="w-11 h-11 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-2">Ready for Your Interview?</h1>
                                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                                        You&apos;ll be interviewed by an AI interviewer. Find a quiet space with a stable internet connection.
                                    </p>
                                </div>
                            </div>

                            {/* Checklist */}
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Before you begin</p>

                                {[
                                    {
                                        icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3z",
                                        text: "Microphone access is required",
                                        required: true,
                                    },
                                    {
                                        icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
                                        text: "Camera is optional but recommended",
                                        required: false,
                                    },
                                    {
                                        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                                        text: "Interview typically takes 15–30 minutes",
                                        required: false,
                                    },
                                ].map(({ icon, text, required }, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${required ? "bg-blue-500/15 ring-1 ring-blue-500/30" : "bg-white/[0.05] ring-1 ring-white/10"}`}>
                                            <svg className={`w-4 h-4 ${required ? "text-blue-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300 text-sm">{text}</span>
                                        {required && (
                                            <span className="ml-auto text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">Required</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Error message */}
                            {errorMsg && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                                    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-red-300 text-sm">{errorMsg}</p>
                                </div>
                            )}

                            {/* CTA button */}
                            <button
                                onClick={handleStartInterview}
                                className="group relative w-full py-4 px-6 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600" />
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Begin Interview
                                </div>
                            </button>
                        </div>

                        {/* Bottom accent stripe */}
                        <div className="h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                    </div>

                    <p className="text-center text-gray-600 text-xs mt-6">
                        Your responses are recorded and analysed securely.
                    </p>
                </div>
            </div>
        );
    }

    // pageState === "ready"
    return <DynamicInterviewRoom sessionId={sessionId} />;
}