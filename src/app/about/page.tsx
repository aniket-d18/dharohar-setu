'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Users,
  Globe,
  Shield,
  Mic,
  BookOpen,
  Map,
  Heart,
  Award,
  Target,
  Compass,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const TEAM_ROLES = [
  { title: 'Cultural Stewards', count: '42+', desc: 'Community elders and tradition-bearers guiding documentation', icon: Users, color: '#2F6E5D' },
  { title: 'Language Experts', count: '15+', desc: 'Linguists and scholars verifying endangered language records', icon: BookOpen, color: '#C97A3D' },
  { title: 'Field Contributors', count: '100+', desc: 'Volunteers recording living traditions across India', icon: Mic, color: '#C5A55A' },
  { title: 'Technologists', count: '8+', desc: 'Engineers building the preservation infrastructure', icon: Globe, color: '#6B8F5E' },
];

const VALUES = [
  {
    title: 'Community-First',
    desc: 'Every tradition belongs to its community. We build with communities, not just about them. Consent and ownership are non-negotiable.',
    icon: Heart,
    color: '#B54A3A',
  },
  {
    title: 'Academic Rigor',
    desc: 'Multi-layered verification by community elders, linguists, and cultural experts ensures authenticity at every level.',
    icon: ShieldCheck,
    color: '#2F6E5D',
  },
  {
    title: 'Open Access',
    desc: 'Cultural heritage is a shared inheritance. We believe in open, accessible archives that anyone can explore and learn from.',
    icon: Globe,
    color: '#C5A55A',
  },
  {
    title: 'Urgency-Driven',
    desc: 'With 197+ Indian languages critically endangered, we prioritize the most at-risk traditions for documentation.',
    icon: Target,
    color: '#C97A3D',
  },
];

const TIMELINE = [
  { year: '2024', title: 'Project Inception', desc: 'Dharohar Setu conceptualized as part of SIH 2024 to preserve India\'s intangible heritage.' },
  { year: '2025', title: 'Field Pilots', desc: 'First field recordings from Nilgiri Hills, Spiti Valley, and Andaman Islands.' },
  { year: '2026', title: 'National Launch', desc: 'Platform scaled to 42 regions with 32 languages documented and AI-powered enrichment.' },
  { year: '2027+', title: 'Vision', desc: 'Cover all 6.5 lakh villages, integrate with MGMD and Indian Culture Portal ecosystem.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 hero-pattern pointer-events-none" />
          <div className="absolute inset-0 pattern-mandala pointer-events-none opacity-30" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="ornamental-top" />
            <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#C5A55A]/10 border border-[#C5A55A]/25 text-xs font-sans text-[#C5A55A] mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="tracking-wider">Our Mission</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] text-[#2A2420] mb-6">
              Preserving the Voices of a Civilization
            </h1>
            <p className="text-base sm:text-lg text-[#2A2420]/60 max-w-2xl mx-auto leading-relaxed">
              Dharohar Setu is India's first community-powered digital archive for documenting, verifying, and preserving the nation's endangered oral traditions, folk arts, and intangible cultural heritage.
            </p>
          </div>
        </section>

        {/* Mission Image Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-16">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <img src="/images/categories/oral-stories.jpg" alt="Oral tradition preservation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <img src="/images/categories/folk-songs.jpg" alt="Folk music documentation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <img src="/images/categories/sacred-crafts.jpg" alt="Traditional craft preservation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="museum-dark-bg py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="ornamental-top" />
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#FAF7F1] mb-6">
              Why This Matters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
              <div className="text-center">
                <p className="font-serif text-5xl font-semibold text-gradient-gold mb-2">197+</p>
                <p className="text-sm text-[#FAF7F1]/50">Indian languages on UNESCO's endangered list</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-5xl font-semibold text-[#B54A3A] mb-2">1</p>
                <p className="text-sm text-[#FAF7F1]/50">Language dies every 14 days globally</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-5xl font-semibold text-[#2F6E5D] mb-2">∞</p>
                <p className="text-sm text-[#FAF7F1]/50">Knowledge lost when an elder passes without documentation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="gold-accent-line-center" />
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2A2420] mb-3">Our Guiding Principles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="heritage-card p-6 sm:p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${value.color}15`, border: `1px solid ${value.color}30` }}>
                      <Icon className="w-6 h-6" style={{ color: value.color }} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#2A2420] mb-2">{value.title}</h3>
                      <p className="text-sm text-[#2A2420]/55 leading-relaxed">{value.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-[#F5F0E6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="gold-accent-line-center" />
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2A2420] mb-3">Our Journey</h2>
            </div>
            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className="flex items-start space-x-6 group">
                  <div className="shrink-0 w-20 text-right">
                    <span className="font-serif text-2xl font-semibold text-[#C5A55A]">{item.year}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute top-3 left-0 w-3 h-3 rounded-full bg-[#C5A55A] border-2 border-[#F5F0E6] -translate-x-1.5 z-10" />
                    {i < TIMELINE.length - 1 && <div className="absolute top-6 left-0 w-[2px] h-full bg-[#C5A55A]/20 -translate-x-[1px]" />}
                  </div>
                  <div className="flex-1 pb-6 pl-4">
                    <h3 className="font-serif text-lg font-medium text-[#2A2420] mb-1">{item.title}</h3>
                    <p className="text-sm text-[#2A2420]/55 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="gold-accent-line-center" />
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2A2420] mb-3">Our Community</h2>
            <p className="text-sm text-[#2A2420]/55 max-w-xl mx-auto">
              A diverse network of tradition-bearers, scholars, and volunteers preserving heritage together
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM_ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.title} className="heritage-card p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}CC)` }}>
                    <Icon className="w-7 h-7 text-[#FAF7F1]" />
                  </div>
                  <p className="font-serif text-3xl font-semibold mb-1" style={{ color: role.color }}>{role.count}</p>
                  <h3 className="font-serif text-base font-medium text-[#2A2420] mb-1">{role.title}</h3>
                  <p className="text-xs text-[#2A2420]/50 leading-relaxed">{role.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="museum-dark-bg py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#FAF7F1] mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-sm text-[#FAF7F1]/50 mb-8 max-w-lg mx-auto">
              Every recording, every story, every word you preserve becomes part of India's eternal cultural memory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/capture" className="btn-gold inline-flex items-center justify-center space-x-2 px-8 py-3.5 text-base">
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </Link>
              <Link href="/archive" className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-lg border border-[#FAF7F1]/20 text-[#FAF7F1] font-semibold text-base hover:border-[#C5A55A] hover:text-[#C5A55A] transition-all">
                <Compass className="w-5 h-5" />
                <span>Explore Archive</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
