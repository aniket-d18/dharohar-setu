'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useTranslations } from '@/context/LanguageContext';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="ink-panel text-[#F6F1E7]/70 py-10 sm:py-14 mt-10 sm:mt-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 text-[#FDFBF6] font-serif text-lg font-medium mb-2.5">
              <img src="/images/logo.png" alt="Dharohar Setu Emblem" className="w-9 h-9 object-cover rounded-md ring-1 ring-[#E0A23C]/40" />
              <span>Dharohar Setu</span>
              <span className="font-devanagari text-[#E0A23C] text-base">धरोहर</span>
            </div>
            <p className="text-xs sm:text-sm text-[#F6F1E7]/65 max-w-md leading-relaxed">
              {t('about')}
            </p>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.14em] text-[#E0A23C] mb-3">{t('exploreArchive')}</h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <Link href="/archive" className="hover:text-[#E0A23C] transition-colors py-1 inline-block">
                  {t('oralTraditions')}
                </Link>
              </li>
              <li>
                <Link href="/archive?category=OTHER" className="hover:text-[#E0A23C] transition-colors py-1 inline-block">
                  Forts & Heritage Sites
                </Link>
              </li>
              <li>
                <Link href="/archive?category=CRAFT_TECHNIQUE" className="hover:text-[#E0A23C] transition-colors py-1 inline-block">
                  {t('craftTechniques')}
                </Link>
              </li>
              <li>
                <Link href="/archive?category=LULLABY" className="hover:text-[#E0A23C] transition-colors py-1 inline-block">
                  {t('ancestralLullabies')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.14em] text-[#E0A23C] mb-3">{t('livingHeritage')}</h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li className="py-0.5">
                <span className="text-[#E2705C]">● {t('critical')}</span> —{' '}
                <Link href="/archive?search=Great%20Andamanese" className="hover:text-[#E0A23C] transition-colors underline decoration-[#B54A3A]/30">Great Andamanese</Link>,{' '}
                <Link href="/archive?search=Toda" className="hover:text-[#E0A23C] transition-colors underline decoration-[#B54A3A]/30">Toda</Link>,{' '}
                <Link href="/archive?search=Toto" className="hover:text-[#E0A23C] transition-colors underline decoration-[#B54A3A]/30">Toto</Link>,{' '}
                <Link href="/archive?search=Nihali" className="hover:text-[#E0A23C] transition-colors underline decoration-[#B54A3A]/30">Nihali</Link>
              </li>
              <li className="py-0.5">
                <span className="text-[#E0A23C]">● {t('endangered')}</span> —{' '}
                <Link href="/archive?search=Spiti%20Bhoti" className="hover:text-[#E0A23C] transition-colors underline decoration-[#C97A3D]/30">Spiti Bhoti</Link>,{' '}
                <Link href="/archive?search=Pahari" className="hover:text-[#E0A23C] transition-colors underline decoration-[#C97A3D]/30">Pahari</Link>
              </li>
              <li className="py-0.5">
                <span className="text-[#8FB77F]">● {t('vulnerable')}</span> —{' '}
                <Link href="/archive?search=Kachchhi" className="hover:text-[#E0A23C] transition-colors underline decoration-[#6B8F5E]/30">Kachchhi</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#F6F1E7]/12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F6F1E7]/55 gap-3 text-center sm:text-left">
          <p>{t('copyright')}</p>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-[#E0A23C] transition-colors underline decoration-[#F6F1E7]/30">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#E0A23C] transition-colors underline decoration-[#F6F1E7]/30">
              Terms of Contribution
            </Link>
          </div>
          <p className="flex items-center space-x-1">
            <span>{t('mission')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
