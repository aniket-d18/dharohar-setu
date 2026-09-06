'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Sparkles,
  Search,
  BookOpen,
  Volume2,
  ArrowRight,
  MapPin,
  Flame,
  Globe,
  Share2,
  Check,
} from 'lucide-react';

import { useTranslations } from '@/context/LanguageContext';

interface UntranslatableItem {
  id: string;
  term: string;
  script?: string | null;
  phonetic?: string | null;
  literalMeaning?: string | null;
  explanation: string;
  isFeatured: boolean;
  record?: {
    id: string;
    mediaType: string;
    category: string;
    region?: {
      id: string;
      name: string;
      vitalityStatus?: string;
    } | null;
    language?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export default function UntranslatableGalleryPage() {
  const t = useTranslations('untranslatable');
  const tCommon = useTranslations('common');

  const [featured, setFeatured] = useState<UntranslatableItem | null>(null);
  const [entries, setEntries] = useState<UntranslatableItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch discovery of the day and full catalog in parallel with no-store
        const [dayRes, listRes] = await Promise.all([
          fetch(`${apiUrl}/api/untranslatable/discovery-of-the-day`, { cache: 'no-store' }).catch(() => null),
          fetch(`${apiUrl}/api/untranslatable`, { cache: 'no-store' }).catch(() => null),
        ]);

        if (dayRes && dayRes.ok) {
          const text = await dayRes.text();
          if (text && text.trim()) {
            try {
              const dayData = JSON.parse(text);
              if (dayData && dayData.id) {
                setFeatured(dayData);
              }
            } catch (parseErr) {
              console.warn('Failed to parse discovery of the day:', parseErr);
            }
          }
        }

        if (listRes && listRes.ok) {
          const listData = await listRes.json();
          if (Array.isArray(listData)) {
            setEntries(listData);
          }
        }
      } catch (err) {
        console.error('Error fetching untranslatable words:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [apiUrl]);

  const filteredEntries = entries.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.term.toLowerCase().includes(q) ||
      (e.phonetic && e.phonetic.toLowerCase().includes(q)) ||
      (e.literalMeaning && e.literalMeaning.toLowerCase().includes(q)) ||
      e.explanation.toLowerCase().includes(q) ||
      (e.record?.language?.name && e.record.language.name.toLowerCase().includes(q)) ||
      (e.record?.region?.name && e.record.region.name.toLowerCase().includes(q))
    );
  });

