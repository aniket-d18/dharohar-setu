'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import MotifTile from '@/components/MotifTile';
import { VETTED_CATEGORY_PHOTOS } from '@/utils/heritageImagery';

const TILES: Array<{ category: string; label: string; native: string }> = [
  { category: 'STORY', label: 'Folktales & oral histories', native: 'लोककथा' },
  { category: 'RITUAL', label: 'Rituals & ceremonies', native: 'संस्कार' },
  { category: 'CRAFT_TECHNIQUE', label: 'Craft techniques', native: 'शिल्प' },
  { category: 'LULLABY', label: 'Lullabies & folk songs', native: 'लोकगीत' },
  { category: 'FESTIVAL', label: 'Festivals', native: 'उत्सव' },
  { category: 'RECIPE', label: 'Ancestral recipes', native: 'पाककला' },
];

export default function TraditionTiles() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 sm:mb-20">
      <div className="mb-6 sm:mb-8">
        <span className="section-eyebrow">Explore by tradition</span>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2A2420] mt-2.5">
          Living forms of memory
        </h2>
        <p className="text-xs sm:text-sm text-[#2A2420]/70 mt-1.5 max-w-2xl">
          Every record in the archive belongs to a practice that is still performed somewhere in India today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {TILES.map((tile) => (
          <Link
            key={tile.category}
            href={`/archive?category=${tile.category}`}
            className="group relative overflow-hidden rounded-2xl border border-[#E4DDD0] aspect-[4/3] sm:aspect-[16/10] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C97A3D]"
          >
            {VETTED_CATEGORY_PHOTOS[tile.category] ? (
              <Image
                src={VETTED_CATEGORY_PHOTOS[tile.category]}
                alt={tile.label}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 30vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <MotifTile category={tile.category} glyph={tile.native} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1714] via-[#1B1714]/45 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-end justify-between gap-2">
              <div>
                <p className="font-devanagari text-[#E0A23C] text-xs sm:text-sm leading-none mb-1.5">{tile.native}</p>
                <p className="font-serif text-sm sm:text-lg text-[#FDFBF6] leading-tight">{tile.label}</p>
              </div>
              <span className="shrink-0 w-8 h-8 rounded-full bg-[#FDFBF6]/12 border border-[#FDFBF6]/25 flex items-center justify-center text-[#FDFBF6] group-hover:bg-[#C97A3D] group-hover:border-[#C97A3D] transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
