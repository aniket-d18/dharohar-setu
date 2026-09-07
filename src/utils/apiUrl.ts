/**
 * Dynamically resolves the backend API URL.
 * In the browser, it adapts to the current hostname (localhost, local IP like 10.x.x.x, or production domain)
 * ensuring mobile devices on the same Wi-Fi seamlessly connect to the backend on port 4000.
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol || 'http:';
    const hostname = window.location.hostname || 'localhost';
    return `${protocol}//${hostname}:4000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

export const API_BASE_URL = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
