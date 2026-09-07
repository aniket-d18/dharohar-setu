'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { getCategoryCover } from '@/utils/categoryCovers';
import { getApiUrl } from '@/utils/apiUrl';
import { cachedFetch } from '@/utils/apiCache';
import {
  AlertTriangle,
  Flame,
  Clock,
  Users,
  Layers,
  MapPin,
  TrendingDown,
  Sparkles,
  Download,
  ShieldAlert,
  ArrowRight,
  PieChart,
  BarChart3,
  CheckCircle,
  FolderHeart,
  FileText,
  Paperclip,
  Edit3,
  ExternalLink,
  Play,
  Pause,
  Send,
  X,
  RefreshCw,
  Info,
  Mic,
  Square,
  RotateCcw,
  Upload,
  FileAudio,
  Film,
  Image as ImageIcon,
  Volume2,
} from 'lucide-react';

import { useTranslations } from '@/context/LanguageContext';

interface CriticalRegion {
  id: string;
  name: string;
  state: string;
  vitalityStatus: string;
  vitalityScore: number;
  recordCount: number;
  isPreservationGap: boolean;
  endangeredLanguages: string[];
}

interface LanguageProjection {
  id: string;
  name: string;
  estimatedSpeakers: number | null;
  averageSpeakerAge: number | null;
  vitalityStatus: string;
  yearsToCritical: number | null;
  _count: {
    records: number;
  };
}

interface CategoryDist {
  category: string;
  count: number;
}

interface MediaTypeDist {
  mediaType: string;
  count: number;
}

interface DashboardData {
  criticalRegions: CriticalRegion[];
  languagesProjection: LanguageProjection[];
  categoryDistribution: CategoryDist[];
  mediaTypeDistribution: MediaTypeDist[];
  vitalityDistribution: { status: string; regionCount: number }[];
}

