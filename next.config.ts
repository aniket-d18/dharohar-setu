import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow mobile devices on the local network to connect to the dev server
  allowedDevOrigins: ['10.66.14.237'],

  // Proxy all /backend/* requests to the NestJS server running on 127.0.0.1:4000
  // Using 127.0.0.1 explicitly to avoid IPv6 ::1 resolution issues on Windows.
  // This allows mobile devices on the same Wi-Fi to access the backend
  // without needing to open port 4000 in the firewall.
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://127.0.0.1:4000/:path*',
      },
    ];
  },
};

export default nextConfig;
