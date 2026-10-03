'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecordCard, { RecordCardData } from '@/components/RecordCard';
import { useTranslations } from '@/context/LanguageContext';
import { getApiUrl } from '@/utils/apiUrl';
import { cachedFetch } from '@/utils/apiCache';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
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
  ChevronLeft,
  ChevronRight,
  Map,
  Music,
  Hand,
  ScrollText,
  Play,
  Search,
  Globe,
  Award,
  Heart,
  Clock,
  Headphones,
  Camera,
  FileText,
  Star,
} from 'lucide-react';

/* ================================================================
   INTERFACES
   ================================================================ */
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

/* ================================================================
   CATEGORY TILES DATA — Indian Culture Portal inspired
   ================================================================ */
const EXPLORE_CATEGORIES = [
  {
    id: 'songs',
    title: 'Folk Songs & Lullabies',
    subtitle: 'Ancestral melodies passed through generations',
    icon: Music,
    color: '#C97A3D',
    href: '/archive?category=LULLABY',
    count: '12+ Records',
    image: '/images/categories/folk-songs.jpg',
  },
  {
    id: 'stories',
    title: 'Oral Narratives',
    subtitle: 'Folktales, myths, and indigenous storytelling',
    icon: BookOpen,
    color: '#2F6E5D',
    href: '/archive?category=STORY',
    count: '8+ Records',
    image: '/images/categories/oral-stories.jpg',
  },
  {
    id: 'crafts',
    title: 'Sacred Crafts',
    subtitle: 'Ancient artisanship and textile traditions',
    icon: Hand,
    color: '#C5A55A',
    href: '/archive?category=CRAFT_TECHNIQUE',
    count: '6+ Records',
    image: '/images/categories/sacred-crafts.jpg',
  },
  {
    id: 'rituals',
    title: 'Living Rituals',
    subtitle: 'Ceremonies, prayers, and spiritual practices',
    icon: Sparkles,
    color: '#B54A3A',
    href: '/archive?category=RITUAL',
    count: '5+ Records',
    image: '/images/categories/rituals.jpg',
  },
  {
    id: 'medicine',
    title: 'Traditional Medicine',
    subtitle: 'Ancient herbal remedies, Ayurveda, and wild cures',
    icon: Heart,
    color: '#5E8F6B',
    href: '/archive?category=TRADITIONAL_MEDICINE',
    count: 'Folk Wisdom',
    image: '/images/categories/traditional-medicine.jpg',
  },
  {
    id: 'atlas',
    title: 'Cultural Atlas',
    subtitle: 'Interactive geo-heritage map of India',
    icon: Map,
    color: '#6B8F5E',
    href: '/atlas',
    count: '42 Regions',
    image: '/images/categories/cultural-atlas.jpg',
  },
  {
    id: 'concepts',
    title: 'Untranslatable Words',
    subtitle: 'Indigenous concepts with no English equivalent',
    icon: ScrollText,
    color: '#9C4D18',
    href: '/untranslatable',
    count: 'Living Lexicon',
    image: '/images/categories/oral-stories.jpg',
  },
];


/* ================================================================
   CURATED COLLECTIONS DATA
   ================================================================ */
const COLLECTIONS = [
  {
    id: 'vanishing-voices',
    title: 'Vanishing Voices of the Nilgiris',
    description: 'The Toda, Irula, and Kurumba communities preserve oral traditions dating back millennia in the misty hills of Tamil Nadu.',
    items: 8,
    image: '/images/categories/oral-stories.jpg',
    tag: 'Critically Endangered',
    tagColor: '#B54A3A',
  },
  {
    id: 'textile-heritage',
    title: 'Threads of Time: India\'s Textile Legacy',
    description: 'From Kanchipuram silk to Pashmina wool — documenting the living art of India\'s master weavers.',
    items: 12,
    image: '/images/categories/sacred-crafts.jpg',
    tag: 'Featured Collection',
    tagColor: '#C5A55A',
  },
  {
    id: 'monsoon-songs',
    title: 'Songs of the Monsoon',
    description: 'Seasonal folk melodies that celebrate the arrival of rains across diverse linguistic communities.',
    items: 6,
    image: '/images/categories/folk-songs.jpg',
    tag: 'Seasonal',
    tagColor: '#2F6E5D',
  },
];

