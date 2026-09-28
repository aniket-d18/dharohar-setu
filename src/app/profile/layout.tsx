import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contributor Profile & Passbook',
  description: 'View your documented cultural recordings, verification trust score, community badges, and impact across Indian heritage preservation.',
  openGraph: {
    title: 'Contributor Profile & Passbook | Dharohar Setu',
    description: 'Track your contributions, verifications, and badges on Dharohar Setu.',
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
