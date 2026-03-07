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
      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl border border-gray-700/50">
        <video
          ref={ref}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-300 text-sm font-medium">
                Connecting to interviewer...
              </p>
            </div>
          </div>
        )}
        {isThinking && isConnected && (
          <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-gray-300 text-xs">Thinking...</span>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? "bg-green-400 shadow-lg shadow-green-400/50"
                : isConnected
                ? "bg-blue-400"
                : "bg-gray-500"
            }`}
          />
          <span className="text-white text-xs font-medium bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            AI Interviewer
          </span>
        </div>
      </div>
    );
  }
);

AvatarTile.displayName = "AvatarTile";

export default AvatarTile;
