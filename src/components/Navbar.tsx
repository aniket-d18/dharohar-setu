'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Map, Compass, Mic, LogIn, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, useTranslations, LANGUAGE_OPTIONS, SupportedLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations('nav');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const canVerify = Boolean(user && user.role !== 'CONTRIBUTOR');

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ontologies is only shown to non-verifier users (contributors and guests)
  const showOntologies = !user || user.role === 'CONTRIBUTOR';

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/atlas', label: t('atlas'), icon: Map },
    { href: '/archive', label: t('archive'), icon: Compass },
    ...(showOntologies ? [{ href: '/untranslatable', label: t('untranslatable') }] : []),
    { href: '/dashboard', label: t('dashboard') },
    ...(canVerify ? [{ href: '/verify', label: t('verify') }] : []),
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#B54A3A]/10 text-[#B54A3A] border-[#B54A3A]/30';
      case 'STEWARD':
        return 'bg-[#2F6E5D]/15 text-[#2F6E5D] border-[#2F6E5D]/40';
      case 'REVIEWER':
      case 'EXPERT':
        return 'bg-[#6B8F5E]/15 text-[#6B8F5E] border-[#6B8F5E]/40';
      default:
        return 'bg-[#C97A3D]/10 text-[#C97A3D] border-[#C97A3D]/30';
    }
  };

  const currentLangOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-50 bg-[#DCE9E4] border-b border-[#B8D4CB]">
      {/* Top Utility Strip — brand name removed from left, everything else as original */}
      <div className="bg-[#D2E3DD] border-b border-[#B8D4CB]/70 text-[11px] sm:text-xs text-[#2A2420]/75 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[36px] py-1 flex items-center justify-end">
          <div className="flex items-center space-x-3 sm:space-x-5 text-[#2A2420]/75">
            <span className="hidden sm:inline-flex items-center space-x-1.5">
              <span className="text-[#2F6E5D] font-semibold">49</span>
              <span>{t('records')}</span>
              <span className="text-[#2A2420]/35">·</span>
              <span className="text-[#2F6E5D] font-semibold">32</span>
              <span>{t('languages')}</span>
            </span>
            <span className="hidden sm:inline text-[#2A2420]/35">|</span>
            <Link href="/archive" className="hover:text-[#2F6E5D] transition-colors">
              {t('archiveDirectory')}
            </Link>
            <a
              href="mailto:curator@dharoharsetu.in"
              className="hover:text-[#2F6E5D] transition-colors hidden md:inline"
            >
              {t('contactCurators')}
            </a>

            {/* User Profile / Sign In Dropdown */}
            {user ? (
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-1 rounded bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] border border-[#B8D4CB] hover:border-[#2F6E5D] text-left transition-colors font-sans"
                  aria-label="User account menu"
                >
                  <span className="text-xs text-[#2A2420] font-semibold leading-none max-w-[110px] sm:max-w-[140px] truncate">
                    {user.displayName}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-[#2A2420]/50 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-[#FAF7F1] border border-[#B8D4CB] rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans">
                    <div className="px-3 py-2 border-b border-[#E4DDD0]">
                      <div className="text-xs font-semibold text-[#2A2420] truncate">
                        {user.displayName}
                      </div>
                      {user.email && (
                        <div className="text-[10px] text-[#2A2420]/55 truncate font-mono mt-0.5">
                          {user.email}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2 text-[#B54A3A] hover:bg-[#B54A3A]/10 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-sans font-medium text-[#2A2420]/85 hover:text-[#2F6E5D] border border-[#B8D4CB] hover:border-[#2F6E5D] hover:bg-[#FFFFFF]/80 transition-colors ml-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('signIn')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>


      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3.5 group shrink-0">
          <div className="w-12 h-12 rounded-lg bg-[#FFFFFF] border border-[#B8D4CB] overflow-hidden flex items-center justify-center group-hover:border-[#2F6E5D] transition-colors shadow-sm shrink-0">
            <img src="/images/logo.png" alt="Dharohar Setu Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-serif text-2xl font-semibold tracking-tight text-[#2A2420] block leading-none">
              Dharohar Setu
            </span>
            <span className="text-xs text-[#2F6E5D] font-sans tracking-wide font-medium mt-1 inline-block">
              {t('brandSubtitle')}
            </span>
          </div>
        </Link>

        {/* Right-Aligned Group: Nav Links + Language Switcher + Capture Button */}
        <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md text-sm font-sans transition-colors ${
                    isActive
                      ? 'text-[#2F6E5D] bg-[#FFFFFF] font-semibold border border-[#B8D4CB]'
                      : 'text-[#2A2420]/80 hover:text-[#2F6E5D] hover:bg-[#FFFFFF]/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Language Switcher Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs font-sans font-medium text-[#2A2420]/85 hover:text-[#2F6E5D] bg-[#FFFFFF]/70 hover:bg-[#FFFFFF] border border-[#B8D4CB] transition-colors"
                title="Select UI Language"
                aria-label="Select UI Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#2F6E5D]" />
                <span className="font-semibold">{currentLangOption.label}</span>
                <ChevronDown className={`w-3 h-3 text-[#2A2420]/50 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-[#FAF7F1] border border-[#B8D4CB] rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-[#E4DDD0] text-[10px] uppercase tracking-wider font-semibold text-[#2A2420]/50">
                    Select Language
                  </div>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLanguage(opt.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        language === opt.code
                          ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-semibold'
                          : 'text-[#2A2420]/85 hover:bg-[#EAE4D9]'
                      }`}
                    >
                      <span>{opt.nativeName}</span>
                      <span className="text-[10px] text-[#2A2420]/45 font-mono uppercase">{opt.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>



            {/* Primary CTA */}
            <Link
              href="/capture"
              className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-md bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs sm:text-sm hover:bg-[#B86B30] transition-colors shadow-none whitespace-nowrap"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">{t('capture')}</span>
              <span className="sm:hidden">{t('capture')}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
