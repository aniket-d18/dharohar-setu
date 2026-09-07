'use client';

import { Mic, Video, Image as ImageIcon, FileText, MapPin, Volume2, ShieldCheck, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLanguage } from '@/context/LanguageContext';
import { useRecordTranslation } from '@/hooks/useRecordTranslation';
import { getCategoryCover } from '@/utils/categoryCovers';
import { getApiUrl } from '@/utils/apiUrl';
import { CATEGORY_I18N } from '@/utils/captureI18n';

export interface RecordCardData {
  id: string;
  mediaType: 'AUDIO' | 'VIDEO' | 'IMAGE' | 'TEXT';
  mediaUrl: string;
  thumbnailUrl?: string | null;
  category: string;
  tags: string[];
  speakerName?: string | null;
  speakerAge?: number | null;
  transcriptionText?: string | null;
  translationText?: string | null;
  summaryText?: string | null;
  verificationStatus: 'UNVERIFIED' | 'COMMUNITY_VERIFIED' | 'STEWARD_ENDORSED' | 'EXPERT_REVIEWED';
  region?: {
    id: string;
    name: string;
    level: string;
    vitalityStatus?: string;
    vitalityScore?: number;
  } | null;
  language?: {
    id: string;
    name: string;
    vitalityStatus?: string;
  } | null;
  craft?: {
    id: string;
    name: string;
  } | null;
}

