'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, useTranslations, LANGUAGE_OPTIONS } from '@/context/LanguageContext';
import { getApiUrl } from '@/utils/apiUrl';
import { cachedFetch } from '@/utils/apiCache';
import { countQueued, flushQueue } from '@/utils/syncManager';
import {
  User,
  FolderHeart,
  Bookmark,
  Globe,
  Settings,
  LogOut,
  LogIn,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  ChevronRight,
  ExternalLink,
  Shield,
  Award,
  RefreshCw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface MyRecord {
  id: string;
  category: string;
  mediaType: string;
  createdAt: string;
  verificationStatus: string;
  region?: { name: string };
  language?: { name: string };
  transcriptionText?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const [activeSection, setActiveSection] = useState<'contributions' | 'saved' | 'settings'>('contributions');
  const [myRecords, setMyRecords] = useState<MyRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedRecords, setSavedRecords] = useState<{ id: string; title: string; language: string }[]>([]);

  // Fetch user's personal contributions
  useEffect(() => {
    if (!user) return;
    setRecordsLoading(true);
    const apiUrl = getApiUrl();

    cachedFetch<MyRecord[]>(`${apiUrl}/api/records/my`, { ttl: 5 * 60 * 1000 })
      .then((data) => {
        if (Array.isArray(data)) setMyRecords(data);
      })
      .catch((err) => console.error('Failed to load contributions:', err))
      .finally(() => setRecordsLoading(false));
  }, [user]);

  // Load offline queue status & saved records from localStorage
  useEffect(() => {
    countQueued()
      .then(setOfflinePendingCount)
      .catch(() => {});

    try {
      const saved = localStorage.getItem('dharohar_bookmarks');
      if (saved) {
        setSavedRecords(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSyncOffline = async () => {
    setIsSyncing(true);
    try {
      await flushQueue();
      const remaining = await countQueued();
      setOfflinePendingCount(remaining);
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMMUNITY_VERIFIED':
      case 'STEWARD_ENDORSED':
      case 'EXPERT_REVIEWED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#2F6E5D]/15 text-[#2F6E5D] border border-[#2F6E5D]/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'COMMUNITY_SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#6B8F5E]/15 text-[#2F6E5D] border border-[#6B8F5E]/30">
            <span>Community Supported</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#C97A3D]/15 text-[#C97A3D] border border-[#C97A3D]/30">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {/* ========================================================= */}
        {/* 1. USER IDENTITY CARD                                     */}
        {/* ========================================================= */}
        <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-[#2F6E5D] text-[#FAF7F1] flex items-center justify-center font-serif text-xl font-bold shrink-0 shadow-xs">
                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="font-serif text-xl font-medium text-[#2A2420]">
                      {user.displayName}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#C97A3D]/15 text-[#C97A3D] border border-[#C97A3D]/30 uppercase tracking-tight">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#2A2420]/65 font-sans mt-0.5">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-[#2F6E5D] font-medium mt-1">
                    <span className="inline-flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>{user.points || 0} pts</span>
                    </span>
                    <span>•</span>
                    <span>{myRecords.length} submissions</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="self-start sm:self-center inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#B54A3A]/30 text-[#B54A3A] hover:bg-[#B54A3A]/10 text-xs font-sans font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F1] border-2 border-[#E4DDD0] text-[#2A2420]/50 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-serif text-lg font-medium text-[#2A2420]">
                    Guest Contributor
                  </h1>
                  <p className="text-xs text-[#2A2420]/70 font-sans mt-0.5 max-w-sm">
                    Sign in to track your oral records, receive peer review feedback, and earn reviewer status.
                  </p>
                </div>
              </div>

              <Link
                href="/login?redirect=/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#2F6E5D] text-[#FAF7F1] text-xs font-sans font-medium hover:bg-[#235346] transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. SECTION TABS                                           */}
        {/* ========================================================= */}
        <div className="flex items-center border-b border-[#E4DDD0] mb-5 overflow-x-auto no-scrollbar gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('contributions')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-sans font-medium flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'contributions'
                ? 'border-[#C97A3D] text-[#C97A3D]'
                : 'border-transparent text-[#2A2420]/60 hover:text-[#2A2420]'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            <span>Contributions</span>
            {myRecords.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#C97A3D]/10 text-[#C97A3D]">
                {myRecords.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('saved')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-sans font-medium flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'saved'
                ? 'border-[#2F6E5D] text-[#2F6E5D]'
                : 'border-transparent text-[#2A2420]/60 hover:text-[#2A2420]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Records</span>
            {savedRecords.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#2F6E5D]/10 text-[#2F6E5D]">
                {savedRecords.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-sans font-medium flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'settings'
                ? 'border-[#2A2420] text-[#2A2420]'
                : 'border-transparent text-[#2A2420]/60 hover:text-[#2A2420]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Language & Settings</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 3. SECTION CONTENT                                        */}
        {/* ========================================================= */}

        {/* --- SECTION: CONTRIBUTIONS --- */}
        {activeSection === 'contributions' && (
          <div className="space-y-4">
            {!user ? (
              <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-8 text-center">
                <FolderHeart className="w-10 h-10 text-[#C97A3D]/40 mx-auto mb-3" />
                <h3 className="font-serif text-base font-medium text-[#2A2420] mb-1">
                  Track Your Submissions
                </h3>
                <p className="text-xs text-[#2A2420]/65 max-w-sm mx-auto mb-4">
                  When you sign in, every oral tradition, folk song, and ritual you record is saved to your account.
                </p>
                <Link
                  href="/login?redirect=/profile"
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-[#2F6E5D] text-white text-xs font-sans font-medium hover:bg-[#235346] transition-colors"
                >
                  <span>Sign In</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            ) : recordsLoading ? (
              <div className="p-8 text-center bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl text-xs text-[#2A2420]/60">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#C97A3D]" />
                <span>Loading your contributions...</span>
              </div>
            ) : myRecords.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-8 text-center">
                <FolderHeart className="w-10 h-10 text-[#C97A3D]/40 mx-auto mb-3" />
                <h3 className="font-serif text-base font-medium text-[#2A2420] mb-1">
                  No Contributions Yet
                </h3>
                <p className="text-xs text-[#2A2420]/65 max-w-sm mx-auto mb-4">
                  Help document India's living cultural memories before they vanish.
                </p>
                <Link
                  href="/capture"
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-[#C97A3D] text-white text-xs font-sans font-medium hover:bg-[#B86B30] transition-colors"
                >
                  <span>Record an Oral Tradition</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myRecords.map((r) => (
                  <Link
                    key={r.id}
                    href={`/record/${r.id}`}
                    className="block bg-[#FFFFFF] border border-[#E4DDD0] hover:border-[#C97A3D] rounded-xl p-4 transition-all shadow-none group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-sm font-medium text-[#2A2420] group-hover:text-[#C97A3D] transition-colors">
                            {r.category.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 text-[#2A2420]/60">
                            {r.mediaType}
                          </span>
                        </div>
                        <p className="text-xs text-[#2A2420]/60 mt-0.5">
                          {r.language?.name || 'Oral Tradition'} {r.region ? `• ${r.region.name}` : ''}
                        </p>
                      </div>
                      <div>{getStatusBadge(r.verificationStatus)}</div>
                    </div>
                    {r.transcriptionText && (
                      <p className="text-xs text-[#2A2420]/80 line-clamp-2 italic font-serif bg-[#FAF7F1] p-2.5 rounded-lg border border-[#E4DDD0]/60 mt-2">
                        "{r.transcriptionText}"
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-[#2A2420]/50 pt-2 mt-2 border-t border-[#E4DDD0]/60">
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <span className="text-[#C97A3D] font-medium flex items-center space-x-1">
                        <span>View plaque</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- SECTION: SAVED RECORDS --- */}
        {activeSection === 'saved' && (
          <div className="space-y-4">
            {savedRecords.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-8 text-center">
                <Bookmark className="w-10 h-10 text-[#2F6E5D]/40 mx-auto mb-3" />
                <h3 className="font-serif text-base font-medium text-[#2A2420] mb-1">
                  No Saved Records
                </h3>
                <p className="text-xs text-[#2A2420]/65 max-w-sm mx-auto mb-4">
                  Tap the bookmark icon on any record in the archive to save it for quick offline listening.
                </p>
                <Link
                  href="/archive"
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-[#2F6E5D] text-white text-xs font-sans font-medium hover:bg-[#235346] transition-colors"
                >
                  <span>Explore Heritage Archive</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedRecords.map((item) => (
                  <Link
                    key={item.id}
                    href={`/record/${item.id}`}
                    className="flex items-center justify-between p-3.5 bg-[#FFFFFF] border border-[#E4DDD0] hover:border-[#2F6E5D] rounded-xl transition-all shadow-none"
                  >
                    <div>
                      <h4 className="font-serif text-sm font-medium text-[#2A2420]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#2A2420]/60 mt-0.5">{item.language}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#2A2420]/40" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- SECTION: LANGUAGE & SETTINGS --- */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            {/* Language Selection */}
            <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl p-5 shadow-none">
              <div className="flex items-center space-x-2 text-xs font-sans font-semibold uppercase tracking-wider text-[#2F6E5D] mb-3">
                <Globe className="w-4 h-4" />
                <span>Display Language / भाषा</span>
              </div>
              <p className="text-xs text-[#2A2420]/70 mb-3">
                Select your preferred interface language:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setLanguage(opt.code)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs font-sans ${
                      language === opt.code
                        ? 'bg-[#2F6E5D] border-[#2F6E5D] text-white font-semibold shadow-xs'
                        : 'bg-[#FAF7F1] border-[#E4DDD0] text-[#2A2420] hover:border-[#2F6E5D]/40'
                    }`}
                  >
                    <span className="font-medium block">{opt.label}</span>
                    <span className={`text-[10px] block mt-0.5 ${language === opt.code ? 'text-white/80' : 'text-[#2A2420]/50'}`}>
                      {opt.code.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Database Telemetry */}
            <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl p-5 shadow-none">
              <div className="flex items-center space-x-2 text-xs font-sans font-semibold uppercase tracking-wider text-[#C97A3D] mb-3">
                <Wifi className="w-4 h-4" />
                <span>Offline Storage & Sync</span>
              </div>
              <p className="text-xs text-[#2A2420]/70 mb-4 leading-relaxed">
                Dharohar Setu caches heritage records in IndexedDB for offline village fieldwork.
              </p>

              <div className="bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-3.5 flex items-center justify-between gap-3 mb-4 text-xs font-sans">
                <div>
                  <span className="font-medium text-[#2A2420] block">
                    Pending Offline Submissions
                  </span>
                  <span className="text-[11px] text-[#2A2420]/60">
                    {offlinePendingCount === 0
                      ? 'All records synced with the national repository'
                      : `${offlinePendingCount} records waiting for internet connection`}
                  </span>
                </div>
                {offlinePendingCount > 0 && (
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleSyncOffline}
                    className="px-3 py-1.5 rounded-lg bg-[#C97A3D] text-white text-xs font-medium hover:bg-[#B86B30] disabled:opacity-50 transition-colors shrink-0"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-[#E4DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#2A2420]/60">
                <span>IndexedDB Protocol: v2.4 (Active)</span>
                <span className="font-mono text-[11px]">Storage Engine: Web Crypto + IndexedDB</span>
              </div>
            </div>

            {/* National Observatory Link for deep analytics */}
            <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl p-5 shadow-none">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-medium text-[#2A2420]">
                    National Preservation Observatory
                  </h4>
                  <p className="text-xs text-[#2A2420]/65 mt-0.5">
                    View nationwide language vulnerability and regional telemetry
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-lg border border-[#E4DDD0] hover:border-[#2F6E5D] text-xs font-sans font-medium text-[#2F6E5D] transition-colors"
                >
                  Open Observatory &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
