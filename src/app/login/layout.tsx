import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Sign In',
  description: 'Access Dharohar Setu to document heritage records, review and peer-verify oral traditions, and safeguard India’s cultural memory.',
  openGraph: {
    title: 'Community Sign In | Dharohar Setu',
    description: 'Sign in to access your contributor passbook and review cultural records.',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
