import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Home, Search, BookOpen, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found',
  description: 'The requested page could not be located in India’s living cultural heritage repository.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        {/* Cultural Motif Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#C97A3D]/10 border border-[#C97A3D]/30 text-[#9C4D18] text-xs font-mono font-medium mb-6">
          <span>Error 404 • Uncharted Path</span>
        </div>

        {/* 404 Serif Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl text-[#2A2420] font-semibold tracking-tight mb-4">
          Record Not Found
        </h1>

        {/* Descriptive Body */}
        <p className="font-sans text-base sm:text-lg text-[#2A2420]/75 max-w-xl mx-auto mb-8 leading-relaxed">
          The page or archival record you are looking for has either been relocated, uncatalogued, or does not exist in our digital repository.
        </p>

        {/* Main Action Links (Home & Explore) */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-[#2F6E5D] text-[#FAF7F1] font-sans text-sm font-medium hover:bg-[#25584a] transition-all shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/archive"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-[#FFFFFF] border border-[#E4DDD0] text-[#2A2420] font-sans text-sm font-medium hover:border-[#C97A3D] hover:text-[#9C4D18] transition-all shadow-xs"
          >
            <Compass className="w-4 h-4 text-[#9C4D18]" />
            <span>Explore Cultural Archive</span>
          </Link>
        </div>

        {/* Quick Nav Suggestions */}
        <div className="mt-12 pt-8 border-t border-[#E4DDD0] w-full max-w-md">
          <span className="text-xs font-mono uppercase tracking-wider text-[#2A2420]/60 block mb-3">
            Popular Destinations
          </span>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-sans">
            <Link
              href="/atlas"
              className="px-3 py-1.5 rounded-md bg-[#FAF7F1] border border-[#E4DDD0] text-[#2A2420]/80 hover:border-[#2F6E5D] hover:text-[#2F6E5D] transition-colors"
            >
              Linguistic Atlas
            </Link>
            <Link
              href="/untranslatable"
              className="px-3 py-1.5 rounded-md bg-[#FAF7F1] border border-[#E4DDD0] text-[#2A2420]/80 hover:border-[#2F6E5D] hover:text-[#2F6E5D] transition-colors"
            >
              Untranslatable Terms
            </Link>
            <Link
              href="/capture"
              className="px-3 py-1.5 rounded-md bg-[#FAF7F1] border border-[#E4DDD0] text-[#2A2420]/80 hover:border-[#2F6E5D] hover:text-[#2F6E5D] transition-colors"
            >
              Deposit Record
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
