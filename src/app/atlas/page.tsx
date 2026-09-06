'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecordCard, { RecordCardData } from '@/components/RecordCard';
import { useTranslations } from '@/context/LanguageContext';

const AtlasMap = dynamic(() => import('@/components/AtlasMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[640px] bg-[#FAF7F1] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#C97A3D] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif text-sm text-[#2A2420]/70">Initializing Cultural Geospatial Atlas...</p>
      </div>
    </div>
  ),
});
import {
  MapPin,
  Layers,
  Sparkles,
  AlertCircle,
  X,
  Volume2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  List,
  Compass,
  Users,
  Search,
} from 'lucide-react';

interface LanguageLink {
  language: {
    id: string;
    name: string;
    estimatedSpeakers?: number | null;
    vitalityStatus: string;
    yearsToCritical?: number | null;
  };
}

interface CraftLink {
  craft: {
    id: string;
    name: string;
    vitalityStatus: string;
    estimatedPractitioners?: number | null;
  };
}

interface DistrictRegion {
  id: string;
  name: string;
  level: string;
  vitalityStatus: string;
  vitalityScore: number;
  languages: LanguageLink[];
  crafts: CraftLink[];
  _count: {
    records: number;
  };
  // Geospatial coordinate coordinates for SVG overlay pins
  coordinates?: { x: number; y: number };
  stateName?: string;
}

interface StateRegion {
  id: string;
  name: string;
  level: string;
  vitalityStatus: string;
  vitalityScore: number;
  childRegions: DistrictRegion[];
  languages: LanguageLink[];
  _count: {
    records: number;
  };
}

// Approximate percentage coordinates (x: 0-100% of map width, y: 0-100% of map height) for India districts
const REGION_COORDINATES: Record<string, { x: number; y: number }> = {
  'The Nilgiris': { x: 42, y: 84 },
  'Tamil Nadu': { x: 48, y: 85 },
  'Buldhana': { x: 42, y: 53 },
  'Maharashtra': { x: 38, y: 56 },
  'South Andaman': { x: 88, y: 78 },
  'Andaman & Nicobar Islands': { x: 88, y: 78 },
  'Lahaul & Spiti': { x: 41, y: 22 },
  'Himachal Pradesh': { x: 41, y: 22 },
  'Kutch': { x: 20, y: 46 },
  'Gujarat': { x: 23, y: 48 },
  'Alipurduar': { x: 76, y: 38 },
  'West Bengal': { x: 74, y: 48 },
  'Nagaland': { x: 86, y: 39 },
  'Mon': { x: 87, y: 38 },
};