/* ================================================================
   EDITORIAL STORIES DATA
   ================================================================ */
const STORIES = [
  {
    id: 'last-speakers',
    title: 'The Last Speakers of Great Andamanese',
    excerpt: 'On a remote island in the Bay of Bengal, fewer than 50 people hold the key to a language that predates most civilizations...',
    readTime: '5 min read',
    category: 'Language',
    image: '/images/categories/oral-stories.jpg',
  },
  {
    id: 'rogan-art',
    title: 'Rogan Art: When Oil Becomes Poetry',
    excerpt: 'In Nirona village, Gujarat, one family keeps alive a 400-year-old craft of painting with castor oil paste...',
    readTime: '4 min read',
    category: 'Craft',
    image: '/images/categories/sacred-crafts.jpg',
  },
  {
    id: 'spiti-valley',
    title: 'Echoes from the Roof of the World',
    excerpt: 'At 12,500 feet, the ancient monasteries of Spiti Valley preserve rain invocation chants that science can barely explain...',
    readTime: '6 min read',
    category: 'Ritual',
    image: '/images/categories/rituals.jpg',
  },
];

/* ================================================================
   PARTNERS / INSTITUTIONS
   ================================================================ */
const PARTNERS = [
  'Indira Gandhi National Centre for the Arts',
  'Archaeological Survey of India',
  'National Archives of India',
  'Sahitya Akademi',
  'National Museum',
  'Anthropological Survey of India',
  'CIIL Mysuru',
  'Bharat Bhavan',
];

