'use client';

import Link from 'next/link';
import { useTranslations } from '@/context/LanguageContext';
import {
  MapPin,
  Mail,
  Globe,
  Heart,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-[#1A1714] text-[#FAF7F1] mt-0">
      {/* Gold divider at top */}
      <div className="gold-divider" />

      {/* Partner logos strip */}
      <div className="border-b border-[#FAF7F1]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#C5A55A]/60 mb-4 text-center">
            In Collaboration with Leading Cultural Institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] text-[#FAF7F1]/25 font-sans">
            {['Archaeological Survey of India', 'IGNCA', 'National Archives', 'Sahitya Akademi', 'CIIL Mysuru', 'Anthropological Survey'].map((name) => (
              <span key={name} className="flex items-center space-x-1.5 hover:text-[#FAF7F1]/40 transition-colors cursor-default">
                <span className="w-1 h-1 rounded-full bg-[#C5A55A]/30" />
                <span>{name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 mb-10">
          {/* Brand & Mission — spans 4 columns */}
          <div className="md:col-span-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-11 h-11 rounded-xl overflow-hidden ring-1 ring-[#C5A55A]/30 shrink-0 shadow-lg">
                <img src="/images/logo.png" alt="Dharohar Setu Emblem" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-serif text-xl font-semibold text-[#FAF7F1] block leading-tight">
                  Dharohar Setu
                </span>
                <span className="text-[10px] text-[#C5A55A] font-sans tracking-widest uppercase font-medium">
                  Living Cultural Atlas
                </span>
              </div>
            </div>
            <p className="text-sm text-[#FAF7F1]/50 max-w-xs leading-relaxed mb-5">
              {t('about')}
            </p>
            <div className="flex items-center space-x-4 text-[11px] text-[#FAF7F1]/30">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B8F5E] pulse-dot" />
                <span>Active Repository</span>
              </span>
              <span>•</span>
              <span>Community Powered</span>
            </div>
          </div>

          {/* Explore Heritage — 2 columns */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-sans font-semibold uppercase tracking-widest text-[#C5A55A] mb-4">
              {t('exploreArchive')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/archive?category=LULLABY" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Folk Songs & Lullabies</span>
                </Link>
              </li>
              <li>
                <Link href="/archive?category=STORY" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Oral Narratives</span>
                </Link>
              </li>
              <li>
                <Link href="/archive?category=CRAFT_TECHNIQUE" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>{t('craftTechniques')}</span>
                </Link>
              </li>
              <li>
                <Link href="/archive?category=RITUAL" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Rituals & Ceremonies</span>
                </Link>
              </li>
              <li>
                <Link href="/archive?category=OTHER" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Heritage Sites</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links — 2 columns */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-sans font-semibold uppercase tracking-widest text-[#C5A55A] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/collections" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Collections</span>
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Field Chronicles</span>
                </Link>
              </li>
              <li>
                <Link href="/atlas" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Cultural Atlas</span>
                </Link>
              </li>
              <li>
                <Link href="/untranslatable" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Living Concepts</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/capture" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Contribute a Record</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1.5 py-0.5 group">
                  <span className="w-1 h-1 rounded-full bg-[#C97A3D]/40 group-hover:bg-[#C5A55A] transition-colors" />
                  <span>Observatory</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Living Heritage Status — 4 columns */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-sans font-semibold uppercase tracking-widest text-[#C5A55A] mb-4">
              {t('livingHeritage')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="bg-[#FAF7F1]/5 border border-[#FAF7F1]/8 rounded-lg p-3">
                <span className="text-[#B54A3A] text-xs font-semibold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B54A3A] pulse-dot" />
                  <span>{t('critical')}</span>
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Link href="/archive?search=Great%20Andamanese" className="text-[11px] text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors px-2.5 py-1 rounded-md bg-[#FAF7F1]/5 border border-[#FAF7F1]/8 hover:border-[#C5A55A]/30">Great Andamanese</Link>
                  <Link href="/archive?search=Toda" className="text-[11px] text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors px-2.5 py-1 rounded-md bg-[#FAF7F1]/5 border border-[#FAF7F1]/8 hover:border-[#C5A55A]/30">Toda</Link>
                  <Link href="/archive?search=Nihali" className="text-[11px] text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors px-2.5 py-1 rounded-md bg-[#FAF7F1]/5 border border-[#FAF7F1]/8 hover:border-[#C5A55A]/30">Nihali</Link>
                </div>
              </div>
              <div className="bg-[#FAF7F1]/5 border border-[#FAF7F1]/8 rounded-lg p-3">
                <span className="text-[#C97A3D] text-xs font-semibold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C97A3D]" />
                  <span>{t('endangered')}</span>
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Link href="/archive?search=Spiti%20Bhoti" className="text-[11px] text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors px-2.5 py-1 rounded-md bg-[#FAF7F1]/5 border border-[#FAF7F1]/8 hover:border-[#C5A55A]/30">Spiti Bhoti</Link>
                  <Link href="/archive?search=Pahari" className="text-[11px] text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors px-2.5 py-1 rounded-md bg-[#FAF7F1]/5 border border-[#FAF7F1]/8 hover:border-[#C5A55A]/30">Pahari</Link>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-xs px-1">
                <span className="text-[#6B8F5E] flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B8F5E]" />
                  <span>{t('vulnerable')}</span>
                </span>
                <span className="text-[#FAF7F1]/20">—</span>
                <Link href="/archive?search=Kachchhi" className="text-[#FAF7F1]/50 hover:text-[#C5A55A] transition-colors">Kachchhi</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Government Portals */}
        <div className="border-t border-[#FAF7F1]/8 pt-6 mb-6">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#FAF7F1]/20 mb-3">
            Related Portals
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Indian Culture Portal', url: 'https://indianculture.gov.in' },
              { name: 'MGMD', url: 'https://mgmd.gov.in' },
              { name: 'Museums of India', url: 'https://museumsofindia.gov.in' },
              { name: 'Digital India', url: 'https://digitalindia.gov.in' },
            ].map((portal) => (
              <a
                key={portal.name}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#FAF7F1]/30 hover:text-[#C5A55A] transition-colors inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-[#FAF7F1]/5 hover:border-[#C5A55A]/20"
              >
                <span>{portal.name}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#FAF7F1]/8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF7F1]/30 gap-4 text-center sm:text-left">
          <p>{t('copyright')}</p>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-[#C5A55A] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#FAF7F1]/10">|</span>
            <Link href="/terms" className="hover:text-[#C5A55A] transition-colors">
              Terms of Contribution
            </Link>
            <span className="text-[#FAF7F1]/10">|</span>
            <Link href="/accessibility" className="hover:text-[#C5A55A] transition-colors py-1">
              Accessibility
            </Link>
            <span className="text-[#FAF7F1]/10">|</span>
            <Link href="/sitemap" className="hover:text-[#C5A55A] transition-colors py-1">
              Sitemap
            </Link>
          </div>
          <p className="flex items-center space-x-1.5 text-[#FAF7F1]/20">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-[#B54A3A]" />
            <span>{t('mission')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
