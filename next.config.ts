import type { NextConfig } from 'next';
import path from 'path';

function resolveBackendUrl(): string {
  const backendUrl = (process.env.BACKEND_URL || '').trim();
  if (backendUrl) {
    let url = backendUrl;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    return url.replace(/\/+$/, '');
  }

  // When developing locally on Windows/Node, use loopback directly to avoid
  // Wi-Fi interface routing latency and timeouts.
  return 'http://127.0.0.1:4000';
}

const nextConfig: NextConfig = {
  // Disable floating dev-mode error / status overlay so it never blocks mobile navigation controls
  devIndicators: false,

  // Set Turbopack root explicitly to avoid parent directory warning
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Allow mobile devices on the local network to connect to the dev server
  allowedDevOrigins: ['10.66.14.237', 'localhost', '127.0.0.1'],

  // Proxy all /backend/* requests to the NestJS server running locally or on Render.
  async rewrites() {
    const backendUrl = resolveBackendUrl();
    return [
      {
        source: '/backend/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
