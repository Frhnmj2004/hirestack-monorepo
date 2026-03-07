"use client";

/**
 * Dynamic Interview room: connects to a LiveKit room where a Python agent runs the
 * AI interviewer with Simli avatar. The backend returns LiveKit credentials (URL + token)
 * via GET /v1/dynamic-sessions/:id/token.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
  LocalParticipant,
  createLocalTracks,
  LocalTrack,
  ConnectionState as LKConnectionState,
} from "livekit-client";
import { API_BASE_URL } from "@/utils/config";
import AvatarTile from "./AvatarTile";
import CandidateTile from "./CandidateTile";
import SessionControls from "./SessionControls";

interface DynamicInterviewRoomProps {
  sessionId: string;
}

type ConnectionState = "idle" | "connecting" | "connected" | "error" | "ended";

const DYNAMIC_API_BASE =
  process.env.NEXT_PUBLIC_DYNAMIC_INTERVIEW_API_URL || API_BASE_URL;

interface LiveKitCredentials {
  livekit_url: string;
  livekit_token: string;
  livekit_room: string;
  session_id: string;
  face_id: string;
}

export default function DynamicInterviewRoom({
  sessionId,
}: DynamicInterviewRoomProps) {
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const avatarAudioRef = useRef<HTMLAudioElement>(null);
  const candidateVideoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const cleaningUpRef = useRef(false);
  // Per-connection-attempt abort flag — set to true to cancel an in-flight connect()
  const connectAbortRef = useRef(false);

  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const fetchCredentials = useCallback(async (): Promise<LiveKitCredentials> => {
    const token = localStorage.getItem("attendeeToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${DYNAMIC_API_BASE}/v1/dynamic-sessions/${sessionId}/token`,
      { headers }
    );
    if (!res.ok) {
      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      throw new Error(
        data?.message || `Failed to fetch session info (${res.status})`
      );
    }
    const json = await res.json();
    const d = json.data;
    if (!d?.livekit_url || !d?.livekit_token) {
      throw new Error("No LiveKit credentials returned from backend");
    }
    return {
      livekit_url: d.livekit_url,
      livekit_token: d.livekit_token,
      livekit_room: d.livekit_room,
      session_id: d.session_id,
      face_id: d.face_id,
    };
  }, [sessionId]);

  const attachRemoteTrack = useCallback(
    (
      track: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      try {
        const mediaTrack = track.track;
        if (!mediaTrack) return;

        if (track.kind === Track.Kind.Video && avatarVideoRef.current) {
          mediaTrack.attach(avatarVideoRef.current);
          setIsThinking(false);
        } else if (track.kind === Track.Kind.Audio && avatarAudioRef.current) {
          mediaTrack.attach(avatarAudioRef.current);
        }
      } catch (err) {
        // Track may not be ready yet — LiveKit will retry via TrackSubscribed
        console.warn("[DynamicInterview] attachRemoteTrack skipped:", err);
      }
    },
    []
  );

  const updateLocalStream = useCallback((localParticipant: LocalParticipant) => {
    try {
      localParticipant.videoTrackPublications.forEach((pub) => {
        if (pub.track && candidateVideoRef.current) {
          pub.track.attach(candidateVideoRef.current);
        }
      });
    } catch (err) {
      console.warn("[DynamicInterview] attach local stream skipped:", err);
    }
  }, []);

  const startSession = useCallback(async () => {
    if (connectionState === "connecting" || connectionState === "connected")
      return;
    if (cleaningUpRef.current) return;

    // Mark this connection attempt as active
    connectAbortRef.current = false;
    setConnectionState("connecting");
    setErrorMessage(null);

    try {
      const existing = roomRef.current;
      if (existing) {
        roomRef.current = null;
        await existing.disconnect(true);
      }

      if (cleaningUpRef.current || connectAbortRef.current) return;

      // Fetch real LiveKit credentials from backend
      const creds = await fetchCredentials();
      console.log(`[DynamicInterview] Connecting to LiveKit: ${creds.livekit_url}, room: ${creds.livekit_room}`);

      if (cleaningUpRef.current || connectAbortRef.current) return;

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720 },
        },
      });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (participant instanceof RemoteParticipant) {
          attachRemoteTrack(publication as RemoteTrackPublication, participant);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach();
      });

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        if (participant instanceof RemoteParticipant) {
          setIsThinking(true);
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const remoteActive = speakers.some(
          (s) => s instanceof RemoteParticipant
        );
        setIsSpeaking(remoteActive);
        if (remoteActive) setIsThinking(false);
      });

      room.on(RoomEvent.LocalTrackPublished, () => {
        updateLocalStream(room.localParticipant);
      });

      room.on(RoomEvent.Disconnected, () => {
        if (!cleaningUpRef.current) {
          setConnectionState("ended");
        }
      });

      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === LKConnectionState.Disconnected && !cleaningUpRef.current) {
          setConnectionState("error");
          setErrorMessage("Connection lost. Please retry.");
        }
      });

      // Pre-fetch camera and mic permissions cleanly BEFORE connecting
      let initialTracks: LocalTrack[] = [];
      try {
        initialTracks = await createLocalTracks({ audio: true, video: true });
      } catch (err) {
        console.warn("[DynamicInterview] Both camera/mic not available, falling back to audio only", err);
        try {
          initialTracks = await createLocalTracks({ audio: true, video: false });
          // User has no camera, sync UI state to match reality:
          setIsCameraOff(true);
        } catch (audioErr) {
          console.error("[DynamicInterview] Even microphone is unavailable", audioErr);
        }
      }

      if (cleaningUpRef.current || connectAbortRef.current) {
        initialTracks.forEach((t) => t.stop());
        return;
      }

      // Connect to LiveKit room
      await room.connect(creds.livekit_url, creds.livekit_token);

      // Guard: component may have been unmounted while connect() was in flight
      if (cleaningUpRef.current || connectAbortRef.current) {
        room.disconnect(true);
        initialTracks.forEach((t) => t.stop());
        return;
      }

      setConnectionState("connected");

      // Safely publish our pre-fetched tracks to the room
      for (const track of initialTracks) {
        try {
          await room.localParticipant.publishTrack(track);
        } catch (publishErr) {
          console.warn(`[DynamicInterview] Failed to publish ${track.kind} track:`, publishErr);
        }
      }
      
      // Update local preview
      if (!cleaningUpRef.current && !connectAbortRef.current) {
        updateLocalStream(room.localParticipant);
      }

      // Attach any already-subscribed remote tracks
      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((pub) => {
          if (pub.isSubscribed && pub.track) {
            attachRemoteTrack(pub as RemoteTrackPublication, participant);
          }
        });
      });
    } catch (err) {
      // Silently discard errors caused by component unmounting mid-connect
      if (cleaningUpRef.current || connectAbortRef.current) return;

      console.error("[DynamicInterview] Connection error:", err);

      // Convert browser-internal errors (DOMException) to readable messages
      let message = "Failed to connect to interview room.";
      if (err instanceof Error) {
        if (err.name === "DOMException" || err.message?.includes("object can not be found")) {
          message = "Could not connect to the interview server. Please check your internet connection and retry.";
        } else if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
          message = "Network error — could not reach the interview service. Is the backend running?";
        } else {
          message = err.message;
        }
      }

      setConnectionState("error");
      setErrorMessage(message);
    }
  }, [connectionState, fetchCredentials, attachRemoteTrack, updateLocalStream]);

  useEffect(() => {
    cleaningUpRef.current = false;
    connectAbortRef.current = false;
    // 600ms delay: safely outlasts React 18 StrictMode's mount→unmount→remount cycle
    // so we only attempt connection on the final stable mount
    const timeout = setTimeout(() => {
      startSession();
    }, 600);

    return () => {
      cleaningUpRef.current = true;
      connectAbortRef.current = true; // abort any in-flight connect()
      clearTimeout(timeout);
      const room = roomRef.current;
      roomRef.current = null;
      if (room) {
        room.disconnect(true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleMute = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const newMuted = !isMuted;
    room.localParticipant.setMicrophoneEnabled(!newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleToggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const newOff = !isCameraOff;
    room.localParticipant.setCameraEnabled(!newOff);
    setIsCameraOff(newOff);
  }, [isCameraOff]);

  const handleEndSession = useCallback(async () => {
    setConnectionState("ended");

    const room = roomRef.current;
    roomRef.current = null;
    if (room) {
      await room.disconnect(true);
    }

    try {
      const token = localStorage.getItem("attendeeToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      await fetch(
        `${DYNAMIC_API_BASE}/v1/dynamic-sessions/${sessionId}/end`,
        { method: "POST", headers }
      );
    } catch (err) {
      console.error("[DynamicInterview] Failed to call end API:", err);
    }
  }, [sessionId]);

  // ── ENDED ──────────────────────────────────────────────────────────────────
  if (connectionState === "ended") {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-md w-full mx-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-12 text-center shadow-2xl">
            <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent mb-10" />
            <div className="w-20 h-20 mx-auto mb-7 relative">
              <div className="absolute inset-0 rounded-full bg-green-500/10 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <svg className="w-9 h-9 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Interview Complete</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Thank you for completing the interview. Your responses have been recorded and will be reviewed shortly.
            </p>
            <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN ROOM ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-700/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-700/8 rounded-full blur-3xl pointer-events-none" />
      {isSpeaking && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/4 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3.5 bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-white/70 font-medium text-sm">HireStack AI Interview</span>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              connectionState === "connected"
                ? "bg-green-400"
                : connectionState === "connecting"
                ? "bg-amber-400 animate-pulse"
                : "bg-red-400"
            }`}
          />
          <span className="text-gray-400 text-xs font-medium capitalize">{connectionState}</span>
        </div>

        {/* Timer placeholder */}
        <div className="w-24" />
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────────── */}
      {errorMessage && (
        <div className="relative z-10 mx-6 mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-red-300 text-sm flex-1">{errorMessage}</span>
          <button
            onClick={() => { setErrorMessage(null); setConnectionState("idle"); startSession(); }}
            className="ml-auto text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg px-3 py-1 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main Video Area ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-4 min-h-0">
        {/* Avatar + candidate overlay */}
        <div className="relative w-full max-w-5xl" style={{ aspectRatio: "16/9" }}>
          {/* Speaking ring */}
          {isSpeaking && (
            <div className="absolute -inset-1 rounded-[28px] ring-1 ring-blue-500/40 animate-pulse pointer-events-none z-0" />
          )}

          {/* Main avatar */}
          <div className="relative w-full h-full z-10">
            <AvatarTile
              ref={avatarVideoRef}
              isSpeaking={isSpeaking}
              isConnected={connectionState === "connected"}
              isThinking={isThinking}
            />
          </div>

          {/* Candidate PiP */}
          <div className="absolute bottom-4 right-4 z-20">
            <CandidateTile
              ref={candidateVideoRef}
              isMuted={isMuted}
              isCameraOff={isCameraOff}
            />
          </div>
        </div>

        {/* Hidden audio */}
        <audio ref={avatarAudioRef} autoPlay playsInline className="hidden" />
      </div>

      {/* ── Controls Bar ────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 py-4 bg-white/[0.03] backdrop-blur-xl border-t border-white/[0.06]">
        <SessionControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isConnected={connectionState === "connected"}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onEndSession={handleEndSession}
        />
      </div>
    </div>
  );
}
