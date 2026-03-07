/** @type {import('next').NextConfig} */
const nextConfig = {
  // React StrictMode intentionally mounts/unmounts components twice in dev.
  // This is fundamentally incompatible with WebRTC (LiveKit) — the RTCPeerConnection
  // object gets invalidated during cleanup before room.connect() completes.
  reactStrictMode: false,
};

export default nextConfig;