  const handleCopy = (id: string, term: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(
        `${term} — Untranslatable cultural term preserved on Dharohar Setu: ${window.location.origin}/untranslatable`
      );
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header Hero Section */}
        <section className="bg-[#FAF7F1] py-14 px-4 sm:px-8 border-b border-[#E4DDD0]">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C97A3D]/10 border border-[#C97A3D]/30 text-[#C97A3D] text-xs font-sans mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cultural Ontologies</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#2A2420] mb-4">
              {t('title')}
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#2A2420]/75 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </section>

        {/* Discovery of the Day (Featured Card) */}
        {featured && (
          <section className="max-w-5xl mx-auto px-4 sm:px-8 -mt-6">
            <div className="bg-[#FFFFFF] border-2 border-[#C97A3D] rounded-xl p-6 sm:p-10 shadow-none relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center space-x-1.5 text-xs font-sans font-medium text-[#C97A3D] bg-[#C97A3D]/10 px-3 py-1 rounded border border-[#C97A3D]/30">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t('discoveryOfTheDay')}</span>
                </span>
                {featured.record?.region?.name && (
                  <span className="flex items-center text-xs text-[#2A2420]/70">
                    <MapPin className="w-3.5 h-3.5 text-[#C97A3D] mr-1" />
                    {featured.record.region.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-baseline space-x-3 flex-wrap">
                    <h2 className="font-serif text-3xl sm:text-5xl text-[#2A2420] font-semibold">
                      {featured.term}
                    </h2>
                    {featured.script && (
                      <span className="font-serif text-xl sm:text-2xl text-[#C97A3D]">
                        ({featured.script})
                      </span>
                    )}
                    {featured.phonetic && (
                      <span className="font-mono text-sm text-[#2A2420]/60">
                        {featured.phonetic}
                      </span>
                    )}
                  </div>

                  {featured.record?.language?.name && (
                    <p className="text-xs font-sans text-[#2F6E5D] uppercase tracking-wider font-semibold">
                      {t('spokenIn', { language: featured.record.language.name })}
                    </p>
                  )}

                  {featured.literalMeaning && (
                    <p className="text-sm font-sans text-[#2A2420]/80 italic">
                      <strong>{t('literalMeaning')}:</strong> "{featured.literalMeaning}"
                    </p>
                  )}

                  <p className="text-sm sm:text-base font-sans text-[#2A2420]/90 leading-relaxed pt-1">
                    {featured.explanation}
                  </p>
                </div>

                <div className="flex flex-col space-y-3 justify-center md:border-l md:border-[#E4DDD0] md:pl-6">
                  {featured.record?.id && (
                    <Link
                      href={`/record/${featured.record.id}`}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-sm hover:bg-[#B86B30] transition-colors shadow-none"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{t('hearOriginal')}</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleCopy(featured.id, featured.term)}
                    className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded border border-[#E4DDD0] text-[#2A2420]/80 font-sans text-xs hover:bg-[#FAF7F1] hover:text-[#2A2420] transition-colors"
                  >
                    {copiedId === featured.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2F6E5D]" />
                        <span className="text-[#2F6E5D]">{tCommon('copied')}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{tCommon('shareDiscovery')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Search & Filter Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8 mt-12 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[#C97A3D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg pl-10 pr-4 py-2 text-sm text-[#2A2420] placeholder-[#2A2420]/40 focus:outline-none focus:border-[#C97A3D]"
              />
            </div>

            <div className="text-xs text-[#2A2420]/60 self-end sm:self-center font-sans">
              {t('entriesCount', { count: filteredEntries.length })}
            </div>
          </div>
        </section>

        {/* Terms Grid */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-[#C97A3D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-serif text-sm text-[#2A2420]/70">{tCommon('loading')}</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-8 shadow-none">
              <BookOpen className="w-8 h-8 text-[#C97A3D]/50 mx-auto mb-2" />
              <p className="font-serif text-base text-[#2A2420]/80">{t('emptyTitle')}</p>
              <p className="text-xs text-[#2A2420]/50 mt-1">
                {t('emptyDesc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-6 hover:border-[#C97A3D] transition-all duration-300 flex flex-col justify-between group shadow-none"
                >
                  <div>
                    {/* Top Row: Language & Region badge */}
                    <div className="flex items-center justify-between text-xs text-[#2A2420]/60 mb-3">
                      <span className="font-medium text-[#2F6E5D] bg-[#2F6E5D]/10 px-2 py-0.5 rounded border border-[#2F6E5D]/20">
                        {entry.record?.language?.name || 'Oral isolate'}
                      </span>
                      {entry.record?.region?.name && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#C97A3D]" />
                          <span>{entry.record.region.name}</span>
                        </span>
                      )}
                    </div>

                    {/* Word Header */}
                    <div className="flex items-baseline space-x-2.5 mb-2">
                      <h3 className="font-serif text-2xl text-[#2A2420] font-semibold group-hover:text-[#C97A3D] transition-colors">
                        {entry.term}
                      </h3>
                      {entry.script && (
                        <span className="font-serif text-sm text-[#C97A3D]">
                          {entry.script}
                        </span>
                      )}
                      {entry.phonetic && (
                        <span className="font-mono text-xs text-[#2A2420]/50">
                          {entry.phonetic}
                        </span>
                      )}
                    </div>

                    {/* Literal Meaning */}
                    {entry.literalMeaning && (
                      <p className="text-xs text-[#2A2420]/70 italic mb-3 font-sans border-l-2 border-[#C97A3D] pl-2.5">
                        {t('literalMeaning')}: "{entry.literalMeaning}"
                      </p>
                    )}

                    {/* Cultural Explanation */}
                    <p className="text-xs sm:text-sm text-[#2A2420]/85 leading-relaxed font-sans mb-4">
                      {entry.explanation}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-[#E4DDD0] flex items-center justify-between">
                    {entry.record?.id ? (
                      <Link
                        href={`/record/${entry.record.id}`}
                        className="inline-flex items-center space-x-1.5 text-xs text-[#C97A3D] hover:text-[#B86B30] font-sans font-medium"
                      >
                        <span>{t('listenFullRecord')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-[#2A2420]/40">{tCommon('fieldDocumentation')}</span>
                    )}

                    <button
                      onClick={() => handleCopy(entry.id, entry.term)}
                      className="text-[#2A2420]/50 hover:text-[#C97A3D] transition-colors p-1"
                      title="Copy cultural citation"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-3.5 h-3.5 text-[#2F6E5D]" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
