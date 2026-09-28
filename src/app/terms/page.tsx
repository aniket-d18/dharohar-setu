'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, ShieldCheck, CheckCircle2, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        {/* Prototype Draft Notice */}
        <div className="mb-6 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B54A3A]/10 border border-[#B54A3A]/30 text-[#B54A3A] text-xs font-mono font-medium">
          <span>Prototype — Draft Policy</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#2A2420] font-medium mb-3">
          Terms of Contribution
        </h1>
        <p className="text-xs sm:text-sm text-[#2A2420]/70 font-sans mb-8 leading-relaxed">
          Welcome to Dharohar Setu. By accessing or depositing oral recordings, folktales, artisan techniques, or living concepts into the archive, you agree to the following terms designed to safeguard community heritage with dignity.
        </p>

        <div className="space-y-8 font-sans text-xs sm:text-sm text-[#2A2420]/85 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#2F6E5D] font-semibold text-sm sm:text-base mb-3">
              <Scale className="w-4 h-4 shrink-0" />
              <h2>1. Contribution License &amp; Cultural Stewardship</h2>
            </div>
            <p className="mb-2 text-[#2A2420]/80">
              When you deposit cultural materials to Dharohar Setu:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                <strong>Community Ownership:</strong> You and your community retain cultural and moral ownership over your traditions, stories, and expressions.
              </li>
              <li>
                <strong>Preservation License:</strong> You grant Dharohar Setu a non-exclusive, royalty-free license to store, format, transcribe, translate, and display the content for non-commercial educational, linguistic preservation, and research purposes.
              </li>
              <li>
                <strong>Open Access:</strong> Content marked as "Public" is made accessible to the public under Creative Commons Attribution-NonCommercial (CC BY-NC 4.0) principles to prevent commercial exploitation.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#C97A3D] font-semibold text-sm sm:text-base mb-3">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <h2>2. Informed Consent &amp; Ethical Recording</h2>
            </div>
            <p className="mb-2 text-[#2A2420]/80">
              As a contributor, you represent and warrant that:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>You obtained informed consent from the speaker, singer, elder, or artisan prior to recording.</li>
              <li>You will not upload sacred, secret, or gender-restricted rituals intended only for private community initiation without proper elder authorization.</li>
              <li>You will not deposit defamatory, infringing, or harmful material.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#2F6E5D] font-semibold text-sm sm:text-base mb-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <h2>3. Community Peer Review &amp; Verification</h2>
            </div>
            <p className="mb-2 text-[#2A2420]/80">
              Dharohar Setu operates on a decentralized, multi-tier community verification framework:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                <strong>Verification Status:</strong> Records are initially marked as <em>Unverified</em>. Native speakers and appointed Community Stewards verify phonetic transcriptions, cultural meanings, and regional dialects.
              </li>
              <li>
                <strong>Peer Corrections:</strong> Reviewers and experts may append linguistic annotations, correct phonetic spellings, or open dispute logs if inaccuracies exist.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#B54A3A] font-semibold text-sm sm:text-base mb-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h2>4. No Guarantee of Absolute Authenticity</h2>
            </div>
            <p className="mb-2 text-[#2A2420]/80">
              Dharohar Setu is a living, crowdsourced cultural archive:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                While our verification badges indicate peer and expert review, the platform does not warrant absolute historic, legal, or linguistic accuracy of any single narrative or folklore claim.
              </li>
              <li>
                Oral traditions naturally exhibit regional variations, poetic licenses, and dialectical evolutions. Diverse versions of the same folktale are celebrated as living variants rather than errors.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#2F6E5D] font-semibold text-sm sm:text-base mb-3">
              <BookOpen className="w-4 h-4 shrink-0" />
              <h2>5. Platform Integrity &amp; Takedown Requests</h2>
            </div>
            <p className="text-[#2A2420]/80">
              We reserve the right to unpublish or remove any submission that violates community guidelines, lacks elder consent, or infringes copyright. To request the removal of any record, visit your <Link href="/profile" className="text-[#C97A3D] hover:underline font-medium">Profile</Link> or reach out to a platform steward.
            </p>
          </section>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-8 pt-6 border-t border-[#E4DDD0] flex items-center justify-between">
          <Link
            href="/capture"
            className="inline-flex items-center space-x-1.5 text-xs text-[#2A2420]/70 hover:text-[#C97A3D] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Capture</span>
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-[#C97A3D] hover:underline font-medium"
          >
            Read Privacy Policy &rarr;
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
