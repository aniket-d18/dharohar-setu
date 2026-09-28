'use client';

import { motifFor } from '@/utils/heritageImagery';

/**
 * Woven lattice surface used wherever the archive has no authentic photograph
 * for a category yet.
 */
export default function MotifTile({ category, glyph }: { category: string; glyph: string }) {
  const motif = motifFor(category);

  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `linear-gradient(150deg, ${motif.from} 0%, ${motif.via} 55%, ${motif.to} 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-45 transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: 'var(--texture-jali)', backgroundSize: '44px 44px' }}
      />
      <span
        className="absolute -right-3 -bottom-8 font-devanagari leading-none select-none text-[5.5rem] sm:text-[7.5rem]"
        style={{ color: motif.accent, opacity: 0.22 }}
      >
        {glyph}
      </span>
    </div>
  );
}
