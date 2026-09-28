import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deposit Oral Heritage',
  description: 'Document, record, and preserve endangered folk songs, native dialects, oral histories, and living cultural traditions with explicit ethical consent.',
  openGraph: {
    title: 'Deposit Oral Heritage | Dharohar Setu',
    description: 'Contribute field recordings and cultural traditions to India’s national living heritage repository.',
  },
};

export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
