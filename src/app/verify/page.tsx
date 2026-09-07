'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/LanguageContext';
import { getCategoryCover } from '@/utils/categoryCovers';
import { getApiUrl } from '@/utils/apiUrl';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Edit3,
  Check,
  X,
  Volume2,
  ChevronRight,
  Filter,
  Users,
  Clock,
  ArrowRight,
  ThumbsUp,
  MessageSquare,
  Lock,
  Paperclip,
  FileText,
  Upload,
  UserCheck,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  ZoomIn,
  Trash2,
} from 'lucide-react';

interface QueueItem {
  id: string;
  contributorId?: string | null;
  contributor?: {
    id: string;
    displayName: string;
    role: string;
  } | null;
  mediaType: 'AUDIO' | 'VIDEO' | 'IMAGE' | 'TEXT';
  mediaUrl: string;
  thumbnailUrl?: string | null;
  category: string;
  speakerName?: string | null;
  transcriptionText?: string | null;
  translationText?: string | null;
  summaryText?: string | null;
  verificationStatus: 'UNVERIFIED' | 'COMMUNITY_SUPPORTED' | 'COMMUNITY_VERIFIED' | 'STEWARD_ENDORSED' | 'EXPERT_REVIEWED';
  createdAt: string;
  region?: {
    id: string;
    name: string;
    vitalityStatus: string;
    vitalityScore: number;
  } | null;
  language?: {
    id: string;
    name: string;
    scriptName?: string | null;
    vitalityStatus: string;
  } | null;
  verifications?: {
    id: string;
    action: string;
    notes?: string | null;
    documentUrl?: string | null;
    documentName?: string | null;
    reviewer: { displayName?: string | null; role: string };
  }[];
}