export default function AtlasPage() {
  const t = useTranslations('atlas');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');

  const [states, setStates] = useState<StateRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<DistrictRegion | null>(null);
  const [regionRecords, setRegionRecords] = useState<RecordCardData[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'language' | 'craft' | 'density'>('language');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    async function loadRegions() {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/regions`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStates(data);
          // Keep selectedRegion null on initial load so user sees full India map overview
        }
      } catch (err) {
        console.error('Error fetching atlas regions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRegions();
  }, [apiUrl]);

  // When selectedRegion changes, fetch its records
  useEffect(() => {
    if (!selectedRegion) {
      setRegionRecords([]);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 6000);

    async function loadRegionRecords() {
      try {
        setLoadingRecords(true);
        const res = await fetch(`${apiUrl}/api/records?regionId=${selectedRegion?.id}&limit=6`, {
          signal: abortController.signal,
          cache: 'no-store',
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          setRegionRecords(data.data || []);
        } else {
          console.warn('API returned non-ok status for region records:', res.status);
          setRegionRecords([]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error loading region records:', err);
        }
        setRegionRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    }

    loadRegionRecords();

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [selectedRegion, apiUrl]);

  // Flatten all monitored regions (States and child Districts) for map markers & directory
  const allDistricts: DistrictRegion[] = states.flatMap((s) => {
    const items: DistrictRegion[] = [];

    // Always include the state itself so it gets a dedicated cultural pin & directory entry
    items.push({
      id: s.id,
      name: s.name,
      level: s.level,
      vitalityStatus: s.vitalityStatus,
      vitalityScore: s.vitalityScore,
      languages: s.languages || [],
      crafts: [],
      _count: {
        records:
          (s._count?.records || 0) +
          (s.childRegions || []).reduce((acc, c) => acc + (c._count?.records || 0), 0),
      },
      stateName: s.name,
    });

    // Also include any child districts
    if (s.childRegions && s.childRegions.length > 0) {
      s.childRegions.forEach((d) => {
        items.push({
          ...d,
          stateName: s.name,
        });
      });
    }

    return items;
  });

  const filteredDistricts = allDistricts.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.languages.some((l) => l.language.name.toLowerCase().includes(q)) ||
      d.crafts.some((c) => c.craft.name.toLowerCase().includes(q))
    );
  });

  const getMarkerColor = (d: DistrictRegion) => {
    if (activeLayer === 'craft') {
      return d.crafts.length > 0 ? '#C97A3D' : '#6B8F5E';
    }
    if (activeLayer === 'density') {
      return d._count.records > 0 ? '#2F6E5D' : '#B54A3A';
    }
    // Language vitality
    switch (d.vitalityStatus) {
      case 'CRITICAL':
        return '#B54A3A';
      case 'ENDANGERED':
      case 'VULNERABLE':
        return '#C97A3D';
      default:
        return '#6B8F5E';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAF7F1] text-[#2A2420] overflow-hidden">
      <div className="flex-shrink-0 z-40">
        <Navbar />
      </div>

      <main className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        {/* Top Control Strip */}
        <div className="bg-[#FAF7F1] border-b border-[#E4DDD0] px-4 sm:px-8 py-3 flex-shrink-0 flex flex-wrap items-center justify-between gap-4 z-20">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-[#C97A3D]" />
            <h1 className="font-serif text-lg sm:text-xl font-medium text-[#2A2420]">
              {t('title')}
            </h1>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center space-x-2 bg-[#FFFFFF] p-1 rounded-lg border border-[#E4DDD0] text-xs font-sans">
            <span className="text-[#2A2420]/50 px-2 hidden sm:inline">Layer:</span>
            <button
              onClick={() => setActiveLayer('language')}
              className={`px-3 py-1 rounded transition-colors ${
                activeLayer === 'language'
                  ? 'bg-[#2F6E5D] text-[#FAF7F1] font-medium shadow-none'
                  : 'text-[#2A2420]/70 hover:text-[#2A2420]'
              }`}
            >
              Language Vitality
            </button>
            <button
              onClick={() => setActiveLayer('craft')}
              className={`px-3 py-1 rounded transition-colors ${
                activeLayer === 'craft'
                  ? 'bg-[#2F6E5D] text-[#FAF7F1] font-medium shadow-none'
                  : 'text-[#2A2420]/70 hover:text-[#2A2420]'
              }`}
            >
              Craft Vitality
            </button>
            <button
              onClick={() => setActiveLayer('density')}
              className={`px-3 py-1 rounded transition-colors ${
                activeLayer === 'density'
                  ? 'bg-[#2F6E5D] text-[#FAF7F1] font-medium shadow-none'
                  : 'text-[#2A2420]/70 hover:text-[#2A2420]'
              }`}
            >
              Contribution Density
            </button>
          </div>

          {/* View Toggle & Search */}
          <div className="flex items-center space-x-3">
            <div className="relative w-40 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#C97A3D] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={tCommon('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded pl-8 pr-3 py-1 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
              />
            </div>

            <div className="flex items-center bg-[#FFFFFF] border border-[#E4DDD0] rounded p-0.5 text-xs">
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded flex items-center space-x-1 ${
                  viewMode === 'map'
                    ? 'bg-[#C97A3D] text-[#FAF7F1] font-medium'
                    : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                }`}
                title="Geospatial Map View"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded flex items-center space-x-1 ${
                  viewMode === 'list'
                    ? 'bg-[#C97A3D] text-[#FAF7F1] font-medium'
                    : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                }`}
                title="Accessible Directory List"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Directory</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map or Directory Content Area */}
        <div className="flex-1 min-h-0 relative flex overflow-hidden">
          {viewMode === 'map' ? (
            /* Interactive Geospatial Leaflet Map Canvas */
            <div className="flex-1 relative bg-[#FAF7F1] flex flex-col overflow-hidden">
              <AtlasMap
                states={states}
                districts={filteredDistricts}
                selectedRegion={selectedRegion}
                onSelectRegion={(d) => setSelectedRegion(d)}
                activeLayer={activeLayer}
              />
            </div>
          ) : (
            /* Accessible Directory List View */
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-4xl mx-auto w-full">
              <h2 className="font-serif text-2xl text-[#2A2420] mb-6">
                All Monitored Cultural Districts
              </h2>
              <div className="space-y-4">
                {filteredDistricts.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedRegion(d)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-none ${
                      selectedRegion?.id === d.id
                        ? 'bg-[#FFFFFF] border-[#C97A3D]'
                        : 'bg-[#FFFFFF] border-[#E4DDD0] hover:border-[#C97A3D]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-serif text-lg text-[#2A2420] font-medium">{d.name}</h3>
                        <span className="text-xs text-[#2A2420]/50">
                          ({d.vitalityStatus.toLowerCase()})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-[#2A2420]/70">
                        <span>
                          Languages:{' '}
                          <strong className="text-[#C97A3D]">
                            {d.languages.map((l) => l.language.name).join(', ') || 'N/A'}
                          </strong>
                        </span>
                        {d.crafts.length > 0 && (
                          <span>
                            • Crafts:{' '}
                            <strong className="text-[#2F6E5D]">
                              {d.crafts.map((c) => c.craft.name).join(', ')}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs text-[#C97A3D]">
                        {d._count.records} {tNav('records')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#2A2420]/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide-In Region Detail Side Panel (Right) */}
          {selectedRegion && (
            <div className="w-full sm:w-96 lg:w-[420px] bg-[#FFFFFF] border-l border-[#E4DDD0] flex flex-col justify-between shadow-xl z-30 transition-all h-full">
              <div className="p-6 overflow-y-auto flex-1">
                {/* Close Button */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#C97A3D]">
                    {t('dossierTitle')}
                  </span>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="p-1 rounded text-[#2A2420]/50 hover:text-[#2A2420] hover:bg-[#FAF7F1]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Region Title & Vitality Pill */}
                <h2 className="font-serif text-2xl sm:text-3xl text-[#2A2420] font-medium mb-1">
                  {selectedRegion.name}
                </h2>
                <div className="flex items-center space-x-2 mb-4">
                  <span
                    style={{ backgroundColor: getMarkerColor(selectedRegion) }}
                    className="w-2 h-2 rounded-full"
                  />
                  <span className="text-xs font-sans text-[#2A2420]/70">
                    {t('vitalityStatus')}: <strong>{selectedRegion.vitalityScore.toFixed(1)} / 10</strong>{' '}
                    ({selectedRegion.vitalityStatus.toLowerCase()})
                  </span>
                </div>

                <hr className="border-[#E4DDD0] my-4" />

                {/* Languages Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-sans font-medium text-[#C97A3D] uppercase tracking-wider mb-2.5">
                    Endangered Native Languages
                  </h3>
                  <div className="space-y-3">
                    {selectedRegion.languages.length > 0 ? (
                      selectedRegion.languages.map((l) => (
                        <div
                          key={l.language.id}
                          className="bg-[#FAF7F1] p-3 rounded-lg border border-[#E4DDD0]"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-serif text-sm font-semibold text-[#2A2420]">
                              {l.language.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#B54A3A]/10 text-[#B54A3A] border border-[#B54A3A]/30">
                              {l.language.vitalityStatus}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#2A2420]/70 flex items-center justify-between">
                            <span>
                              {l.language.estimatedSpeakers
                                ? `~${l.language.estimatedSpeakers.toLocaleString()} speakers`
                                : 'Extremely low speaker base'}
                            </span>
                            {l.language.yearsToCritical && (
                              <span className="text-[#C97A3D]">
                                ~{l.language.yearsToCritical} yrs to critical
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#2A2420]/50">No languages registered yet.</p>
                    )}
                  </div>
                </div>

                {/* Crafts Section */}
                {selectedRegion.crafts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-sans font-medium text-[#2F6E5D] uppercase tracking-wider mb-2.5">
                      Intangible Crafts & Techniques
                    </h3>
                    <div className="space-y-2">
                      {selectedRegion.crafts.map((c) => (
                        <div
                          key={c.craft.id}
                          className="bg-[#FAF7F1] p-3 rounded-lg border border-[#2F6E5D]/20 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-[#2A2420]">{c.craft.name}</span>
                          <span className="text-[11px] text-[#C97A3D]">
                            {c.craft.estimatedPractitioners
                              ? `~${c.craft.estimatedPractitioners} master artisans`
                              : 'Vulnerable'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Records from this Region */}
                <div>
                  <h3 className="text-xs font-sans font-medium text-[#2A2420]/70 uppercase tracking-wider mb-3">
                    {t('directRecords')} ({selectedRegion._count.records})
                  </h3>
                  {loadingRecords ? (
                    <div className="py-6 text-center text-xs text-[#2A2420]/60">
                      {tCommon('loading')}
                    </div>
                  ) : regionRecords.length === 0 ? (
                    <div className="bg-[#FAF7F1] p-4 rounded-lg border border-[#B54A3A]/30 text-center">
                      <ShieldAlert className="w-6 h-6 text-[#B54A3A] mx-auto mb-1.5" />
                      <p className="font-serif text-sm text-[#2A2420]">Preservation Gap Detected</p>
                      <p className="text-xs text-[#2A2420]/60 mt-1 mb-3">
                        No audio or oral recordings have been submitted for this district yet.
                      </p>
                      <Link
                        href="/capture"
                        className="inline-block px-3 py-1.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs hover:bg-[#B86B30]"
                      >
                        {tNav('capture')}
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {regionRecords.map((r) => (
                        <Link
                          key={r.id}
                          href={`/record/${r.id}`}
                          className="block bg-[#FAF7F1] p-3 rounded-lg border border-[#E4DDD0] hover:border-[#C97A3D] transition-colors group"
                        >
                          <div className="flex items-center justify-between text-xs text-[#C97A3D] mb-1">
                            <span className="font-medium">{r.category}</span>
                            <span className="text-[10px] text-[#2A2420]/50">
                              {r.mediaType.toLowerCase()}
                            </span>
                          </div>
                          <p className="font-serif text-xs text-[#2A2420] line-clamp-2 group-hover:text-[#C97A3D] transition-colors">
                            {r.summaryText || 'Field recording'}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Drawer CTA */}
              <div className="p-4 bg-[#FAF7F1] border-t border-[#E4DDD0] flex items-center justify-between">
                <Link
                  href={`/archive?regionId=${selectedRegion.id}`}
                  className="text-xs text-[#C97A3D] hover:underline"
                >
                  {t('viewRegionRecords')} →
                </Link>
                <Link
                  href="/capture"
                  className="px-3.5 py-1.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs hover:bg-[#B86B30] transition-colors shadow-none"
                >
                  {tNav('capture')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
