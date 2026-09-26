'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useTranslations } from '@/context/LanguageContext';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-[#E4DDD0] bg-[#FAF7F1] text-[#2A2420]/75 py-8 sm:py-12 mt-10 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 text-[#2A2420] font-serif text-lg font-medium mb-2.5">
              <img src="/images/logo.png" alt="Dharohar Setu" className="w-8 h-8 object-cover rounded-md" />
              <span>Dharohar Setu</span>
            </div>
            <p className="text-xs sm:text-sm text-[#2A2420]/70 max-w-md leading-relaxed">
              {t('about')}
            </p>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider text-[#2A2420] mb-2.5">{t('exploreArchive')}</h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <Link href="/archive" className="hover:text-[#C97A3D] transition-colors py-1 inline-block">
                  {t('oralTraditions')}
                </Link>
              </li>
              <li>
                <Link href="/archive?category=OTHER" className="hover:text-[#C97A3D] transition-colors py-1 inline-block">
                  Forts & Heritage Sites
                </Link>
              </li>
              <li>
                <Link href="/archive?category=CRAFT_TECHNIQUE" className="hover:text-[#C97A3D] transition-colors py-1 inline-block">
                  {t('craftTechniques')}
                </Link>
              </li>
              <li>
                <Link href="/archive?category=LULLABY" className="hover:text-[#C97A3D] transition-colors py-1 inline-block">
                  {t('ancestralLullabies')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider text-[#2A2420] mb-2.5">{t('livingHeritage')}</h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li className="py-0.5">
                <span className="text-[#B54A3A]">● {t('critical')}</span> —{' '}
                <Link href="/archive?search=Great%20Andamanese" className="hover:text-[#C97A3D] transition-colors underline decoration-[#B54A3A]/30">Great Andamanese</Link>,{' '}
                <Link href="/archive?search=Toda" className="hover:text-[#C97A3D] transition-colors underline decoration-[#B54A3A]/30">Toda</Link>,{' '}
                <Link href="/archive?search=Toto" className="hover:text-[#C97A3D] transition-colors underline decoration-[#B54A3A]/30">Toto</Link>,{' '}
                <Link href="/archive?search=Nihali" className="hover:text-[#C97A3D] transition-colors underline decoration-[#B54A3A]/30">Nihali</Link>
              </li>
              <li className="py-0.5">
                <span className="text-[#C97A3D]">● {t('endangered')}</span> —{' '}
                <Link href="/archive?search=Spiti%20Bhoti" className="hover:text-[#C97A3D] transition-colors underline decoration-[#C97A3D]/30">Spiti Bhoti</Link>,{' '}
                <Link href="/archive?search=Pahari" className="hover:text-[#C97A3D] transition-colors underline decoration-[#C97A3D]/30">Pahari</Link>
              </li>
              <li className="py-0.5">
                <span className="text-[#6B8F5E]">● {t('vulnerable')}</span> —{' '}
                <Link href="/archive?search=Kachchhi" className="hover:text-[#C97A3D] transition-colors underline decoration-[#6B8F5E]/30">Kachchhi</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E4DDD0] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#2A2420]/60 gap-2 text-center sm:text-left">
          <p>{t('copyright')}</p>
          <p className="flex items-center space-x-1">
            <span>{t('mission')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