export default function RecordCard({ record }: { record: RecordCardData }) {
  const t = useTranslations('common');

  const {
    language,
    isTranslating,
    hasTranslation,
    showOriginal,
    setShowOriginal,
    displayedTitle,
    displayedTranslation,
    displayedTags,
  } = useRecordTranslation(record.id, {
    summaryText: record.summaryText,
    translationText: record.translationText,
    transcriptionText: record.transcriptionText,
    tags: record.tags,
  });

  // Format Category name to localized title
  const formatCategory = (cat: string) => {
    const curLang = (language === 'mr' || language === 'hi') ? language : 'en';
    const catMap = CATEGORY_I18N[curLang] || CATEGORY_I18N.en;
    if (catMap[cat]?.label) return catMap[cat].label;
    return cat
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Media icon
  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'AUDIO':
        return <Mic className="w-4 h-4 text-[#C97A3D]" />;
      case 'VIDEO':
        return <Video className="w-4 h-4 text-[#C97A3D]" />;
      case 'IMAGE':
        return <ImageIcon className="w-4 h-4 text-[#C97A3D]" />;
      case 'TEXT':
      default:
        return <FileText className="w-4 h-4 text-[#C97A3D]" />;
    }
  };

  // Verification trust badge styling as specified in design doc
  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'EXPERT_REVIEWED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-[#B54A3A]/10 text-[#B54A3A] border border-[#B54A3A]/30">
            {t('expertReviewed')}
          </span>
        );
      case 'STEWARD_ENDORSED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-[#C97A3D]/10 text-[#C97A3D] border border-[#C97A3D]/30">
            {t('stewardEndorsed')}
          </span>
        );
      case 'COMMUNITY_VERIFIED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/30">
            {t('communityVerified')}
          </span>
        );
      case 'UNVERIFIED':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium border border-[#E4DDD0] text-[#2A2420]/50">
            {t('pendingReview')}
          </span>
        );
    }
  };

  // Resolve authentic photo: If it's an uploaded image, use the real field photo
  const hasRealImage = record.mediaType === 'IMAGE' && Boolean(record.mediaUrl);
  const photoUrl = hasRealImage
    ? (record.mediaUrl.startsWith('/uploads/') ? `${getApiUrl()}${record.mediaUrl}` : record.mediaUrl)
    : (record.thumbnailUrl && !record.thumbnailUrl.includes('unsplash.com') ? record.thumbnailUrl : null);

  return (
    <div className="group bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg overflow-hidden hover:border-[#C97A3D] transition-all duration-300 flex flex-col justify-between relative">
      <div>
        {/* Card Media Preview Header */}
        <Link href={`/record/${record.id}`} className="block relative aspect-[16/9] w-full bg-[#1E1B18] overflow-hidden cursor-pointer">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={record.summaryText || 'Cultural heritage record'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
              loading="lazy"
            />
          ) : (
            /* Dignified Archival Voice & Oral Lore Plaque (Strictly 0% dummy photos, 0% AI) */
            <div className="w-full h-full bg-gradient-to-br from-[#24201D] via-[#1A1815] to-[#12100E] p-4 flex flex-col justify-between relative overflow-hidden group-hover:bg-[#1E1B18] transition-colors">
              {/* Traditional Indian Sacred Geometry Rings */}
              <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full border border-[#C97A3D]/20 opacity-30 pointer-events-none" />
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-[#C97A3D]/10 opacity-20 pointer-events-none" />

              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C97A3D] font-semibold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#C97A3D]" />
                  <span>Archival Voice Recording</span>
                </span>
              </div>

              <div className="my-auto text-center py-2 z-10">
                <div className="w-11 h-11 rounded-full bg-[#C97A3D]/15 border border-[#C97A3D]/40 flex items-center justify-center mx-auto mb-2 text-[#C97A3D] group-hover:scale-110 transition-transform shadow-inner">
                  <Mic className="w-5 h-5 text-[#C97A3D]" />
                </div>
                <p className="text-xs font-serif text-[#FAF7F1] font-medium truncate max-w-[220px] mx-auto opacity-90">
                  {record.speakerName ? `Voice of ${record.speakerName}` : (record.language?.name ? `${record.language.name} Oral Lore` : 'Living Oral Heritage')}
                </p>
                <p className="text-[10px] text-[#FAF7F1]/50 font-sans mt-0.5">
                  Preserved Field Audio Recording
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#FAF7F1]/40 z-10 pt-1 border-t border-white/5">
                <span>Living Memory</span>
                <span className="font-mono text-[#C97A3D]/90 font-medium">Listen Audio →</span>
              </div>
            </div>
          )}

          {/* Top-Right Quiet Media Type Icon */}
          <div className="absolute top-2.5 right-2.5 p-1.5 rounded bg-[#FFFFFF]/90 backdrop-blur-sm border border-[#E4DDD0] shadow-none z-20">
            {getMediaIcon(record.mediaType)}
          </div>

          {/* Category Tag (Deep Teal as per Design Doc) */}
          <div className="absolute bottom-2.5 left-2.5 z-20">
            <span className="inline-block px-2.5 py-0.5 rounded text-xs font-sans font-medium bg-[#2F6E5D] text-[#FAF7F1] shadow-none">
              {formatCategory(record.category)}
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Dual-Display Toggle & Translation Status (Active when UI is non-English) */}
          {language !== 'en' && (
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#E4DDD0]/70">
              <div className="inline-flex items-center rounded-full bg-[#FAF7F1] border border-[#E4DDD0] p-0.5 shadow-none">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowOriginal(false);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium transition-all ${
                    !showOriginal
                      ? 'bg-[#2F6E5D] text-[#FAF7F1] shadow-xs'
                      : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                  }`}
                  title="Display AI translated content"
                >
                  {t('showTranslated')}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowOriginal(true);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium transition-all ${
                    showOriginal
                      ? 'bg-[#C97A3D] text-[#FAF7F1] shadow-xs'
                      : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                  }`}
                  title="Display original English / source text"
                >
                  {t('showOriginal')}
                </button>
              </div>

              <div className="flex items-center space-x-1 text-[10px] font-sans">
                {isTranslating ? (
                  <span className="inline-flex items-center text-[#C97A3D] space-x-1 animate-pulse">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>{t('translating')}</span>
                  </span>
                ) : !showOriginal && hasTranslation ? (
                  <span className="inline-flex items-center text-[#2F6E5D] space-x-1 bg-[#2F6E5D]/10 px-1.5 py-0.5 rounded border border-[#2F6E5D]/20">
                    <Sparkles className="w-2.5 h-2.5 text-[#2F6E5D]" />
                    <span>{t('aiTranslatedBadge')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[#2A2420]/50 space-x-1">
                    <span>{t('originalAuthenticBadge')}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Location and Dialect / Craft info */}
          <div className="flex items-center justify-between text-xs text-[#2A2420]/65 mb-2">
            <span className="flex items-center space-x-1 truncate max-w-[65%]">
              <MapPin className="w-3.5 h-3.5 text-[#C97A3D] shrink-0" />
              <span className="truncate">{record.region?.name || 'India'}</span>
            </span>
            {record.language?.name && (
              <span className="text-[#C97A3D] font-medium truncate shrink-0">
                {record.language.name}
              </span>
            )}
          </div>

          {/* Title / Summary */}
          <Link href={`/record/${record.id}`} className="block">
            <h3 className="font-serif text-base sm:text-lg font-medium text-[#2A2420] mb-2.5 line-clamp-2 leading-snug group-hover:text-[#C97A3D] transition-colors cursor-pointer">
              {displayedTitle || 'Recorded oral heritage memory'}
            </h3>
          </Link>

          {/* Native Transcription Quote (Preserved authentically in all languages) */}
          {record.transcriptionText && (
            <p className="text-xs text-[#2A2420]/85 italic line-clamp-2 mb-2 font-serif bg-[#F5F0E6] p-2 rounded border-l-2 border-[#C97A3D]">
              "{record.transcriptionText}"
            </p>
          )}

          {/* Translation Preview */}
          {displayedTranslation && (
            <p className="text-xs text-[#2A2420]/70 line-clamp-2 mb-3 leading-relaxed">
              {displayedTranslation}
            </p>
          )}

          {/* Tags */}
          {displayedTags && displayedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {displayedTags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-sans bg-[#FAF7F1] text-[#2A2420]/65 border border-[#E4DDD0]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Speaker & Trust Badge */}
      <div className="px-4 sm:px-5 py-3 border-t border-[#E4DDD0] bg-[#FAF7F1] flex items-center justify-between text-xs">
        <span className="text-[#2A2420]/65 truncate">
          {record.speakerName ? (
            <span>
              {t('by')} {record.speakerName}
              {record.speakerAge ? ` (${record.speakerAge}y)` : ''}
            </span>
          ) : (
            <span className="italic">{t('anonymousSpeaker')}</span>
          )}
        </span>
        <Link href={`/record/${record.id}`}>
          {getVerificationBadge(record.verificationStatus)}
        </Link>
      </div>
    </div>
  );
}
