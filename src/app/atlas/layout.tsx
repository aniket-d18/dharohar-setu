import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linguistic & Cultural Atlas',
  description: 'Interactive map of India’s linguistic diversity, dialect vitality matrix, endangered language zones, and regional heritage distribution.',
  openGraph: {
    title: 'Linguistic & Cultural Atlas | Dharohar Setu',
    description: 'Explore dialect vitality, state-level language distribution, and cultural geographic traditions.',
  },
};

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
