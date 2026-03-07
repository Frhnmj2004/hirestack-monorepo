"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DynamicInterviewRoom from "@/components/dynamic-interview/DynamicInterviewRoom";
import { API_BASE_URL } from "@/utils/config";

const DYNAMIC_API_BASE =
    process.env.NEXT_PUBLIC_DYNAMIC_INTERVIEW_API_URL || API_BASE_URL;

interface SessionStatus {
    status: string;
    session_id: string;
    face_id: string;
}

export default function DynamicInterviewPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [pageState, setPageState] = useState<
        "loading" | "permission" | "ready" | "error" | "ended"
    >("loading");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            setPageState("error");
            setErrorMsg("No session ID provided");
            return;
        }

        const checkSession = async () => {
            // 2. Add debug logging for sessionId and API URL
            console.log(`[Dynamic Interview] Initializing session check for ID: ${sessionId}`);
            const apiUrl = `${DYNAMIC_API_BASE}/v1/dynamic-sessions/${sessionId}/status`;
            console.log(`[Dynamic Interview] Fetching: ${apiUrl}`);

            try {
                const token = localStorage.getItem("attendeeToken");
                const headers: Record<string, string> = {};

                // 5. Ensure the request headers are correct, token exists check
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                } else {
                    console.warn("[Dynamic Interview] No attendeeToken found in localStorage. Proceeding without Authorization header.");
                }

                const res = await fetch(apiUrl, { headers });
                console.log(`[Dynamic Interview] Response HTTP Status: ${res.status}`);

                // 8. Add a temporary debug mode where the interview can still proceed if the backend returns 404.
                if (res.status === 404) {
                    console.warn(`[Dynamic Interview] API returned 404. Development Fallback triggered: Proceeding to 'permission' state to allow UI testing.`);
                    setPageState("permission");
                    return;
                }

                // Get raw text first to handle both JSON and potential HTML error pages
                const rawText = await res.text();
                console.log(`[Dynamic Interview] Response Body:`, rawText);

                if (!res.ok) {
                    // 3. Helpful error message including API URL, Status, and Body
                    let snippet = rawText.slice(0, 100);
                    throw new Error(`API Error (${res.status})\nURL: ${apiUrl}\nResponse: ${snippet}${rawText.length > 100 ? '...' : ''}`);
                }

                // 7. Ensure frontend does NOT crash if API returns HTML / invalid JSON
                let json;
                try {
                    json = JSON.parse(rawText);
                } catch (parseError) {
                    console.error("[Dynamic Interview] Failed to parse JSON response:", parseError);
                    let snippet = rawText.slice(0, 100);
                    throw new Error(`Invalid JSON format (Status ${res.status})\nURL: ${apiUrl}\nResponse starts with: ${snippet}`);
                }

                // 6. Add fallback handling if backend returns { data: { status: ... } }
                const data = json.data ? json.data : json;
                const status = data.status || "unknown";

                if (
                    status === "ended" ||
                    status === "transcript_fetched" ||
                    status === "report_triggered"
                ) {
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

                /*setPageState("error");
                setErrorMsg(
                    err instanceof Error
                        ? err.message
                        : "Failed to verify session"
                );*/
                console.warn("[Dynamic Interview] Backend unreachable. Dev mode enabled.");

                if (process.env.NODE_ENV === "development") {
                    setPageState("permission");
                    return;
                }

                setPageState("error");
                setErrorMsg(
                    err instanceof Error
                        ? err.message
                        : "Failed to verify session"
                ); /*TILL HERE */
            }
        };

        checkSession();
    }, [sessionId]);

    const handleStartInterview = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            // stop preview tracks immediately
            stream.getTracks().forEach((track) => track.stop());

            setPermissionGranted(true);
            setPageState("ready");
        } catch {
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

                audioStream.getTracks().forEach((track) => track.stop());

                setPermissionGranted(true);
                setPageState("ready");
            } catch {
                setErrorMsg(
                    "Microphone access is required for this interview. Please allow microphone access and try again."
                );
            }
        }
    };

    if (pageState === "loading") {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading interview session...</p>
                </div>
            </div>
        );
    }

    if (pageState === "error") {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md mx-auto px-4">
                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        Unable to Load Interview
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {errorMsg || "An unexpected error occurred."}
                    </p>
                </div>
            </div>
        );
    }

    if (pageState === "ended") {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md mx-auto px-4">
                    <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        Interview Already Completed
                    </h2>
                    <p className="text-gray-400 text-sm">
                        This interview session has already been completed. If you believe
                        this is an error, please contact the hiring team.
                    </p>
                </div>
            </div>
        );
    }

    if (pageState === "permission") {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-8 max-w-lg mx-auto px-4">
                    <div className="space-y-3">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            Ready for Your Interview?
                        </h1>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            You will be interviewed by an AI interviewer. Make sure you are in
                            a quiet environment with a stable internet connection.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-left space-y-3">
                            <h3 className="text-white font-medium text-sm">Before you begin:</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li className="flex items-start gap-2">
                                    <svg
                                        className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3z"
                                        />
                                    </svg>
                                    Microphone access is required
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg
                                        className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                    Camera is optional but recommended
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg
                                        className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    The interview typically takes 15-30 minutes
                                </li>
                            </ul>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                                <p className="text-red-300 text-sm">{errorMsg}</p>
                            </div>
                        )}

                        <button
                            onClick={handleStartInterview}
                            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg shadow-blue-600/20"
                        >
                            Start Interview
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // pageState === "ready"
    return <DynamicInterviewRoom sessionId={sessionId} />;
}