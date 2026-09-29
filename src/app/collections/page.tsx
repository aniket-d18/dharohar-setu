'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  MapPin,
  BookOpen,
  Music,
  Flame,
  Star,
  Layers,
  Compass,
  Mic,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

/* ================================================================
   DATA: CURATED EXHIBITIONS
   ================================================================ */
interface CollectionItem {
  id: string;
  title: string;
  category: 'medicine' | 'songs' | 'crafts' | 'rituals' | 'stories' | 'languages';
  categoryLabel: string;
  description: string;
  items: number;
  image: string;
  tag: string;
  tagColor: string;
  languages: string[];
  region: string;
  curator: string;
  archiveHref: string;
  featured?: boolean;
}

const FEATURED_COLLECTION: CollectionItem = {
  id: 'vanishing-nilgiris',
  title: 'Vanishing Voices of the Nilgiris',
  category: 'languages',
  categoryLabel: 'Endangered Dialects',
  description:
    'In the misty heights of Tamil Nadu, three ancient pastoral communities — the Toda, Irula, and Kurumba — preserve sacred hymns, botanical cures, and oral poetry that predate most recorded history. With fewer than 3,500 fluent speakers remaining, this anthology preserves their living acoustic heritage before time runs out.',
  items: 8,
  image: '/images/categories/oral-stories.jpg',
  tag: 'Critically Endangered',
  tagColor: '#B54A3A',
  languages: ['Toda', 'Irula', 'Kurumba'],
  region: 'Nilgiri Hills, Tamil Nadu',
  curator: 'Dr. Meera Krishnan & Nilgiri Tribal Stewardship Trust',
  archiveHref: '/archive?category=STORY&search=Toda',
  featured: true,
};

