import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preservation Dashboard',
  description: 'National overview of archived oral traditions, dialect vitality indices, verification throughput, and geographic coverage across India.',
  openGraph: {
    title: 'Preservation Dashboard | Dharohar Setu',
    description: 'Analytics, vitality statistics, and preservation metrics for Indian cultural heritage.',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
