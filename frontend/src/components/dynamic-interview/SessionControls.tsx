"use client";

import React from "react";

interface SessionControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isConnected: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndSession: () => void;
}

export default function SessionControls({
  isMuted,
  isCameraOff,
  isConnected,
  onToggleMute,
  onToggleCamera,
  onEndSession,
}: SessionControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onToggleMute}
        disabled={!isConnected}
        className={`group relative p-4 rounded-full transition-all duration-200 ${
          isMuted
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted ? (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
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
        )}
      </button>

      <button
        onClick={onToggleCamera}
        disabled={!isConnected}
        className={`group relative p-4 rounded-full transition-all duration-200 ${
          isCameraOff
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isCameraOff ? "Turn on camera" : "Turn off camera"}
      >
        {isCameraOff ? (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
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
        )}
      </button>

      <button
        onClick={onEndSession}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg shadow-red-600/30"
        title="End interview"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
          />
        </svg>
      </button>
    </div>
  );
}
