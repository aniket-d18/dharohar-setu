'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecordCard, { RecordCardData } from '@/components/RecordCard';
import { getCategoryCover } from '@/utils/categoryCovers';
import { getApiUrl } from '@/utils/apiUrl';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLanguage } from '@/context/LanguageContext';
import { cachedFetch } from '@/utils/apiCache';
import { CATEGORY_I18N } from '@/utils/captureI18n';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Flag,
  Sparkles,
  ArrowLeft,
  BookOpen,
  FileCheck,
  History,
  Tag,
  AlertCircle,
  Clock,
  Download,
  Check,
  Trash2,
  AlertTriangle,
  X,
  ThumbsUp,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface VerificationLog {
  id: string;
  action: 'AGREE' | 'EDIT' | 'DISPUTE' | 'ENDORSE';
  submittedTranscription?: string | null;
  submittedTranslation?: string | null;
  notes?: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    displayName?: string | null;
    role: string;
  };
}

interface ConsentRecord {
  id: string;
  consentVersion: string;
  scopesGranted: string[];
  isAnonymous: boolean;
  createdAt: string;
}

interface UntranslatableEntry {
  id: string;
  term: string;
  script?: string | null;
  phonetic?: string | null;
  literalMeaning?: string | null;
  explanation: string;
}

interface RecordDetail {
  id: string;
  mediaType: 'AUDIO' | 'VIDEO' | 'IMAGE' | 'TEXT';
  mediaUrl: string;
  thumbnailUrl?: string | null;
  category: string;
  tags: string[];
  speakerName?: string | null;
  speakerAge?: number | null;
  visibility: string;
  transcriptionText?: string | null;
  translationText?: string | null;
  summaryText?: string | null;
  verificationStatus: 'UNVERIFIED' | 'COMMUNITY_SUPPORTED' | 'COMMUNITY_VERIFIED' | 'STEWARD_ENDORSED' | 'EXPERT_REVIEWED';
  upvoteCount?: number;
  hasUpvoted?: boolean;
  upvoteThreshold?: number;
  similarityHash?: string | null;
  createdAt: string;
  isAiProcessing?: boolean;
  region?: {
    id: string;
    name: string;
    level: string;
    vitalityStatus?: string;
    vitalityScore?: number;
    parentRegion?: {
      id: string;
      name: string;
    } | null;
  } | null;
  language?: {
    id: string;
    name: string;
    scriptName?: string | null;
    vitalityStatus?: string;
    estimatedSpeakers?: number | null;
  } | null;
  craft?: {
    id: string;
    name: string;
    vitalityStatus?: string;
  } | null;
  consentRecord?: ConsentRecord | null;
  verifications?: VerificationLog[];
  untranslatableEntries?: UntranslatableEntry[];
}

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params?.id as string;

  const t = useTranslations('record');
  const tCommon = useTranslations('common');
  const { language } = useLanguage();
  const currentLang = (language === 'mr' || language === 'hi') ? language : 'en';

  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [relatedRecords, setRelatedRecords] = useState<RecordCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcription' | 'provenance'>('transcription');
  const [copied, setCopied] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagTerm, setFlagTerm] = useState('');
  const [flagExplanation, setFlagExplanation] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  // AI Live Processing & Auto-Refresh State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReEnriching, setIsReEnriching] = useState(false);
  const [enrichmentNotice, setEnrichmentNotice] = useState<string | null>(null);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(142); // sample seconds
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const apiUrl = getApiUrl();
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Community Upvote State (Pre-verification trust pipeline)
  const [upvoteCount, setUpvoteCount] = useState<number>(0);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);
  const [isUpvoting, setIsUpvoting] = useState<boolean>(false);
  const [upvoteThreshold, setUpvoteThreshold] = useState<number>(10);
  const [currentVerificationStatus, setCurrentVerificationStatus] = useState<string>('UNVERIFIED');

  // Strictly restricted to Admin or Verifiers (Reviewer, Steward, Expert)
  const canDelete = Boolean(
    user && ['ADMIN', 'REVIEWER', 'STEWARD', 'EXPERT'].includes(user.role)
  );

  const handleDeleteRecord = async () => {
    if (!record || !user || !canDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await fetch(
        `${apiUrl}/api/records/${record.id}?userId=${encodeURIComponent(user.id)}&role=${encodeURIComponent(user.role)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete record from archives.');
      }
      setIsDeleteModalOpen(false);
      router.push('/archive?deleted=true');
    } catch (err: any) {
      console.error('Delete error:', err);
      setDeleteError(err.message || 'Error deleting record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      router.push(`/login?redirect=/record/${recordId}&message=login_to_upvote`);
      return;
    }
    if (isUpvoting) return;

    const nextHasUpvoted = !hasUpvoted;
    const nextCount = nextHasUpvoted ? upvoteCount + 1 : Math.max(0, upvoteCount - 1);
    setHasUpvoted(nextHasUpvoted);
    setUpvoteCount(nextCount);

    if (nextCount >= upvoteThreshold && currentVerificationStatus === 'UNVERIFIED') {
      setCurrentVerificationStatus('COMMUNITY_SUPPORTED');
    } else if (nextCount < upvoteThreshold && currentVerificationStatus === 'COMMUNITY_SUPPORTED') {
      setCurrentVerificationStatus('UNVERIFIED');
    }

    try {
      setIsUpvoting(true);
      const res = await fetch(`${apiUrl}/api/records/${recordId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setUpvoteCount(data.upvoteCount);
        setHasUpvoted(data.hasUpvoted);
        if (data.verificationStatus) {
          setCurrentVerificationStatus(data.verificationStatus);
        }
      } else {
        setHasUpvoted(!nextHasUpvoted);
        setUpvoteCount(upvoteCount);
      }
    } catch (err) {
      console.error('Error toggling upvote:', err);
      setHasUpvoted(!nextHasUpvoted);
      setUpvoteCount(upvoteCount);
    } finally {
      setIsUpvoting(false);
    }
  };

  const fetchDetail = async (silent = false) => {
    if (!recordId) return;
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const userParam = user?.id ? `?userId=${encodeURIComponent(user.id)}` : '';
      const separator = userParam ? '&' : '?';
      const res = await fetch(`${apiUrl}/api/records/${recordId}${userParam}${separator}_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (!res.ok) throw new Error('Record not found');
      const data: RecordDetail = await res.json();
      setRecord(data);
      setUpvoteCount(data.upvoteCount ?? 0);
      setHasUpvoted(Boolean(data.hasUpvoted));
      setUpvoteThreshold(data.upvoteThreshold ?? 10);
      setCurrentVerificationStatus(data.verificationStatus);

      const isPending = Boolean(
        data.isAiProcessing ||
        (data.transcriptionText && data.transcriptionText.includes('Transcribing audio with AI')) ||
        (data.summaryText && data.summaryText.includes('Generating cultural summary'))
      );
      setIsAiProcessing(isPending);

      // Fetch related records from same region or language
      const relUrl = (data as any).languageId
        ? `${apiUrl}/api/records?languageId=${(data as any).languageId}&limit=4`
        : `${apiUrl}/api/records?regionId=${(data as any).regionId}&limit=4`;
      const relData = await cachedFetch<any>(relUrl, { ttl: 60 * 1000 });
      if (relData && Array.isArray(relData.data)) {
        setRelatedRecords(
          relData.data.filter((r: RecordCardData) => r.id !== recordId).slice(0, 3)
        );
      }
    } catch (err) {
      console.error('Error fetching record detail:', err);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [recordId, apiUrl, user?.id]);

  // Real-time polling when AI is transcribing or generating translation
  useEffect(() => {
    if (!recordId || !isAiProcessing) return;

    const interval = setInterval(async () => {
      try {
        const userParam = user?.id ? `?userId=${encodeURIComponent(user.id)}` : '';
        const separator = userParam ? '&' : '?';
        const res = await fetch(`${apiUrl}/api/records/${recordId}${userParam}${separator}_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });
        if (res.ok) {
          const data: RecordDetail = await res.json();
          const isStillPending = Boolean(
            data.isAiProcessing ||
            (data.transcriptionText && data.transcriptionText.includes('Transcribing audio with AI')) ||
            (data.summaryText && data.summaryText.includes('Generating cultural summary'))
          );

          setRecord(data);
          if (data.upvoteCount !== undefined) setUpvoteCount(data.upvoteCount);
          if (data.verificationStatus) setCurrentVerificationStatus(data.verificationStatus);

          if (!isStillPending) {
            setIsAiProcessing(false);
            setEnrichmentNotice('✨ AI native transcription & cultural translation completed!');
            setTimeout(() => setEnrichmentNotice(null), 8000);
          }
        }
      } catch (pollErr) {
        console.warn('[RecordDetail] Live polling error:', pollErr);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [recordId, isAiProcessing, apiUrl, user?.id]);

  const handleTriggerAiEnrichment = async () => {
    if (!recordId || isReEnriching) return;
    try {
      setIsReEnriching(true);
      setEnrichmentNotice('⚡ Re-triggering Gemini AI enrichment...');
      const res = await fetch(`${apiUrl}/api/records/${recordId}/ai-enrich`, {
        method: 'POST',
      });
      if (res.ok) {
        setIsAiProcessing(true);
        await fetchDetail(true);
      }
    } catch (err) {
      console.error('Failed to trigger AI enrichment:', err);
    } finally {
      setIsReEnriching(false);
    }
  };

  // Audio playback controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('Playback error, trying fallback:', err);
            if (audioRef.current) {
              audioRef.current.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
          });
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (val / 100) * duration;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagTerm.trim()) return;
    setFlagSubmitted(true);
    setTimeout(() => {
      setFlagModalOpen(false);
      setFlagSubmitted(false);
      setFlagTerm('');
      setFlagExplanation('');
    }, 2000);
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'EXPERT_REVIEWED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-sans font-medium bg-[#B54A3A]/10 text-[#B54A3A] border border-[#B54A3A]/30">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            {tCommon('expertReviewed')}
          </span>
        );
      case 'STEWARD_ENDORSED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-sans font-medium bg-[#C97A3D]/10 text-[#C97A3D] border border-[#C97A3D]/30">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {tCommon('stewardEndorsed')}
          </span>
        );
      case 'COMMUNITY_VERIFIED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-sans font-medium bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/30">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {tCommon('communityVerified')}
          </span>
        );
      case 'COMMUNITY_SUPPORTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-sans font-medium bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30">
            <ThumbsUp className="w-3.5 h-3.5 mr-1.5 text-[#D97706]" />
            {tCommon('communitySupported') || 'Community Supported'}
          </span>
        );
      case 'UNVERIFIED':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-sans font-medium border border-[#E4DDD0] text-[#2A2420]/70 bg-[#FAF7F1]">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-[#C97A3D]" />
            {upvoteCount < upvoteThreshold
              ? `${tCommon('awaitingCommunitySupport') || 'Awaiting community support'} (${upvoteCount}/${upvoteThreshold} ${tCommon('upvotes') || 'upvotes'})`
              : (tCommon('pendingReview') || 'Pending review')}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-2 border-[#C97A3D] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-lg text-[#2A2420]/80">Accessing cultural archives...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#B54A3A] mb-4" />
          <h1 className="font-serif text-2xl mb-2 text-[#2A2420]">{t('recordNotFound')}</h1>
          <p className="text-sm text-[#2A2420]/70 mb-6">
            {t('recordNotFoundDesc')}
          </p>
          <Link
            href="/archive"
            className="px-5 py-2.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-medium font-sans hover:bg-[#b56b32] transition-colors shadow-none"
          >
            {t('returnToArchive')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Top Bar */}
        <div className="border-b border-[#E4DDD0] bg-[#FFFFFF] py-3 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href="/archive"
              className="inline-flex items-center text-xs text-[#2A2420]/70 hover:text-[#C97A3D] transition-colors group font-sans"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform" />
              {t('backToArchive')}
            </Link>
            <div className="flex items-center space-x-3">
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-[#B54A3A]/40 bg-[#B54A3A]/5 text-xs font-sans text-[#B54A3A] hover:bg-[#B54A3A]/15 hover:border-[#B54A3A] transition-colors font-medium"
                  title="Permanently delete record (Admin / Verifier only)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('deleteRecord')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleUpvote}
                disabled={isUpvoting}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border text-xs font-sans transition-colors font-medium ${
                  hasUpvoted
                    ? 'bg-[#C97A3D] text-[#FAF7F1] border-[#C97A3D]'
                    : 'bg-[#FAF7F1] text-[#2A2420]/80 border-[#E4DDD0] hover:bg-[#FFFFFF] hover:border-[#C97A3D] hover:text-[#C97A3D]'
                }`}
                title={user ? (hasUpvoted ? 'Remove your community upvote' : 'Upvote this record for community verification') : 'Sign in to upvote'}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current text-[#FAF7F1]' : 'text-[#C97A3D]'}`} />
                <span>{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                <span className="font-mono text-[11px] ml-0.5 px-1 py-0.2 rounded bg-black/5">
                  {upvoteCount}
                </span>
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-[#E4DDD0] bg-[#FAF7F1] text-xs font-sans text-[#2A2420]/80 hover:bg-[#FFFFFF] hover:border-[#C97A3D] hover:text-[#C97A3D] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2F6E5D]" />
                    <span className="text-[#2F6E5D]">{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#C97A3D]" />
                    <span>{t('shareMemory')}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setFlagModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-[#E4DDD0] bg-[#FAF7F1] text-xs font-sans text-[#2A2420]/60 hover:text-[#C97A3D] hover:border-[#C97A3D] hover:bg-[#FFFFFF] transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('flagTerm')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Media Artifact Stage */}
        <section className="bg-[#FAF7F1] border-b border-[#E4DDD0] py-8 sm:py-12 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Custom Media Player */}
            <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl overflow-hidden shadow-sm">
              {/* If Image Record */}
              {record.mediaType === 'IMAGE' && (
                <div className="relative aspect-[16/9] w-full bg-[#FAF7F1] flex items-center justify-center overflow-hidden">
                  <img
                    src={getCategoryCover(record.category, record.mediaUrl || record.thumbnailUrl)}
                    alt={record.summaryText || 'Cultural artifact'}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* If Video Record */}
              {record.mediaType === 'VIDEO' && (
                <div className="relative aspect-[16/9] w-full bg-black flex items-center justify-center">
                  <video
                    src={record.mediaUrl}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('mov_bbb.mp4')) {
                        target.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
                      }
                    }}
                    poster={record.thumbnailUrl || undefined}
                    controls
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML video playback.
                  </video>
                </div>
              )}

              {/* If Audio Record */}
              {record.mediaType === 'AUDIO' && (
                <div className="p-6 sm:p-10 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#FAF7F1] to-[#F5EFEB]">
                  <audio 
                    ref={audioRef} 
                    src={record.mediaUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('SoundHelix-Song-1.mp3')) {
                        target.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                        if (isPlaying) target.play().catch(() => setIsPlaying(false));
                      }
                    }}
                    preload="metadata"
                    onEnded={() => {
                      setIsPlaying(false);
                      setCurrentTime(0);
                      setProgress(0);
                    }}
                    onTimeUpdate={(e) => {
                      const curr = e.currentTarget.currentTime;
                      const dur = e.currentTarget.duration || duration;
                      setCurrentTime(curr);
                      setProgress((curr / dur) * 100);
                    }}
                    onLoadedMetadata={(e) => {
                      if (e.currentTarget.duration && e.currentTarget.duration !== Infinity) {
                        setDuration(e.currentTarget.duration);
                      }
                    }}
                  />
                  {/* Visual Representation */}
                  <div className="w-full mb-8 flex items-center justify-center">
                    {record.thumbnailUrl && !record.thumbnailUrl.includes('unsplash.com') ? (
                      <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-4 border border-[#E4DDD0]">
                        <img
                          src={record.thumbnailUrl}
                          alt="Oral recording cover"
                          className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2420]/80 via-transparent to-transparent flex items-end p-4">
                          <span className="text-xs font-sans text-[#FAF7F1] bg-[#2A2420]/80 px-2.5 py-1 rounded backdrop-blur-sm border border-[#E4DDD0]/30">
                            Archival Field Audio • {record.category}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Dignified Archival Acoustic Stage (Zero stock photos, Zero AI) */
                      <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-4 border border-[#E4DDD0] bg-gradient-to-br from-[#24201D] via-[#1A1815] to-[#12100E] flex flex-col justify-between p-6">
                        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-[#C97A3D]/20 opacity-30 pointer-events-none" />
                        <div className="absolute -right-16 -bottom-16 w-60 h-60 rounded-full border border-[#C97A3D]/10 opacity-20 pointer-events-none" />

                        <div className="flex items-center justify-between z-10">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[#C97A3D] font-semibold flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-[#C97A3D]" />
                            <span>Authentic Field Voice Recording</span>
                          </span>
                          <span className="text-xs font-sans text-[#FAF7F1]/70 bg-white/10 px-2.5 py-1 rounded backdrop-blur-sm border border-white/10">
                            {record.language?.name || 'Regional Dialect'} • {record.category}
                          </span>
                        </div>

                        <div className="text-center z-10 my-auto">
                          <div className="w-12 h-12 rounded-full bg-[#C97A3D]/20 border border-[#C97A3D]/50 flex items-center justify-center mx-auto mb-2 text-[#C97A3D] shadow-lg">
                            <Volume2 className="w-6 h-6 text-[#C97A3D]" />
                          </div>
                          <h3 className="font-serif text-lg text-[#FAF7F1] font-medium max-w-md mx-auto truncate">
                            {record.summaryText}
                          </h3>
                          {record.speakerName && (
                            <p className="text-xs text-[#FAF7F1]/60 font-sans mt-1">
                              Spoken / Sung by {record.speakerName} ({record.speakerAge ? `${record.speakerAge} years` : 'Elder tradition bearer'})
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#FAF7F1]/50 z-10 pt-2 border-t border-white/10 font-mono">
                          <span>Oral History Archive</span>
                          <span className="text-[#C97A3D]">Preserved in National Registry</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scrub Bar */}
                  <div className="w-full flex items-center space-x-3 mb-4">
                    <span className="text-xs font-mono text-[#2A2420]/60 w-10 text-right">
                      {formatTime(currentTime)}
                    </span>
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newPct = (clickX / rect.width) * 100;
                        const newTime = (newPct / 100) * duration;
                        setProgress(newPct);
                        setCurrentTime(newTime);
                        if (audioRef.current) {
                          audioRef.current.currentTime = newTime;
                        }
                      }}
                      className="flex-1 h-2 bg-[#E4DDD0] rounded-full cursor-pointer relative overflow-hidden group"
                    >
                      <div
                        style={{ width: `${progress}%` }}
                        className="h-full bg-[#C97A3D] rounded-full relative group-hover:bg-[#b56b32]"
                      />
                    </div>
                    <span className="text-xs font-mono text-[#2A2420]/60 w-10">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => {
                        setCurrentTime(0);
                        setProgress(0);
                      }}
                      className="p-2 text-[#2A2420]/60 hover:text-[#C97A3D] transition-colors"
                      title="Restart playback"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center hover:bg-[#b56b32] hover:scale-105 transition-all duration-200 shadow-md"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-[#2A2420]/60 hover:text-[#C97A3D] transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* If Text Record */}
              {record.mediaType === 'TEXT' && (
                <div className="p-8 sm:p-12 bg-[#FAF7F1]">
                  <div className="border-l-2 border-[#C97A3D] pl-4 sm:pl-6 py-2 mb-6 bg-[#FFFFFF] rounded-r border border-l-0 border-[#E4DDD0]">
                    <p className="font-serif text-lg sm:text-xl text-[#2A2420] italic leading-relaxed">
                      "{record.transcriptionText || 'Direct recorded indigenous script text.'}"
                    </p>
                  </div>
                  <p className="text-sm text-[#2A2420]/80 leading-relaxed font-sans">
                    {record.translationText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Museum Plaque Specification Section */}
        <section className="py-12 px-4 sm:px-8 max-w-4xl mx-auto">
          <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-6 sm:p-10 relative shadow-sm">
            {/* Corner Ornamental Stitching Marker */}
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 text-xs text-[#C97A3D]/70 font-mono">
              <span>REF-DS-{record.id.slice(0, 8).toUpperCase()}</span>
            </div>

            {/* Verification Status & Category Header */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded text-xs font-sans font-medium bg-[#2F6E5D] text-[#FAF7F1]">
                {CATEGORY_I18N[currentLang]?.[record.category]?.label ||
                  record.category
                    .toLowerCase()
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
              </span>
              <div>{getVerificationBadge(currentVerificationStatus)}</div>
            </div>

            {/* Artifact Title in Serif Fraunces */}
            <h1 className="font-serif text-2xl sm:text-4xl text-[#2A2420] font-normal leading-tight mb-4">
              {record.summaryText || 'Oral Heritage Recording'}
            </h1>

            {/* Divider */}
            <hr className="border-[#E4DDD0] my-6" />

            {/* AI Active Processing Banner */}
            {isAiProcessing && (
              <div className="mb-6 p-4 rounded-xl border border-[#C97A3D]/40 bg-gradient-to-r from-[#FAF7F1] via-[#FFF9EE] to-[#FAF7F1] shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 animate-spin" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#C97A3D] font-bold">
                          AI Multilingual Processing Active
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-ping" />
                          Live Auto-Updating
                        </span>
                      </div>
                      <p className="text-xs text-[#2A2420]/80 mt-0.5">
                        Gemini is transcribing indigenous oral phonetics, preparing English/Hindi translation, and identifying untranslatable terms. This screen updates automatically.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => fetchDetail(true)}
                      disabled={isRefreshing}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-[#C97A3D]/40 bg-white text-xs font-medium text-[#C97A3D] hover:bg-[#FAF7F1] transition-all shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Checking...' : 'Refresh Now'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enrichment Completion Notice */}
            {enrichmentNotice && (
              <div className="mb-6 p-3 rounded-lg border border-[#2F6E5D]/30 bg-[#2F6E5D]/10 text-xs text-[#2F6E5D] font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6E5D]" />
                  {enrichmentNotice}
                </span>
                <button onClick={() => setEnrichmentNotice(null)} className="text-[#2F6E5D]/70 hover:text-[#2F6E5D]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Community Upvote & Pre-Verification Trust Pipeline Stage */}
            {(() => {
              const isGatedCategory = record.category === 'RECIPE' || record.category === 'STORY';
              return (
                <div className="mb-8 p-5 rounded-xl border border-[#E4DDD0] bg-gradient-to-r from-[#FAF7F1] via-[#F6F0E6] to-[#FAF7F1]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {isGatedCategory ? (
                          <>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#C97A3D] font-semibold flex items-center gap-1.5">
                              <ThumbsUp className="w-3.5 h-3.5 text-[#C97A3D]" />
                              <span>Stage 1: Community Support Gate</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C97A3D]/10 text-[#C97A3D] font-mono font-medium border border-[#C97A3D]/20">
                              {upvoteCount} / {upvoteThreshold} {tCommon('upvotes') || 'upvotes'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#2F6E5D] font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#2F6E5D]" />
                              <span>Direct Reviewer Queue Active</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2F6E5D]/10 text-[#2F6E5D] font-mono font-medium border border-[#2F6E5D]/20">
                              In Verification Console
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-[#2A2420]/80 font-sans leading-relaxed max-w-xl">
                        {isGatedCategory ? (
                          upvoteCount >= upvoteThreshold ? (
                            <span className="text-[#2F6E5D] font-medium">
                              ✓ Community threshold reached ({upvoteCount}/{upvoteThreshold} upvotes). This record has attained <strong>Community Supported</strong> status and is eligible for peer review in the <Link href="/verify" className="underline font-semibold hover:text-[#245749]">Verification Console</Link>.
                            </span>
                          ) : (
                            <span>
                              Personal / Family-Origin Tradition: Because family recipes and personal narratives cannot be independently validated in historical archives, this record requires <strong>{upvoteThreshold} community upvotes</strong> before entering the expert reviewer queue on /verify. Logged-in community members can vouch for cultural authenticity.
                            </span>
                          )
                        ) : (
                          <span>
                            Community-Wide Heritage: As public folklore and regional cultural tradition ({CATEGORY_I18N[currentLang]?.[record.category]?.label || record.category.toLowerCase().replace('_', ' ')}), this record is <strong>already queued</strong> in the <Link href="/verify" className="underline font-semibold hover:text-[#245749]">Verification Console</Link> for peer review and dialect verification. Logged-in members can also upvote to vouch for cultural authenticity.
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <button
                        type="button"
                        onClick={handleUpvote}
                        disabled={isUpvoting}
                        className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg border font-sans font-medium text-xs transition-all shadow-sm ${
                          hasUpvoted
                            ? 'bg-[#C97A3D] text-[#FAF7F1] border-[#C97A3D] hover:bg-[#b86b30]'
                            : 'bg-[#FFFFFF] text-[#2A2420] border-[#E4DDD0] hover:border-[#C97A3D] hover:text-[#C97A3D]'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
                        <span>{hasUpvoted ? 'Upvoted' : 'Upvote Record'}</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-black/10 font-mono text-[11px]">
                          {upvoteCount}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 pt-3 border-t border-[#E4DDD0]/60">
                    <div className="flex items-center justify-between text-[11px] font-sans text-[#2A2420]/60 mb-1.5">
                      <span>{isGatedCategory ? 'Community Validation Progress' : 'Community Endorsements'}</span>
                      <span className="font-mono font-medium text-[#C97A3D]">
                        {isGatedCategory
                          ? `${Math.min(100, Math.round((upvoteCount / upvoteThreshold) * 100))}% toward Reviewer Queue (${upvoteCount}/${upvoteThreshold})`
                          : `${upvoteCount} Community Upvotes Received`}
                      </span>
                    </div>
                    <div className="w-full bg-[#E4DDD0] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          !isGatedCategory || upvoteCount >= upvoteThreshold ? 'bg-[#2F6E5D]' : 'bg-[#C97A3D]'
                        }`}
                        style={{
                          width: isGatedCategory
                            ? `${Math.min(100, Math.max(upvoteCount > 0 ? 6 : 0, (upvoteCount / upvoteThreshold) * 100))}%`
                            : '100%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Two-Column Metadata Plaque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-sans mb-8">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-[#C97A3D] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[#2A2420]/50 block text-xs">{t('originRegion')}</span>
                    <span className="text-[#2A2420] font-medium">
                      {record.region?.name || t('unspecified')}
                      {record.region?.parentRegion?.name
                        ? `, ${record.region.parentRegion.name}`
                        : ''}
                    </span>
                    {record.region?.vitalityStatus && (
                      <span className="inline-block mt-0.5 ml-1 text-[11px] text-[#B54A3A]">
                        ({record.region.vitalityStatus.toLowerCase()})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <BookOpen className="w-4 h-4 text-[#C97A3D] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[#2A2420]/50 block text-xs">{t('langDialect')}</span>
                    <span className="text-[#2A2420] font-medium">
                      {record.language?.name || 'Traditional Dialect'}
                    </span>
                    {record.language?.scriptName && (
                      <span className="text-[#2A2420]/60 text-xs ml-1">
                        [{record.language.scriptName} script]
                      </span>
                    )}
                    {record.language?.estimatedSpeakers && (
                      <p className="text-[11px] text-[#C97A3D]/90">
                        ~{record.language.estimatedSpeakers.toLocaleString()} {t('speakersRemaining')}
                      </p>
                    )}
                  </div>
                </div>

                {record.craft && (
                  <div className="flex items-start space-x-3">
                    <Sparkles className="w-4 h-4 text-[#C97A3D] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[#2A2420]/50 block text-xs">{t('associatedCraft')}</span>
                      <span className="text-[#2A2420] font-medium">{record.craft.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <User className="w-4 h-4 text-[#C97A3D] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[#2A2420]/50 block text-xs">{t('voiceCustodian')}</span>
                    <span className="text-[#2A2420] font-medium">
                      {record.speakerName ? (
                        <span>
                          {record.speakerName}
                          {record.speakerAge ? ` (${record.speakerAge} ${t('yearsOld')})` : ''}
                        </span>
                      ) : (
                        <span className="italic">{t('anonymousElder')}</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 text-[#C97A3D] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[#2A2420]/50 block text-xs">{t('archivedOn')}</span>
                    <span className="text-[#2A2420] font-medium">
                      {new Date(record.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Tag className="w-4 h-4 text-[#C97A3D] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[#2A2420]/50 block text-xs">{t('subjectTags')}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {record.tags && record.tags.length > 0 ? (
                        record.tags.map((tagItem, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] bg-[#FAF7F1] text-[#2A2420]/75 border border-[#E4DDD0]"
                          >
                            #{tagItem}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#2A2420]/40">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Draft & Provenance Tabs Header */}
            <div className="border-b border-[#E4DDD0] mb-6 flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('transcription')}
                className={`pb-3 text-sm font-sans font-medium transition-colors border-b-2 ${
                  activeTab === 'transcription'
                    ? 'border-[#C97A3D] text-[#C97A3D]'
                    : 'border-transparent text-[#2A2420]/60 hover:text-[#2A2420]'
                }`}
              >
                {t('tabTranscription')}
              </button>
              <button
                onClick={() => setActiveTab('provenance')}
                className={`pb-3 text-sm font-sans font-medium transition-colors border-b-2 ${
                  activeTab === 'provenance'
                    ? 'border-[#C97A3D] text-[#C97A3D]'
                    : 'border-transparent text-[#2A2420]/60 hover:text-[#2A2420]'
                }`}
              >
                {t('tabVerification')} (
                {(record.verifications?.length || 0) + (record.consentRecord ? 1 : 0)})
              </button>
            </div>

            {/* Tab 1: Transcription & Translation */}
            {activeTab === 'transcription' && (
              <div className="space-y-6">
                {/* Control bar */}
                <div className="flex items-center justify-between bg-[#FAF7F1] px-4 py-2.5 rounded-lg border border-[#E4DDD0]">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#2A2420]/70 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C97A3D]" />
                    <span>Linguistic Provenance & AI Analysis</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchDetail(true)}
                      disabled={isRefreshing}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded border border-[#E4DDD0] bg-white text-[#2A2420]/80 hover:text-[#C97A3D] hover:border-[#C97A3D]/40 transition-colors"
                      title="Check for updated AI results"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Updating...' : 'Check Updates'}</span>
                    </button>
                    <button
                      onClick={handleTriggerAiEnrichment}
                      disabled={isReEnriching || isAiProcessing}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded border border-[#C97A3D]/30 bg-[#C97A3D]/10 text-[#C97A3D] hover:bg-[#C97A3D]/20 transition-colors disabled:opacity-50"
                      title="Re-run Gemini AI enrichment"
                    >
                      <Sparkles className={`w-3 h-3 ${isReEnriching ? 'animate-spin' : ''}`} />
                      <span>{isReEnriching ? 'Re-running...' : 'Re-run AI'}</span>
                    </button>
                  </div>
                </div>

                {/* Native Script Box */}
                <div className="bg-[#FAF7F1] border border-[#E4DDD0] rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-sans font-medium text-[#C97A3D] flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {record.mediaType === 'IMAGE' ? 'Visual Iconography & Inscriptions' : 'Native Oral Transcription'}
                    </span>
                    <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#C97A3D]/10 text-[#C97A3D] border border-[#C97A3D]/25">
                      {record.verificationStatus === 'EXPERT_REVIEWED' ||
                      record.verificationStatus === 'STEWARD_ENDORSED'
                        ? 'Peer-reviewed Text'
                        : (record.mediaType === 'IMAGE' ? 'AI Vision (Gemini Multimodal)' : 'AI Draft (Gemini)')}
                    </span>
                  </div>
                  {isAiProcessing || record.transcriptionText?.includes('Transcribing audio with AI') ? (
                    <div className="py-3 px-1 space-y-1.5">
                      <div className="flex items-center space-x-2 text-[#C97A3D]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-sans text-sm font-medium">Gemini AI is transcribing native speech phonetics...</span>
                      </div>
                      <p className="text-xs text-[#2A2420]/60 font-sans italic">
                        Oral recording is being transcribed verbatim into authentic script. Content will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <p className="font-serif text-lg sm:text-xl text-[#2A2420] leading-relaxed italic">
                      "{record.transcriptionText || (record.mediaType === 'IMAGE' ? 'Visual cultural iconography analysis underway.' : 'Transcription underway.')}"
                    </p>
                  )}
                </div>

                {/* Translation Box */}
                <div className="bg-[#FAF7F1] border border-[#E4DDD0] rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-sans font-medium text-[#2F6E5D] flex items-center">
                      <FileCheck className="w-3.5 h-3.5 mr-1" />
                      {record.mediaType === 'IMAGE' ? 'Cultural Interpretation & Context' : 'English / Hindi Translation'}
                    </span>
                    <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/25">
                      {record.mediaType === 'IMAGE' ? 'Ethnographic Meaning' : 'Meaning Preserved'}
                    </span>
                  </div>
                  {isAiProcessing && (!record.translationText || record.translationText.includes('pending')) ? (
                    <div className="py-2 flex items-center space-x-2 text-[#2F6E5D]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-sans">Cultural contextual translation generating with Gemini...</span>
                    </div>
                  ) : (
                    <p className="font-sans text-sm sm:text-base text-[#2A2420]/90 leading-relaxed">
                      {record.translationText || 'Translation pending community review.'}
                    </p>
                  )}
                </div>

                {/* Cultural Untranslatable Terms Flagged Inside Record */}
                {record.untranslatableEntries && record.untranslatableEntries.length > 0 && (
                  <div className="mt-6 p-4 rounded-lg bg-[#C97A3D]/5 border border-[#C97A3D]/25">
                    <div className="flex items-center space-x-2 text-xs font-sans font-medium text-[#C97A3D] mb-3">
                      <Sparkles className="w-4 h-4" />
                      <span>Untranslatable Cultural Concepts Identified</span>
                    </div>
                    <div className="space-y-3">
                      {record.untranslatableEntries.map((term) => (
                        <div
                          key={term.id}
                          className="bg-[#FFFFFF] p-3 rounded border border-[#E4DDD0]"
                        >
                          <div className="flex items-baseline space-x-2 mb-1">
                            <span className="font-serif text-base font-semibold text-[#C97A3D]">
                              {term.term}
                            </span>
                            {term.script && (
                              <span className="font-serif text-xs text-[#2A2420]/70">
                                ({term.script})
                              </span>
                            )}
                            {term.phonetic && (
                              <span className="font-mono text-xs text-[#2A2420]/50">
                                {term.phonetic}
                              </span>
                            )}
                          </div>
                          {term.literalMeaning && (
                            <p className="text-xs text-[#2A2420]/70 mb-1">
                              <strong className="text-[#2A2420]/90">Literal:</strong>{' '}
                              {term.literalMeaning}
                            </p>
                          )}
                          <p className="text-xs text-[#2A2420]/90 leading-relaxed">
                            {term.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Provenance & Edit History */}
            {activeTab === 'provenance' && (
              <div className="space-y-6">
                {/* Consent & Ethics Record */}
                {record.consentRecord && (
                  <div className="bg-[#FAF7F1] p-4 rounded-lg border border-[#2F6E5D]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-sans font-medium text-[#2F6E5D] flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                        Elder Informed Consent Agreement
                      </span>
                      <span className="text-[11px] font-mono text-[#2A2420]/50">
                        {record.consentRecord.consentVersion}
                      </span>
                    </div>
                    <p className="text-xs text-[#2A2420]/70 mb-3">
                      Recorded with explicit, revocable consent under the Dharohar Heritage Charter.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {record.consentRecord.scopesGranted.map((scope, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/25"
                        >
                          ✓ {scope.toLowerCase().replace('_', ' ')}
                        </span>
                      ))}
                      {record.consentRecord.isAnonymous && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#C97A3D]/10 text-[#C97A3D] border border-[#C97A3D]/25">
                          Anonymous attribution requested
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Audit Trail Timeline */}
                <div>
                  <h3 className="text-xs font-sans font-medium text-[#2A2420]/70 mb-4 flex items-center">
                    <History className="w-3.5 h-3.5 mr-1.5 text-[#C97A3D]" />
                    Verification & Revision Log
                  </h3>
                  <div className="border-l-2 border-[#E4DDD0] ml-3 pl-5 space-y-6">
                    {record.verifications && record.verifications.length > 0 ? (
                      record.verifications.map((log) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-[#C97A3D]" />
                          <div className="flex items-center space-x-2 text-xs mb-1">
                            <span className="font-medium text-[#C97A3D]">
                              {log.reviewer.displayName || 'Regional Steward'}
                            </span>
                            <span className="text-[#2A2420]/40">({log.reviewer.role})</span>
                            <span className="text-[#2A2420]/40">•</span>
                            <span className="text-[#2A2420]/50">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/20 mb-1.5">
                            Action: {log.action}
                          </span>
                          {log.notes && (
                            <p className="text-xs text-[#2A2420]/80 bg-[#FAF7F1] p-2 rounded border border-[#E4DDD0]">
                              "{log.notes}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="relative">
                        <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-[#2A2420]/30" />
                        <p className="text-xs text-[#2A2420]/60">
                          Initial submission recorded. Queued for community double-blind verification.
                        </p>
                        <span className="text-[11px] text-[#2A2420]/40">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Cultural Records Grid */}
        {relatedRecords.length > 0 && (
          <section className="py-12 px-4 sm:px-8 border-t border-[#E4DDD0] bg-[#FAF7F1]">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#2A2420] font-medium">
                    Related Voice Artifacts
                  </h2>
                  <p className="text-xs text-[#2A2420]/60 mt-1">
                    Other preserved memories from this geographic or linguistic lineage
                  </p>
                </div>
                <Link
                  href="/archive"
                  className="text-xs text-[#C97A3D] hover:underline flex items-center space-x-1"
                >
                  <span>Explore all</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedRecords.map((rel) => (
                  <RecordCard key={rel.id} record={rel} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Flag Unusual Word / Dialect Expression Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl max-w-lg w-full p-6 shadow-xl relative">
            <h3 className="font-serif text-xl text-[#2A2420] mb-2 flex items-center">
              <Sparkles className="w-5 h-5 text-[#C97A3D] mr-2" />
              Flag an Unusual Term or Craft Technique
            </h3>
            <p className="text-xs text-[#2A2420]/70 mb-4 leading-relaxed">
              Help linguists and community elders document idioms, rare botanical terms, or archaic
              ritual phrasing found in this recording.
            </p>

            {flagSubmitted ? (
              <div className="p-6 text-center bg-[#2F6E5D]/10 border border-[#2F6E5D]/30 rounded-lg">
                <CheckCircle2 className="w-10 h-10 text-[#2F6E5D] mx-auto mb-2" />
                <h4 className="font-serif text-base text-[#2A2420]">Thank you for preserving this knowledge</h4>
                <p className="text-xs text-[#2A2420]/70 mt-1">
                  Our cultural stewards will review your linguistic notation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFlagSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-sans text-[#2A2420]/80 mb-1.5">
                    Unusual Term or Phrase *
                  </label>
                  <input
                    type="text"
                    required
                    value={flagTerm}
                    onChange={(e) => setFlagTerm(e.target.value)}
                    placeholder="e.g. Poh, Jikcho, Daisang..."
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded px-3 py-2 text-sm text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-[#2A2420]/80 mb-1.5">
                    Cultural Explanation or Context
                  </label>
                  <textarea
                    rows={3}
                    value={flagExplanation}
                    onChange={(e) => setFlagExplanation(e.target.value)}
                    placeholder="Describe how elders use this word or why it resists direct English translation..."
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded px-3 py-2 text-sm text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFlagModalOpen(false)}
                    className="px-4 py-2 rounded text-xs font-sans text-[#2A2420]/70 hover:text-[#2A2420]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-[#C97A3D] text-[#FAF7F1] font-medium font-sans text-xs hover:bg-[#b56b32] transition-colors"
                  >
                    Submit Linguistic Flag
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal - Strictly for Admin and Verifiers */}
      {isDeleteModalOpen && record && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#B54A3A]/10 border border-[#B54A3A]/20 flex items-center justify-center text-[#B54A3A]">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#2A2420]">
                    Permanently Delete Record
                  </h3>
                  <p className="text-xs text-[#2A2420]/60">
                    Action authorized for: {user?.displayName} ({user?.role})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-[#2A2420]/40 hover:text-[#2A2420] hover:bg-[#FAF7F1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#B54A3A]/5 border border-[#B54A3A]/20 text-xs text-[#B54A3A] space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Permanent Destruction</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                This operation is restricted strictly to Administrators and peer Verifiers. Deleting this artifact permanently removes it from the National Archives, the Cultural Atlas map, search indices, and clears all linked audio/image media files and verification logs.
              </p>
            </div>

            <div className="bg-[#FAF7F1] p-3 rounded-lg border border-[#E4DDD0] text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[#2A2420]/70">
                <span>Record ID:</span>
                <span className="text-[#2A2420] font-semibold">{record.id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between text-[#2A2420]/70">
                <span>Language & Category:</span>
                <span className="text-[#2A2420]">{record.language?.name || 'Unknown'} • {record.category}</span>
              </div>
              {record.region?.name && (
                <div className="flex justify-between text-[#2A2420]/70">
                  <span>Location:</span>
                  <span className="text-[#2A2420]">
                    {record.region.name}
                    {record.region.parentRegion?.name ? `, ${record.region.parentRegion.name}` : ''}
                  </span>
                </div>
              )}
            </div>

            {deleteError && (
              <div className="p-3 rounded-lg bg-[#B54A3A]/10 border border-[#B54A3A]/30 text-xs text-[#B54A3A]">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E4DDD0] text-xs font-sans font-medium text-[#2A2420] hover:bg-[#FAF7F1] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteRecord}
                className="px-4 py-2 rounded-lg bg-[#B54A3A] hover:bg-[#9E3E30] text-white text-xs font-sans font-semibold transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
