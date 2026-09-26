import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder so the stray package-lock.json in the
  // parent directory doesn't confuse Next.js's inferred root detection.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
