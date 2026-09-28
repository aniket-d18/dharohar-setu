'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass, Mic, Sparkles } from 'lucide-react';
import { useTranslations } from '@/context/LanguageContext';
import MotifTile from '@/components/MotifTile';
import { VETTED_CATEGORY_PHOTOS } from '@/utils/heritageImagery';

export interface HeroCounters {
  totalRecords: number;
  totalLanguages: number;
  verifiedRecords: number;
  totalContributors: number;
  regionsCovered: number;
}

const MOSAIC: Array<{
  key: string;
  src?: string;
  category: string;
  glyph: string;
  caption: string;
  region: string;
}> = [
  { key: 'ritual', src: VETTED_CATEGORY_PHOTOS.RITUAL, category: 'RITUAL', glyph: 'संस्कार', caption: 'Temple ritual chant', region: 'Tamil Nadu' },
  { key: 'craft', src: VETTED_CATEGORY_PHOTOS.CRAFT_TECHNIQUE, category: 'CRAFT_TECHNIQUE', glyph: 'शिल्प', caption: 'Bandhani & kalash craft', region: 'Kutch' },
  { key: 'story', category: 'STORY', glyph: 'लोककथा', caption: 'Village folktale', region: 'Buldhana' },
  { key: 'lullaby', category: 'LULLABY', glyph: 'लोकगीत', caption: 'Cradle song', region: 'Lahaul & Spiti' },
];

export default function HeritageHero({ counters }: { counters: HeroCounters }) {
  const tHome = useTranslations('home');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const stats = [
    { value: counters.totalRecords, label: tHome('totalRecords') },
    { value: counters.totalLanguages, label: tHome('languagesDocumented') },
    { value: counters.regionsCovered, label: tHome('regionsCovered') },
    { value: counters.totalContributors, label: tHome('activeContributors') },
  ];

  return (
    <section className="ink-panel">
      <span
        aria-hidden
        className="script-watermark absolute -right-4 -top-6 text-[9rem] sm:text-[16rem] lg:text-[20rem]"
      >
        धरोहर
      </span>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-16 sm:pb-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E0A23C]/40 bg-[#E0A23C]/10 text-[11px] sm:text-xs font-sans font-medium tracking-wide text-[#E8B665]">
            <Sparkles className="w-3.5 h-3.5" />
            {tHome('heroBadge')}
          </span>

          <p className="font-devanagari text-[#E0A23C] text-lg sm:text-2xl mt-5 mb-2">
            धरोहर सेतु — स्मृति से भविष्य तक
          </p>

          <h1 className="font-serif font-semibold tracking-tight text-[#FDFBF6] text-[2.1rem] leading-[1.08] sm:text-6xl lg:text-[4.25rem]">
            {tHome('heroTitle')}
          </h1>

          <p className="mt-5 max-w-xl text-sm sm:text-lg leading-relaxed text-[#F6F1E7]/75">
            {tHome('heroSubtitle')}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/capture"
              className="btn-ochre group min-h-[52px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-sans font-semibold text-sm sm:text-base"
            >
              <Mic className="w-4 h-4" />
              <span>{tNav('capture')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/archive"
              className="min-h-[52px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#F6F1E7]/25 bg-[#F6F1E7]/5 text-[#F6F1E7] font-sans font-medium text-sm sm:text-base hover:bg-[#F6F1E7]/12 hover:border-[#E0A23C]/60 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#E0A23C]" />
              <span>{tCommon('exploreArchive')}</span>
            </Link>
          </div>

          <dl className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 border-t border-[#F6F1E7]/12 pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-serif text-3xl sm:text-4xl font-semibold text-[#E0A23C] leading-none">
                  {stat.value}
                </dd>
                <p className="mt-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-[#F6F1E7]/55">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </div>

        {/* Photographic mosaic — the archive has faces and hands, so show them */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {MOSAIC.map((tile, i) => (
            <figure
              key={tile.key}
              className={`relative overflow-hidden rounded-2xl border border-[#F6F1E7]/15 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.85)] group ${
                i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[3/4] translate-y-5 sm:translate-y-8'
              }`}
            >
              {tile.src ? (
                <Image
                  src={tile.src}
                  alt={`${tile.caption} — ${tile.region}`}
                  fill
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={i < 2}
                />
              ) : (
                <MotifTile category={tile.category} glyph={tile.glyph} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#15110F] via-[#15110F]/25 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-3">
                <p className="font-serif text-sm text-[#FDFBF6] leading-tight">{tile.caption}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#E0A23C]/90 mt-0.5">{tile.region}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#E0A23C]/50 to-transparent" />
    </section>
  );
}
