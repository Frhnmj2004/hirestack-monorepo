"use client";

import React, { forwardRef } from "react";

interface AvatarTileProps {
  isSpeaking: boolean;
  isConnected: boolean;
  isThinking: boolean;
}

const AvatarTile = forwardRef<HTMLVideoElement, AvatarTileProps>(
  ({ isSpeaking, isConnected, isThinking }, ref) => {
    return (
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
        {/* Background — shown when no video feed yet */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1629] via-[#111827] to-[#0a0f1e]" />

        {/* Ambient pulse ring when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-3xl ring-2 ring-blue-500/40 animate-pulse" />
            <div className="absolute -inset-1 rounded-3xl bg-blue-500/5 animate-pulse" />
          </div>
        )}

        {/* Grid overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Video element */}
        <video
          ref={ref}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-10"
        />

        {/* Connecting overlay */}
        {!isConnected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080c14]/80 backdrop-blur-sm">
            <div className="text-center space-y-5">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-blue-500/20 animate-spin" />
                <div className="absolute inset-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white/80 text-sm font-medium">Connecting to AI Interviewer</p>
                <p className="text-gray-500 text-xs">Setting up your session...</p>
              </div>
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && isConnected && (
          <div className="absolute bottom-5 left-5 z-20">
            <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
              <span className="text-gray-300 text-xs font-medium">AI is thinking...</span>
            </div>
          </div>
        )}

        {/* Name badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                isSpeaking
                  ? "bg-green-400 shadow-sm shadow-green-400/60 animate-pulse"
                  : isConnected
                  ? "bg-blue-400"
                  : "bg-gray-600"
              }`}
            />
            <span className="text-white/80 text-xs font-medium">AI Interviewer</span>
          </div>
        </div>
      </div>
    );
  }
);

AvatarTile.displayName = "AvatarTile";

export default AvatarTile;
