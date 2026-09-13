/**
 * Dynamically resolves the backend API URL.
 *
 * In the browser we route through the Next.js rewrite proxy at /backend/*
 * so the phone only ever talks to port 3000 (which is already firewall-allowed).
 * On the server side (SSR / API routes) we talk directly to localhost:4000.
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser: use the same origin via Next.js rewrite proxy
    return `${window.location.origin}/backend`;
  }
  // Server-side: talk directly to the backend
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

export const API_BASE_URL = typeof window !== 'undefined'
  ? '' // Will be set at runtime via getApiUrl()
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

