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
    <div className="flex items-center justify-center gap-3">
      {/* Mic button */}
      <button
        onClick={onToggleMute}
        disabled={!isConnected}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
        className={`group relative flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isMuted
              ? "bg-red-500/20 border border-red-500/40 shadow-lg shadow-red-500/20 group-hover:bg-red-500/30"
              : "bg-white/[0.07] border border-white/10 group-hover:bg-white/[0.12] group-hover:border-white/20"
          }`}
        >
          {isMuted ? (
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3z" />
            </svg>
          )}
        </div>
        <span className={`text-[10px] font-medium ${isMuted ? "text-red-400" : "text-gray-500"}`}>
          {isMuted ? "Unmute" : "Mute"}
        </span>
      </button>

      {/* Camera button */}
      <button
        onClick={onToggleCamera}
        disabled={!isConnected}
        title={isCameraOff ? "Turn on camera" : "Turn off camera"}
        className="group relative flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isCameraOff
              ? "bg-red-500/20 border border-red-500/40 shadow-lg shadow-red-500/20 group-hover:bg-red-500/30"
              : "bg-white/[0.07] border border-white/10 group-hover:bg-white/[0.12] group-hover:border-white/20"
          }`}
        >
          {isCameraOff ? (
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <span className={`text-[10px] font-medium ${isCameraOff ? "text-red-400" : "text-gray-500"}`}>
          {isCameraOff ? "Show" : "Camera"}
        </span>
      </button>

      {/* Divider */}
      <div className="w-px h-10 bg-white/[0.06] mx-2" />

      {/* End session */}
      <button
        onClick={onEndSession}
        title="End interview"
        className="group relative flex flex-col items-center gap-1.5"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center transition-all duration-200 group-hover:bg-red-500/30 group-hover:scale-105 shadow-lg shadow-red-600/20">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </div>
        <span className="text-[10px] font-medium text-red-400/70">End</span>
      </button>
    </div>
  );
}
