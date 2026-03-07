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
  const roomRef = useRef<Room | null>(null);
  const cleaningUpRef = useRef(false);

  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

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
      const mediaTrack = track.track;
      if (!mediaTrack) return;

      if (track.kind === Track.Kind.Video && avatarVideoRef.current) {
        mediaTrack.attach(avatarVideoRef.current);
        setIsThinking(false);
      } else if (track.kind === Track.Kind.Audio && avatarAudioRef.current) {
        mediaTrack.attach(avatarAudioRef.current);
      }
    },
    []
  );

  const updateLocalStream = useCallback((localParticipant: LocalParticipant) => {
    const tracks: MediaStreamTrack[] = [];
    localParticipant.audioTrackPublications.forEach((pub) => {
      if (pub.track?.mediaStreamTrack) tracks.push(pub.track.mediaStreamTrack);
    });
    localParticipant.videoTrackPublications.forEach((pub) => {
      if (pub.track?.mediaStreamTrack) tracks.push(pub.track.mediaStreamTrack);
    });
    if (tracks.length > 0) {
      setLocalStream(new MediaStream(tracks));
    }
  }, []);

  const startSession = useCallback(async () => {
    if (connectionState === "connecting" || connectionState === "connected")
      return;
    if (cleaningUpRef.current) return;

    setConnectionState("connecting");
    setErrorMessage(null);

    try {
      const existing = roomRef.current;
      if (existing) {
        roomRef.current = null;
        await existing.disconnect(true);
      }

      /*const creds = await fetchCredentials();*/
      const creds = {
        livekit_url: "ws://localhost:7880",
        livekit_token: "fake-token",
        livekit_room: "test-room",
        session_id: sessionId,
        face_id: "dev",
      }; /* TILL HERE */
      if (cleaningUpRef.current) return;

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
    },
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
          setErrorMessage("Connection lost");
        }
      });

      await room.connect(creds.livekit_url, creds.livekit_token);
      setConnectionState("connected");

      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      updateLocalStream(room.localParticipant);

      // Attach any already-subscribed remote tracks
      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((pub) => {
          if (pub.isSubscribed && pub.track) {
            attachRemoteTrack(pub as RemoteTrackPublication, participant);
          }
        });
      });
    } catch (err) {
      if (cleaningUpRef.current) return;
      console.error("[DynamicInterview] Failed to start session:", err);
      setConnectionState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to start session"
      );
    }
  }, [connectionState, fetchCredentials, attachRemoteTrack, updateLocalStream]);

  useEffect(() => {
    cleaningUpRef.current = false;
    const timeout = setTimeout(() => {
      startSession();
    }, 150);

    return () => {
      cleaningUpRef.current = true;
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

  if (connectionState === "ended") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Interview Complete
          </h2>
          <p className="text-gray-400">
            Thank you for completing the interview. Your responses have been
            recorded and will be reviewed shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="text-white font-medium text-sm">
            Dynamic Interview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionState === "connected"
                ? "bg-green-400"
                : connectionState === "connecting"
                ? "bg-yellow-400 animate-pulse"
                : "bg-red-400"
            }`}
          />
          <span className="text-gray-400 text-xs capitalize">
            {connectionState}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0"
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
          <span className="text-red-300 text-sm">{errorMessage}</span>
          <button
            onClick={() => {
              setErrorMessage(null);
              setConnectionState("idle");
              startSession();
            }}
            className="ml-auto text-red-400 hover:text-red-300 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 gap-4 min-h-0">
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="relative w-full max-w-4xl aspect-video">
            <AvatarTile
              ref={avatarVideoRef}
              isSpeaking={isSpeaking}
              isConnected={connectionState === "connected"}
              isThinking={isThinking}
            />
            <div className="absolute bottom-4 right-4 z-10">
              <CandidateTile
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                stream={localStream}
              />
            </div>
          </div>
        </div>

        <audio
          ref={avatarAudioRef}
          autoPlay
          playsInline
          className="hidden"
        />
      </div>

      {/* Controls bar */}
      <div className="px-6 py-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
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
