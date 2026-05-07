import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for static image optimization with local files
  images: {
    unoptimized: false,
  },
  // Ensure clean output for Vercel
  output: undefined,
};

export default nextConfig;
