import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Cultural Consent',
  description: 'Our ethical framework, cultural consent guidelines, and data protection standards for preserving indigenous traditions and oral recordings.',
  openGraph: {
    title: 'Privacy Policy & Cultural Consent | Dharohar Setu',
    description: 'Learn about community ownership, consent tiers, and ethical AI processing on Dharohar Setu.',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
