import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peer Verification Queue',
  description: 'Community and expert validation queue for reviewing audio recordings, transcription authenticity, and cultural metadata.',
  openGraph: {
    title: 'Peer Verification Queue | Dharohar Setu',
    description: 'Peer-review and validate cultural heritage records to maintain archival authenticity.',
  },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
