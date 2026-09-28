import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Untranslatable Cultural Concepts',
  description: 'Dictionary of unique philosophical concepts, untranslatable words, and deep idioms across India’s indigenous languages.',
  openGraph: {
    title: 'Untranslatable Cultural Concepts | Dharohar Setu',
    description: 'Explore untranslatable cultural concepts and deep linguistic philosophy from Indian languages.',
  },
};

export default function UntranslatableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