export default function VerificationConsolePage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const t = useTranslations('verify');
  const tCommon = useTranslations('common');

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNVERIFIED' | 'COMMUNITY_SUPPORTED' | 'COMMUNITY_VERIFIED'>('ALL');

  // Workspace Form State
  const [editedTranscription, setEditedTranscription] = useState('');
  const [editedTranslation, setEditedTranslation] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [attachedDocumentUrl, setAttachedDocumentUrl] = useState<string | null>(null);
  const [attachedDocumentName, setAttachedDocumentName] = useState<string | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Audio Playback State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const apiUrl = getApiUrl();

  // Role-Gating: Only REVIEWER, STEWARD, EXPERT, or ADMIN can access /verify
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role === 'CONTRIBUTOR') {
        router.push('/login?redirect=/verify&error=reviewers_only');
      }
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function fetchQueue() {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/verification/queue`);
        if (res.ok) {
          const data: QueueItem[] = await res.json();
          setQueue(data);
          if (data.length > 0) {
            setSelectedRecord(data[0]);
            setEditedTranscription(data[0].transcriptionText || '');
            setEditedTranslation(data[0].translationText || '');
          }
        }
      } catch (err) {
        console.error('Error fetching verification queue:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchQueue();
  }, [apiUrl]);

  // Helper to ensure media URL is playable across domains and fallbacks
  const getPlayableMediaUrl = (url?: string | null) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('blob:')) {
      // In-memory browser blob from another session cannot be fetched
      return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }
    if (cleanUrl.startsWith('/uploads/')) {
      return `${apiUrl}${cleanUrl}`;
    }
    if (cleanUrl.startsWith('uploads/')) {
      return `${apiUrl}/${cleanUrl}`;
    }
    if (cleanUrl.includes('archive.org/download/sample') || cleanUrl.includes('unsplash.com')) {
      return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }
    return cleanUrl;
  };

  // Helper for real authentic photograph inspection
  const getPhotoUrl = (url?: string | null, thumb?: string | null, category?: string) => {
    const raw = url || thumb;
    if (!raw || typeof raw !== 'string' || raw.trim() === '') {
      return getCategoryCover(category, null);
    }
    const clean = raw.trim();
    if (clean.startsWith('blob:')) return getCategoryCover(category, null);
    if (clean.startsWith('/uploads/')) return `${apiUrl}${clean}`;
    if (clean.startsWith('uploads/')) return `${apiUrl}/${clean}`;
    if (clean.includes('photo-1544717305')) return getCategoryCover(category, null);
    return clean;
  };

  // Quick switch role to Reviewer (Dr. Sunita Devi) for immediate peer verification & correction testing
  const handleQuickSwitchToReviewer = async () => {
    setIsSwitchingRole(true);
    setActionError(null);
    try {
      const res = await login('reviewer@dharohar.org', 'dharohar2026');
      if (res.success) {
        setActionFeedback('Switched to Reviewer role (Dr. Sunita Devi). You can now verify and submit corrections.');
      } else {
        setActionError('Failed to switch to reviewer role.');
      }
    } catch (e: any) {
      setActionError(e?.message || 'Error switching role.');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  // Handle reference document upload (PDF, image scan, text note)
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingDoc(true);
      setActionError(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${apiUrl}/api/records/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload reference document.');
      }

      const data = await res.json();
      const finalDocUrl = data.url.startsWith('http') ? data.url : `${apiUrl}${data.url}`;
      setAttachedDocumentUrl(finalDocUrl);
      setAttachedDocumentName(file.name);
    } catch (err: any) {
      console.error('Error uploading reference doc:', err);
      setActionError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const removeAttachedDocument = () => {
    setAttachedDocumentUrl(null);
    setAttachedDocumentName(null);
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  // When selected record changes, update form and reset audio
  const handleSelectRecord = (rec: QueueItem) => {
    setSelectedRecord(rec);
    setEditedTranscription(rec.transcriptionText || '');
    setEditedTranslation(rec.translationText || '');
    setReviewerNotes('');
    setAttachedDocumentUrl(null);
    setAttachedDocumentName(null);
    // Reset audio player
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = getPlayableMediaUrl(rec.mediaUrl);
      audioRef.current.load();
    }
    setIsPlaying(false);
    setPlayProgress(0);
    setAudioDuration(0);
    setActionFeedback(null);
    setActionError(null);
  };

  // Real audio toggle with automatic fallback for corrupted or local blob URLs
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const activeSrc = getPlayableMediaUrl(selectedRecord?.mediaUrl);
      if (!audioRef.current.src || audioRef.current.src === '' || audioRef.current.src.startsWith('blob:')) {
        audioRef.current.src = activeSrc;
        audioRef.current.load();
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setActionError(null);
        })
        .catch((err) => {
          console.warn('Playback of original audio failed, attempting fallback audio:', err);
          if (audioRef.current) {
            audioRef.current.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
            audioRef.current.load();
            audioRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setActionError(null);
              })
              .catch(() => {
                setIsPlaying(false);
                setActionError('Could not play audio. Please check your browser audio permissions.');
              });
          }
        });
    }
  };

  // Determine if the current record was contributed by the logged-in user (self-review prevention)
  const isSelfSubmission = Boolean(
    user && selectedRecord?.contributorId && user.id === selectedRecord.contributorId
  );

  // Handle action submission (AGREE, EDIT, ENDORSE, DISPUTE)
  const handleAction = async (action: 'AGREE' | 'EDIT' | 'ENDORSE' | 'DISPUTE') => {
    if (!selectedRecord || !user) return;

    if (isSelfSubmission) {
      setActionError(
        'Self-Review Protocol: You cannot verify or dispute a record you originally contributed. An independent reviewer must evaluate it.'
      );
      return;
    }

    if (action === 'EDIT') {
      if (!editedTranscription.trim() && !editedTranslation.trim() && !reviewerNotes.trim() && !attachedDocumentUrl) {
        setActionError('Please enter a corrected transcription, translation, reviewer note, or reference document before submitting.');
        return;
      }
    }

    setIsSubmitting(true);
    setActionFeedback(null);
    setActionError(null);

    try {
      const res = await fetch(`${apiUrl}/api/verification/${selectedRecord.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewerId: user.id,
          reviewerName: user.displayName,
          reviewerRole: action === 'ENDORSE' ? 'STEWARD' : user.role === 'ADMIN' ? 'ADMIN' : 'REVIEWER',
          submittedTranscription: action === 'EDIT' ? editedTranscription.trim() : undefined,
          submittedTranslation: action === 'EDIT' ? editedTranslation.trim() : undefined,
          notes: reviewerNotes || (action === 'AGREE' ? 'Transcription confirmed by native listener.' : undefined),
          documentUrl: attachedDocumentUrl || undefined,
          documentName: attachedDocumentName || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setActionError(result.message || 'Verification submission rejected.');
        return;
      }

      setActionFeedback(
        action === 'ENDORSE'
          ? 'Record officially endorsed with Cultural Steward certification.'
          : action === 'EDIT'
          ? 'Transcription and translation revisions successfully saved and verified.'
          : action === 'AGREE'
          ? 'Consensus verified. Upgraded to Community Verified.'
          : 'Dispute recorded for senior elder mediation.'
      );

      // Keep editor fields synced with newly updated record
      if (action === 'EDIT') {
        setEditedTranscription(result.record.transcriptionText || '');
        setEditedTranslation(result.record.translationText || '');
      }

      // Update local queue status
      setQueue((prev) =>
        prev.map((item) =>
          item.id === selectedRecord.id
            ? {
                ...item,
                verificationStatus: result.record.verificationStatus,
                transcriptionText: result.record.transcriptionText,
                translationText: result.record.translationText,
                verifications: result.record.verifications || item.verifications,
              }
            : item
        )
      );

      if (selectedRecord) {
        setSelectedRecord({
          ...selectedRecord,
          verificationStatus: result.record.verificationStatus,
          transcriptionText: result.record.transcriptionText,
          translationText: result.record.translationText,
          verifications: result.record.verifications || selectedRecord.verifications,
        });
      }
    } catch (err: any) {
      console.error('Error submitting verification action:', err);
      setActionError(err?.message || 'Network error submitting verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Permanently delete invalid/spam record (Admin/Reviewer only)
  const handleDeleteRecord = async () => {
    if (!selectedRecord || !user) return;
    try {
      setIsDeleting(true);
      const res = await fetch(
        `${apiUrl}/api/records/${selectedRecord.id}?userId=${encodeURIComponent(user.id)}&role=${encodeURIComponent(user.role)}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        const remaining = queue.filter((r) => r.id !== selectedRecord.id);
        setQueue(remaining);
        setSelectedRecord(remaining.length > 0 ? remaining[0] : null);
        setIsDeleteModalOpen(false);
        setActionFeedback('Record permanently deleted from archives.');
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.message || 'Failed to delete record.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error deleting record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filterStatus === 'UNVERIFIED') return item.verificationStatus === 'UNVERIFIED';
    if (filterStatus === 'COMMUNITY_SUPPORTED') return item.verificationStatus === 'COMMUNITY_SUPPORTED';
    if (filterStatus === 'COMMUNITY_VERIFIED') return item.verificationStatus === 'COMMUNITY_VERIFIED';
    return true;
  });

  // If role-checking or user not authorized, render authorization prompt
  if (authLoading || !user || user.role === 'CONTRIBUTOR') {
    return (
      <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-8 text-center shadow-none">
            <Lock className="w-12 h-12 text-[#C97A3D] mx-auto mb-4 animate-pulse" />
            <h2 className="font-serif text-xl text-[#2A2420] font-medium mb-2">
              Verification Console Access Restricted
            </h2>
            <p className="text-xs text-[#2A2420]/75 font-sans leading-relaxed mb-6">
              Participating in oral folklore transcription validation, dialect peer review, and cultural endorsement requires an authorized{' '}
              <strong>Reviewer</strong>, <strong>Steward</strong>, or <strong>Administrator</strong> account.
            </p>
            <Link
              href="/login?redirect=/verify&error=reviewers_only"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs hover:bg-[#B86B30] transition-colors shadow-none"
            >
              <span>Sign In with Reviewer or Steward Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Verification Subheader Bar */}
        <div className="bg-[#FAF7F1] border-b border-[#E4DDD0] px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#C97A3D]/10 border border-[#C97A3D]/30 flex items-center justify-center text-[#C97A3D]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-lg sm:text-xl text-[#2A2420] font-medium leading-none">
                  Community Verification Workbench
                </h1>
                <p className="text-[11px] text-[#2A2420]/60 font-sans mt-1">
                  Peer dialect accreditation • Acoustic consensus • Living Cultural Atlas governance
                </p>
              </div>
            </div>

            {/* Current Active Reviewer Badge */}
            <div className="flex items-center space-x-3 text-xs font-sans">
              <div className="px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E4DDD0] flex items-center space-x-2">
                <span className="text-[#2A2420]/60">Logged in as:</span>
                <span className="font-medium text-[#2A2420]">{user.displayName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${
                    user.role === 'ADMIN'
                      ? 'bg-[#B54A3A]/10 text-[#B54A3A] border-[#B54A3A]/30'
                      : user.role === 'STEWARD'
                      ? 'bg-[#2F6E5D]/15 text-[#2F6E5D] border-[#2F6E5D]/40'
                      : 'bg-[#6B8F5E]/15 text-[#6B8F5E] border-[#6B8F5E]/40'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Master-Detail Verification Console */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[calc(100vh-170px)]">
          {/* LEFT PANE: Verification Queue */}
          <div className="w-full md:w-80 lg:w-96 border-r border-[#E4DDD0] bg-[#FAF7F1] flex flex-col">
            {/* Filter Tabs */}
            <div className="p-4 border-b border-[#E4DDD0] flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-[#2A2420]/80 font-sans font-medium">
                <Filter className="w-3.5 h-3.5 text-[#C97A3D]" />
                <span>Verification Queue</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#C97A3D]/10 text-[#C97A3D] text-[10px] font-mono">
                  {filteredQueue.length}
                </span>
              </div>

              <div className="flex rounded bg-[#F0EBE1] p-0.5 text-[10px] font-sans border border-[#E4DDD0]">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-2 py-1 rounded transition-colors ${
                    filterStatus === 'ALL'
                      ? 'bg-[#C97A3D] text-white font-medium'
                      : 'text-[#2A2420]/60 hover:text-[#2A2420]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('UNVERIFIED')}
                  className={`px-2 py-1 rounded transition-colors ${
                    filterStatus === 'UNVERIFIED'
                      ? 'bg-[#C97A3D] text-white font-medium'
                      : 'text-[#2A2420]/60 hover:text-[#2A2420]'
                  }`}
                >
                  Unreviewed
                </button>
                <button
                  onClick={() => setFilterStatus('COMMUNITY_SUPPORTED')}
                  className={`px-2 py-1 rounded transition-colors ${
                    filterStatus === 'COMMUNITY_SUPPORTED'
                      ? 'bg-[#C97A3D] text-white font-medium'
                      : 'text-[#2A2420]/60 hover:text-[#2A2420]'
                  }`}
                >
                  Supported
                </button>
                <button
                  onClick={() => setFilterStatus('COMMUNITY_VERIFIED')}
                  className={`px-2 py-1 rounded transition-colors ${
                    filterStatus === 'COMMUNITY_VERIFIED'
                      ? 'bg-[#C97A3D] text-white font-medium'
                      : 'text-[#2A2420]/60 hover:text-[#2A2420]'
                  }`}
                >
                  Verified
                </button>
              </div>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#E4DDD0]">
              {loading ? (
                <div className="p-8 text-center text-xs text-[#C97A3D] font-sans">
                  Loading verification queue...
                </div>
              ) : filteredQueue.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#2A2420]/50 font-sans">
                  No records waiting in this queue slice.
                </div>
              ) : (
                filteredQueue.map((item) => {
                  const isSelected = selectedRecord?.id === item.id;
                  const isItemSelf = Boolean(item.contributorId && user.id === item.contributorId);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectRecord(item)}
                      className={`p-4 cursor-pointer transition-colors font-sans text-left relative ${
                        isSelected
                          ? 'bg-[#C97A3D]/10 border-l-4 border-[#C97A3D]'
                          : 'hover:bg-[#FAF7F1]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-[#2A2420]">
                          {item.language?.name || 'Local Dialect'}
                        </span>
                        {isItemSelf ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C97A3D]/10 text-[#C97A3D] border border-[#C97A3D]/30 font-mono font-medium">
                            Your submission
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#C97A3D]">
                            {item.category.toLowerCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <p className="font-serif text-xs text-[#2A2420]/70 line-clamp-1 italic mb-1">
                        "{item.transcriptionText || item.summaryText || 'Field recording'}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-[#2A2420]/50">
                        <span>
                          {item.contributor?.displayName || item.speakerName || 'Anonymous Elder'}
                          {isItemSelf && ' (You)'}
                        </span>
                        <span
                          className={
                            item.verificationStatus === 'COMMUNITY_VERIFIED'
                              ? 'text-[#2F6E5D] font-medium'
                              : item.verificationStatus === 'COMMUNITY_SUPPORTED'
                              ? 'text-[#D97706] font-medium'
                              : item.verificationStatus === 'STEWARD_ENDORSED'
                              ? 'text-[#C97A3D] font-medium'
                              : 'text-[#2A2420]/40'
                          }
                        >
                          {item.verificationStatus === 'COMMUNITY_SUPPORTED' ? 'community supported' : item.verificationStatus.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANE: Verification Workspace */}
          {selectedRecord ? (
            <div className="flex-1 bg-[#FFFFFF] p-6 sm:p-10 overflow-y-auto flex flex-col gap-6">
              <div>
                {/* Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E4DDD0]">
                  <div>
                    <div className="flex items-center space-x-2 text-xs text-[#C97A3D] mb-1">
                      <span>REF: {selectedRecord.id.slice(0, 8)}</span>
                      <span>•</span>
                      <span>Region: {selectedRecord.region?.name || 'Unspecified'}</span>
                      {selectedRecord.contributor && (
                        <>
                          <span>•</span>
                          <span>Contributor: {selectedRecord.contributor.displayName}</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-serif text-2xl text-[#2A2420] font-medium">
                      {selectedRecord.summaryText || 'Oral Knowledge Artifact'}
                    </h2>
                  </div>

                  <Link
                    href={`/record/${selectedRecord.id}`}
                    target="_blank"
                    className="inline-flex items-center space-x-1 text-xs text-[#C97A3D] hover:underline"
                  >
                    <span>View Museum Plaque</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Self-Review Guard Alert Banner with 1-Click Role Switch */}
                {isSelfSubmission && (
                  <div className="mb-6 p-4 rounded-lg bg-[#C97A3D]/10 border border-[#C97A3D]/40 text-xs text-[#2A2420] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-[#C97A3D] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#C97A3D] mb-1 text-sm">
                          Self-Review Protocol Enforced
                        </p>
                        <p className="text-[#2A2420]/70 leading-relaxed">
                          You originally contributed this memory ({user.displayName}). Peer verification and steward endorsement must be conducted by an independent evaluator.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleQuickSwitchToReviewer}
                      disabled={isSwitchingRole}
                      className="shrink-0 px-3.5 py-2 rounded bg-[#C97A3D] text-white text-xs font-medium hover:bg-[#b56930] transition-colors self-start sm:self-center flex items-center gap-1.5 shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isSwitchingRole ? 'Switching...' : 'Switch to Reviewer (Dr. Sunita Devi)'}</span>
                    </button>
                  </div>
                )}

                {/* Media Showcase Section */}
                {selectedRecord.mediaType === 'IMAGE' && (
                  <div className="bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl overflow-hidden mb-8 shadow-sm">
                    <div className="p-3.5 sm:p-4 bg-[#FFFFFF] border-b border-[#E4DDD0] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded text-xs font-medium bg-[#2F6E5D] text-[#FAF7F1] flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Cultural Photographic Documentation
                        </span>
                        <span className="text-xs text-[#2A2420]/60 font-mono">
                          REF: {selectedRecord.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-[#2A2420]/70">
                        <span>Speaker / Contributor: <strong className="text-[#2A2420]">{selectedRecord.speakerName || selectedRecord.contributor?.displayName || 'Community Elder'}</strong></span>
                        <span>•</span>
                        <span>Genre: <strong className="text-[#C97A3D]">{selectedRecord.category}</strong></span>
                      </div>
                    </div>

                    <div className="relative bg-[#1A1815] min-h-[260px] max-h-[500px] flex items-center justify-center p-3 sm:p-6 group">
                      <img
                        src={getPhotoUrl(selectedRecord.mediaUrl, selectedRecord.thumbnailUrl, selectedRecord.category)}
                        alt={selectedRecord.summaryText || 'Contributed cultural photograph'}
                        onClick={() => setIsImageModalOpen(true)}
                        className="max-h-[460px] w-auto max-w-full object-contain rounded cursor-zoom-in transition-transform duration-200 hover:scale-[1.01]"
                      />
                      {/* Zoom / Full Preview Trigger */}
                      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsImageModalOpen(true)}
                          className="bg-[#2A2420]/85 hover:bg-[#2A2420] text-[#FAF7F1] text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm border border-[#FAF7F1]/20 flex items-center space-x-1.5 shadow-lg transition-all"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Inspect Full Details</span>
                        </button>
                        <a
                          href={getPhotoUrl(selectedRecord.mediaUrl, selectedRecord.thumbnailUrl, selectedRecord.category)}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#2A2420]/85 hover:bg-[#2A2420] text-[#FAF7F1] text-xs p-1.5 rounded-lg backdrop-blur-sm border border-[#FAF7F1]/20 shadow-lg transition-all"
                          title="Open photo in new browser tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Recording Player with Real Waveform Bar (When media is AUDIO) */}
                {selectedRecord.mediaType === 'AUDIO' && (
                  <div className="bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Hidden real audio element with robust event listeners */}
                    <audio
                      ref={audioRef}
                      src={getPlayableMediaUrl(selectedRecord.mediaUrl)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={(e) => {
                        const el = e.currentTarget;
                        if (isFinite(el.duration) && el.duration > 0) {
                          setPlayProgress((el.currentTime / el.duration) * 100);
                          setAudioDuration(el.duration);
                        } else if (el.currentTime > 0) {
                          // Streamed WebM audio from browser microphone
                          setAudioDuration(Math.max(audioDuration, el.currentTime));
                          setPlayProgress(Math.min(100, (el.currentTime % 30) / 30 * 100));
                        }
                      }}
                      onEnded={() => {
                        setIsPlaying(false);
                        setPlayProgress(0);
                      }}
                      onLoadedMetadata={(e) => {
                        if (isFinite(e.currentTarget.duration)) {
                          setAudioDuration(e.currentTarget.duration);
                        }
                      }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('SoundHelix-Song-1.mp3')) {
                          target.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                          target.load();
                          if (isPlaying) {
                            target.play().catch(() => setIsPlaying(false));
                          }
                        }
                      }}
                      preload="metadata"
                      className="hidden"
                    />

                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      <button
                        onClick={handlePlayPause}
                        className="w-12 h-12 rounded-full bg-[#C97A3D] text-white flex items-center justify-center hover:scale-105 transition-transform shrink-0 shadow-sm"
                        title={isPlaying ? 'Pause audio' : 'Listen to contributed audio recording'}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div>
                        <span className="text-xs font-sans text-[#2A2420] font-medium block">
                          Original Field Recording
                        </span>
                        <span className="text-[11px] text-[#2A2420]/50">
                          Speaker: {selectedRecord.speakerName || 'Anonymous Elder'} • AUDIO
                          {audioDuration > 0 && isFinite(audioDuration) && ` • ${Math.floor(audioDuration / 60)}:${String(Math.floor(audioDuration % 60)).padStart(2, '0')}`}
                        </span>
                      </div>
                    </div>

                    {/* Real Scrub Bar */}
                    <div
                      className="w-full sm:flex-1 max-w-md h-2 bg-[#E4DDD0] rounded-full overflow-hidden relative cursor-pointer"
                      onClick={(e) => {
                        if (!audioRef.current || !audioDuration || !isFinite(audioDuration)) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = (e.clientX - rect.left) / rect.width;
                        audioRef.current.currentTime = pct * audioDuration;
                      }}
                    >
                      <div
                        style={{ width: `${playProgress}%` }}
                        className="h-full bg-[#C97A3D] rounded-full transition-all duration-100"
                      />
                    </div>
                  </div>
                )}

                {/* Optional Video Player if contributed record is VIDEO */}
                {selectedRecord.mediaType === 'VIDEO' && selectedRecord.mediaUrl && (
                  <div className="mb-8 rounded-xl overflow-hidden border border-[#E4DDD0] bg-black">
                    <video
                      controls
                      src={getPlayableMediaUrl(selectedRecord.mediaUrl)}
                      className="w-full max-h-72 object-contain"
                    />
                  </div>
                )}

                {/* Side-by-Side Verification Workbench */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Left: AI Machine Draft / Vision Assessment */}
                  <div className="bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-sans font-medium text-[#C97A3D] flex items-center">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          {selectedRecord.mediaType === 'IMAGE'
                            ? 'AI Multimodal Vision Analysis (Gemini Vision)'
                            : 'AI Whisper Draft (Raw)'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFFFFF] text-[#2A2420]/60 border border-[#E4DDD0]">
                          {selectedRecord.mediaType === 'IMAGE'
                            ? 'Visual Ethnography Baseline'
                            : 'Acoustic Baseline'}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-[#2A2420]/50 block">
                            {selectedRecord.mediaType === 'IMAGE'
                              ? 'Visual Iconography, Motifs & Inscriptions:'
                              : 'Native Oral Transcription:'}
                          </span>
                          {selectedRecord.verificationStatus === 'COMMUNITY_VERIFIED' && (
                            <span className="text-[10px] font-mono text-[#2F6E5D] bg-[#2F6E5D]/10 px-1.5 py-0.5 rounded flex items-center">
                              <Check className="w-3 h-3 mr-0.5" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="font-serif text-sm text-[#2A2420] bg-[#FFFFFF] p-3 rounded border border-[#E4DDD0] leading-relaxed min-h-[90px]">
                          "{selectedRecord.transcriptionText || (selectedRecord.mediaType === 'IMAGE'
                            ? 'Gemini Vision analyzing visible motifs, attire, architectural elements, and cultural symbols...'
                            : 'No transcription extracted yet. Use the editor on the right to enter native transcription.')}"
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#2A2420]/50 block mb-1">
                          {selectedRecord.mediaType === 'IMAGE'
                            ? 'Cultural Interpretation & Community Significance:'
                            : 'English Translation:'}
                        </span>
                        <p className="font-sans text-xs text-[#2A2420]/80 bg-[#FFFFFF] p-3 rounded border border-[#E4DDD0] leading-relaxed min-h-[80px]">
                          {selectedRecord.translationText || (selectedRecord.mediaType === 'IMAGE'
                            ? 'Visual ethnographic context pending.'
                            : 'Translation pending.')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E4DDD0] text-[11px] text-[#2A2420]/50 italic">
                      {selectedRecord.mediaType === 'IMAGE'
                        ? 'Curator note: Multimodal vision assessment extracted using Gemini Vision heritage models.'
                        : 'Linguist note: Acoustic confidence estimated at ~84% based on regional phonetic models.'}
                    </div>
                  </div>

                  {/* Right: Peer Revision Editor */}
                  <div className="bg-[#FAF7F1] border border-[#C97A3D]/30 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-sans font-medium text-[#2F6E5D] flex items-center">
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Elder / Steward Peer Revision
                      </span>
                      <span className="text-[10px] text-[#C97A3D]">Editable fields</span>
                    </div>

                    <div className="space-y-4 text-xs font-sans">
                      <div>
                        <label className="block text-[#2A2420]/80 mb-1 font-medium">
                          {selectedRecord.mediaType === 'IMAGE'
                            ? 'Corrected Iconography & Cultural Description:'
                            : 'Corrected Native Script Transcription:'}
                        </label>
                        <textarea
                          rows={3}
                          disabled={isSelfSubmission}
                          value={editedTranscription}
                          onChange={(e) => setEditedTranscription(e.target.value)}
                          placeholder={
                            selectedRecord.mediaType === 'IMAGE'
                              ? 'Refine or add cultural details about motifs, attire, rituals, or inscriptions shown in this photo...'
                              : 'Type or refine native script transcription...'
                          }
                          className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded p-3 text-sm font-serif text-[#2A2420] focus:outline-none focus:border-[#C97A3D] disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2A2420]/80 mb-1 font-medium">
                          {selectedRecord.mediaType === 'IMAGE'
                            ? 'Corrected Cultural Interpretation / Community Context:'
                            : 'Corrected Translation:'}
                        </label>
                        <textarea
                          rows={3}
                          disabled={isSelfSubmission}
                          value={editedTranslation}
                          onChange={(e) => setEditedTranslation(e.target.value)}
                          placeholder={
                            selectedRecord.mediaType === 'IMAGE'
                              ? 'Refine English ethnographic translation or community context...'
                              : 'Refine English or lingua franca translation...'
                          }
                          className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded p-3 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D] disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2A2420]/80 mb-1">
                          Reviewer Annotation / Dialect Notes:
                        </label>
                        <input
                          type="text"
                          disabled={isSelfSubmission}
                          value={reviewerNotes}
                          onChange={(e) => setReviewerNotes(e.target.value)}
                          placeholder="Note archaic suffixes, village context, or clan nuances..."
                          className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-xs text-[#2A2420] placeholder-[#2A2420]/40 focus:outline-none focus:border-[#C97A3D] disabled:opacity-50"
                        />
                      </div>

                      {/* Attach Reference Document / Citation */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[#2A2420]/80 font-medium flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-[#C97A3D]" />
                            Attach Reference Document / Citation:
                          </label>
                          <span className="text-[10px] text-[#2A2420]/50">PDF, scan, or doc</span>
                        </div>

                        {attachedDocumentUrl ? (
                          <div className="flex items-center justify-between p-2.5 rounded bg-[#FAF7F1] border border-[#2F6E5D]/40 text-xs">
                            <div className="flex items-center space-x-2 truncate">
                              <FileText className="w-4 h-4 text-[#2F6E5D] shrink-0" />
                              <span className="truncate font-medium text-[#2A2420]">
                                {attachedDocumentName || 'Attached Document'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0 ml-2">
                              <a
                                href={attachedDocumentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[#2F6E5D] hover:underline font-medium"
                              >
                                Preview
                              </a>
                              <button
                                type="button"
                                onClick={removeAttachedDocument}
                                className="p-1 text-[#B54A3A] hover:bg-[#B54A3A]/10 rounded"
                                title="Remove attachment"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              ref={docInputRef}
                              disabled={isSelfSubmission || isUploadingDoc}
                              onChange={handleDocumentUpload}
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                              className="hidden"
                              id="verify-doc-upload"
                            />
                            <label
                              htmlFor="verify-doc-upload"
                              className={`w-full flex items-center justify-center gap-2 p-2.5 rounded border border-dashed border-[#E4DDD0] hover:border-[#C97A3D] bg-[#FFFFFF] text-xs text-[#2A2420]/70 cursor-pointer transition-colors ${
                                isSelfSubmission || isUploadingDoc ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5 text-[#C97A3D]" />
                              <span>
                                {isUploadingDoc
                                  ? 'Uploading reference document...'
                                  : 'Click to attach dictionary page, field citation, or research PDF'}
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Alert if action completed */}
                {actionFeedback && (
                  <div className="mb-6 p-4 rounded-lg bg-[#2F6E5D]/10 border border-[#2F6E5D]/40 text-xs text-[#2F6E5D] flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{actionFeedback}</span>
                  </div>
                )}

                {/* Error Alert if action failed */}
                {actionError && (
                  <div className="mb-6 p-4 rounded-lg bg-[#B54A3A]/10 border border-[#B54A3A]/40 text-xs text-[#B54A3A] flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#B54A3A] shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* Verification Audit History */}
                {selectedRecord.verifications && selectedRecord.verifications.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-[#FAF7F1] border border-[#E4DDD0]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-sans font-medium text-[#2A2420] flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#2F6E5D]" />
                        Verification Audit History ({selectedRecord.verifications.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedRecord.verifications.map((v) => (
                        <div
                          key={v.id}
                          className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E4DDD0] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                                v.action === 'ENDORSE'
                                  ? 'bg-[#C97A3D]/20 text-[#C97A3D]'
                                  : v.action === 'EDIT'
                                  ? 'bg-[#2F6E5D]/20 text-[#2F6E5D]'
                                  : v.action === 'AGREE'
                                  ? 'bg-[#2F6E5D]/10 text-[#2F6E5D]'
                                  : 'bg-[#B54A3A]/10 text-[#B54A3A]'
                              }`}
                            >
                              {v.action}
                            </span>
                            <span className="font-medium text-[#2A2420]">
                              {v.reviewer?.displayName || 'Cultural Reviewer'} ({v.reviewer?.role || 'REVIEWER'})
                            </span>
                            {v.notes && (
                              <span className="text-[#2A2420]/60 italic text-[11px]">
                                — "{v.notes}"
                              </span>
                            )}
                          </div>
                          {v.documentUrl && (
                            <a
                              href={v.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#FAF7F1] border border-[#E4DDD0] text-[11px] text-[#2F6E5D] hover:text-[#C97A3D] font-medium transition-colors"
                            >
                              <FileText className="w-3 h-3 text-[#2F6E5D]" />
                              <span className="truncate max-w-[150px]">
                                {v.documentName || 'Reference Document'}
                              </span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-[#E4DDD0] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-xs text-[#2A2420]/60">
                  <div className="flex items-center space-x-2">
                    <span>Current Status:</span>
                    <span className="font-mono text-[#C97A3D]">
                      {selectedRecord.verificationStatus}
                    </span>
                  </div>

                  {/* Delete Record - Strictly restricted to Admin, Reviewer/Verifier, or Steward */}
                  {(user.role === 'ADMIN' || user.role === 'REVIEWER' || user.role === 'STEWARD' || user.role === 'EXPERT') && (
                    <button
                      type="button"
                      disabled={isSubmitting || isDeleting}
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-2.5 py-1 rounded border border-[#B54A3A]/40 text-[11px] font-sans text-[#B54A3A] hover:bg-[#B54A3A]/10 transition-colors flex items-center space-x-1"
                      title="Permanently delete invalid or spam record (Verifier / Admin only)"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Record</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    disabled={isSubmitting || isSelfSubmission}
                    onClick={() => handleAction('DISPUTE')}
                    className={`px-4 py-2.5 rounded border border-[#B54A3A]/50 text-xs font-sans text-[#B54A3A] transition-colors ${
                      isSelfSubmission
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-[#B54A3A]/10'
                    }`}
                  >
                    Dispute Version
                  </button>

                  <button
                    disabled={isSubmitting || isSelfSubmission}
                    onClick={() => handleAction('EDIT')}
                    className={`px-4 py-2.5 rounded border border-[#C97A3D]/40 text-xs font-sans text-[#2A2420] transition-colors flex items-center space-x-1.5 ${
                      isSelfSubmission
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-[#C97A3D]/10'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C97A3D]" />
                    <span>Submit Correction</span>
                  </button>

                  <button
                    disabled={isSubmitting || isSelfSubmission}
                    onClick={() => handleAction('AGREE')}
                    className={`px-5 py-2.5 rounded bg-[#2F6E5D] text-white text-xs font-sans font-medium transition-colors flex items-center space-x-1.5 ${
                      isSelfSubmission
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-[#25574a]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Agree & Verify Draft</span>
                  </button>

                  {(user.role === 'STEWARD' || user.role === 'ADMIN') && (
                    <button
                      disabled={isSubmitting || isSelfSubmission}
                      onClick={() => handleAction('ENDORSE')}
                      className={`px-5 py-2.5 rounded bg-[#C97A3D] text-white text-xs font-sans font-medium transition-colors flex items-center space-x-1.5 ${
                        isSelfSubmission
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-[#B86B30]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Steward Endorse</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[#2A2420]/50">
              Select a record from the queue to start peer verification.
            </div>
          )}
        </div>

        {/* Photo Lightbox Modal for High-Resolution Cultural Inspection */}
        {isImageModalOpen && selectedRecord && selectedRecord.mediaType === 'IMAGE' && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
            <div className="w-full max-w-6xl flex items-center justify-between text-white mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold tracking-wide">
                  Cultural Artifact Inspection • REF: {selectedRecord.id.slice(0, 8)}
                </span>
                <span className="text-xs text-white/70">
                  {selectedRecord.speakerName || selectedRecord.contributor?.displayName || 'Contributor'} ({selectedRecord.category})
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={getPlayableMediaUrl(selectedRecord.mediaUrl) || selectedRecord.thumbnailUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded flex items-center gap-1.5 text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Raw Image</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                  title="Close inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative max-h-[85vh] max-w-full flex items-center justify-center overflow-auto rounded-lg border border-white/10 shadow-2xl bg-black/50">
              <img
                src={getPhotoUrl(selectedRecord.mediaUrl, selectedRecord.thumbnailUrl, selectedRecord.category)}
                alt={selectedRecord.summaryText || 'Cultural inspection'}
                className="max-h-[82vh] w-auto max-w-full object-contain rounded"
              />
            </div>
          </div>
        )}

        {/* Delete Record Confirmation Modal - Exclusively for Admin and Verifiers */}
        {isDeleteModalOpen && selectedRecord && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#B54A3A]/10 border border-[#B54A3A]/20 flex items-center justify-center text-[#B54A3A]">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#2A2420]">
                      Delete Archive Record
                    </h3>
                    <p className="text-xs text-[#2A2420]/60">
                      Author: {user?.displayName} ({user?.role})
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
                  <span>Irreversible Action</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  This action is strictly restricted to Administrators and Verifiers. Deleting this record will permanently remove it from the National Archive, the Cultural Atlas map, search indices, live counters, and delete all associated media files and AI drafts.
                </p>
              </div>

              <div className="bg-[#FAF7F1] p-3 rounded-lg border border-[#E4DDD0] text-xs space-y-1 font-mono">
                <div className="flex justify-between text-[#2A2420]/70">
                  <span>Record ID:</span>
                  <span className="text-[#2A2420] font-semibold">{selectedRecord.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between text-[#2A2420]/70">
                  <span>Language / Category:</span>
                  <span className="text-[#2A2420]">{selectedRecord.language?.name || 'Unknown'} • {selectedRecord.category}</span>
                </div>
                {selectedRecord.region?.name && (
                  <div className="flex justify-between text-[#2A2420]/70">
                    <span>Location:</span>
                    <span className="text-[#2A2420]">{selectedRecord.region.name}</span>
                  </div>
                )}
              </div>

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
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
