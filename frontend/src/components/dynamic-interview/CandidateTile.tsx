"use client";

import React, { forwardRef } from "react";

interface CandidateTileProps {
  isMuted: boolean;
  isCameraOff: boolean;
}

export const CandidateTile = forwardRef<HTMLVideoElement, CandidateTileProps>(
  ({ isMuted, isCameraOff }, ref) => {
    return (
      <div className="relative w-52 h-36 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#0f1629]" />

        {/* Camera off placeholder */}
        {isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0e131f]/80 z-10">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-500 text-[10px]">Camera off</p>
            </div>
          </div>
        )}

        {/* Video */}
        {!isCameraOff && (
          <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        {/* Name label */}
        <div className="absolute bottom-2 left-2 z-20">
          <div className="bg-black/50 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5">
            <span className="text-white/80 text-[10px] font-medium">You</span>
          </div>
        </div>

        {/* Muted badge */}
        {isMuted && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-red-500/80 backdrop-blur-md rounded-lg p-1">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </div>
          </div>
        )}

        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] pointer-events-none z-30" />
      </div>
    );
  }
);

CandidateTile.displayName = "CandidateTile";
export default CandidateTile;