export default function HomePage() {
  const tHome = useTranslations('home');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const [counters, setCounters] = useState<LiveCounters>({
    totalRecords: 27,
    totalLanguages: 37,
    verifiedRecords: 18,
    totalContributors: 5,
    regionsCovered: 65,
  });
  const [fadingLanguages, setFadingLanguages] = useState<FadingLanguage[]>([]);
  const [featuredRecords, setFeaturedRecords] = useState<RecordCardData[]>([]);
  const [activeTickerIndex, setActiveTickerIndex] = useState(0);
  const [heroTextIndex, setHeroTextIndex] = useState(0);
  const [activeCollectionIndex, setActiveCollectionIndex] = useState(0);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  const API_URL = getApiUrl();

  // Hero slideshow images
  const HERO_IMAGES = [
    '/images/hero-banner.jpg',
    '/images/categories/traditional-medicine.jpg',
    '/images/categories/folk-songs.jpg',
    '/images/categories/sacred-crafts.jpg',
    '/images/categories/rituals.jpg',
    '/images/categories/oral-stories.jpg',
    '/images/categories/cultural-atlas.jpg',
  ];

  // Hero text rotation
  const heroTexts = [
    'Every voice tells a story.',
    'Every tradition has a heartbeat.',
    'Every craft holds a civilization.',
    'Every song carries a memory.',
    'Ancient wild herbs preserve living cures.',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Hero image rotation (3.4s interval for lively, responsive rotation)
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3400);
    return () => clearInterval(interval);
  }, [HERO_IMAGES.length]);

  // Collection auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCollectionIndex((prev) => (prev + 1) % COLLECTIONS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cachedFetch<any>(`${API_URL}/api/analytics/live-counters`, { ttl: 15 * 60 * 1000 })
      .then(data => {
        if (data && typeof data.totalRecords === 'number') {
          setCounters(data);
        }
      })
      .catch(err => console.error('Failed to load counters:', err));

    cachedFetch<any[]>(`${API_URL}/api/languages/fading-fastest?limit=5`, { ttl: 15 * 60 * 1000 })
      .then(data => {
        if (Array.isArray(data)) {
          setFadingLanguages(data);
        }
      })
      .catch(err => console.error('Failed to load fading languages:', err));

    cachedFetch<any>(`${API_URL}/api/records?limit=6&sort=urgency`, { ttl: 15 * 60 * 1000 })
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setFeaturedRecords(data.data);
        }
      })
      .catch(err => console.error('Failed to load records:', err));
  }, [API_URL]);

  useEffect(() => {
    if (fadingLanguages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTickerIndex(prev => (prev + 1) % fadingLanguages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [fadingLanguages]);

  const currentUrgentLanguage = fadingLanguages[activeTickerIndex];

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [featuredRecords, fadingLanguages]);

  /* ================================================================
     ANIMATED COUNTER COMPONENT
     ================================================================ */
  const AnimatedCounter = ({ value, suffix = '', color = '#2A2420' }: { value: number; suffix?: string; color?: string }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      const duration = 1500;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.floor(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [value]);
    return (
      <span className="font-serif font-semibold stat-glow" style={{ color }}>
        {display}{suffix}
      </span>
    );
  };

  /* ================================================================
     SHIMMER SKELETON
     ================================================================ */
  const ShimmerCard = () => (
    <div className="shimmer-card">
      <div className="shimmer h-44 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-4 w-1/3 rounded" />
        <div className="shimmer h-5 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="flex gap-2">
          <div className="shimmer h-6 w-16 rounded-full" />
          <div className="shimmer h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col selection:bg-[#C97A3D]/20 overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden w-full max-w-[100vw]">

        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* MOBILE CONSUMER EXPERIENCE                                */}
        {/* ========================================================= */}
        <div className="block md:hidden pb-8 space-y-5 overflow-x-hidden">
          {/* Mobile Hero: Edge-to-Edge Immersive Showcase */}
          <div className="relative overflow-hidden min-h-[490px] flex flex-col justify-between px-4 py-5 border-b border-[#C5A55A]/25">
            {/* Background crossfading images */}
            <div className="absolute inset-0">
              {HERO_IMAGES.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt="Indian Cultural Heritage"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: i === heroImageIndex ? 1 : 0,
                    zIndex: i === heroImageIndex ? 1 : 0,
                    transform: i === heroImageIndex ? 'scale(1.04)' : 'scale(1)',
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '0.75s, 3.4s',
                  }}
                />
              ))}
              {/* Multi-stop rich gradient for high legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110E] via-[#14110E]/75 to-[#14110E]/30" style={{ zIndex: 2 }} />
            </div>

            {/* Top pill inside card */}
            <div className="relative z-10 flex items-center justify-start">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-sans font-medium text-[#C5A55A] border border-[#C5A55A]/35">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Living Heritage Archive</span>
              </div>
            </div>

            {/* Bottom Hero Content */}
            <div className="relative z-10 mt-auto text-left space-y-3 pt-6">
              <h1 className="font-serif text-3xl font-bold tracking-tight leading-tight text-[#FAF7F1]">
                Dharohar Setu
              </h1>

              {/* Rotating subtitle */}
              <div className="h-6 overflow-hidden">
                <p className="text-sm text-[#C5A55A] font-serif italic transition-all duration-500">
                  {heroTexts[heroTextIndex]}
                </p>
              </div>

              <p className="text-xs text-[#FAF7F1]/80 font-sans leading-relaxed">
                Preserving India's endangered oral folklore, traditional medicines, sacred rituals, and vanishing dialects.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Link
                  href="/capture"
                  className="btn-primary min-h-[46px] inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl shadow-lg"
                >
                  <Mic className="w-4 h-4 shrink-0" />
                  <span>Deposit Memory</span>
                </Link>
                <Link
                  href="/archive"
                  className="min-h-[46px] inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl border border-white/25 bg-white/10 backdrop-blur-md text-[#FAF7F1] text-xs font-semibold hover:bg-white/20 active:scale-95 transition-all"
                >
                  <Compass className="w-4 h-4 text-[#C5A55A] shrink-0" />
                  <span>Explore Archive</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Category Scroll — Full-Bleed Edge-to-Edge (No artificial right padding cutoff) */}
          <div>
            <div className="px-4 mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#C5A55A]">
                Explore by Category
              </span>
              <span className="text-[10px] text-[#2A2420]/45 font-sans">
                Swipe to explore →
              </span>
            </div>
            {/* Edge-to-edge scroll container: px-4 on the track starts first item flush, but container bleeds 100% to screen edge */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2 scroll-smooth">
              {EXPLORE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.id} href={cat.href} className="shrink-0 w-36 group">
                    <div className="category-tile rounded-xl overflow-hidden aspect-[3/4] relative shadow-sm">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 z-10 flex flex-col justify-end p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                        <Icon className="w-5 h-5 text-[#FAF7F1] mb-1.5" />
                        <h3 className="font-serif text-sm font-medium text-[#FAF7F1] leading-tight">{cat.title}</h3>
                        <p className="text-[10px] text-[#FAF7F1]/60 mt-0.5">{cat.count}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {/* Trailing space spacer for comfortable end-of-scroll */}
              <div className="shrink-0 w-1" aria-hidden="true" />
            </div>
          </div>

          {/* Mobile Curated Collections Discovery Banner */}
          <div className="px-4">
            <Link
              href="/collections"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#1A1714] to-[#25201C] text-[#FAF7F1] border border-[#C5A55A]/35 shadow-md group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center shrink-0 text-[#C5A55A]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-serif text-sm font-semibold text-[#FAF7F1] group-hover:text-[#C5A55A] transition-colors">
                      Curated Exhibitions
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#C97A3D] text-white font-bold">
                      8 Themes
                    </span>
                  </div>
                  <p className="text-[11px] text-[#FAF7F1]/65 font-sans mt-0.5">
                    Wild medicine, Toda chants &amp; sacred weaves
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#C5A55A] group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </div>

          {/* Mobile Recent Records */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#C5A55A]">
                Recent Living Records
              </span>
              <Link href="/archive" className="text-xs font-sans text-[#C97A3D] font-medium hover:underline inline-flex items-center space-x-0.5">
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {featuredRecords.length > 0 ? (
                featuredRecords.slice(0, 3).map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))
              ) : (
                <div className="space-y-3">
                  <ShimmerCard />
                  <ShimmerCard />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP EXPERIENCE                                        */}
        {/* ========================================================= */}
        <div className="hidden md:block">

        {/* ========================================================= */}
        {/* 1. CINEMATIC HERO — Full viewport with banner image       */}
        {/* ========================================================= */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Background images with crossfade */}
          <div className="absolute inset-0">
            {HERO_IMAGES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="Indian Cultural Heritage"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: i === heroImageIndex ? 1 : 0,
                  transition: 'opacity 0.75s ease-in-out',
                  transform: i === heroImageIndex ? 'scale(1.04)' : 'scale(1)',
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '0.75s, 3.4s',
                }}
              />
            ))}
            <div className="hero-banner-overlay absolute inset-0" />
          </div>



          {/* Cultural pattern overlay */}
          <div className="absolute inset-0 pattern-mandala pointer-events-none" />

          {/* Hero content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Ornamental top */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="ornamental-top"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-full glass-dark text-xs font-sans text-[#C5A55A] mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="tracking-wider">{tHome('heroBadge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-[#FAF7F1] mb-6"
            >
              <span className="block">{tHome('heroTitle')}</span>
            </motion.h1>

            {/* Rotating subtitle text */}
            <div className="h-8 mb-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={heroTextIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg sm:text-xl text-[#C5A55A] font-serif italic"
                >
                  {heroTexts[heroTextIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm sm:text-base text-[#FAF7F1]/60 font-sans leading-relaxed max-w-2xl mx-auto mb-10"
            >
              {tHome('heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/archive"
                className="btn-gold min-h-[52px] inline-flex items-center justify-center space-x-2 px-8 py-3.5 text-base group"
              >
                <Compass className="w-5 h-5" />
                <span>{tCommon('exploreArchive')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/capture"
                className="min-h-[52px] inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-lg border border-[#FAF7F1]/20 text-[#FAF7F1] font-sans font-semibold text-base hover:border-[#C5A55A] hover:text-[#C5A55A] transition-all backdrop-blur-sm"
              >
                <Mic className="w-5 h-5" />
                <span>{tNav('capture')}</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. LIVE IMPACT COUNTERS — Embedded in hero bottom          */}
        {/* ========================================================= */}
        <section className="museum-dark-bg py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-0 text-center sm:divide-x divide-[#FAF7F1]/10">
              <div className="sm:px-6">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#FAF7F1] mb-1">
                  {counters.totalRecords}+
                </p>
                <p className="text-[10px] sm:text-xs font-sans text-[#C5A55A] tracking-widest uppercase">
                  {tHome('totalRecords')}
                </p>
              </div>

              <div className="sm:px-6">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#C97A3D] mb-1">
                  {counters.totalLanguages}
                </p>
                <p className="text-[10px] sm:text-xs font-sans text-[#C5A55A] tracking-widest uppercase">
                  {tHome('languagesDocumented')}
                </p>
              </div>

              <div className="sm:px-6">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#6B8F5E] mb-1">
                  {counters.verifiedRecords}
                </p>
                <p className="text-[10px] sm:text-xs font-sans text-[#C5A55A] tracking-widest uppercase">
                  {tHome('verifiedRecords')}
                </p>
              </div>

              <div className="sm:px-6">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#FAF7F1] mb-1">
                  {counters.totalContributors}
                </p>
                <p className="text-[10px] sm:text-xs font-sans text-[#C5A55A] tracking-widest uppercase">
                  {tHome('activeContributors')}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 sm:px-6">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#2F6E5D] mb-1">
                  {counters.regionsCovered}
                </p>
                <p className="text-[10px] sm:text-xs font-sans text-[#C5A55A] tracking-widest uppercase">
                  {tHome('regionsCovered')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. EXPLORE BY CATEGORY — Image-backed tiles               */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 sm:mb-28">
          <div className="text-center mb-10 sm:mb-14 reveal">
            <div className="gold-accent-line-center" />
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#2A2420] mb-3">
              Explore Our Living Heritage
            </h2>
            <p className="text-sm sm:text-base text-[#2A2420]/55 max-w-xl mx-auto">
              Dive into India's rich cultural tapestry — from ancient folk songs to endangered craft traditions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 stagger-children">
            {EXPLORE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.id} href={cat.href} className="group">
                  <div className="category-tile rounded-xl overflow-hidden aspect-[4/3] relative shadow-lg">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Content overlay */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm"
                          style={{ backgroundColor: `${cat.color}30`, border: `1px solid ${cat.color}50` }}
                        >
                          <Icon className="w-5 h-5 text-[#FAF7F1]" />
                        </div>
                        <span className="text-[11px] font-mono font-medium text-[#C5A55A] tracking-wider bg-[#1A1714]/60 px-2 py-0.5 rounded backdrop-blur-sm">
                          {cat.count}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-medium text-[#FAF7F1] mb-1 group-hover:text-[#C5A55A] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-[#FAF7F1]/60 leading-relaxed">
                        {cat.subtitle}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-[#C5A55A] font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. "FADING FASTEST" TICKER                                */}
        {/* ========================================================= */}
        {currentUrgentLanguage && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 overflow-hidden reveal">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentUrgentLanguage.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="bg-[#FFFCF7] border border-[#B54A3A]/20 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="shrink-0 px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-sans font-semibold bg-[#B54A3A] text-[#FAF7F1] flex items-center space-x-1.5 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{tHome('fadingFastest')}</span>
                    </span>
                    <span className="sm:hidden text-[10px] font-sans text-[#B54A3A] font-semibold bg-[#B54A3A]/8 px-2 py-0.5 rounded border border-[#B54A3A]/20">
                      {tHome('criticalThreshold', { years: currentUrgentLanguage.yearsToCritical })}
                    </span>
                  </div>
                  <div>
                    <span className="font-serif text-lg sm:text-xl font-medium text-[#2A2420] block sm:inline">
                      {currentUrgentLanguage.name}
                    </span>
                    <span className="text-xs text-[#2A2420]/60 sm:ml-2 block sm:inline mt-0.5 sm:mt-0">
                      (~{currentUrgentLanguage.estimatedSpeakers} fluent speakers left · avg age {currentUrgentLanguage.averageSpeakerAge})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4DDD0]/60 justify-between sm:justify-end">
                  <span className="hidden sm:inline-block text-xs font-sans text-[#B54A3A] font-medium bg-[#B54A3A]/8 px-2.5 py-1 rounded border border-[#B54A3A]/20">
                    {tHome('criticalThreshold', { years: currentUrgentLanguage.yearsToCritical })}
                  </span>
                  <Link
                    href={`/archive?search=${encodeURIComponent(currentUrgentLanguage.name)}`}
                    className="w-full sm:w-auto btn-primary inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 sm:px-5 sm:py-2 text-xs min-h-[44px] sm:min-h-0"
                  >
                    <span>{tHome('listenRecordings')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </section>
        )}

        {/* ========================================================= */}
        {/* 5. CURATED COLLECTIONS — Indian Culture Portal style      */}
        {/* ========================================================= */}
        <section className="museum-dark-bg py-16 sm:py-24 px-4 sm:px-6 lg:px-8 mb-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 reveal">
              <div className="text-left">
                <div className="ornamental-top !mx-0" />
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#FAF7F1] mb-2">
                  Curated Collections
                </h2>
                <p className="text-sm sm:text-base text-[#FAF7F1]/50 max-w-xl">
                  Themed exhibitions that bring together related cultural records from across India
                </p>
              </div>
              <Link
                href="/collections"
                className="btn-gold inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto"
              >
                <span>All Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 reveal">
              {COLLECTIONS.map((collection, i) => (
                <Link
                  key={collection.id}
                  href="/collections"
                  className="group block"
                >
                  <div className="relative rounded-xl overflow-hidden bg-[#FAF7F1]/5 border border-[#FAF7F1]/8 hover:border-[#C5A55A]/30 transition-all card-lift">
                    {/* Image */}
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img
                        src={collection.image}
                        alt={collection.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1714]/80 to-transparent" />
                      <span
                        className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-sans font-semibold text-[#FAF7F1] backdrop-blur-sm"
                        style={{ backgroundColor: `${collection.tagColor}CC` }}
                      >
                        {collection.tag}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-medium text-[#FAF7F1] mb-2 group-hover:text-[#C5A55A] transition-colors leading-snug">
                        {collection.title}
                      </h3>
                      <p className="text-sm text-[#FAF7F1]/50 leading-relaxed mb-3 line-clamp-2">
                        {collection.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#C5A55A]">{collection.items} items</span>
                        <span className="inline-flex items-center space-x-1 text-xs text-[#C5A55A] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>View Collection</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. STORIES FROM THE FIELD — Editorial section              */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10 sm:mb-14 reveal">
            <div className="gold-accent-line">
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2A2420]">
                Stories from the Field
              </h2>
              <p className="text-sm text-[#2A2420]/55 mt-1.5">
                Deep-dive narratives from India's living cultural landscape
              </p>
            </div>
            <Link
              href="/stories"
              className="inline-flex items-center space-x-1.5 text-sm font-sans text-[#C97A3D] hover:text-[#9C4D18] font-medium py-1 self-start sm:self-auto group"
            >
              <span>All Stories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
            {STORIES.map((story) => (
              <Link key={story.id} href={`/stories#${story.id}`} className="group block">
                <div className="heritage-card overflow-hidden">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#1A1714]/70 backdrop-blur-sm text-[10px] text-[#C5A55A] font-sans font-medium">
                      {story.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-medium text-[#2A2420] mb-2 group-hover:text-[#C97A3D] transition-colors leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-sm text-[#2A2420]/55 leading-relaxed mb-3 line-clamp-2">
                      {story.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#2A2420]/40">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{story.readTime}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[#C97A3D] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section divider */}
        <div className="section-divider section-divider-ornate max-w-4xl mx-auto" />

        {/* ========================================================= */}
        {/* 7. RECENT ARCHIVE ENTRIES GRID                            */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-8 sm:mb-10 reveal">
            <div className="gold-accent-line">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2A2420]">
                {tHome('recentRecords')}
              </h2>
              <p className="text-sm text-[#2A2420]/55 mt-1.5">
                {tHome('recentRecordsDesc')}
              </p>
            </div>

            <Link
              href="/archive"
              className="inline-flex items-center space-x-1.5 text-sm font-sans text-[#C97A3D] hover:text-[#9C4D18] font-medium py-1 self-start sm:self-auto min-h-[36px] group"
            >
              <span>{tCommon('viewFullArchive')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {featuredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 stagger-children">
              {featuredRecords.map(record => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <ShimmerCard key={i} />
              ))}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 8. HOW IT WORKS — Process steps                           */}
        {/* ========================================================= */}
        <section className="bg-[#F5F0E6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 reveal">
              <div className="gold-accent-line-center" />
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2A2420] mb-3">
                How Dharohar Setu Works
              </h2>
              <p className="text-sm text-[#2A2420]/55 max-w-xl mx-auto">
                A community-powered preservation pipeline from field recording to verified cultural archive
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 reveal">
              {[
                {
                  step: '01',
                  icon: Mic,
                  title: 'Record',
                  desc: 'Communities capture oral traditions, songs, and craft demonstrations directly on their phones.',
                  color: '#C97A3D',
                },
                {
                  step: '02',
                  icon: Globe,
                  title: 'Enrich',
                  desc: 'AI transcribes, translates, and tags content in 22+ languages using Bhashini integration.',
                  color: '#2F6E5D',
                },
                {
                  step: '03',
                  icon: Users,
                  title: 'Verify',
                  desc: 'Community elders, linguists, and cultural experts validate and endorse submissions.',
                  color: '#C5A55A',
                },
                {
                  step: '04',
                  icon: ShieldCheck,
                  title: 'Preserve',
                  desc: 'Verified records are permanently archived in the national cultural heritage repository.',
                  color: '#6B8F5E',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="text-center group">
                    <div className="relative mx-auto mb-5">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform"
                        style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)` }}
                      >
                        <Icon className="w-7 h-7 text-[#FAF7F1]" />
                      </div>
                      <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold text-[#C5A55A] bg-[#1A1714] w-6 h-6 rounded-full flex items-center justify-center border border-[#C5A55A]/30">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-medium text-[#2A2420] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#2A2420]/55 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 9. PARTNERS & INSTITUTIONS                                */}
        {/* ========================================================= */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center mb-6">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-[#C5A55A]">
              Collaborating Institutions
            </p>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee space-x-12 whitespace-nowrap">
              {[...PARTNERS, ...PARTNERS].map((name, i) => (
                <span
                  key={i}
                  className="text-sm font-sans text-[#2A2420]/30 font-medium tracking-wide flex items-center space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A55A]/30" />
                  <span>{name}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 10. "WHY THIS MATTERS" — Editorial CTA                    */}
        {/* ========================================================= */}
        <section className="museum-dark-bg py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center reveal">
            <div className="ornamental-top" />
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#FAF7F1] mb-4 sm:mb-6">
              {tHome('whyMattersTitle')}
            </h2>
            <div className="text-sm sm:text-base text-[#FAF7F1]/60 leading-relaxed space-y-3 sm:space-y-5 mb-8 sm:mb-10 text-left sm:text-center max-w-2xl mx-auto">
              <p>
                {tHome('whyMattersP1', { count: 197 })}
              </p>
              <p>
                {tHome('whyMattersP2')}
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                href="/archive"
                className="btn-teal w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center space-x-2 px-8 py-3.5 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>{tHome('browseEndangered')}</span>
              </Link>
              <Link
                href="/capture"
                className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-lg border border-[#FAF7F1]/20 text-[#FAF7F1]/80 text-sm font-medium hover:border-[#C5A55A] hover:text-[#C5A55A] transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Become a Contributor</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 11. NEWSLETTER / SUBSCRIBE CTA                            */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center reveal">
            <div className="bg-[#FFFCF7] border border-[#E4DDD0] rounded-2xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#C5A55A]/15 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#C5A55A]/15 rounded-br-2xl" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/20 flex items-center justify-center mx-auto mb-5">
                  <Heart className="w-6 h-6 text-[#C5A55A]" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2A2420] mb-3">
                  Join the Heritage Movement
                </h3>
                <p className="text-sm text-[#2A2420]/55 max-w-md mx-auto mb-6 leading-relaxed">
                  Whether you're a linguist, storyteller, artisan, or a curious soul — every voice matters in preserving India's living heritage.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/capture"
                    className="btn-primary inline-flex items-center justify-center space-x-2 px-6 py-3 text-sm"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Contributing</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/archive"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border border-[#E4DDD0] text-[#2A2420] font-sans font-medium text-sm hover:bg-[#F5F0E6] transition-all"
                  >
                    <Compass className="w-4 h-4 text-[#C97A3D]" />
                    <span>Explore Archive</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
