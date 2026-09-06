'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Feather,
  Award,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck,
  Building,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const errorParam = searchParams.get('error');

  const { login, demoAccounts, sharedDemoPassword, hasAdminConfigured, adminEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'reviewers_only'
      ? 'Access restricted: The Verification Console is reserved for Reviewers, Stewards, and Administrators. Please sign in with an authorized role account.'
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Authentication successful. Redirecting...');
      setTimeout(() => {
        router.push(redirectPath);
      }, 600);
    } else {
      setErrorMessage(res.error || 'Failed to authenticate. Check your email and password.');
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(sharedDemoPassword);
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await login(demoEmail, sharedDemoPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(`Signed in as demo user. Redirecting to ${redirectPath === '/verify' ? 'Verification Console' : 'portal'}...`);
      setTimeout(() => {
        router.push(redirectPath);
      }, 600);
    } else {
      setErrorMessage(res.error || 'Demo login failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Banner if redirected from a role-gated page */}
      {errorParam === 'reviewers_only' && (
        <div className="mb-8 p-4 rounded-lg bg-[#C97A3D]/10 border border-[#C97A3D]/30 text-[#2A2420] flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-[#C97A3D] shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-[#C97A3D]">Verification Console Authorization Required</p>
            <p className="text-[#2A2420]/80 mt-1">
              Validating community contributions and resolving linguistic disputes requires peer or elder accreditation.
              Choose the <strong>Reviewer</strong> or <strong>Steward</strong> demo account below to test the verification workflow.
            </p>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="max-w-md mx-auto bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-8 mb-12 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#C97A3D]/10 border border-[#C97A3D]/30 text-[#C97A3D] mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#2A2420] font-medium tracking-tight">
            Sign In to Dharohar Setu
          </h1>
          <p className="text-xs text-[#2A2420]/70 font-sans mt-2">
            Access your heritage guardian workspace, badges, and verification permissions
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-md bg-[#B54A3A]/10 border border-[#B54A3A]/30 text-[#B54A3A] text-xs leading-relaxed flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-[#B54A3A] shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 rounded-md bg-[#2F6E5D]/10 border border-[#2F6E5D]/30 text-[#2F6E5D] text-xs leading-relaxed flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#2F6E5D] shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-[#2A2420]/80 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2A2420]/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.org"
                className="w-full pl-9 pr-3 py-2.5 rounded-md bg-[#FFFFFF] border border-[#E4DDD0] text-[#2A2420] text-sm placeholder-[#2A2420]/40 focus:outline-none focus:border-[#C97A3D] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2A2420]/80 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2A2420]/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-md bg-[#FFFFFF] border border-[#E4DDD0] text-[#2A2420] text-sm placeholder-[#2A2420]/40 focus:outline-none focus:border-[#C97A3D] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-md bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-sm hover:bg-[#B86B30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E4DDD0] text-center">
          <p className="text-xs text-[#2A2420]/60">
            Just want to submit a memory?{' '}
            <Link href="/capture" className="text-[#C97A3D] hover:underline font-medium">
              Contribute anonymously without an account →
            </Link>
          </p>
        </div>
      </div>

      {/* "Try the Demo" Role Showcase Section */}
      <div className="mt-8 border-t border-[#E4DDD0] pt-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C97A3D]/10 border border-[#C97A3D]/30 text-[#C97A3D] text-xs font-sans uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo Accounts</span>
          </div>
          <h2 className="font-serif text-2xl text-[#2A2420] font-medium">
            Explore Dharohar Setu Roles
          </h2>
          <p className="text-xs sm:text-sm text-[#2A2420]/70 max-w-xl mx-auto mt-2 font-sans">
            Test how different community roles interact with heritage preservation. Shared password for all demo accounts is{' '}
            <code className="px-2 py-0.5 rounded bg-[#C97A3D]/10 text-[#C97A3D] font-mono font-medium border border-[#C97A3D]/30">
              {sharedDemoPassword}
            </code>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Contributor */}
          <div className="rounded-xl bg-[#FFFFFF] border border-[#E4DDD0] p-6 flex flex-col justify-between hover:border-[#C97A3D]/40 transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#C97A3D]/10 border border-[#C97A3D]/30 flex items-center justify-center text-[#C97A3D]">
                  <Feather className="w-5 h-5" />
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-medium bg-[#C97A3D]/10 text-[#C97A3D] border border-[#C97A3D]/30">
                  Contributor
                </span>
              </div>

              <h3 className="font-serif text-lg text-[#2A2420] font-medium mb-1">
                Aarav Sharma
              </h3>
              <p className="text-xs text-[#C97A3D] font-mono mb-3">
                contributor@dharohar.org
              </p>
              <p className="text-xs text-[#2A2420]/75 font-sans leading-relaxed mb-4">
                Documents oral folklore, tribal lullabies, artisan handicraft stories, and village memories. Submissions are peer-reviewed before inclusion in the National Living Cultural Atlas.
              </p>

              <div className="bg-[#FAF7F1] rounded-md p-2.5 border border-[#E4DDD0] text-[11px] text-[#2A2420]/70 space-y-1 mb-6">
                <div className="flex justify-between">
                  <span>Community Points:</span>
                  <span className="font-mono text-[#C97A3D] font-semibold">120 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Badge Status:</span>
                  <span className="text-[#2A2420] font-medium">Oral Folklore Pioneer</span>
                </div>
                <div className="flex justify-between">
                  <span>Capture Access:</span>
                  <span className="text-[#2F6E5D] font-medium">Open (No login needed)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickDemoLogin('contributor@dharohar.org')}
              disabled={isSubmitting}
              className="w-full py-2 px-3 rounded-md bg-[#FAF7F1] hover:bg-[#C97A3D]/10 border border-[#C97A3D]/40 text-[#C97A3D] text-xs font-medium font-sans transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Login as Contributor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Reviewer */}
          <div className="rounded-xl bg-[#FFFFFF] border border-[#2F6E5D]/30 p-6 flex flex-col justify-between hover:border-[#2F6E5D]/60 transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#2F6E5D]/10 border border-[#2F6E5D]/30 flex items-center justify-center text-[#2F6E5D]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-medium bg-[#2F6E5D]/15 text-[#2F6E5D] border border-[#2F6E5D]/30">
                  Reviewer
                </span>
              </div>

              <h3 className="font-serif text-lg text-[#2A2420] font-medium mb-1">
                Dr. Sunita Devi
              </h3>
              <p className="text-xs text-[#2F6E5D] font-mono mb-3">
                reviewer@dharohar.org
              </p>
              <p className="text-xs text-[#2A2420]/75 font-sans leading-relaxed mb-4">
                Validates dialect transcription accuracy, checks audio acoustic fidelity, and provides cultural terminology notes. Granted full access to the Community Verification Console.
              </p>

              <div className="bg-[#FAF7F1] rounded-md p-2.5 border border-[#E4DDD0] text-[11px] text-[#2A2420]/70 space-y-1 mb-6">
                <div className="flex justify-between">
                  <span>Verification Rights:</span>
                  <span className="text-[#2F6E5D] font-medium">Full Console Access</span>
                </div>
                <div className="flex justify-between">
                  <span>Self-Review Guard:</span>
                  <span className="text-[#B54A3A]">Enforced (Cannot review own)</span>
                </div>
                <div className="flex justify-between">
                  <span>Badge Status:</span>
                  <span className="text-[#2A2420] font-medium">Acoustic Verifier</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickDemoLogin('reviewer@dharohar.org')}
              disabled={isSubmitting}
              className="w-full py-2 px-3 rounded-md bg-[#2F6E5D]/10 hover:bg-[#2F6E5D]/20 border border-[#2F6E5D]/40 text-[#2F6E5D] text-xs font-medium font-sans transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Login as Reviewer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Steward */}
          <div className="rounded-xl bg-[#FFFFFF] border border-[#C97A3D]/30 p-6 flex flex-col justify-between hover:border-[#C97A3D]/60 transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#C97A3D]/10 border border-[#C97A3D]/30 flex items-center justify-center text-[#C97A3D]">
                  <Building className="w-5 h-5" />
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-medium bg-[#C97A3D]/15 text-[#C97A3D] border border-[#C97A3D]/30">
                  Steward
                </span>
              </div>

              <h3 className="font-serif text-lg text-[#2A2420] font-medium mb-1">
                Rajeshwar Singh
              </h3>
              <p className="text-xs text-[#C97A3D] font-mono mb-3">
                steward@dharohar.org
              </p>
              <p className="text-xs text-[#2A2420]/75 font-sans leading-relaxed mb-4">
                Senior custodian and tribal council elder delegate. Endorses sacred folklore, resolves contested records, and grants formal heritage accreditation with official seal.
              </p>

              <div className="bg-[#FAF7F1] rounded-md p-2.5 border border-[#E4DDD0] text-[11px] text-[#2A2420]/70 space-y-1 mb-6">
                <div className="flex justify-between">
                  <span>Endorsement Authority:</span>
                  <span className="text-[#C97A3D] font-medium">Binding Cultural Seal</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispute Resolution:</span>
                  <span className="text-[#2F6E5D]">Elder Council Escalation</span>
                </div>
                <div className="flex justify-between">
                  <span>Badge Status:</span>
                  <span className="text-[#2A2420] font-medium">Heritage Custodian</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickDemoLogin('steward@dharohar.org')}
              disabled={isSubmitting}
              className="w-full py-2 px-3 rounded-md bg-[#C97A3D]/10 hover:bg-[#C97A3D]/20 border border-[#C97A3D]/40 text-[#C97A3D] text-xs font-medium font-sans transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Login as Steward</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Administrator Role Banner */}
        <div className="mt-8 rounded-xl bg-[#FFFFFF] border border-[#B54A3A]/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#B54A3A]/10 border border-[#B54A3A]/30 flex items-center justify-center text-[#B54A3A] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-base text-[#2A2420] font-medium">
                  Administrator Role (System Oversight)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold bg-[#B54A3A]/10 text-[#B54A3A] border border-[#B54A3A]/30">
                  Admin
                </span>
              </div>
              <p className="text-xs text-[#2A2420]/70 font-sans mt-1 leading-relaxed max-w-2xl">
                The Administrator holds final oversight across all verifications, disputes, and role configurations.
                In accordance with production security standards, admin credentials are not hardcoded — they are managed strictly via environment variables (
                <code className="text-[#C97A3D] font-mono">ADMIN_EMAIL</code> and <code className="text-[#C97A3D] font-mono">ADMIN_PASSWORD</code>) with cryptographic bcrypt hashing.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono shrink-0">
            {hasAdminConfigured ? (
              <div className="px-3 py-2 rounded-md bg-[#2F6E5D]/10 border border-[#2F6E5D]/30 text-[#2F6E5D]">
                <span>Configured in .env: </span>
                <span className="font-semibold">{adminEmail}</span>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-md bg-[#C97A3D]/10 border border-[#C97A3D]/30 text-[#C97A3D]">
                <span>Set ADMIN_EMAIL & ADMIN_PASSWORD in .env</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col selection:bg-[#C97A3D]/20">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh] text-[#C97A3D]">
              <span className="font-sans text-sm">Loading login portal...</span>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
