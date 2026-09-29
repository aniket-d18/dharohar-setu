'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Compass,
  BookOpen,
  Map,
  Mic,
  ShieldCheck,
  Home,
  Layers,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User,
  LayoutDashboard,
} from 'lucide-react';

const SITEMAP_SECTIONS = [
  {
    title: 'Core Portals & Discovery',
    icon: Compass,
    links: [
      { label: 'Home Page', href: '/', desc: 'Living cultural repository overview, live impact counters, and category explorer' },
      { label: 'Living Heritage Archive', href: '/archive', desc: 'Browse all documented oral folklore, songs, crafts, and medical lore with multi-faceted filters' },
      { label: 'Cultural Atlas (36 States & UTs)', href: '/atlas', desc: 'Geographic and linguistic map showcasing regional diversity and vitality scores' },
      { label: 'Curated Collections & Exhibitions', href: '/collections', desc: 'Thematic exhibitions celebrating vanishing dialects, wild medicine, and sacred weaves' },
      { label: 'Field Chronicles & Stories', href: '/stories', desc: 'In-depth documentation essays and oral recording expeditions' },
      { label: 'Living Concepts (Untranslatable Words)', href: '/untranslatable', desc: 'Indigenous words and cultural philosophies without direct English equivalents' },
    ],
  },
  {
    title: 'Heritage Classifications & Direct Links',
    icon: Layers,
    links: [
      { label: 'Traditional Medicine & Wild Herbs', href: '/archive?category=TRADITIONAL_MEDICINE', desc: 'Forest cures, tribal botany, and Ayurvedic healing wisdom' },
      { label: 'Folk Songs & Lullabies', href: '/archive?category=LULLABY', desc: 'Cradle songs, seasonal ballads, and oral poetry' },
      { label: 'Oral Folktales & Narratives', href: '/archive?category=STORY', desc: 'Creation legends, tribal ballads, and ancestral parables' },
      { label: 'Sacred Crafts & Handlooms', href: '/archive?category=CRAFT_TECHNIQUE', desc: 'Hereditary weaving, pottery, metalwork, and temple carving' },
      { label: 'Living Rituals & Chants', href: '/archive?category=RITUAL', desc: 'Pastoral chants, Vedic fire rites, and festival invocations' },
      { label: 'Culinary Heritage & Wild Foraging', href: '/archive?category=RECIPE', desc: 'Ancestral grain fermentation and heirloom nutritional recipes' },
      { label: 'Vernacular Proverbs & Sayings', href: '/archive?category=PROVERB', desc: 'Living idioms and cultural philosophies' },
      { label: 'Endangered Dialects Directory', href: '/archive?tab=languages', desc: '197 endangered and vulnerable Indian dialects' },
    ],
  },
  {
    title: 'Contribution & Community Stewardship',
    icon: Mic,
    links: [
      { label: 'Deposit Cultural Memory', href: '/capture', desc: 'Guided submission workflow for audio, video, photo, and text folklore' },
      { label: 'Review & Verification Desk', href: '/verify', desc: 'Peer verification workspace for linguists, stewards, and elders' },
      { label: 'Contributor Dashboard', href: '/dashboard', desc: 'Track your contributions, verification progress, and community impact' },
      { label: 'Community Profile', href: '/profile', desc: 'Manage your custodian profile and peer badges' },
      { label: 'Sign In / Register', href: '/login', desc: 'Access your steward account' },
    ],
  },
  {
    title: 'Governance & Institutional Transparency',
    icon: ShieldCheck,
    links: [
      { label: 'About Dharohar Setu', href: '/about', desc: 'Mission, technological architecture, and indigenous community stewardship model' },
      { label: 'Privacy Policy', href: '/privacy', desc: 'Ethical data governance, elder consent, and cultural sovereignty guarantees' },
      { label: 'Terms of Contribution', href: '/terms', desc: 'Community licensing, fair use for preservation, and provenance tracking' },
      { label: 'Accessibility Statement', href: '/accessibility', desc: 'WCAG 2.1 AA compliance and oral-first non-literate access' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20 overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-sans text-[#C97A3D] font-medium hover:underline mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#C5A55A]/10 border border-[#C5A55A]/30 text-[#C5A55A] text-xs font-sans font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Repository Sitemap</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2A2420] font-semibold mb-3">
            Site Directory &amp; Navigation Index
          </h1>
          <p className="text-xs sm:text-sm text-[#2A2420]/70 font-sans max-w-2xl leading-relaxed">
            A comprehensive index of all portals, curated exhibitions, heritage classifications, community verification tools, and institutional policies across Dharohar Setu.
          </p>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SITEMAP_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-[#FFFCF7] border border-[#E4DDD0] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2.5 pb-4 border-b border-[#E4DDD0] mb-4 text-[#2A2420]">
                    <div className="w-8 h-8 rounded-lg bg-[#C97A3D]/10 border border-[#C97A3D]/25 flex items-center justify-center text-[#C97A3D] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="font-serif text-lg font-semibold">{section.title}</h2>
                  </div>

                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href + link.label}>
                        <Link
                          href={link.href}
                          className="group block p-2 rounded-xl hover:bg-[#F5F0E6] transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-[#2A2420] group-hover:text-[#C97A3D] transition-colors">
                            <span>{link.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#C97A3D]" />
                          </div>
                          <p className="text-[11px] text-[#2A2420]/55 font-sans mt-0.5 line-clamp-1">
                            {link.desc}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
