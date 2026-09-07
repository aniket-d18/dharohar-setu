'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useTranslations } from '@/context/LanguageContext';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-[#E4DDD0] bg-[#FAF7F1] text-[#2A2420]/75 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 text-[#2A2420] font-serif text-lg font-medium mb-3">
              <img src="/images/logo.png" alt="Dharohar Setu" className="w-8 h-8 object-cover rounded-md" />
              <span>Dharohar Setu</span>
            </div>
            <p className="text-sm text-[#2A2420]/70 max-w-md leading-relaxed">
              {t('about')}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-sans font-medium text-[#2A2420] mb-3">{t('exploreArchive')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/archive" className="hover:text-[#C97A3D] transition-colors">
                  {t('oralTraditions')}
                </Link>
              </li>
              <li>
                <Link href="/archive?category=CRAFT_TECHNIQUE" className="hover:text-[#C97A3D] transition-colors">
                  {t('craftTechniques')}
                </Link>
              </li>
              <li>
                <Link href="/archive?category=LULLABY" className="hover:text-[#C97A3D] transition-colors">
                  {t('ancestralLullabies')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-sans font-medium text-[#2A2420] mb-3">{t('livingHeritage')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-[#B54A3A]">● {t('critical')}</span> — Great Andamanese, Toda, Toto, Nihali
              </li>
              <li>
                <span className="text-[#C97A3D]">● {t('endangered')}</span> — Spiti Bhoti, Pahari
              </li>
              <li>
                <span className="text-[#6B8F5E]">● {t('vulnerable')}</span> — Kachchhi
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E4DDD0] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#2A2420]/60">
          <p>{t('copyright')}</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>{t('mission')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
