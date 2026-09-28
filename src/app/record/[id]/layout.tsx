import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cultural Heritage Record',
  description: 'Preserved field recording, phonetic transcription, and cultural significance breakdown on Dharohar Setu.',
  openGraph: {
    title: 'Cultural Heritage Record | Dharohar Setu',
    description: 'Listen to verified oral traditions and endangered linguistic expressions from India.',
  },
};

export default function RecordDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
