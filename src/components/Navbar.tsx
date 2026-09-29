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
  Layers,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, useTranslations, LANGUAGE_OPTIONS } from '@/context/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations('nav');

  // Dropdown & drawer states
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const directoryRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Role gating for verification desk
  const canVerify = Boolean(user && user.role !== 'CONTRIBUTOR');

  // Track scroll for subtle shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (directoryRef.current && !directoryRef.current.contains(e.target as Node)) {
        setDirectoryOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close drawer & menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setDirectoryOpen(false);
    setLangMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Lock background scroll when mobile directory drawer is open
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

  const currentLangOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

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

  // Mobile Bottom Bar active checks
  const isHomeActive = pathname === '/';
  const isExploreActive = pathname === '/archive' || pathname.startsWith('/record/');
  const isCollectionsActive = pathname === '/collections';
  const isAtlasActive = pathname === '/atlas';
  const isCaptureActive = pathname === '/capture';

  // Structured Heritage Categories in List Format
  const HERITAGE_LIST = [
    {
      id: 'TRADITIONAL_MEDICINE',
      label: 'Traditional Medicine & Wild Herbs',
      icon: '🌿',
      desc: 'Ancient herbal cures, forest foraging & Ayurvedic wisdom',
      href: '/archive?category=TRADITIONAL_MEDICINE',
      badge: 'Featured',
    },
    {
      id: 'LULLABY',
      label: 'Folk Songs & Lullabies',
      icon: '🎵',
      desc: 'Ancestral melodies, cradle songs & oral poetry',
      href: '/archive?category=LULLABY',
    },
    {
      id: 'STORY',
      label: 'Oral Folktales & Ballads',
      icon: '📖',
      desc: 'Creation legends, heroic ballads & clan narratives',
      href: '/archive?category=STORY',
    },
    {
      id: 'CRAFT_TECHNIQUE',
      label: 'Sacred Crafts & Handloom',
      icon: '🏺',
      desc: 'Silk weaving, pottery, metalwork & carving',
      href: '/archive?category=CRAFT_TECHNIQUE',
    },
    {
      id: 'RITUAL',
      label: 'Sacred Rituals & Chants',
      icon: '🙏',
      desc: 'Temple rites, pastoral prayers & seasonal invocations',
      href: '/archive?category=RITUAL',
    },
    {
      id: 'RECIPE',
      label: 'Culinary Heritage',
      icon: '🍲',
      desc: 'Traditional recipes, seasonal foraged cooking & nutrition',
      href: '/archive?category=RECIPE',
    },
    {
      id: 'PROVERB',
      label: 'Vernacular Proverbs',
      icon: '💬',
      desc: 'Living idioms & ancestral philosophical sayings',
      href: '/archive?category=PROVERB',
    },
    {
      id: 'LIFE_SKILL',
      label: 'Ecology & Life Skills',
      icon: '🌾',
      desc: 'Indigenous weather reading, tracking & woodcraft',
      href: '/archive?category=LIFE_SKILL',
    },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* LUXURY HERITAGE NAVBAR (Warm Ivory • Unified Cohesion • Zero Empty Void)  */}
      {/* ========================================================================= */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 bg-[#FFFCF7]/95 backdrop-blur-md border-b border-[#E4DDD0] ${
          scrolled ? 'shadow-[0_4px_24px_rgba(42,36,32,0.08)]' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center space-x-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center ring-1 ring-[#C5A55A]/50 group-hover:ring-[#C5A55A] shadow-sm bg-[#1A1714] shrink-0 transition-transform group-hover:scale-105">
              <img src="/images/logo.png" alt="Dharohar Setu Emblem" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-[21px] font-bold tracking-tight text-[#2A2420] block leading-none group-hover:text-[#C97A3D] transition-colors">
                Dharohar Setu
              </span>
              <span className="text-[10px] sm:text-[10.5px] text-[#C5A55A] font-sans font-semibold tracking-widest uppercase mt-1 block">
                Living Cultural Vault
              </span>
            </div>
          </Link>

          {/* Desktop Navigation & Actions (Clean, Refined Typography — No Icon Clutter) */}
          <div className="hidden lg:flex items-center space-x-1.5 xl:space-x-2.5 shrink-0">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-1">
              {/* 1. Home */}
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-[13.5px] font-sans font-medium transition-colors ${
                  pathname === '/'
                    ? 'text-[#2A2420] bg-[#F5F0E6] font-semibold'
                    : 'text-[#2A2420]/75 hover:text-[#2A2420] hover:bg-[#F5F0E6]'
                }`}
              >
                {t('home')}
              </Link>

              {/* 2. Heritage Directory (List Format Mega-Menu) */}
              <div className="relative" ref={directoryRef}>
                <button
                  type="button"
                  onClick={() => setDirectoryOpen(!directoryOpen)}
                  className={`px-3 py-1.5 rounded-lg text-[13.5px] font-sans font-medium flex items-center space-x-1 transition-colors cursor-pointer ${
                    directoryOpen || pathname.startsWith('/archive') || pathname.startsWith('/record/')
                      ? 'text-[#2A2420] bg-[#F5F0E6] font-semibold'
                      : 'text-[#2A2420]/75 hover:text-[#2A2420] hover:bg-[#F5F0E6]'
                  }`}
                  aria-expanded={directoryOpen}
                >
                  <span>Heritage Directory</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#2A2420]/50 transition-transform duration-200 ${
                      directoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Directory Dropdown Panel (Clean 2-Column List Format) */}
                {directoryOpen && (
                  <div className="absolute left-0 mt-2 w-[560px] bg-[#FFFCF7] border border-[#E4DDD0] rounded-2xl shadow-xl p-4.5 z-50 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD0] mb-3">
                      <div>
                        <p className="text-sm font-serif font-bold text-[#2A2420]">Living Heritage Archives</p>
                        <p className="text-xs text-[#2A2420]/60 font-sans mt-0.5">
                          Browse folk traditions, ancient medicine, and oral wisdom
                        </p>
                      </div>
                      <Link
                        href="/archive"
                        onClick={() => setDirectoryOpen(false)}
                        className="text-xs font-sans text-[#C97A3D] font-semibold hover:underline flex items-center space-x-1"
                      >
                        <span>All Records</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {HERITAGE_LIST.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setDirectoryOpen(false)}
                          className="p-2.5 rounded-xl hover:bg-[#F5F0E6] transition-colors border border-transparent hover:border-[#E4DDD0] flex items-start space-x-2.5 group"
                        >
                          <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                            {item.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-semibold text-[#2A2420] group-hover:text-[#C97A3D] transition-colors truncate">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded-full bg-[#2F6E5D]/15 text-[#2F6E5D] border border-[#2F6E5D]/30 font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#2A2420]/55 line-clamp-1 mt-0.5">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-[#E4DDD0] flex items-center justify-between text-xs bg-[#FAF7F1] -mx-4.5 -mb-4.5 p-3 rounded-b-2xl">
                      <span className="text-[#2A2420]/65 text-xs">Have an ancient remedy or folk song?</span>
                      <Link
                        href="/capture"
                        onClick={() => setDirectoryOpen(false)}
                        className="font-semibold text-[#C97A3D] hover:underline flex items-center gap-1"
                      >
                        <span>Deposit now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Cultural Atlas */}
              <Link
                href="/atlas"
                className={`px-3 py-1.5 rounded-lg text-[13.5px] font-sans font-medium transition-colors ${
                  pathname === '/atlas'
                    ? 'text-[#2F6E5D] bg-[#2F6E5D]/10 font-semibold'
                    : 'text-[#2A2420]/75 hover:text-[#2A2420] hover:bg-[#F5F0E6]'
                }`}
              >
                Cultural Atlas
              </Link>

              {/* 4. Curated Collections */}
              <Link
                href="/collections"
                className={`px-3 py-1.5 rounded-lg text-[13.5px] font-sans font-medium transition-colors ${
                  pathname === '/collections'
                    ? 'text-[#2A2420] bg-[#F5F0E6] font-semibold'
                    : 'text-[#2A2420]/75 hover:text-[#2A2420] hover:bg-[#F5F0E6]'
                }`}
              >
                Collections
              </Link>

              {/* 5. Dashboard */}
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-[13.5px] font-sans font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-[#2A2420] bg-[#F5F0E6] font-semibold'
                    : 'text-[#2A2420]/75 hover:text-[#2A2420] hover:bg-[#F5F0E6]'
                }`}
              >
                Dashboard
              </Link>

              {/* 6. Verify (Role-gated) */}
              {canVerify && (
                <Link
                  href="/verify"
                  className={`px-3 py-1.5 rounded-lg text-[13.5px] font-sans font-medium text-[#2F6E5D] transition-colors ${
                    pathname === '/verify'
                      ? 'bg-[#2F6E5D]/15 font-semibold'
                      : 'hover:bg-[#2F6E5D]/10'
                  }`}
                >
                  Verify
                </Link>
              )}
            </nav>

            {/* Subtle Divider */}
            <div className="h-5 w-[1px] bg-[#E4DDD0] mx-0.5 shrink-0" />

            {/* Language Selector */}
            <div className="relative shrink-0" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-sans font-medium text-[#2A2420] bg-[#F5F0E6] hover:bg-[#EAE4D9] border border-[#E4DDD0] transition-colors cursor-pointer"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#C5A55A]" />
                <span>{currentLangOption.label}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#2A2420]/45 transition-transform ${
                    langMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#FFFCF7] border border-[#E4DDD0] rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn font-sans">
                  <div className="px-3.5 py-1.5 border-b border-[#E4DDD0] text-[10px] uppercase tracking-wider font-semibold text-[#2A2420]/50">
                    Language / भाषा
                  </div>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLanguage(opt.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors ${
                        language === opt.code
                          ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-semibold'
                          : 'text-[#2A2420]/80 hover:bg-[#F5F0E6]'
                      }`}
                    >
                      <span>{opt.nativeName}</span>
                      <span className="text-xs text-[#2A2420]/40 font-mono uppercase">{opt.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Sign In */}
            {user ? (
              <div className="relative shrink-0" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#F5F0E6] hover:bg-[#EAE4D9] border border-[#E4DDD0] text-left transition-colors font-sans"
                >
                  <span className="text-xs text-[#2A2420] font-medium max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-[#2A2420]/40 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#FFFCF7] border border-[#E4DDD0] rounded-xl shadow-xl py-1 z-50 animate-fadeIn font-sans">
                    <div className="px-4 py-2.5 border-b border-[#E4DDD0] bg-[#F5F0E6]/50">
                      <div className="text-sm font-semibold text-[#2A2420] truncate">{user.displayName}</div>
                      {user.email && (
                        <div className="text-xs text-[#2A2420]/55 truncate font-mono mt-0.5">
                          {user.email}
                        </div>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center space-x-2.5 text-[#2A2420]/80 hover:bg-[#F5F0E6] transition-colors"
                    >
                      <User className="w-4 h-4 shrink-0 text-[#2F6E5D]" />
                      <span>My Contributions</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center space-x-2.5 text-[#2A2420]/80 hover:bg-[#F5F0E6] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0 text-[#C97A3D]" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center space-x-2.5 text-[#B54A3A] hover:bg-[#B54A3A]/5 transition-colors font-medium border-t border-[#E4DDD0]"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>{t('signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-[13.5px] font-sans font-medium text-[#2A2420]/80 hover:text-[#2A2420] hover:bg-[#F5F0E6] transition-colors shrink-0"
              >
                <span>{t('signIn')}</span>
              </Link>
            )}

            {/* Deposit Memory CTA */}
            <Link
              href="/capture"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#C97A3D] to-[#9C4D18] hover:from-[#D98748] hover:to-[#B3581E] shadow-sm hover:shadow transition-all active:scale-95 shrink-0"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Deposit Memory</span>
            </Link>
          </div>

          {/* Mobile & Tablet Controls (< 1024px) */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Quick Deposit button for tablets / mobile */}
            <Link
              href="/capture"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#C97A3D] to-[#9C4D18] shadow-xs shrink-0"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deposit</span>
            </Link>

            {/* Language Selection Pill */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#F5F0E6] border border-[#E4DDD0] text-xs font-semibold text-[#2A2420]"
              aria-label="Language selection"
            >
              <Globe className="w-3.5 h-3.5 text-[#C5A55A]" />
              <span>{currentLangOption.label}</span>
            </button>

            {/* Directory Drawer Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#2A2420] bg-[#F5F0E6] border border-[#E4DDD0] transition-colors"
              aria-label="Open Directory Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE DIRECTORY DRAWER (Categorized List Format)                         */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#1A1714]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute top-0 right-0 h-full w-84 max-w-[88vw] bg-[#FFFCF7] shadow-2xl flex flex-col overflow-y-auto border-l border-[#E4DDD0] animate-slideInRight font-sans">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4DDD0] bg-[#161310] text-[#FAF7F1]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-[#C5A55A]/50 bg-black">
                  <img src="/images/logo.png" alt="Emblem" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-serif text-base font-bold text-[#FAF7F1] block leading-tight">
                    Dharohar Setu
                  </span>
                  <span className="text-[9px] text-[#C5A55A] font-sans font-semibold tracking-widest uppercase block mt-0.5">
                    Living Heritage Directory
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#FAF7F1]/70 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Deposit Banner */}
            <div className="p-3.5 bg-gradient-to-r from-[#C97A3D]/10 via-[#FAF7F1] to-[#C5A55A]/10 border-b border-[#E4DDD0]">
              <Link
                href="/capture"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <Mic className="w-4 h-4" />
                <span>+ Deposit Cultural Memory</span>
              </Link>
            </div>

            {/* Categorized List */}
            <div className="flex-1 px-3.5 py-4 overflow-y-auto space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#C5A55A] px-2 mb-2">
                  Heritage Classifications
                </p>
                <div className="space-y-1">
                  {HERITAGE_LIST.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F0E6] text-xs text-[#2A2420] transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="text-lg shrink-0">{item.icon}</span>
                        <span className="font-medium truncate">{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full bg-[#2F6E5D]/15 text-[#2F6E5D]">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#2A2420]/30 shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Portals */}
              <div className="pt-2 border-t border-[#E4DDD0]">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#C5A55A] px-2 mb-2">
                  Portals &amp; Discovery
                </p>
                <div className="space-y-1">
                  <Link
                    href="/collections"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                      pathname === '/collections'
                        ? 'bg-[#C97A3D]/10 text-[#C97A3D] font-semibold border border-[#C97A3D]/30'
                        : 'hover:bg-[#F5F0E6] text-[#2A2420]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <BookOpen className="w-4 h-4 text-[#C97A3D] shrink-0" />
                      <span className="font-semibold">Collections &amp; Exhibitions</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#C97A3D]/15 text-[#C97A3D] font-bold">
                      8 Exhibitions
                    </span>
                  </Link>

                  <Link
                    href="/atlas"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                      pathname === '/atlas'
                        ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-semibold border border-[#2F6E5D]/30'
                        : 'hover:bg-[#F5F0E6] text-[#2A2420]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Map className="w-4 h-4 text-[#2F6E5D] shrink-0" />
                      <span className="font-medium">Cultural Atlas (36 States &amp; UTs)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#2A2420]/30" />
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F0E6] text-xs text-[#2A2420]"
                  >
                    <div className="flex items-center space-x-2.5">
                      <LayoutDashboard className="w-4 h-4 text-[#C97A3D] shrink-0" />
                      <span className="font-medium">Dashboard</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#2A2420]/30" />
                  </Link>

                  {canVerify && (
                    <Link
                      href="/verify"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#2F6E5D]/10 text-xs text-[#2F6E5D] font-semibold"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2F6E5D] shrink-0" />
                        <span>Review &amp; Verification Desk</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#2F6E5D]/50" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Language Selection */}
              <div className="pt-2 border-t border-[#E4DDD0]">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#C5A55A] px-2 mb-2">
                  Language / भाषा
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLanguage(opt.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`p-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
                        language === opt.code
                          ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] border-[#2F6E5D]/30 font-semibold'
                          : 'bg-[#FFFCF7] text-[#2A2420]/80 border-[#E4DDD0]'
                      }`}
                    >
                      <span>{opt.nativeName}</span>
                      {language === opt.code && <Check className="w-3 h-3 text-[#2F6E5D]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer User Account Footer */}
            <div className="p-3.5 border-t border-[#E4DDD0] bg-[#FAF7F1]">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="text-xs font-semibold text-[#2A2420]">{user.displayName}</p>
                      <p className="text-[10px] text-[#2A2420]/50">{user.email}</p>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold text-[#B54A3A] bg-[#B54A3A]/8 hover:bg-[#B54A3A]/15 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('signOut')}</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold text-[#2A2420] bg-white border border-[#E4DDD0] hover:bg-[#F5F0E6] shadow-xs"
                >
                  <LogIn className="w-4 h-4 text-[#C97A3D]" />
                  <span>{t('signIn')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION DOCK (< 768px)                                   */}
      {/* ========================================================================= */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden bg-[#FFFCF7]/95 backdrop-blur-md border-t border-[#E4DDD0] shadow-[0_-4px_20px_rgba(26,23,20,0.08)] h-16 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.6rem)] px-2"
        aria-label="Mobile Navigation Dock"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto h-full">
          {/* TAB 1: Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center h-full transition-all relative ${
              isHomeActive ? 'text-[#C97A3D]' : 'text-[#2A2420]/50 hover:text-[#2A2420]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" strokeWidth={isHomeActive ? 2.3 : 1.8} />
            <span
              className={`text-[10px] font-sans leading-tight ${
                isHomeActive ? 'font-bold text-[#C97A3D]' : 'font-medium'
              }`}
            >
              Home
            </span>
            {isHomeActive && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#C97A3D]" />
            )}
          </Link>

          {/* TAB 2: Explore Archives */}
          <Link
            href="/archive"
            className={`flex flex-col items-center justify-center h-full transition-all relative ${
              isExploreActive ? 'text-[#C97A3D]' : 'text-[#2A2420]/50 hover:text-[#2A2420]'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" strokeWidth={isExploreActive ? 2.3 : 1.8} />
            <span
              className={`text-[10px] font-sans leading-tight ${
                isExploreActive ? 'font-bold text-[#C97A3D]' : 'font-medium'
              }`}
            >
              Archives
            </span>
            {isExploreActive && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#C97A3D]" />
            )}
          </Link>

          {/* TAB 3: Deposit (+ Capture) Center Elevated Button */}
          <Link
            href="/capture"
            className="flex flex-col items-center justify-center h-full relative group"
            aria-label="Deposit Cultural Memory"
          >
            <div
              className={`-mt-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-[#FFFCF7] transition-all active:scale-95 ${
                isCaptureActive
                  ? 'bg-gradient-to-br from-[#C97A3D] to-[#9C4D18] text-white ring-2 ring-[#C97A3D]/40'
                  : 'bg-gradient-to-br from-[#C97A3D] to-[#B86B30] text-white group-hover:scale-105'
              }`}
            >
              <Mic className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <span
              className={`text-[10px] font-sans leading-tight mt-0.5 ${
                isCaptureActive ? 'font-bold text-[#C97A3D]' : 'font-medium text-[#2A2420]/60'
              }`}
            >
              Deposit
            </span>
          </Link>

          {/* TAB 4: Collections */}
          <Link
            href="/collections"
            className={`flex flex-col items-center justify-center h-full transition-all relative ${
              isCollectionsActive ? 'text-[#C97A3D]' : 'text-[#2A2420]/50 hover:text-[#2A2420]'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" strokeWidth={isCollectionsActive ? 2.3 : 1.8} />
            <span
              className={`text-[10px] font-sans leading-tight ${
                isCollectionsActive ? 'font-bold text-[#C97A3D]' : 'font-medium'
              }`}
            >
              Collections
            </span>
            {isCollectionsActive && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#C97A3D]" />
            )}
          </Link>

          {/* TAB 5: Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center h-full text-[#2A2420]/50 hover:text-[#2A2420]"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 mb-0.5" strokeWidth={1.8} />
            <span className="text-[10px] font-sans font-medium leading-tight">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}
