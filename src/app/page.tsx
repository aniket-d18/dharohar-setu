'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecordCard, { RecordCardData } from '@/components/RecordCard';
import { useTranslations } from '@/context/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  Compass,
  MapPin,
  Volume2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Users,
  Layers,
  BookOpen,
  Mic,
} from 'lucide-react';

interface LiveCounters {
  totalRecords: number;
  totalLanguages: number;
  verifiedRecords: number;
  totalContributors: number;
  regionsCovered: number;
}

interface FadingLanguage {
  id: string;
  name: string;
  scriptName?: string;
  estimatedSpeakers: number;
  averageSpeakerAge: number;
  vitalityStatus: string;
  yearsToCritical: number;
  regions: Array<{ region: { id: string; name: string } }>;
  _count?: { records: number };
}

export default function HomePage() {
  const tHome = useTranslations('home');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const [counters, setCounters] = useState<LiveCounters>({
    totalRecords: 49,
    totalLanguages: 32,
    verifiedRecords: 0,
    totalContributors: 4,
    regionsCovered: 42,
  });
  const [fadingLanguages, setFadingLanguages] = useState<FadingLanguage[]>([]);
  const [featuredRecords, setFeaturedRecords] = useState<RecordCardData[]>([]);
  const [activeTickerIndex, setActiveTickerIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const CAROUSEL_CARDS = [
    {
      id: 'ritual',
      badge: 'Ritual',
      badgeColor: 'bg-[#B54A3A] text-[#FAF7F1]',
      title: 'Spiti Rain Invocation',
      subtitle: 'Lahaul & Spiti · ~150 voices',
      quote: '"Kharji khorji, yul la chhar be..."',
      translation: '"Oh clouds of the high pass, bring rain to our dry valley..."',
      media: 'Sacred chant · 0:45',
      isHero: false
    },
    {
      id: 'folktale',
      badge: 'Folktale',
      badgeColor: 'bg-[#2F6E5D] text-[#FAF7F1]',
      title: 'Nihali River Spirit',
      subtitle: 'Buldhana · ~2,000 voices',
      quote: '"Biki poyki, naku awa..."',
      translation: '"When the river swells, the water spirit wakes..."',
      media: 'Oral storytelling · 2:10',
      isHero: false
    },
    {
      id: 'hero',
      badge: 'Featured record of the week',
      badgeColor: 'bg-[#C97A3D]/15 text-[#C97A3D] border border-[#C97A3D]/30',
      title: 'Toda Morning Hymn',
      subtitle: 'The Nilgiris, Tamil Nadu · ~800 voices left',
      quote: '"En nodw kars kars koodsh, nodw pinsh poyth. Tevh noed koodt ensh..."',
      translation: '"When dawn touches the high shola ridge, we lead the sacred buffaloes to the dairy temple, praying for the wellbeing of the seven hills."',
      media: 'Oral pastoral chant · 1:42',
      isHero: true
    },
    {
      id: 'lullaby',
      badge: 'Lullaby',
      badgeColor: 'bg-[#2F6E5D] text-[#FAF7F1]',
      title: 'Great Andamanese Cradle',
      subtitle: 'Strait Island · ~48 voices',
      quote: '"Bulu bulu, miko teye..."',
      translation: '"Sleep now, the tide is going out to the deep ocean..."',
      media: 'Lullaby singing · 1:15',
      isHero: false
    },
    {
      id: 'craft',
      badge: 'Craft',
      badgeColor: 'bg-[#C97A3D] text-[#FAF7F1]',
      title: 'Rogan Art Motif',
      subtitle: 'Nirona · ~20 practitioners',
      quote: '"Tedo medo, pako rang..."',
      translation: '"The castor oil paste follows the needle, weaving the tree of life..."',
      media: 'Artisan interview · 3:20',
      isHero: false
    }
  ];

  const POSITIONS = [
    { x: -280, y: 15, rotate: -12, scale: 0.8, opacity: 0.2, zIndex: 0 },
    { x: -140, y: 5, rotate: -6, scale: 0.9, opacity: 0.4, zIndex: 10 },
    { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 20 },
    { x: 140, y: 5, rotate: 6, scale: 0.9, opacity: 0.4, zIndex: 10 },
    { x: 280, y: 15, rotate: 12, scale: 0.8, opacity: 0.2, zIndex: 0 }
  ];

  const [activeIndex, setActiveIndex] = useState(2);

  const mouseXVal = useMotionValue(0);
  const mouseYVal = useMotionValue(0);
  const smoothMouseX = useSpring(mouseXVal, { stiffness: 40, damping: 20 });
  const smoothMouseY = useSpring(mouseYVal, { stiffness: 40, damping: 20 });

  const parallaxX = useTransform(smoothMouseX, [-1, 1], [-15, 15]);
  const parallaxY = useTransform(smoothMouseY, [-1, 1], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.floor((x / rect.width) * 5);
    setActiveIndex(Math.min(Math.max(index, 0), 4));

    // Micro parallax for active card
    const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseXVal.set(normX);
    mouseYVal.set(normY);
  };

  const handleMouseLeave = () => {
    setActiveIndex(2); // return to center on leave
    mouseXVal.set(0);
    mouseYVal.set(0);
  };

  useEffect(() => {
    // 1. Fetch live counters
    fetch(`${API_URL}/api/analytics/live-counters`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.totalRecords === 'number') {
          setCounters(data);
        }
      })
      .catch(err => console.error('Failed to load counters:', err));

    // 2. Fetch fading fastest languages
    fetch(`${API_URL}/api/languages/fading-fastest?limit=5`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFadingLanguages(data);
        }
      })
      .catch(err => console.error('Failed to load fading languages:', err));

    // 3. Fetch featured records
    fetch(`${API_URL}/api/records?limit=6&sort=urgency`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setFeaturedRecords(data.data);
        }
      })
      .catch(err => console.error('Failed to load records:', err));
  }, [API_URL]);

  // Rotate fading fastest ticker every 5 seconds
  useEffect(() => {
    if (fadingLanguages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTickerIndex(prev => (prev + 1) % fadingLanguages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [fadingLanguages]);

  const currentUrgentLanguage = fadingLanguages[activeTickerIndex];

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* 1. HERO SECTION WITH FANNED CARD CAROUSEL (Design Doc Spec) */}
        {/* ========================================================= */}
        <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C97A3D]/10 border border-[#C97A3D]/30 text-xs font-sans text-[#C97A3D] mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tHome('heroBadge')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15] text-[#2A2420] mb-6">
              {tHome('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-[#2A2420]/75 font-sans leading-relaxed max-w-2xl mx-auto mb-8">
              {tHome('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/capture"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-md bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-base hover:bg-[#B86B30] transition-all shadow-none group"
              >
                <Mic className="w-4 h-4" />
                <span>{tNav('capture')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/archive"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-md border border-[#E4DDD0] text-[#2A2420] font-sans font-medium text-base hover:bg-[#E4DDD0]/40 hover:border-[#C97A3D] transition-all"
              >
                <Compass className="w-4 h-4 text-[#C97A3D]" />
                <span>{tCommon('exploreArchive')}</span>
              </Link>
            </div>
          </div>

          {/* FANNED CARD CAROUSEL */}
          <div 
            className="relative max-w-5xl mx-auto mt-6 px-4 py-8 flex items-center justify-center min-h-[420px] overflow-hidden sm:overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {CAROUSEL_CARDS.map((card, i) => {
              const posIndex = (i - activeIndex + 2 + 5) % 5;
              const pos = POSITIONS[posIndex];
              const isActive = posIndex === 2;

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={false}
                  animate={{
                    x: pos.x,
                    y: pos.y,
                    rotate: pos.rotate,
                    scale: pos.scale,
                    opacity: pos.opacity,
                    zIndex: pos.zIndex,
                    filter: isActive ? 'blur(0px)' : 'blur(2px)'
                  }}
                  transition={{ type: "spring", stiffness: 50, damping: 14 }}
                  className={`absolute origin-center ${isActive ? 'w-[calc(100%-2rem)] sm:w-full max-w-md' : 'w-64'}`}
                  style={{ cursor: isActive ? 'default' : 'pointer' }}
                  onClick={() => !isActive && setActiveIndex(i)}
                >
                  <motion.div 
                    style={{ x: isActive ? parallaxX : 0, y: isActive ? parallaxY : 0 }}
                    className={`transition-colors duration-500 ease-out ${isActive ? 'bg-[#FFFFFF] border-2 border-[#C97A3D] p-6 sm:p-7 shadow-none' : 'bg-[#F5F0E6] border border-[#E4DDD0] p-5 shadow-none'} rounded-xl`}
                  >
                    
                    <div className={`flex items-center ${isActive ? 'justify-between mb-4' : 'mb-2'}`}>
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-sans font-medium ${card.badgeColor}`}>
                        {isActive && card.isHero && <Flame className="w-3.5 h-3.5" />}
                        <span>{card.badge}</span>
                      </span>
                      {isActive && card.isHero && (
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-[#B54A3A]/10 text-[#B54A3A] border border-[#B54A3A]/30">
                          {tCommon('criticalUrgency')}
                        </span>
                      )}
                    </div>

                    <div className={isActive ? 'mb-4' : ''}>
                      <h3 className={`font-serif font-medium text-[#2A2420] ${isActive ? 'text-2xl mb-1' : 'text-sm mb-1'}`}>
                        {card.title}
                      </h3>
                      <p className={`text-[#C97A3D] flex items-center ${isActive ? 'text-sm space-x-1.5' : 'text-xs'}`}>
                        {isActive && <MapPin className="w-3.5 h-3.5 shrink-0" />}
                        <span className="truncate sm:whitespace-normal">{card.subtitle}</span>
                      </p>
                    </div>

                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring", stiffness: 60, damping: 15 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-[#FAF7F1] p-3.5 rounded-lg border border-[#E4DDD0] mb-5 mt-4">
                            <p className="text-xs text-[#2A2420]/90 italic font-serif leading-relaxed mb-2">
                              {card.quote}
                            </p>
                            <p className="text-xs text-[#2A2420]/70 leading-relaxed">
                              {card.translation}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#E4DDD0] gap-3 sm:gap-0">
                            <div className="flex items-center space-x-2 text-xs text-[#2A2420]/65">
                              <Volume2 className="w-4 h-4 text-[#C97A3D] shrink-0" />
                              <span>{card.media}</span>
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); setIsPlayingAudio(!isPlayingAudio); }}
                              className="inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-md bg-[#C97A3D] text-[#FAF7F1] text-xs font-sans font-semibold hover:bg-[#B86B30] transition-colors shrink-0 shadow-none"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{isPlayingAudio ? tCommon('listening') : tCommon('listenNow')}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. LIVE IMPACT COUNTERS STRIP (Design Doc & PRD Spec)     */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-6 sm:p-8 shadow-none">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#E4DDD0]">
              <div className="pt-4 sm:pt-0">
                <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#2A2420] mb-1">
                  {counters.totalRecords}
                </p>
                <p className="text-xs font-sans text-[#2A2420]/60 tracking-wide uppercase">
                  {tHome('totalRecords')}
                </p>
              </div>

              <div className="pt-4 sm:pt-0">
                <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#C97A3D] mb-1">
                  {counters.totalLanguages}
                </p>
                <p className="text-xs font-sans text-[#2A2420]/60 tracking-wide uppercase">
                  {tHome('languagesDocumented')}
                </p>
              </div>

              <div className="pt-4 sm:pt-0">
                <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#6B8F5E] mb-1">
                  {counters.verifiedRecords}
                </p>
                <p className="text-xs font-sans text-[#2A2420]/60 tracking-wide uppercase">
                  {tHome('verifiedRecords')}
                </p>
              </div>

              <div className="pt-4 sm:pt-0">
                <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#2A2420] mb-1">
                  {counters.totalContributors}
                </p>
                <p className="text-xs font-sans text-[#2A2420]/60 tracking-wide uppercase">
                  {tHome('activeContributors')}
                </p>
              </div>

              <div className="pt-4 sm:pt-0 col-span-2 sm:col-span-1">
                <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#2F6E5D] mb-1">
                  {counters.regionsCovered}
                </p>
                <p className="text-xs font-sans text-[#2A2420]/60 tracking-wide uppercase">
                  {tHome('regionsCovered')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. "FADING FASTEST" TICKER (Design Doc Spec)              */}
        {/* ========================================================= */}
        {currentUrgentLanguage && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentUrgentLanguage.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-[#FFFFFF] border border-[#B54A3A]/30 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-none"
              >
                <div className="flex items-center space-x-3">
                  <span className="shrink-0 px-2.5 py-1 rounded text-xs font-sans font-medium bg-[#B54A3A] text-[#FAF7F1] flex items-center space-x-1.5 shadow-none">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{tHome('fadingFastest')}</span>
                  </span>
                  <div>
                    <span className="font-serif text-base sm:text-lg font-medium text-[#2A2420]">
                      {currentUrgentLanguage.name}
                    </span>
                    <span className="text-xs text-[#2A2420]/70 ml-2">
                      (~{currentUrgentLanguage.estimatedSpeakers} fluent speakers left · avg age {currentUrgentLanguage.averageSpeakerAge})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <span className="text-xs font-sans text-[#B54A3A] font-medium bg-[#B54A3A]/10 px-2.5 py-1 rounded border border-[#B54A3A]/30">
                    {tHome('criticalThreshold', { years: currentUrgentLanguage.yearsToCritical })}
                  </span>
                  <Link
                    href={`/archive?search=${encodeURIComponent(currentUrgentLanguage.name)}`}
                    className="text-xs text-[#C97A3D] hover:underline flex items-center space-x-1 font-medium"
                  >
                    <span>{tHome('listenRecordings')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </section>
        )}

        {/* ========================================================= */}
        {/* 4. RECENT ARCHIVE ENTRIES GRID (Live Database Data)        */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2A2420]">
                {tHome('recentRecords')}
              </h2>
              <p className="text-sm text-[#2A2420]/70 mt-1">
                {tHome('recentRecordsDesc')}
              </p>
            </div>

            <Link
              href="/archive"
              className="inline-flex items-center space-x-1.5 text-sm font-sans text-[#C97A3D] hover:text-[#B86B30] font-medium"
            >
              <span>{tCommon('viewFullArchive')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRecords.map(record => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-[#E4DDD0] rounded-lg bg-[#FFFFFF]">
              <p className="text-sm text-[#2A2420]/60">{tCommon('loading')}</p>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 5. EDITORIAL "WHY THIS MATTERS" (PRD & Design Doc Spec)   */}
        {/* ========================================================= */}
        <section className="border-t border-[#E4DDD0] bg-[#F5F0E6] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2A2420] mb-6">
              {tHome('whyMattersTitle')}
            </h2>
            <div className="text-base text-[#2A2420]/80 leading-relaxed space-y-4 mb-8 text-left sm:text-center">
              <p>
                {tHome('whyMattersP1', { count: 197 })}
              </p>
              <p>
                {tHome('whyMattersP2')}
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/archive"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#2F6E5D] text-[#FAF7F1] text-sm font-sans font-medium hover:bg-[#25584a] transition-colors shadow-none"
              >
                <BookOpen className="w-4 h-4" />
                <span>{tHome('browseEndangered')}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