const COLLECTIONS: CollectionItem[] = [
  {
    id: 'wild-medicine',
    title: 'Sanjeevani: Wild Herbal Medicine & Forest Cures',
    category: 'medicine',
    categoryLabel: 'Traditional Medicine',
    description:
      'Ancient herbal wisdom passed exclusively through oral chants by Kani forest healers and Himalayan Vaidyas — covering botanical antidotes, wild root infusions, and indigenous health diagnostics.',
    items: 14,
    image: '/images/categories/traditional-medicine.jpg',
    tag: 'Living Heritage',
    tagColor: '#2F6E5D',
    languages: ['Kani', 'Malayalam', 'Pahadi', 'Sanskrit'],
    region: 'Agasthyamalai & Western Ghats',
    curator: 'Ayurvedic Botanical Heritage Group',
    archiveHref: '/archive?category=TRADITIONAL_MEDICINE',
  },
  {
    id: 'textile-heritage',
    title: 'Threads of Time: Sacred Handlooms of India',
    category: 'crafts',
    categoryLabel: 'Sacred Crafts',
    description:
      'From double-ikat Patan Patola of Gujarat to high-altitude Pashmina wool spinning of Changthang — documenting hereditary loom mathematics, warp songs, and natural mineral dyes.',
    items: 12,
    image: '/images/categories/sacred-crafts.jpg',
    tag: 'Master Artisans',
    tagColor: '#C5A55A',
    languages: ['Gujarati', 'Ladakhi', 'Telugu'],
    region: 'Patan, Ladakh & Pochampally',
    curator: 'National Weaving Guild Archives',
    archiveHref: '/archive?category=CRAFT_TECHNIQUE',
  },
  {
    id: 'monsoon-songs',
    title: 'Songs of the Monsoon & Parched Earth',
    category: 'songs',
    categoryLabel: 'Folk Melodies',
    description:
      'Celebratory rain invocations and soil ballads: poignant Kajari melodies from Uttar Pradesh, Malhar epics of the Thar desert, and rhythmic boat ballads echoing along Kerala waterways.',
    items: 9,
    image: '/images/categories/folk-songs.jpg',
    tag: 'Seasonal Ballads',
    tagColor: '#C97A3D',
    languages: ['Bhojpuri', 'Marwari', 'Malayalam'],
    region: 'Mirzapur, Thar & Alappuzha',
    curator: 'Folk Heritage Documentation Cell',
    archiveHref: '/archive?category=LULLABY',
  },
  {
    id: 'sacred-fire',
    title: 'Sacred Fire & Temple Rites: The Agnicayana',
    category: 'rituals',
    categoryLabel: 'Sacred Rituals',
    description:
      'Vedic fire invocations, Kudiyattam Sanskrit temple gestures, and harvest ceremonies — unbroken acoustic rituals sustained through rigorous mnemonic chanting across three millennia.',
    items: 11,
    image: '/images/categories/rituals.jpg',
    tag: 'Sacred Traditions',
    tagColor: '#9C4D18',
    languages: ['Vedic Sanskrit', 'Malayalam'],
    region: 'Thrissur & Palakkad, Kerala',
    curator: 'Vedic Oral Heritage Observatory',
    archiveHref: '/archive?category=RITUAL',
  },
  {
    id: 'himalayan-echoes',
    title: 'Himalayan Echoes: Monastery Chants of Spiti',
    category: 'songs',
    categoryLabel: 'Folk Melodies',
    description:
      'Deep harmonic throat chanting, sacred long-horn dungchen invocations, and nomadic winter lullabies recorded above 12,000 feet in the ancient monasteries of Tabo and Ki.',
    items: 7,
    image: '/images/categories/cultural-atlas.jpg',
    tag: 'High Altitude',
    tagColor: '#2F6E5D',
    languages: ['Bhoti (Spiti dialect)'],
    region: 'Lahaul & Spiti, Himachal Pradesh',
    curator: 'Himalayan Cultural Preservation Trust',
    archiveHref: '/archive?category=LULLABY&search=Spiti',
  },
  {
    id: 'island-voices',
    title: 'Island Voices: Andaman & Nicobar Oral Lore',
    category: 'languages',
    categoryLabel: 'Endangered Dialects',
    description:
      'Among humanity’s most endangered linguistic treasures — creation myths, oceanic navigation songs, and turtle ballads from indigenous island communities with very few living native speakers.',
    items: 6,
    image: '/images/categories/oral-stories.jpg',
    tag: 'Critical Priority',
    tagColor: '#B54A3A',
    languages: ['Great Andamanese', 'Onge', 'Shompen'],
    region: 'Strait Island & Great Nicobar',
    curator: 'CIIL Indigenous Language Project',
    archiveHref: '/archive?category=STORY&search=Andaman',
  },
  {
    id: 'kitchen-wisdom',
    title: 'Rasoi Sanskriti: Ancestral Kitchen & Wild Foraging',
    category: 'medicine',
    categoryLabel: 'Traditional Medicine',
    description:
      'Therapeutic grain fermentations, medicinal spice decoctions (kashayams), and wild forest greens recipes guarded by tribal matriarchs across central India and the Himalayan foothills.',
    items: 10,
    image: '/images/categories/traditional-medicine.jpg',
    tag: 'Living Recipes',
    tagColor: '#6B8F5E',
    languages: ['Garhwali', 'Gondi', 'Odia'],
    region: 'Garhwal, Bastar & Mayurbhanj',
    curator: 'Living Food Heritage Collective',
    archiveHref: '/archive?category=RECIPE',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Exhibitions', icon: '🏛️' },
  { id: 'medicine', label: 'Wild Medicine & Herbs', icon: '🌿' },
  { id: 'songs', label: 'Folk Songs & Ballads', icon: '🎵' },
  { id: 'crafts', label: 'Sacred Crafts & Looms', icon: '🏺' },
  { id: 'rituals', label: 'Sacred Rituals & Rites', icon: '🙏' },
  { id: 'languages', label: 'Endangered Dialects', icon: '🗣️' },
];

export default function CollectionsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter collections
  const filteredCollections = useMemo(() => {
    return COLLECTIONS.filter((col) => {
      const matchesCategory = activeCategory === 'all' || col.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        col.title.toLowerCase().includes(query) ||
        col.description.toLowerCase().includes(query) ||
        col.region.toLowerCase().includes(query) ||
        col.languages.some((l) => l.toLowerCase().includes(query)) ||
        col.curator.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Overall statistics
  const totalRecordsCount = COLLECTIONS.reduce((acc, c) => acc + c.items, FEATURED_COLLECTION.items);

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col selection:bg-[#C97A3D]/20 overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />

      <main className="flex-1 pb-20 overflow-x-hidden w-full max-w-[100vw]">
        {/* ========================================================================= */}
        {/* 1. COMPACT MUSEUM EXHIBITIONS HEADER (Zero Wasted Space)                  */}
        {/* ========================================================================= */}
        <section className="relative pt-6 sm:pt-8 pb-5 sm:pb-6 px-4 sm:px-6 lg:px-8 border-b border-[#E4DDD0] bg-gradient-to-b from-[#F5F0E6]/70 to-[#FAF7F1]">
          <div className="max-w-7xl mx-auto">
            {/* Top row: Title + Metrics */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFFCF7] border border-[#E4DDD0] text-[11px] font-sans font-semibold text-[#C97A3D] mb-2 shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#C5A55A]" />
                  <span className="tracking-wider uppercase">Living Cultural Anthologies</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-semibold tracking-tight text-[#2A2420] leading-tight">
                  Curated Collections
                </h1>
                <p className="text-xs sm:text-sm text-[#2A2420]/60 max-w-xl font-sans mt-1">
                  Thematic digital exhibitions bringing together India's endangered oral poetry, wild medicine, sacred crafts, and vanishing dialects.
                </p>
              </div>

              {/* Compact Metrics Pill Ribbon */}
              <div className="flex items-center space-x-3 text-xs bg-[#FFFCF7] border border-[#E4DDD0] rounded-xl px-4 py-2 shadow-xs self-start md:self-auto shrink-0">
                <div className="text-center px-1">
                  <span className="font-serif font-bold text-[#2A2420] text-base block leading-none">8</span>
                  <span className="text-[10px] text-[#C5A55A] font-semibold uppercase tracking-wider">Themes</span>
                </div>
                <span className="h-6 w-[1px] bg-[#E4DDD0]" />
                <div className="text-center px-1">
                  <span className="font-serif font-bold text-[#C97A3D] text-base block leading-none">{totalRecordsCount}+</span>
                  <span className="text-[10px] text-[#C5A55A] font-semibold uppercase tracking-wider">Records</span>
                </div>
                <span className="h-6 w-[1px] bg-[#E4DDD0]" />
                <div className="text-center px-1">
                  <span className="font-serif font-bold text-[#2F6E5D] text-base block leading-none">19</span>
                  <span className="text-[10px] text-[#C5A55A] font-semibold uppercase tracking-wider">Dialects</span>
                </div>
              </div>
            </div>

            {/* Filter Toolbar: Categories on Left, Search on Right */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      className={`shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2A2420] text-[#FAF7F1] shadow-xs font-semibold'
                          : 'bg-[#FFFCF7] text-[#2A2420]/75 hover:text-[#2A2420] border border-[#E4DDD0] hover:bg-[#F5F0E6]'
                      }`}
                    >
                      <span className="text-xs">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Compact Search Box */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-[#2A2420]/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#FFFCF7] border border-[#E4DDD0] text-xs text-[#2A2420] placeholder-[#2A2420]/40 focus:outline-none focus:ring-1 focus:ring-[#C97A3D] shadow-xs font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#2A2420]/40 hover:text-[#2A2420]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. FEATURED EXHIBITION OF THE MONTH                       */}
        {/* ========================================================= */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 mb-10 sm:mb-14">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#C97A3D]" />
                <span className="text-xs font-serif font-bold text-[#C5A55A] tracking-wider uppercase">
                  Featured Exhibition of the Month
                </span>
              </div>
              <span className="text-xs font-sans text-[#2A2420]/50 hidden sm:inline">
                National Digital Preservation Focus
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E4DDD0] bg-[#1A1714]">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Visual Cover */}
                <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto min-h-[300px] lg:min-h-[440px] overflow-hidden">
                  <img
                    src={FEATURED_COLLECTION.image}
                    alt={FEATURED_COLLECTION.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1714] via-transparent to-transparent lg:hidden" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1A1714]/20 to-[#1A1714] hidden lg:block" />

                  {/* Corner Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#B54A3A] text-white shadow-sm flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{FEATURED_COLLECTION.tag}</span>
                    </span>
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-[#FAF7F1]">
                  <div>
                    <div className="flex items-center space-x-2 mb-2 text-xs text-[#C5A55A] font-sans font-medium uppercase tracking-wider">
                      <Star className="w-3.5 h-3.5 fill-[#C5A55A]" />
                      <span>Special Archival Focus</span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#FAF7F1] mb-3 leading-snug">
                      {FEATURED_COLLECTION.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#FAF7F1]/70 leading-relaxed font-sans mb-6">
                      {FEATURED_COLLECTION.description}
                    </p>

                    {/* Metadata Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-xs bg-white/5 border border-white/10 rounded-xl p-3.5">
                      <div>
                        <span className="text-[#C5A55A] text-[10px] font-sans uppercase font-bold block">Items</span>
                        <span className="text-[#FAF7F1] font-serif font-semibold">{FEATURED_COLLECTION.items} Records</span>
                      </div>
                      <div>
                        <span className="text-[#C5A55A] text-[10px] font-sans uppercase font-bold block">Languages</span>
                        <span className="text-[#FAF7F1] font-sans truncate block">{FEATURED_COLLECTION.languages.join(', ')}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[#C5A55A] text-[10px] font-sans uppercase font-bold block">Region</span>
                        <span className="text-[#FAF7F1] font-sans truncate block">{FEATURED_COLLECTION.region}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href={FEATURED_COLLECTION.archiveHref}
                        className="btn-gold inline-flex items-center space-x-2 px-6 py-3 text-xs sm:text-sm font-semibold rounded-xl group"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Explore 8 Records in Archive</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        href="/atlas"
                        className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl border border-white/20 text-[#FAF7F1] text-xs sm:text-sm font-medium hover:border-[#C5A55A] hover:text-[#C5A55A] transition-colors"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Locate on Cultural Atlas</span>
                      </Link>
                    </div>

                    <p className="text-[11px] text-[#FAF7F1]/40 mt-5 pt-3 border-t border-white/10 font-sans">
                      Curated with academic support from {FEATURED_COLLECTION.curator}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. ALL EXHIBITIONS GRID                                                   */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-[#E4DDD0]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#C97A3D]" />
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2A2420]">
                  {activeCategory === 'all' ? 'All Thematic Exhibitions' : `${CATEGORY_TABS.find(t => t.id === activeCategory)?.label}`}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#2A2420]/60 mt-1 font-sans">
                {filteredCollections.length} exhibition{filteredCollections.length !== 1 ? 's' : ''} available
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </p>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-xs text-[#C97A3D] font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>Reset filters</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Empty Search Result */}
          {filteredCollections.length === 0 ? (
            <div className="bg-[#FFFCF7] border border-[#E4DDD0] rounded-2xl p-10 text-center max-w-md mx-auto my-12 shadow-xs">
              <Search className="w-8 h-8 text-[#C5A55A] mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-lg font-bold text-[#2A2420] mb-1">No collections match your criteria</h3>
              <p className="text-xs text-[#2A2420]/60 font-sans mb-4">
                Try searching for broader keywords like "medicine", "folk", "Tamil", or "weaving".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="btn-primary px-4 py-2 text-xs font-semibold"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((col) => (
                <Link
                  key={col.id}
                  href={col.archiveHref}
                  className="group flex flex-col justify-between bg-[#FFFCF7] rounded-2xl overflow-hidden border border-[#E4DDD0] hover:border-[#C97A3D]/70 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div>
                    {/* Visual Thumbnail */}
                    <div className="aspect-[16/10] relative overflow-hidden bg-[#1E1B18]">
                      <img
                        src={col.image}
                        alt={col.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      {/* Tag pill */}
                      <span
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-sans font-bold text-white shadow-xs backdrop-blur-sm"
                        style={{ backgroundColor: `${col.tagColor}E6` }}
                      >
                        {col.tag}
                      </span>

                      {/* Items counter */}
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-[#C5A55A] font-semibold border border-[#C5A55A]/30">
                        {col.items} Records
                      </span>

                      {/* Region & Language Badges at bottom of image */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                        <span className="flex items-center space-x-1 truncate max-w-[65%]">
                          <MapPin className="w-3 h-3 text-[#C5A55A] shrink-0" />
                          <span className="truncate">{col.region}</span>
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm shrink-0">
                          {col.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-bold text-[#2A2420] group-hover:text-[#C97A3D] transition-colors leading-snug mb-2">
                        {col.title}
                      </h3>
                      <p className="text-xs text-[#2A2420]/65 font-sans leading-relaxed line-clamp-3 mb-4">
                        {col.description}
                      </p>

                      {/* Languages List */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {col.languages.map((lang) => (
                          <span
                            key={lang}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F0E6] text-[#2A2420]/75 border border-[#E4DDD0] font-sans"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 border-t border-[#E4DDD0] bg-[#FAF7F1]/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#2A2420]/50 font-sans truncate max-w-[65%]">
                      {col.curator}
                    </span>
                    <span className="inline-flex items-center space-x-1 font-semibold text-[#C97A3D] group-hover:translate-x-0.5 transition-transform">
                      <span>View Exhibition</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 4. PROPOSE A COLLECTION / COMMUNITY CURATION BANNER                       */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
          <div className="bg-[#1A1714] border border-[#C5A55A]/30 rounded-3xl p-8 sm:p-12 text-center text-[#FAF7F1] relative overflow-hidden shadow-xl">
            {/* Sacred mandala overlay */}
            <div className="absolute inset-0 pattern-mandala opacity-20 pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#C97A3D]/20 border border-[#C97A3D]/40 flex items-center justify-center mx-auto mb-4 text-[#C97A3D]">
                <Layers className="w-6 h-6" />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium mb-3">
                Have a Thematic Collection to Propose?
              </h2>

              <p className="text-xs sm:text-sm text-[#FAF7F1]/65 leading-relaxed font-sans mb-8">
                Are you an indigenous community steward, linguistic researcher, or ethnographer with recorded oral
                songs, tribal botanical cures, or craft wisdom? Submit your records to be peer-verified and curated into a
                national exhibition.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/capture"
                  className="btn-gold min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 text-sm font-semibold rounded-xl"
                >
                  <Mic className="w-4 h-4" />
                  <span>Deposit Cultural Records</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/archive"
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border border-white/20 text-[#FAF7F1] text-sm font-medium hover:border-[#C5A55A] hover:text-[#C5A55A] transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Full Archive</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
