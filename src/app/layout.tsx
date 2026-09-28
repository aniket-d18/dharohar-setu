import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import ServerWakeupDetector from '@/components/ServerWakeupDetector';
import { Analytics } from '@vercel/analytics/react';

export const viewport: Viewport = {
  themeColor: '#FAF7F1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dharohar-setu.org'),
  title: {
    default: 'Dharohar Setu — Living Cultural Atlas of India',
    template: '%s | Dharohar Setu',
  },
  description: 'National repository for documenting, peer-verifying, and preserving India’s endangered oral traditions, folk songs, and living cultural heritage.',
  applicationName: 'Dharohar Setu',
  authors: [{ name: 'Dharohar Setu Community & Ministry of Culture' }],
  keywords: [
    'Indian Cultural Heritage',
    'Endangered Languages',
    'Oral Traditions',
    'Folk Songs',
    'Linguistic Atlas',
    'Living Heritage',
    'Indigenous Folklore',
  ],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/images/logo.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/images/logo.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://dharohar-setu.org',
    siteName: 'Dharohar Setu',
    title: 'Dharohar Setu — Living Cultural Atlas of India',
    description: 'Preserving India’s endangered oral traditions, folk songs, ceremonies, and ancient craftsmanship before they vanish.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Dharohar Setu — Living Cultural Atlas of India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dharohar Setu — Living Cultural Atlas of India',
    description: 'Preserving India’s endangered oral traditions, folk songs, ceremonies, and ancient craftsmanship before they vanish.',
    images: ['/opengraph-image'],
  },
  // NOTE FOR PUBLIC LAUNCH:
  // Currently set to noindex / nofollow while app contains prototype demo accounts.
  // Switch to `index: true, follow: true` upon public launch.
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF7F1] text-[#2A2420] font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <ServerWakeupDetector />
            {children}
            <Analytics />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
