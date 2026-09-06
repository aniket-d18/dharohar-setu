import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'Dharohar Setu — Living Cultural Atlas of India',
  description: 'Community-driven archive for documenting, verifying, and exploring India’s living cultural heritage.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF7F1] text-[#2A2420] font-sans antialiased min-h-screen">
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
