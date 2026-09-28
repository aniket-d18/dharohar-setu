import { MetadataRoute } from 'next';

/**
 * Robots configuration for Dharohar Setu.
 *
 * NOTE FOR PUBLIC LAUNCH:
 * Currently, robots are blocked (disallow: '/') to prevent indexing of demo seed data.
 * When you are ready for full public indexing in Google / Bing search engines:
 * 1. Change `disallow: '/'` to `disallow: ['/api/', '/dashboard', '/verify', '/profile']`
 * 2. Add `allow: '/'`
 * 3. Update `robots` in src/app/layout.tsx to `{ index: true, follow: true }`
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
