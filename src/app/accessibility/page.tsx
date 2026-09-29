'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, Volume2, Type, Keyboard, Globe, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20 overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-sans text-[#C97A3D] font-medium hover:underline mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>

        {/* Status Badge */}
        <div className="mb-4 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#2F6E5D]/10 border border-[#2F6E5D]/30 text-[#2F6E5D] text-xs font-mono font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>WCAG 2.1 AA Standards • Universal Heritage Access</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#2A2420] font-semibold mb-3">
          Accessibility Statement
        </h1>
        <p className="text-xs sm:text-sm text-[#2A2420]/70 font-sans mb-8 leading-relaxed">
          Dharohar Setu is committed to ensuring digital accessibility for all citizens, including individuals with visual, auditory, motor, or cognitive disabilities, as well as elders and oral custodians without traditional literacy.
        </p>

        <div className="space-y-6 font-sans text-xs sm:text-sm text-[#2A2420]/85 leading-relaxed">
          {/* Section 1: Oral First Architecture */}
          <section className="bg-[#FFFCF7] p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#C97A3D] font-semibold text-sm sm:text-base mb-3">
              <Volume2 className="w-4 h-4 shrink-0" />
              <h2>1. Oral-First &amp; Audio Accessibility</h2>
            </div>
            <p className="text-[#2A2420]/80 mb-3">
              Many vulnerable cultural traditions exist solely in spoken form among non-literate community elders. Our platform is engineered to support audio-first engagement:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                <strong>One-Tap Voice Recording:</strong> The capture interface allows direct voice deposition without requiring written typing or form completion.
              </li>
              <li>
                <strong>Native Audio Playback:</strong> High-fidelity audio waveforms and speed controls allow easy listening for elders and researchers.
              </li>
              <li>
                <strong>Dual Vernacular Transcripts:</strong> Audio recordings provide synchronized textual representations and Romanized phonetic transcripts where available.
              </li>
            </ul>
          </section>

          {/* Section 2: Visual & High Contrast */}
          <section className="bg-[#FFFCF7] p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#2F6E5D] font-semibold text-sm sm:text-base mb-3">
              <Eye className="w-4 h-4 shrink-0" />
              <h2>2. Contrast &amp; Visual Design</h2>
            </div>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                <strong>Warm Ivory Museum Palette:</strong> Designed with low glare and high readability, conforming to WCAG 2.1 AA contrast ratios (4.5:1 for body copy).
              </li>
              <li>
                <strong>Legible Multi-Script Typography:</strong> Uses Work Sans for crisp interface labels, Fraunces for headings, and Noto Serif Devanagari for native Indic scripts.
              </li>
              <li>
                <strong>Descriptive Alt Text:</strong> Cultural artifacts, field photographs, and historical textiles include descriptive textual metadata for screen reader users.
              </li>
            </ul>
          </section>

          {/* Section 3: Keyboard & Navigation */}
          <section className="bg-[#FFFCF7] p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#9C4D18] font-semibold text-sm sm:text-base mb-3">
              <Keyboard className="w-4 h-4 shrink-0" />
              <h2>3. Keyboard &amp; Device Compatibility</h2>
            </div>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                <strong>Full Keyboard Navigability:</strong> All navigation menus, dropdowns, audio players, and recording dialogs are navigable via standard keyboard focus (`Tab`, `Enter`, `Escape`).
              </li>
              <li>
                <strong>Screen Reader Optimization:</strong> Proper semantic HTML elements (&lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, &lt;section&gt;, &lt;footer&gt;) with ARIA landmark attributes.
              </li>
              <li>
                <strong>Touch Friendly Sizing:</strong> Mobile interactive elements conform to minimum 44×44px touch target guidelines.
              </li>
            </ul>
          </section>

          {/* Section 4: Feedback & Assistance */}
          <section className="bg-[#FFFCF7] p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#C5A55A] font-semibold text-sm sm:text-base mb-3">
              <Globe className="w-4 h-4 shrink-0" />
              <h2>4. Feedback &amp; Accessibility Inquiries</h2>
            </div>
            <p className="text-[#2A2420]/80 mb-3">
              We continually audit our components to improve usability for every community. If you experience any barrier accessing cultural records or need assistance in your native dialect, please reach out to us:
            </p>
            <div className="bg-[#FAF7F1] p-3.5 rounded-xl border border-[#E4DDD0] text-xs space-y-1">
              <p><strong>Email:</strong> accessibility@dharohar-setu.org</p>
              <p><strong>Initiative:</strong> National Digital Heritage Preservation Network</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
