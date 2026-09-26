import type { NextConfig } from 'next';

function resolveBackendUrl(): string {
  let raw = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').trim();

  if (!raw) {
    return 'http://127.0.0.1:4000';
  }

  // Ensure valid HTTP/HTTPS protocol
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  // Strip all trailing slashes
  return raw.replace(/\/+$/, '');
}

const nextConfig: NextConfig = {
  // Allow mobile devices on the local network to connect to the dev server
  allowedDevOrigins: ['10.66.14.237', 'localhost', '127.0.0.1'],

  // Proxy all /backend/* requests to the NestJS server running locally or on Render.
  // Using 127.0.0.1 explicitly locally to avoid IPv6 ::1 resolution issues on Windows.
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
