import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Deposit & Heritage Commons',
  description: 'Terms of use, community ownership principles, and fair use guidelines governing the Dharohar Setu national repository.',
  openGraph: {
    title: 'Terms of Deposit & Heritage Commons | Dharohar Setu',
    description: 'Guidelines on non-commercial preservation, fair attribution, and community rights.',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
