"use client";

import React, { forwardRef } from "react";

interface CandidateTileProps {
  isMuted: boolean;
  isCameraOff: boolean;
}

export const CandidateTile = forwardRef<HTMLVideoElement, CandidateTileProps>(
  ({ isMuted, isCameraOff }, ref) => {
  return (
    <div className="relative w-64 h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 shadow-lg border border-gray-600/50">
      {!isCameraOff ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
          style={{ transform: "scaleX(-1)" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <span className="text-white text-xs font-medium bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
          You
        </span>
        {isMuted && (
          <span className="bg-red-500/90 backdrop-blur-sm p-1 rounded-full">
            <svg
              className="w-3 h-3 text-white"
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
          </span>
        )}
      </div>
    </div>
  );
});

CandidateTile.displayName = "CandidateTile";

export default CandidateTile;
