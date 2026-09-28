'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Database, Cpu, Trash2, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        {/* Prototype Draft Notice */}
        <div className="mb-6 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B54A3A]/10 border border-[#B54A3A]/30 text-[#B54A3A] text-xs font-mono font-medium">
          <span>Prototype — Draft Policy</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#2A2420] font-medium mb-3">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#2A2420]/70 font-sans mb-8 leading-relaxed">
          Dharohar Setu is a living digital repository committed to ethical preservation of India’s oral heritage, indigenous languages, and folklore. This policy outlines exactly what we collect, how it is processed, and how you retain ownership and control.
        </p>

        <div className="space-y-8 font-sans text-xs sm:text-sm text-[#2A2420]/85 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#2F6E5D] font-semibold text-sm sm:text-base mb-3">
              <Database className="w-4 h-4 shrink-0" />
              <h2>1. Information We Collect</h2>
            </div>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                <strong>Cultural Recordings &amp; Media:</strong> Voice recordings, video demonstrations, photographs of cultural artifacts, and native text folklore deposited by contributors.
              </li>
              <li>
                <strong>Speaker &amp; Custodian Attribution:</strong> Optional elder/speaker name, age, and cultural role (e.g., Elder, Singer, Storyteller, Artisan). Contributors may choose to remain completely anonymous.
              </li>
              <li>
                <strong>Geographic &amp; Dialect Context:</strong> State, district/region, native language or dialect name, and optional GPS coordinates if provided during recording.
              </li>
              <li>
                <strong>Account Information:</strong> If you sign in, we store your display name and email address or phone number for authentication and reviewer credentials.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#2F6E5D] font-semibold text-sm sm:text-base mb-3">
              <Lock className="w-4 h-4 shrink-0" />
              <h2>2. Where Data is Stored</h2>
            </div>
            <p className="mb-2 text-[#2A2420]/80">
              Your data is stored securely in structured infrastructure:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                <strong>Database:</strong> Relational metadata, translations, verification records, and user roles are stored in PostgreSQL hosted on Supabase / Render cloud servers.
              </li>
              <li>
                <strong>Media Files:</strong> Audio buffers, videos, and images are stored in secure server storage with authenticated access controls.
              </li>
              <li>
                We do not sell personal data, display commercial advertisements, or share contributor information with data brokers.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#C97A3D] font-semibold text-sm sm:text-base mb-3">
              <Cpu className="w-4 h-4 shrink-0" />
              <h2>3. Third-Party AI Processing (Google Gemini)</h2>
            </div>
            <p className="mb-2 text-[#2A2420]/80">
              When the <strong>AI transcription &amp; translation</strong> toggle is enabled on submission:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                Your audio recording or transcription prompt is sent to Google's Gemini API service (e.g. Gemini 3.5/3.6 Flash) for speech phonetics transcription, English/Hindi translation, and extraction of untranslatable cultural ontologies.
              </li>
              <li>
                <strong>Opt-Out:</strong> If you turn off the AI toggle, Google Gemini is completely bypassed. Your record is marked for manual human verification and translation by community stewards.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#2F6E5D] font-semibold text-sm sm:text-base mb-3">
              <Eye className="w-4 h-4 shrink-0" />
              <h2>4. Granular Consent &amp; Visibility Scopes</h2>
            </div>
            <p className="mb-2 text-[#2A2420]/80">
              Every deposit requires explicit confirmation of consent from the participants. You control the scope of access:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li><strong>Public:</strong> Open to researchers, schools, and citizens for cultural education and preservation.</li>
              <li><strong>Community Only:</strong> Visible only to verified community stewards and registered regional members.</li>
              <li><strong>Private:</strong> Retained securely in your personal archive vault without public indexing.</li>
              <li><strong>Anonymous Custodian:</strong> Suppresses your personal name on public display plaques.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs">
            <div className="flex items-center space-x-2.5 text-[#B54A3A] font-semibold text-sm sm:text-base mb-3">
              <Trash2 className="w-4 h-4 shrink-0" />
              <h2>5. Data Removal &amp; Deletion Rights</h2>
            </div>
            <p className="text-[#2A2420]/80 mb-3">
              You retain the right to remove any cultural record you have deposited:
            </p>
            <ul className="space-y-2 list-disc list-inside text-[#2A2420]/80">
              <li>
                <strong>Self-Service:</strong> You can delete or edit your own records at any time directly through your <Link href="/profile" className="text-[#C97A3D] hover:underline font-medium">Profile</Link> or <Link href="/dashboard" className="text-[#C97A3D] hover:underline font-medium">Dashboard</Link>.
              </li>
              <li>
                <strong>Cascade Deletion:</strong> When a record is deleted, all associated audio files, translations, AI summaries, consent records, and reviewer logs are permanently purged from the database.
              </li>
              <li>
                <strong>Community Requests:</strong> If you are a member of a community whose sacred tradition was uploaded without proper elder consent, contact our stewards to initiate immediate removal.
              </li>
            </ul>
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
            href="/terms"
            className="text-xs text-[#C97A3D] hover:underline font-medium"
          >
            Read Terms of Contribution &rarr;
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
