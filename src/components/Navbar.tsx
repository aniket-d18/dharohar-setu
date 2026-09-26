'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Map,
  Compass,
  Mic,
  LogIn,
  LogOut,
  Globe,
  ChevronDown,
  Menu,
  X,
  Home,
  User,
  CheckCircle2,
  BookOpen,
  LayoutDashboard,
  Check,
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verification is strictly role-gated: only reviewers, stewards, experts, admins can verify
  const canVerify = Boolean(user && user.role !== 'CONTRIBUTOR');

  // Close desktop dropdowns on click outside
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Desktop navigation links
  const showOntologies = !user || user.role === 'CONTRIBUTOR';
  const desktopNavLinks = [
    { href: '/', label: t('home') },
    { href: '/atlas', label: t('atlas') },
    { href: '/archive', label: t('archive') },
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

  // Tab active checks for mobile bottom bar
  const isHomeActive = pathname === '/';
  const isExploreActive = pathname === '/archive' || pathname.startsWith('/record/');
  const isCaptureActive = pathname === '/capture';
  const isProfileActive = pathname === '/dashboard' || pathname === '/login';

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#DCE9E4] border-b border-[#B8D4CB]">
        {/* Top Utility Strip — desktop only */}
        <div className="hidden md:block bg-[#D2E3DD] border-b border-[#B8D4CB]/70 text-xs text-[#2A2420]/75 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[36px] py-1 flex items-center justify-end">
            <div className="flex items-center space-x-3 sm:space-x-5 text-[#2A2420]/75">
              <span className="inline-flex items-center space-x-1.5">
                <span className="text-[#2F6E5D] font-semibold">49</span>
                <span>{t('records')}</span>
                <span className="text-[#2A2420]/35">·</span>
                <span className="text-[#2F6E5D] font-semibold">32</span>
                <span>{t('languages')}</span>
              </span>
              <span className="text-[#2A2420]/35">|</span>
              <Link href="/archive" className="hover:text-[#2F6E5D] transition-colors">
                {t('archiveDirectory')}
              </Link>
              <a
                href="mailto:curator@dharoharsetu.in"
                className="hover:text-[#2F6E5D] transition-colors hidden lg:inline"
              >
                {t('contactCurators')}
              </a>

              {/* User Profile / Sign In Dropdown */}
              {user ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-1 rounded bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] border border-[#B8D4CB] hover:border-[#2F6E5D] text-left transition-colors font-sans min-h-[32px]"
                    aria-label="User account menu"
                  >
                    <span className="text-xs text-[#2A2420] font-semibold leading-none max-w-[80px] sm:max-w-[140px] truncate">
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
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2 text-[#2A2420]/80 hover:bg-[#E4DDD0]/50 transition-colors font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-[#2F6E5D]" />
                        <span>{t('dashboard')}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2 text-[#B54A3A] hover:bg-[#B54A3A]/10 transition-colors font-medium min-h-[36px] border-t border-[#E4DDD0]"
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
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-sans font-medium text-[#2A2420]/85 hover:text-[#2F6E5D] border border-[#B8D4CB] hover:border-[#2F6E5D] hover:bg-[#FFFFFF]/80 transition-colors ml-1 min-h-[32px]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('signIn')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-[#FFFFFF] border border-[#B8D4CB] overflow-hidden flex items-center justify-center group-hover:border-[#2F6E5D] transition-colors shadow-xs shrink-0">
              <img src="/images/logo.png" alt="Dharohar Setu Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-base sm:text-xl lg:text-2xl font-semibold tracking-tight text-[#2A2420] block leading-none">
                Dharohar Setu
              </span>
              <span className="text-[9px] sm:text-xs text-[#2F6E5D] font-sans tracking-wide font-medium mt-0.5 inline-block">
                {t('brandSubtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav (>= 768px) */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            <nav className="flex items-center space-x-1 lg:space-x-2">
              {desktopNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 py-1.5 lg:px-3.5 lg:py-2 rounded-md text-xs lg:text-sm font-sans transition-colors ${
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

            {/* Desktop Language Switcher & Capture CTA */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-sans font-medium text-[#2A2420]/85 hover:text-[#2F6E5D] bg-[#FFFFFF]/70 hover:bg-[#FFFFFF] border border-[#B8D4CB] transition-colors min-h-[36px]"
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
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors min-h-[36px] ${
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

              {/* Desktop Capture Button */}
              <Link
                href="/capture"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-md bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs lg:text-sm hover:bg-[#B86B30] transition-colors shadow-xs whitespace-nowrap min-h-[38px]"
              >
                <Mic className="w-4 h-4" />
                <span>{t('capture')}</span>
              </Link>
            </div>
          </div>

          {/* Mobile Right Controls (< 768px): Language indicator + Hamburger Menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Quick Language Chip */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#FFFFFF]/80 border border-[#B8D4CB] text-xs font-semibold text-[#2F6E5D] active:bg-[#FFFFFF]"
              aria-label="Language selection"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLangOption.label}</span>
            </button>

            {/* Hamburger Button — accessible 44x44px touch target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-lg text-[#2A2420] hover:text-[#2F6E5D] hover:bg-[#FFFFFF]/70 active:bg-[#B8D4CB]/40 transition-colors border border-transparent active:border-[#B8D4CB]"
              aria-label="Toggle secondary navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE HAMBURGER MENU DRAWER (< 768px)                                   */}
      {/* For everything else: Atlas, Verify, Cultural Ontologies, Dashboard,      */}
      {/* Language Switcher, and Sign In/Out.                                      */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#2A2420]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-[86vw] bg-[#FAF7F1] shadow-2xl flex flex-col overflow-y-auto border-l border-[#B8D4CB] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8D4CB] bg-[#DCE9E4]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#B8D4CB] overflow-hidden flex items-center justify-center shrink-0">
                  <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-serif text-base font-semibold text-[#2A2420] block leading-tight">
                    Dharohar Setu
                  </span>
                  <span className="text-[10px] text-[#2F6E5D] font-sans font-medium block">
                    Living Heritage Desk
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-[#2A2420]/70 hover:text-[#2A2420] hover:bg-[#E4DDD0] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Identity / Account Banner */}
            <div className="px-4 py-3 bg-[#EAE4D9]/40 border-b border-[#E4DDD0]">
              {user ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-[#2A2420] truncate">
                      {user.displayName}
                    </p>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  {user.email && (
                    <p className="text-[10px] text-[#2A2420]/60 font-mono truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#2A2420]">Guest Contributor</p>
                    <p className="text-[10px] text-[#2A2420]/60">Sign in to endorse and track records</p>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1 text-xs rounded bg-[#2F6E5D] text-white font-medium hover:bg-[#25584A]"
                  >
                    {t('signIn')}
                  </Link>
                </div>
              )}
            </div>

            {/* Secondary Navigation List */}
            <div className="flex-1 px-3 py-4 space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#2A2420]/50 px-3 mb-2 font-sans">
                Explore & Contribute
              </p>

              {/* 1. Cultural Atlas */}
              <Link
                href="/atlas"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-start space-x-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-colors min-h-[48px] ${
                  pathname === '/atlas'
                    ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-semibold border border-[#2F6E5D]/30'
                    : 'text-[#2A2420]/85 hover:bg-[#E4DDD0]/60'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#2F6E5D]/10 border border-[#2F6E5D]/20 flex items-center justify-center text-[#2F6E5D] shrink-0 mt-0.5">
                  <Map className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight text-[#2A2420]">
                    {t('atlas')}
                  </div>
                  <div className="text-[11px] text-[#2A2420]/60 mt-0.5">
                    Interactive geo-cultural heritage map
                  </div>
                </div>
              </Link>

              {/* 2. Verify Desk — STRICTLY ROLE-GATED */}
              {canVerify && (
                <Link
                  href="/verify"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-start space-x-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-colors min-h-[48px] ${
                    pathname === '/verify'
                      ? 'bg-[#2F6E5D]/15 text-[#2F6E5D] font-semibold border border-[#2F6E5D]/30'
                      : 'text-[#2A2420]/85 hover:bg-[#E4DDD0]/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#6B8F5E]/15 border border-[#6B8F5E]/30 flex items-center justify-center text-[#2F6E5D] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-sm leading-tight text-[#2A2420]">
                        {t('verify')} Desk
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#2F6E5D]/15 text-[#2F6E5D] font-semibold border border-[#2F6E5D]/30">
                        {user?.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#2A2420]/60 mt-0.5">
                      Review oral records & confirm provenance
                    </div>
                  </div>
                </Link>
              )}

              {/* 3. Cultural Ontologies / Untranslatable Words */}
              <Link
                href="/untranslatable"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-start space-x-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-colors min-h-[48px] ${
                  pathname === '/untranslatable'
                    ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-semibold border border-[#2F6E5D]/30'
                    : 'text-[#2A2420]/85 hover:bg-[#E4DDD0]/60'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#C97A3D]/10 border border-[#C97A3D]/20 flex items-center justify-center text-[#C97A3D] shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight text-[#2A2420]">
                    Cultural Ontologies
                  </div>
                  <div className="text-[11px] text-[#2A2420]/60 mt-0.5">
                    Untranslatable words & indigenous concepts
                  </div>
                </div>
              </Link>

              {/* 4. Contributor Dashboard */}
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-start space-x-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-colors min-h-[48px] ${
                  pathname === '/dashboard'
                    ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-semibold border border-[#2F6E5D]/30'
                    : 'text-[#2A2420]/85 hover:bg-[#E4DDD0]/60'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#2A2420]/5 border border-[#2A2420]/15 flex items-center justify-center text-[#2A2420] shrink-0 mt-0.5">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight text-[#2A2420]">
                    {t('dashboard')}
                  </div>
                  <div className="text-[11px] text-[#2A2420]/60 mt-0.5">
                    Your recordings, badges & verification queue
                  </div>
                </div>
              </Link>
            </div>

            {/* Language Switcher Section */}
            <div className="px-4 py-3.5 border-t border-[#E4DDD0] bg-[#FAF7F1]">
              <div className="flex items-center space-x-1.5 mb-2.5 px-0.5">
                <Globe className="w-3.5 h-3.5 text-[#2F6E5D]" />
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#2A2420]/60 font-sans">
                  Display Language / भाषा
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLanguage(opt.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors min-h-[42px] border ${
                        isSelected
                          ? 'bg-[#2F6E5D]/15 text-[#2F6E5D] border-[#2F6E5D]/40 font-semibold'
                          : 'bg-[#FFFFFF] text-[#2A2420]/80 border-[#E4DDD0] hover:bg-[#E4DDD0]/40'
                      }`}
                    >
                      <span className="truncate">{opt.nativeName}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#2F6E5D] shrink-0 ml-1" />
                      ) : (
                        <span className="text-[10px] text-[#2A2420]/40 font-mono uppercase shrink-0 ml-1">
                          {opt.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer: Sign Out / Sign In */}
            <div className="p-4 border-t border-[#E4DDD0] bg-[#FAF7F1]">
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#B54A3A] bg-[#B54A3A]/10 border border-[#B54A3A]/30 hover:bg-[#B54A3A]/15 active:scale-[0.99] transition-all min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{t('signOut')}</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#2A2420] bg-[#FFFFFF] border border-[#B8D4CB] hover:border-[#2F6E5D] active:scale-[0.99] transition-all min-h-[44px] shadow-xs"
                >
                  <LogIn className="w-4 h-4 shrink-0 text-[#2F6E5D]" />
                  <span>{t('signIn')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PERSISTENT MOBILE BOTTOM TAB BAR (< 768px)                             */}
      {/* 4 Tabs: Home, Explore (Archive), Capture, Profile                         */}
      {/* ========================================================================= */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FAF7F1]/98 backdrop-blur-md border-t border-[#B8D4CB] shadow-[0_-4px_16px_rgba(42,36,32,0.06)] h-16 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.6rem)] px-2 overflow-visible"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto h-full">
          {/* TAB 1: Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isHomeActive ? 'text-[#2F6E5D]' : 'text-[#2A2420]/60 hover:text-[#2A2420]'
            }`}
            aria-label="Home page"
          >
            <Home className="w-5 h-5 mb-0.5" strokeWidth={isHomeActive ? 2.3 : 1.8} />
            <span className={`text-[11px] font-sans leading-tight tracking-tight ${isHomeActive ? 'font-semibold text-[#2F6E5D]' : 'font-medium'}`}>
              Home
            </span>
            {isHomeActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6E5D] absolute top-0.5 right-1/2 translate-x-3" />
            )}
          </Link>

          {/* TAB 2: Explore (Routes to Archive) */}
          <Link
            href="/archive"
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isExploreActive ? 'text-[#2F6E5D]' : 'text-[#2A2420]/60 hover:text-[#2A2420]'
            }`}
            aria-label="Explore archive"
          >
            <Compass className="w-5 h-5 mb-0.5" strokeWidth={isExploreActive ? 2.3 : 1.8} />
            <span className={`text-[11px] font-sans leading-tight tracking-tight ${isExploreActive ? 'font-semibold text-[#2F6E5D]' : 'font-medium'}`}>
              Explore
            </span>
            {isExploreActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6E5D] absolute top-0.5 right-1/2 translate-x-3.5" />
            )}
          </Link>

          {/* TAB 3: Capture (Prominent elevated center action) */}
          <Link
            href="/capture"
            className="flex flex-col items-center justify-center h-full relative group"
            aria-label="Capture cultural heritage memory"
          >
            <div
              className={`-mt-4 w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2 border-[#FAF7F1] transition-transform active:scale-95 ${
                isCaptureActive
                  ? 'bg-[#B86B30] text-[#FAF7F1] ring-2 ring-[#C97A3D]/50'
                  : 'bg-[#C97A3D] text-[#FAF7F1] group-hover:bg-[#B86B30]'
              }`}
            >
              <Mic className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <span
              className={`text-[11px] font-sans leading-tight tracking-tight mt-0.5 ${
                isCaptureActive ? 'font-semibold text-[#C97A3D]' : 'font-medium text-[#2A2420]/75'
              }`}
            >
              Capture
            </span>
          </Link>

          {/* TAB 4: Profile / Sign In */}
          <Link
            href={user ? '/dashboard' : '/login'}
            className={`flex flex-col items-center justify-center h-full transition-colors relative ${
              isProfileActive ? 'text-[#2F6E5D]' : 'text-[#2A2420]/60 hover:text-[#2A2420]'
            }`}
            aria-label={user ? 'User Profile' : 'Sign In'}
          >
            <User className="w-5 h-5 mb-0.5" strokeWidth={isProfileActive ? 2.3 : 1.8} />
            <span className={`text-[11px] font-sans leading-tight tracking-tight truncate max-w-[65px] ${isProfileActive ? 'font-semibold text-[#2F6E5D]' : 'font-medium'}`}>
              {user ? 'Profile' : 'Sign In'}
            </span>
            {isProfileActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6E5D] absolute top-0.5 right-1/2 translate-x-3" />
            )}
          </Link>
        </div>
      </nav>
    </>
  );
}
