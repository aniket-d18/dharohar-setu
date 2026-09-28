import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Archive & Catalog',
  description: 'Explore verified folk songs, oral stories, ritual traditions, and cultural heritage records across 36 States & Union Territories of India.',
  openGraph: {
    title: 'Archive & Catalog | Dharohar Setu',
    description: 'Explore verified folk songs, oral stories, ritual traditions, and cultural heritage records across India.',
  },
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