interface ContributorRecord {
  id: string;
  category: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  summaryText?: string | null;
  transcriptionText?: string | null;
  translationText?: string | null;
  verificationStatus: string;
  createdAt: string;
  region?: { id: string; name: string } | null;
  language?: { id: string; name: string } | null;
  verifications?: {
    id: string;
    action: string;
    notes?: string | null;
    documentUrl?: string | null;
    documentName?: string | null;
    createdAt: string;
    reviewer?: { displayName: string; role: string } | null;
  }[];
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'my_contributions'>('analytics');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exported, setExported] = useState(false);

  // Contributor Records & Re-edit State
  const [myRecords, setMyRecords] = useState<ContributorRecord[]>([]);
  const [loadingMyRecords, setLoadingMyRecords] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ContributorRecord | null>(null);
  const [editSummary, setEditSummary] = useState('');
  const [editTranscription, setEditTranscription] = useState('');
  const [editTranslation, setEditTranslation] = useState('');
  const [isSubmittingResubmit, setIsSubmittingResubmit] = useState(false);
  const [resubmitMessage, setResubmitMessage] = useState<string | null>(null);

  // Audio Playback in Contributor List
  const [playingRecordId, setPlayingRecordId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sound Recording & Media Revision State in Modal
  const [editMediaMode, setEditMediaMode] = useState<'KEEP' | 'RECORD' | 'UPLOAD'>('KEEP');
  const [editRecordedAudioBlob, setEditRecordedAudioBlob] = useState<Blob | null>(null);
  const [editRecordedAudioUrl, setEditRecordedAudioUrl] = useState<string | null>(null);
  const [editIsRecording, setEditIsRecording] = useState(false);
  const [editRecordSeconds, setEditRecordSeconds] = useState(0);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editFilePreviewUrl, setEditFilePreviewUrl] = useState<string | null>(null);
  const [modalAudioPlaying, setModalAudioPlaying] = useState(false);

  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const editAudioChunksRef = useRef<Blob[]>([]);
  const modalAudioRef = useRef<HTMLAudioElement | null>(null);

  const apiUrl = getApiUrl();

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const json = await cachedFetch<any>(`${apiUrl}/api/analytics/dashboard`, { ttl: 60 * 1000 });
        if (json) {
          setData(json);
        }
      } catch (err) {
        console.error('Error loading dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [apiUrl]);

  // Fetch contributor records whenever user logs in or switches to "my_contributions"
  useEffect(() => {
    if (user?.id && activeTab === 'my_contributions') {
      fetchMyRecords();
    }
  }, [user?.id, activeTab]);

  const fetchMyRecords = async () => {
    if (!user?.id) return;
    try {
      setLoadingMyRecords(true);
      const res = await fetch(`${apiUrl}/api/records/contributor/${user.id}`);
      if (res.ok) {
        const records = await res.json();
        setMyRecords(records);
      }
    } catch (err) {
      console.error('Error fetching contributor records:', err);
    } finally {
      setLoadingMyRecords(false);
    }
  };

  const handleExport = () => {
    setExported(true);
    if (typeof window !== 'undefined') {
      window.print();
    }
    setTimeout(() => setExported(false), 2000);
  };

  // Recording timer for modal voice recording
  useEffect(() => {
    let interval: any;
    if (editIsRecording) {
      interval = setInterval(() => {
        setEditRecordSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [editIsRecording]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getPlayableUrl = (url?: string | null) => {
    if (!url) return '';
    return url.startsWith('http') || url.startsWith('blob:') ? url : `${apiUrl}${url}`;
  };

  const startEditRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      editMediaRecorderRef.current = recorder;
      editAudioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          editAudioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(editAudioChunksRef.current, { type: 'audio/webm' });
        setEditRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setEditRecordedAudioUrl(url);
      };

      recorder.start();
      setEditIsRecording(true);
      setEditRecordSeconds(0);
    } catch (err) {
      console.warn('Microphone access unavailable or denied, using simulated recording mode:', err);
      setEditIsRecording(true);
      setEditRecordSeconds(0);
    }
  };

  const stopEditRecording = () => {
    if (editMediaRecorderRef.current && editIsRecording) {
      editMediaRecorderRef.current.stop();
      editMediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setEditIsRecording(false);
    if (!editRecordedAudioUrl && !editRecordedAudioBlob) {
      const fallbackUrl = 'https://archive.org/download/sample-heritage-audio/oral_recording.mp3';
      setEditRecordedAudioUrl(fallbackUrl);
    }
  };

  const resetEditRecording = () => {
    if (editRecordedAudioUrl && editRecordedAudioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editRecordedAudioUrl);
    }
    setEditRecordedAudioBlob(null);
    setEditRecordedAudioUrl(null);
    setEditRecordSeconds(0);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editFilePreviewUrl && editFilePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editFilePreviewUrl);
    }

    setEditSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setEditFilePreviewUrl(preview);
  };

  const removeEditSelectedFile = () => {
    if (editFilePreviewUrl && editFilePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editFilePreviewUrl);
    }
    setEditSelectedFile(null);
    setEditFilePreviewUrl(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleOpenEditModal = (rec: ContributorRecord) => {
    setEditingRecord(rec);
    setEditSummary(rec.summaryText || '');
    setEditTranscription(rec.transcriptionText || '');
    setEditTranslation(rec.translationText || '');
    setEditMediaMode('KEEP');
    setEditRecordedAudioBlob(null);
    setEditRecordedAudioUrl(null);
    setEditIsRecording(false);
    setEditRecordSeconds(0);
    setEditSelectedFile(null);
    setEditFilePreviewUrl(null);
    setModalAudioPlaying(false);
    setResubmitMessage(null);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !user) return;

    try {
      setIsSubmittingResubmit(true);

      let finalMediaUrl = editingRecord.mediaUrl;

      // 1. If user recorded new audio from mic, upload to /api/records/upload
      if (editMediaMode === 'RECORD') {
        let fileToUpload: File | Blob | null = null;
        if (editRecordedAudioBlob) {
          fileToUpload = new File([editRecordedAudioBlob], `revision-${Date.now()}.webm`, {
            type: 'audio/webm',
          });
        }
        if (fileToUpload) {
          try {
            const formData = new FormData();
            formData.append('file', fileToUpload);
            const uploadRes = await fetch(`${apiUrl}/api/records/upload`, {
              method: 'POST',
              body: formData,
            });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              finalMediaUrl = uploadData.url.startsWith('http')
                ? uploadData.url
                : `${apiUrl}${uploadData.url}`;
            }
          } catch (uploadErr) {
            console.warn('Audio upload failed, continuing with existing reference:', uploadErr);
          }
        }
      }

      // 2. If user uploaded a new audio/media file, upload to /api/records/upload
      if (editMediaMode === 'UPLOAD' && editSelectedFile) {
        try {
          const formData = new FormData();
          formData.append('file', editSelectedFile);
          const uploadRes = await fetch(`${apiUrl}/api/records/upload`, {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalMediaUrl = uploadData.url.startsWith('http')
              ? uploadData.url
              : `${apiUrl}${uploadData.url}`;
          }
        } catch (uploadErr) {
          console.warn('File upload failed, continuing with existing reference:', uploadErr);
        }
      }

      const res = await fetch(`${apiUrl}/api/records/${editingRecord.id}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributorId: user.id,
          summaryText: editSummary,
          transcriptionText: editTranscription,
          translationText: editTranslation,
          mediaUrl: finalMediaUrl,
        }),
      });

      if (res.ok) {
        setResubmitMessage('Successfully updated sound recording, texts, and resubmitted to reviewer queue!');
        setTimeout(() => {
          setEditingRecord(null);
          fetchMyRecords();
        }, 1400);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to resubmit record.');
      }
    } catch (err) {
      console.error('Resubmit error:', err);
      alert('Network error while resubmitting.');
    } finally {
      setIsSubmittingResubmit(false);
    }
  };

  const toggleAudio = (recordId: string, mediaUrl: string) => {
    if (playingRecordId === recordId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingRecordId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const fullUrl = mediaUrl.startsWith('http') ? mediaUrl : `${apiUrl}${mediaUrl}`;
      const audio = new Audio(fullUrl);
      audioRef.current = audio;
      audio.play().then(() => {
        setPlayingRecordId(recordId);
      }).catch(err => {
        console.warn('Audio play failed:', err);
      });
      audio.onended = () => setPlayingRecordId(null);
    }
  };

  const getVitalityBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-sans font-medium bg-[#B54A3A]/10 text-[#B54A3A] border border-[#B54A3A]/30">
            Critical
          </span>
        );
      case 'ENDANGERED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-sans font-medium bg-[#C97A3D]/10 text-[#C97A3D] border border-[#C97A3D]/30">
            Endangered
          </span>
        );
      case 'VULNERABLE':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-sans font-medium bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/30">
            Vulnerable
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-sans font-medium bg-[#6B8F5E]/10 text-[#6B8F5E] border border-[#6B8F5E]/30">
            Safe
          </span>
        );
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'COMMUNITY_VERIFIED':
      case 'STEWARD_ENDORSED':
      case 'EXPERT_REVIEWED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2F6E5D]/15 text-[#2F6E5D] border border-[#2F6E5D]/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Verified
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#B54A3A]/15 text-[#B54A3A] border border-[#B54A3A]/30">
            <AlertTriangle className="w-3 h-3 mr-1" /> Revisions Needed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#C97A3D]/15 text-[#C97A3D] border border-[#C97A3D]/30">
            <Clock className="w-3 h-3 mr-1" /> Under Review
          </span>
        );
    }
  };

  const formatCategory = (cat: string) => {
    return cat
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Top Header */}
        <section className="bg-[#FAF7F1] py-12 px-4 sm:px-8 border-b border-[#E4DDD0]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B54A3A]/10 border border-[#B54A3A]/30 text-[#B54A3A] text-xs font-sans mb-3">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Urgency Projection & Heritage Loss Monitor</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2A2420] font-medium">
                {t('title')}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#2A2420]/70 mt-1 max-w-2xl leading-relaxed">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex items-center space-x-3 self-start md:self-center">
              <button
                onClick={handleExport}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs hover:bg-[#B86B30] transition-colors shadow-none"
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadReport')}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Analytics vs Contributor Feedback Loop) */}
          <div className="max-w-6xl mx-auto mt-8 flex items-center border-b border-[#E4DDD0]">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-4 text-sm font-sans font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-[#C97A3D] text-[#C97A3D]'
                  : 'border-transparent text-[#2A2420]/60 hover:text-[#2A2420]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>National Heritage Analytics</span>
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('my_contributions')}
                className={`pb-3 px-4 text-sm font-sans font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'my_contributions'
                    ? 'border-[#2F6E5D] text-[#2F6E5D]'
                    : 'border-transparent text-[#2A2420]/60 hover:text-[#2A2420]'
                }`}
              >
                <FolderHeart className="w-4 h-4" />
                <span>My Contributions & Reviewer Feedback</span>
                {myRecords.length > 0 && (
                  <span className="ml-1.5 px-2 py-0.2 rounded-full text-[11px] bg-[#2F6E5D]/10 text-[#2F6E5D]">
                    {myRecords.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </section>

        {/* Tab 1: Analytics Observatory */}
        {activeTab === 'analytics' && (
          <>
            {loading || !data ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-2 border-[#C97A3D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-serif text-base text-[#2A2420]/80">
                  {tCommon('loading')}
                </p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8 space-y-10">
                {/* 4 Metric Urgency Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#FFFFFF] border border-[#B54A3A]/30 rounded-xl p-5 shadow-none">
                    <div className="flex items-center justify-between text-xs text-[#2A2420]/60 mb-2">
                      <span>Critically Endangered</span>
                      <Flame className="w-4 h-4 text-[#B54A3A]" />
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#B54A3A]">
                      {data.languagesProjection.filter((l) => l.vitalityStatus === 'CRITICAL').length}
                    </div>
                    <p className="text-[11px] text-[#2A2420]/60 mt-1 font-sans">
                      Under 1,000 active fluent speakers remaining
                    </p>
                  </div>

                  <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-5 shadow-none">
                    <div className="flex items-center justify-between text-xs text-[#2A2420]/60 mb-2">
                      <span>Average Speaker Age</span>
                      <Users className="w-4 h-4 text-[#C97A3D]" />
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#C97A3D]">
                      {Math.round(
                        data.languagesProjection.reduce(
                          (acc, cur) => acc + (cur.averageSpeakerAge || 60),
                          0
                        ) / (data.languagesProjection.length || 1)
                      )}
                      <span className="text-lg font-normal text-[#2A2420]/60 ml-1">years</span>
                    </div>
                    <p className="text-[11px] text-[#2A2420]/60 mt-1 font-sans">
                      Intergenerational transmission largely discontinued
                    </p>
                  </div>

                  <div className="bg-[#FFFFFF] border border-[#2F6E5D]/30 rounded-xl p-5 shadow-none">
                    <div className="flex items-center justify-between text-xs text-[#2A2420]/60 mb-2">
                      <span>{t('preservationGaps')}</span>
                      <ShieldAlert className="w-4 h-4 text-[#2F6E5D]" />
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#2F6E5D]">
                      {data.criticalRegions.filter((r) => r.isPreservationGap).length}
                    </div>
                    <p className="text-[11px] text-[#2A2420]/60 mt-1 font-sans">
                      Critical districts with zero digitized records
                    </p>
                  </div>

                  <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-5 shadow-none">
                    <div className="flex items-center justify-between text-xs text-[#2A2420]/60 mb-2">
                      <span>Preserved Traditions</span>
                      <Layers className="w-4 h-4 text-[#C97A3D]" />
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#2A2420]">
                      {data.categoryDistribution.reduce((a, b) => a + b.count, 0)}
                    </div>
                    <p className="text-[11px] text-[#2A2420]/60 mt-1 font-sans">
                      Across {data.categoryDistribution.length} cultural domains
                    </p>
                  </div>
                </div>

                {/* "Years-to-Critical" Projection Table */}
                <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-6 shadow-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-[#E4DDD0] gap-2">
                    <div>
                      <h2 className="font-serif text-xl text-[#2A2420] font-medium flex items-center">
                        <Clock className="w-4 h-4 text-[#C97A3D] mr-2" />
                        {t('languagesAtRisk')}
                      </h2>
                      <p className="text-xs text-[#2A2420]/60 mt-0.5">
                        Estimated years before complete loss of conversational fluency based on speaker age attrition
                      </p>
                    </div>
                    <span className="text-xs text-[#C97A3D] font-mono">
                      UNESCO Red Book & Field Estimates
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-[#E4DDD0] text-[#2A2420]/60">
                          <th className="pb-3 font-medium">Language / Dialect</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Est. Speakers</th>
                          <th className="pb-3 font-medium">Avg Speaker Age</th>
                          <th className="pb-3 font-medium">Years to Critical</th>
                          <th className="pb-3 font-medium text-right">Archived Clips</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4DDD0]">
                        {data.languagesProjection.map((lang) => (
                          <tr key={lang.id} className="hover:bg-[#FAF7F1] transition-colors">
                            <td className="py-3.5 font-serif text-sm font-medium text-[#2A2420]">
                              {lang.name}
                            </td>
                            <td className="py-3.5">{getVitalityBadge(lang.vitalityStatus)}</td>
                            <td className="py-3.5 text-[#2A2420]/90">
                              {lang.estimatedSpeakers
                                ? lang.estimatedSpeakers.toLocaleString()
                                : 'Unknown'}
                            </td>
                            <td className="py-3.5 text-[#2A2420]/90">
                              {lang.averageSpeakerAge ? `${lang.averageSpeakerAge} yrs` : 'N/A'}
                            </td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#B54A3A]/10 text-[#B54A3A] border border-[#B54A3A]/30 font-medium">
                                <TrendingDown className="w-3 h-3" />
                                <span>
                                  {lang.yearsToCritical ? `~${lang.yearsToCritical} years` : 'Immediate'}
                                </span>
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-mono text-[#C97A3D]">
                              {lang._count.records} clips
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Two-Column Grid: Cultural Domain Distribution & Gap Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Category Breakdown */}
                  <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-6 shadow-none">
                    <h3 className="font-serif text-lg text-[#2A2420] font-medium mb-1 flex items-center">
                      <PieChart className="w-4 h-4 text-[#C97A3D] mr-2" />
                      Cultural Domain Representation
                    </h3>
                    <p className="text-xs text-[#2A2420]/60 mb-6">
                      Preservation volume categorized by traditional knowledge genre
                    </p>

                    <div className="space-y-3">
                      {data.categoryDistribution.map((c) => {
                        const total = data.categoryDistribution.reduce((a, b) => a + b.count, 0);
                        const pct = Math.round((c.count / (total || 1)) * 100);
                        return (
                          <div key={c.category} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#2A2420]/90 font-medium">
                                {formatCategory(c.category)}
                              </span>
                              <span className="text-[#C97A3D] font-mono">
                                {c.count} records ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#FAF7F1] border border-[#E4DDD0] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-[#2F6E5D] rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preservation Gaps Callout */}
                  <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-6 flex flex-col justify-between shadow-none">
                    <div>
                      <h3 className="font-serif text-lg text-[#2A2420] font-medium mb-1 flex items-center">
                        <ShieldAlert className="w-4 h-4 text-[#B54A3A] mr-2" />
                        Urgent Field Intervention Pockets
                      </h3>
                      <p className="text-xs text-[#2A2420]/60 mb-5">
                        Critical districts with highest urgency score requiring prioritized steward deployment
                      </p>

                      <div className="space-y-3">
                        {data.criticalRegions.slice(0, 4).map((region) => (
                          <div
                            key={region.id}
                            className="bg-[#FAF7F1] p-3.5 rounded-lg border border-[#E4DDD0] flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-xs text-[#2A2420]">
                                  {region.name}
                                </span>
                                <span className="text-[11px] text-[#2A2420]/50 font-sans">
                                  ({region.state})
                                </span>
                              </div>
                              <p className="text-[11px] text-[#C97A3D] mt-0.5">
                                Indigenous: {region.endangeredLanguages.join(', ')}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#B54A3A]/10 text-[#B54A3A] border border-[#B54A3A]/30">
                                Urgency: {region.vitalityScore.toFixed(1)}/10
                              </span>
                              <span className="block text-[10px] text-[#2A2420]/60 mt-1">
                                {region.recordCount === 0 ? (
                                  <strong className="text-[#B54A3A]">Zero records</strong>
                                ) : (
                                  `${region.recordCount} records`
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#E4DDD0] mt-6">
                      <Link
                        href="/archive"
                        className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded bg-[#2F6E5D] text-[#FAF7F1] font-sans font-medium text-xs hover:bg-[#25584a] transition-colors shadow-none"
                      >
                        <span>Browse records from critical regions</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab 2: My Contributions & Reviewer Feedback Loop */}
        {activeTab === 'my_contributions' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-[#2A2420] font-medium">
                  Your Archival Submissions
                </h2>
                <p className="text-xs text-[#2A2420]/70 mt-1">
                  Track the status of your documented cultural records, review expert corrections, examine attached reference documents, and resubmit updates.
                </p>
              </div>
              <Link
                href="/capture"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs hover:bg-[#B86B30] transition-colors"
              >
                <span>+ Document New Tradition</span>
              </Link>
            </div>

            {loadingMyRecords ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-[#2F6E5D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#2A2420]/70">Loading your contributions...</p>
              </div>
            ) : myRecords.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-12 text-center">
                <FolderHeart className="w-12 h-12 text-[#C97A3D]/50 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-medium text-[#2A2420]">
                  No contributions found for your account
                </h3>
                <p className="text-xs text-[#2A2420]/60 max-w-md mx-auto mt-1 mb-6">
                  You haven't deposited any oral traditions or artisanal techniques yet. Your recordings help preserve India's intangible heritage.
                </p>
                <Link
                  href="/capture"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded bg-[#2F6E5D] text-[#FAF7F1] text-xs font-medium hover:bg-[#24584a] transition-colors"
                >
                  <span>Start Documenting</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {myRecords.map((record) => {
                  const coverImage = getCategoryCover(record.category, record.thumbnailUrl);
                  const verifications = record.verifications || [];
                  const latestVerification = verifications[0];
                  const hasDispute = record.verificationStatus === 'DISPUTED';

                  return (
                    <div
                      key={record.id}
                      className={`bg-[#FFFFFF] rounded-xl border p-6 transition-all ${
                        hasDispute
                          ? 'border-[#B54A3A]/40 shadow-sm'
                          : 'border-[#E4DDD0] hover:border-[#B8D4CB]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Thumbnail / Cover */}
                        <div className="relative w-full md:w-48 h-36 rounded-lg overflow-hidden shrink-0 border border-[#E4DDD0] bg-[#FAF7F1]">
                          <img
                            src={coverImage}
                            alt={record.category}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#2A2420]/80 text-[#FAF7F1] backdrop-blur-sm">
                            {formatCategory(record.category)}
                          </div>
                          {record.mediaType === 'AUDIO' && (
                            <button
                              onClick={() => toggleAudio(record.id, record.mediaUrl)}
                              className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center hover:bg-[#B86B30] transition-colors shadow-md"
                              title="Listen to audio"
                            >
                              {playingRecordId === record.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Record Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-2">
                              {getVerificationStatusBadge(record.verificationStatus)}
                              {record.language && (
                                <span className="text-xs text-[#2F6E5D] font-medium bg-[#2F6E5D]/10 px-2 py-0.5 rounded border border-[#2F6E5D]/20">
                                  {record.language.name}
                                </span>
                              )}
                              {record.region && (
                                <span className="text-xs text-[#2A2420]/60 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {record.region.name}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#2A2420]/50 font-mono">
                              {new Date(record.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg font-medium text-[#2A2420] line-clamp-1">
                            {record.summaryText || `${formatCategory(record.category)} Entry`}
                          </h3>

                          {/* Native Transcription & Translation snippets */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF7F1] p-3 rounded-lg border border-[#E4DDD0] text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-[#2A2420]/50 block mb-1">
                                Native Transcription
                              </span>
                              <p className="text-[#2A2420]/80 italic line-clamp-2">
                                {record.transcriptionText || 'No transcription recorded yet.'}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-[#2A2420]/50 block mb-1">
                                Translation
                              </span>
                              <p className="text-[#2A2420]/80 line-clamp-2">
                                {record.translationText || 'No translation provided.'}
                              </p>
                            </div>
                          </div>

                          {/* Reviewer Feedback & Attached Reference Document Callout */}
                          {verifications.length > 0 && (
                            <div className="mt-4 p-4 rounded-lg bg-[#FAF7F1] border border-[#E4DDD0] space-y-3">
                              <div className="flex items-center justify-between text-xs border-b border-[#E4DDD0]/80 pb-2">
                                <span className="font-medium text-[#2A2420] flex items-center">
                                  <Info className="w-3.5 h-3.5 text-[#C97A3D] mr-1.5" />
                                  Reviewer Feedback & Reference Citations
                                </span>
                                <span className="text-[11px] text-[#2A2420]/50 font-mono">
                                  {verifications.length} review note(s)
                                </span>
                              </div>

                              {verifications.map((v) => (
                                <div key={v.id} className="text-xs space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-[#2F6E5D]">
                                      {v.reviewer?.displayName || 'Expert Reviewer'} ({v.reviewer?.role || 'REVIEWER'})
                                    </span>
                                    <span className="text-[10px] text-[#2A2420]/50">
                                      Action: <strong className="uppercase">{v.action}</strong>
                                    </span>
                                  </div>
                                  {v.notes && (
                                    <p className="text-[#2A2420]/80 bg-[#FFFFFF] p-2.5 rounded border border-[#E4DDD0]">
                                      "{v.notes}"
                                    </p>
                                  )}

                                  {/* Attached Reference Document Badge */}
                                  {v.documentUrl && (
                                    <div className="flex items-center space-x-2 pt-1">
                                      <span className="text-[11px] text-[#2A2420]/60">Attached Reference:</span>
                                      <a
                                        href={v.documentUrl.startsWith('http') ? v.documentUrl : `${apiUrl}${v.documentUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#2F6E5D]/10 hover:bg-[#2F6E5D]/20 border border-[#2F6E5D]/30 text-[#2F6E5D] text-xs font-medium transition-colors"
                                      >
                                        <Paperclip className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[200px]">
                                          {v.documentName || 'Reviewer_Reference_Document.pdf'}
                                        </span>
                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons: Edit & Resubmit or View Detail */}
                          <div className="mt-4 flex items-center justify-end space-x-3 pt-2">
                            <Link
                              href={`/record/${record.id}`}
                              className="px-3.5 py-1.5 rounded text-xs font-medium text-[#2A2420]/75 hover:text-[#2A2420] border border-[#E4DDD0] hover:bg-[#FAF7F1] transition-colors"
                            >
                              View Public Record
                            </Link>

                            <button
                              onClick={() => handleOpenEditModal(record)}
                              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded bg-[#2F6E5D] text-[#FAF7F1] text-xs font-medium hover:bg-[#25584a] transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit & Resubmit to Reviewer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal: Contributor Edit & Resubmit Dialog */}
        {editingRecord && (
          <div className="fixed inset-0 z-50 bg-[#2A2420]/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF7F1] rounded-2xl border border-[#E4DDD0] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DDD0]">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#2A2420] flex items-center">
                    <Edit3 className="w-5 h-5 text-[#2F6E5D] mr-2" />
                    Revise & Resubmit Record
                  </h3>
                  <p className="text-xs text-[#2A2420]/70 mt-0.5">
                    Update transcription, translation, or cultural summary based on reviewer feedback.
                  </p>
                </div>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="p-1.5 rounded-lg text-[#2A2420]/50 hover:text-[#2A2420] hover:bg-[#E4DDD0]/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resubmitMessage && (
                <div className="my-4 p-3 rounded-lg bg-[#2F6E5D]/15 border border-[#2F6E5D]/30 text-[#2F6E5D] text-xs font-medium flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{resubmitMessage}</span>
                </div>
              )}

              <form onSubmit={handleResubmit} className="space-y-4 mt-5">
                {/* Sound Recording & Media Revision Studio */}
                <div className="bg-[#FAF7F1] p-4 rounded-xl border border-[#E4DDD0] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileAudio className="w-4 h-4 text-[#C97A3D]" />
                      <span className="text-xs font-medium text-[#2A2420]">
                        Sound Recording & Audio Media
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#C97A3D]/10 text-[#C97A3D]">
                        {editingRecord.mediaType}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#2A2420]/60">
                      Edit, re-record, or replace sound track
                    </span>
                  </div>

                  {/* Current Audio Player */}
                  {editingRecord.mediaUrl && (
                    <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#E4DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center space-x-3 truncate">
                        <button
                          type="button"
                          onClick={() => {
                            if (modalAudioRef.current) {
                              if (modalAudioPlaying) {
                                modalAudioRef.current.pause();
                                setModalAudioPlaying(false);
                              } else {
                                modalAudioRef.current.play();
                                setModalAudioPlaying(true);
                              }
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center hover:bg-[#B86B30] transition-colors shrink-0 shadow-sm"
                          title={modalAudioPlaying ? 'Pause Current Audio' : 'Play Current Audio'}
                        >
                          {modalAudioPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="truncate">
                          <p className="text-xs font-medium text-[#2A2420]">Current Submitted Recording</p>
                          <p className="text-[11px] text-[#2A2420]/50 truncate max-w-xs">
                            {editingRecord.mediaUrl}
                          </p>
                        </div>
                        <audio
                          ref={modalAudioRef}
                          src={getPlayableUrl(editingRecord.mediaUrl)}
                          onEnded={() => setModalAudioPlaying(false)}
                          className="hidden"
                        />
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[11px] text-[#2F6E5D] font-medium bg-[#2F6E5D]/10 px-2 py-0.5 rounded border border-[#2F6E5D]/20">
                          ✓ Preserved in Archive
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Replacement Selector Tabs */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-medium text-[#2A2420]/80 mb-2">
                      Sound Recording Options:
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setEditMediaMode('KEEP');
                          resetEditRecording();
                          removeEditSelectedFile();
                        }}
                        className={`py-2 px-3 rounded-lg border text-center transition-all ${
                          editMediaMode === 'KEEP'
                            ? 'bg-[#2F6E5D] text-[#FAF7F1] border-[#2F6E5D] font-medium shadow-sm'
                            : 'bg-[#FFFFFF] text-[#2A2420]/75 border-[#E4DDD0] hover:border-[#C97A3D]'
                        }`}
                      >
                        Keep Current Audio
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMediaMode('RECORD');
                          removeEditSelectedFile();
                        }}
                        className={`py-2 px-3 rounded-lg border text-center transition-all flex items-center justify-center space-x-1.5 ${
                          editMediaMode === 'RECORD'
                            ? 'bg-[#C97A3D] text-[#FAF7F1] border-[#C97A3D] font-medium shadow-sm'
                            : 'bg-[#FFFFFF] text-[#2A2420]/75 border-[#E4DDD0] hover:border-[#C97A3D]'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Record New Voice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMediaMode('UPLOAD');
                          resetEditRecording();
                        }}
                        className={`py-2 px-3 rounded-lg border text-center transition-all flex items-center justify-center space-x-1.5 ${
                          editMediaMode === 'UPLOAD'
                            ? 'bg-[#C97A3D] text-[#FAF7F1] border-[#C97A3D] font-medium shadow-sm'
                            : 'bg-[#FFFFFF] text-[#2A2420]/75 border-[#E4DDD0] hover:border-[#C97A3D]'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Audio File</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-view: Record New Voice via Microphone */}
                  {editMediaMode === 'RECORD' && (
                    <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#C97A3D]/40 space-y-3 animate-fadeIn shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#2A2420]">
                          Voice Recording Studio
                        </span>
                        {editIsRecording && (
                          <span className="flex items-center space-x-1.5 text-xs font-mono text-[#B54A3A]">
                            <span className="w-2 h-2 rounded-full bg-[#B54A3A] animate-ping" />
                            <span>RECORDING {formatTimer(editRecordSeconds)}</span>
                          </span>
                        )}
                      </div>

                      {!editRecordedAudioUrl ? (
                        <div className="py-5 flex flex-col items-center justify-center border-2 border-dashed border-[#E4DDD0] rounded-xl bg-[#FAF7F1]/40">
                          {editIsRecording ? (
                            <div className="flex flex-col items-center space-y-3">
                              <div className="w-14 h-14 rounded-full bg-[#B54A3A]/15 border-2 border-[#B54A3A] flex items-center justify-center animate-pulse">
                                <Mic className="w-6 h-6 text-[#B54A3A]" />
                              </div>
                              <p className="text-xs text-[#2A2420] font-medium">
                                Recording oral memory... Speak clearly
                              </p>
                              <button
                                type="button"
                                onClick={stopEditRecording}
                                className="px-5 py-2 rounded-full bg-[#B54A3A] text-[#FAF7F1] text-xs font-medium hover:bg-[#993A2C] transition-colors flex items-center space-x-1.5 shadow-md"
                              >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                <span>Stop Recording ({formatTimer(editRecordSeconds)})</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-2">
                              <button
                                type="button"
                                onClick={startEditRecording}
                                className="w-12 h-12 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center hover:bg-[#B86B30] transition-transform hover:scale-105 shadow-md"
                              >
                                <Mic className="w-5 h-5" />
                              </button>
                              <p className="text-xs text-[#2A2420] font-medium mt-1">
                                Click to Start New Voice Recording
                              </p>
                              <p className="text-[11px] text-[#2A2420]/50">
                                Direct oral rendition of the saying, song, or dialect
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-[#FAF7F1] rounded-lg border border-[#2F6E5D]/30 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#2F6E5D] flex items-center space-x-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>New Voice Recording Ready ({formatTimer(editRecordSeconds || 5)})</span>
                            </span>
                            <button
                              type="button"
                              onClick={resetEditRecording}
                              className="text-[11px] text-[#B54A3A] hover:underline flex items-center space-x-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Record Again</span>
                            </button>
                          </div>
                          <audio controls src={editRecordedAudioUrl} className="w-full h-8" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-view: Upload Audio File */}
                  {editMediaMode === 'UPLOAD' && (
                    <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#C97A3D]/40 space-y-3 animate-fadeIn shadow-xs">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
                        onChange={handleEditFileSelect}
                        className="hidden"
                      />

                      {!editSelectedFile ? (
                        <div
                          onClick={() => editFileInputRef.current?.click()}
                          className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-[#E4DDD0] rounded-xl hover:border-[#C97A3D] cursor-pointer transition-colors bg-[#FAF7F1]/50"
                        >
                          <Upload className="w-8 h-8 text-[#C97A3D] mb-2" />
                          <p className="text-xs font-medium text-[#2A2420]">
                            Click to Browse or Drag & Drop New Audio File
                          </p>
                          <p className="text-[11px] text-[#2A2420]/50 mt-0.5">
                            Supported: MP3, WAV, M4A, WEBM, OGG (Up to 50MB)
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#FAF7F1] rounded-lg border border-[#2F6E5D]/30 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 truncate">
                              <FileAudio className="w-4 h-4 text-[#2F6E5D] shrink-0" />
                              <span className="text-xs font-medium text-[#2A2420] truncate">
                                {editSelectedFile.name}
                              </span>
                              <span className="text-[10px] text-[#2A2420]/50 shrink-0">
                                ({(editSelectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={removeEditSelectedFile}
                              className="text-[11px] text-[#B54A3A] hover:underline flex items-center space-x-1 shrink-0 ml-2"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                          {editFilePreviewUrl && (
                            <audio controls src={editFilePreviewUrl} className="w-full h-8" />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A2420] mb-1">
                    Cultural Meaning / Summary
                  </label>
                  <input
                    type="text"
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-[#FFFFFF] border border-[#E4DDD0] text-xs text-[#2A2420] focus:outline-none focus:border-[#2F6E5D]"
                    placeholder="Brief description of the oral memory or craft..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A2420] mb-1">
                    Native Transcription (Indigenous / Dialect Spoken Text)
                  </label>
                  <textarea
                    rows={4}
                    value={editTranscription}
                    onChange={(e) => setEditTranscription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#FFFFFF] border border-[#E4DDD0] text-xs text-[#2A2420] focus:outline-none focus:border-[#2F6E5D]"
                    placeholder="Enter verbatim spoken dialect transcription..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A2420] mb-1">
                    English / Hindi Translation
                  </label>
                  <textarea
                    rows={4}
                    value={editTranslation}
                    onChange={(e) => setEditTranslation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#FFFFFF] border border-[#E4DDD0] text-xs text-[#2A2420] focus:outline-none focus:border-[#2F6E5D]"
                    placeholder="Enter standard translation for national accessibility..."
                  />
                </div>

                <div className="pt-4 border-t border-[#E4DDD0] flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-[#2A2420]/75 hover:bg-[#E4DDD0]/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResubmit}
                    className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-[#2F6E5D] text-[#FAF7F1] text-xs font-medium hover:bg-[#25584a] disabled:opacity-50 transition-colors"
                  >
                    {isSubmittingResubmit ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Resubmitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Resubmit for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
