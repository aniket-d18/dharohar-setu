'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecordCard, { RecordCardData } from '@/components/RecordCard';
import {
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  MapPin,
  CheckCircle2,
  X,
  Volume2,
  Layers,
  ChevronDown,
  ChevronRight,
  Check,
  Map,
  List,
} from 'lucide-react';

import { useTranslations, useLanguage } from '@/context/LanguageContext';
import { getApiUrl } from '@/utils/apiUrl';
import { cachedFetch } from '@/utils/apiCache';
import { CATEGORY_I18N } from '@/utils/captureI18n';

const AtlasMap = dynamic(() => import('@/components/AtlasMap'), { ssr: false });

const CHIP_CATEGORIES = [
  { id: '', label: 'All', icon: '✦' },
  { id: 'LULLABY', label: 'Songs', icon: '🎵' },
  { id: 'STORY', label: 'Stories', icon: '📖' },
  { id: 'PROVERB', label: 'Proverbs', icon: '💬' },
  { id: 'CRAFT_TECHNIQUE', label: 'Crafts', icon: '🏺' },
  { id: 'RITUAL', label: 'Rituals', icon: '🙏' },
  { id: 'RECIPE', label: 'Recipes', icon: '🍲' },
  { id: 'OTHER', label: 'Sites', icon: '🏛️' },
  { id: 'LIFE_SKILL', label: 'Skills', icon: '🌿' },
];

interface RegionItem {
  id: string;
  name: string;
  level: string;
  vitalityStatus: string;
  childRegions?: Array<{ id: string; name: string; vitalityStatus: string }>;
}

const CustomSelect = ({ label, value, options, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[11px] font-sans text-[#2A2420]/60 mb-1">{label}</label>
      <div 
        className="w-full px-3 py-2 rounded bg-[#FFFFFF] border border-[#E4DDD0] text-xs text-[#2A2420] cursor-pointer flex justify-between items-center hover:border-[#C97A3D] transition-colors font-sans shadow-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#C97A3D] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#FAF7F1] border border-[#E4DDD0] rounded shadow-lg max-h-60 overflow-y-auto no-scrollbar font-sans py-1">
          {options.map((opt: any) => (
            <div
              key={opt.value}
              className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                value === opt.value ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-medium' : 'text-[#2A2420]/90 hover:bg-[#EAE4D9]'
              }`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <Check className="w-3.5 h-3.5 text-[#2F6E5D]" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RegionSelect = ({ regions, value, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let selectedLabel = 'All Regions';
  if (value) {
    for (const r of regions) {
      if (r.id === value) selectedLabel = `${r.name} (Entire State)`;
      for (const cr of r.childRegions || []) {
        if (cr.id === value) selectedLabel = cr.name;
      }
    }
  }

  const toggleState = (e: React.MouseEvent, stateId: string) => {
    e.stopPropagation();
    setExpandedStates(prev => ({ ...prev, [stateId]: !prev[stateId] }));
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[11px] font-sans text-[#2A2420]/60 mb-1">Region / District</label>
      <div 
        className="w-full px-3 py-2 rounded bg-[#FFFFFF] border border-[#E4DDD0] text-xs text-[#2A2420] cursor-pointer flex justify-between items-center hover:border-[#C97A3D] transition-colors font-sans shadow-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#C97A3D] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#FAF7F1] border border-[#E4DDD0] rounded shadow-lg max-h-64 overflow-y-auto no-scrollbar font-sans py-1">
          <div
            className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
              value === '' ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-medium' : 'text-[#2A2420]/90 hover:bg-[#EAE4D9]'
            }`}
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
          >
            All Regions
          </div>
          {regions.map((state: any) => (
            <div key={state.id}>
              <div
                className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between group transition-colors ${
                  value === state.id ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-medium' : 'text-[#2A2420]/90 hover:bg-[#EAE4D9]'
                }`}
                onClick={() => {
                  onChange(state.id);
                  setIsOpen(false);
                }}
              >
                <span className="truncate flex-1">{state.name}</span>
                <div className="flex items-center space-x-1 ml-2">
                  {value === state.id && <Check className="w-3.5 h-3.5 text-[#2F6E5D]" />}
                  {(state.childRegions && state.childRegions.length > 0) && (
                    <button 
                      onClick={(e) => toggleState(e, state.id)}
                      className="p-1 -mr-1 rounded hover:bg-[#EAE4D9] transition-colors"
                    >
                      {expandedStates[state.id] ? 
                        <ChevronDown className="w-3.5 h-3.5 text-[#2A2420]/60 group-hover:text-[#2A2420]" /> : 
                        <ChevronRight className="w-3.5 h-3.5 text-[#2A2420]/60 group-hover:text-[#2A2420]" />
                      }
                    </button>
                  )}
                </div>
              </div>
              
              {expandedStates[state.id] && state.childRegions?.map((district: any) => (
                <div
                  key={district.id}
                  className={`px-3 py-2 pl-7 text-[11px] cursor-pointer flex items-center justify-between transition-colors ${
                    value === district.id ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] font-medium' : 'text-[#2A2420]/70 hover:bg-[#EAE4D9]'
                  }`}
                  onClick={() => {
                    onChange(district.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">↳ {district.name}</span>
                  {value === district.id && <Check className="w-3.5 h-3.5 text-[#2F6E5D]" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function ArchiveContent() {
  const t = useTranslations('archive');
  const tCommon = useTranslations('common');
  const { language } = useLanguage();
  const curLang = (language === 'mr' || language === 'hi') ? language : 'en';
  const catMap = CATEGORY_I18N[curLang] || CATEGORY_I18N.en;
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<RecordCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState<RegionItem[]>([]);

  // Filter States initialized from searchParams
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [selectedRegionId, setSelectedRegionId] = useState(searchParams.get('regionId') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedMediaType, setSelectedMediaType] = useState(searchParams.get('mediaType') || '');
  const [selectedVitality, setSelectedVitality] = useState(searchParams.get('vitalityStatus') || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'urgency' | 'verified'>('newest');

  const API_URL = getApiUrl();

  // Sync state when URL query params change (e.g. from footer or atlas links)
  useEffect(() => {
    const cat = searchParams.get('category');
    const reg = searchParams.get('regionId');
    const q = searchParams.get('search');
    const med = searchParams.get('mediaType');
    const vit = searchParams.get('vitalityStatus');
    const del = searchParams.get('deleted');

    if (cat !== null) setSelectedCategory(cat);
    if (reg !== null) setSelectedRegionId(reg);
    if (q !== null) {
      setSearchTerm(q);
      setDebouncedSearch(q);
    }
    if (med !== null) setSelectedMediaType(med);
    if (vit !== null) setSelectedVitality(vit);
    if (del === 'true') {
      setDeletedNotice(true);
      setTimeout(() => setDeletedNotice(false), 5000);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [deletedNotice, setDeletedNotice] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedMapDistrict, setSelectedMapDistrict] = useState<any>(null);

  const activeSecondaryFiltersCount =
    (selectedRegionId ? 1 : 0) +
    (selectedMediaType ? 1 : 0) +
    (selectedVitality ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (selectedSort !== 'newest' ? 1 : 0);

  // Load Regions for the filter dropdown
  useEffect(() => {
    cachedFetch(`${API_URL}/api/regions`, { maxAgeMs: 30 * 60 * 1000 })
      .then(data => {
        if (Array.isArray(data)) {
          setRegions(data);
        }
      })
      .catch(err => console.error('Failed to load regions:', err));
  }, [API_URL]);

  // Fetch Records based on active filters
  const fetchRecords = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (selectedRegionId) params.append('regionId', selectedRegionId);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedMediaType) params.append('mediaType', selectedMediaType);
    if (selectedVitality) params.append('vitalityStatus', selectedVitality);
    if (selectedStatus) params.append('verificationStatus', selectedStatus);
    if (selectedSort) params.append('sort', selectedSort);
    params.append('limit', '30');

    cachedFetch(`${API_URL}/api/records?${params.toString()}`, { maxAgeMs: 30 * 1000 })
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setRecords(data.data);
          setTotalCount(data.pagination?.total || data.data.length);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch records:', err);
        setIsLoading(false);
      });
  }, [
    API_URL,
    debouncedSearch,
    selectedRegionId,
    selectedCategory,
    selectedMediaType,
    selectedVitality,
    selectedStatus,
    selectedSort,
  ]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Warm up batch translations in PostgreSQL cache when viewing in non-English
  useEffect(() => {
    if (language !== 'en' && records.length > 0) {
      const recordIds = records.map(r => r.id);
      fetch('/api/records/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordIds, languageCode: language }),
      }).catch(err => console.log('[Archive] Batch translation notice:', err));
    }
  }, [language, records]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedRegionId('');
    setSelectedCategory('');
    setSelectedMediaType('');
    setSelectedVitality('');
    setSelectedStatus('');
    setSelectedSort('newest');
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    Boolean(selectedRegionId) ||
    Boolean(selectedCategory) ||
    Boolean(selectedMediaType) ||
    Boolean(selectedVitality) ||
    Boolean(selectedStatus) ||
    selectedSort !== 'newest';

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>{tCommon('fieldDocumentation')}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#2A2420]">
            {t('title')}
          </h1>
          <p className="text-sm text-[#2A2420]/70 mt-1 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Record Deletion Success Notice */}
        {deletedNotice && (
          <div className="mb-6 p-4 rounded-xl bg-[#2F6E5D]/10 border border-[#2F6E5D]/30 text-xs text-[#2F6E5D] flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Artifact permanently deleted from archives. Cultural registry and geospatial atlas updated.</span>
          </div>
        )}

        {/* Search & Filter Controls Bar */}
        <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl p-4 sm:p-5 mb-6 shadow-none">
          {/* Top Row: Search Input + Mobile Filter Button + View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#2A2420]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FAF7F1] border border-[#E4DDD0] text-sm text-[#2A2420] placeholder-[#2A2420]/40 focus:outline-none focus:border-[#C97A3D] transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2A2420]/40 hover:text-[#2A2420]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              {/* Mobile Filter Button (opens bottom sheet) */}
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className="inline-flex sm:hidden items-center space-x-1.5 px-3 py-2 rounded-xl border border-[#E4DDD0] bg-[#FAF7F1] text-xs font-sans font-medium text-[#2A2420] active:bg-[#E4DDD0] transition-colors min-h-[40px]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C97A3D]" />
                <span>Filters</span>
                {activeSecondaryFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#C97A3D] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeSecondaryFiltersCount}
                  </span>
                )}
              </button>

              {/* View Mode Toggle (List vs Map) */}
              <div className="flex items-center rounded-xl bg-[#FAF7F1] p-1 border border-[#E4DDD0] text-xs font-sans">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#FFFFFF] text-[#2F6E5D] shadow-xs'
                      : 'text-[#2A2420]/60 hover:text-[#2A2420]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'map'
                      ? 'bg-[#FFFFFF] text-[#C97A3D] shadow-xs'
                      : 'text-[#2A2420]/60 hover:text-[#2A2420]'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simple Category Chips (Horizontal Scroll on Mobile & Desktop) */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {CHIP_CATEGORIES.map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === chip.id ? '' : chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center space-x-1 ${
                  (chip.id === '' && !selectedCategory) || selectedCategory === chip.id
                    ? 'bg-[#2F6E5D] text-[#FAF7F1] font-medium shadow-xs'
                    : 'bg-[#FAF7F1] border border-[#E4DDD0] text-[#2A2420]/80 hover:border-[#C97A3D]'
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Filter Dropdowns (hidden on mobile, visible on desktop) */}
          <div className="hidden md:grid md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-[#E4DDD0]">
            {/* Region Filter */}
            <RegionSelect 
              regions={regions} 
              value={selectedRegionId} 
              onChange={setSelectedRegionId} 
            />

            {/* Media Type Filter */}
            <CustomSelect
              label={t('filterMediaType')}
              value={selectedMediaType}
              onChange={setSelectedMediaType}
              options={[
                { value: '', label: t('allMedia') },
                { value: 'AUDIO', label: t('audioRecording') },
                { value: 'VIDEO', label: t('videoDemonstration') },
                { value: 'IMAGE', label: t('imageArtifact') },
                { value: 'TEXT', label: t('nativeText') },
              ]}
            />

            {/* Vitality Urgency */}
            <CustomSelect
              label={t('vitalityStatus')}
              value={selectedVitality}
              onChange={setSelectedVitality}
              options={[
                { value: '', label: t('allUrgencies') },
                { value: 'CRITICAL', label: t('critical') },
                { value: 'ENDANGERED', label: t('endangered') },
                { value: 'VULNERABLE', label: t('vulnerable') },
                { value: 'SAFE', label: t('safe') },
              ]}
            />

            {/* Verification Status */}
            <CustomSelect
              label={t('filterStatus')}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: '', label: tCommon('allStatuses') },
                { value: 'UNVERIFIED', label: tCommon('pendingReview') },
                { value: 'COMMUNITY_SUPPORTED', label: tCommon('communitySupported') || 'Community Supported' },
                { value: 'COMMUNITY_VERIFIED', label: tCommon('communityVerified') },
                { value: 'STEWARD_ENDORSED', label: tCommon('stewardEndorsed') },
                { value: 'EXPERT_REVIEWED', label: tCommon('expertReviewed') },
              ]}
            />

            {/* Sort Order */}
            <CustomSelect
              label={t('sortBy')}
              value={selectedSort}
              onChange={setSelectedSort}
              options={[
                { value: 'newest', label: t('newestFirst') },
                { value: 'urgency', label: t('highestUrgency') },
                { value: 'verified', label: t('mostVerified') },
              ]}
            />
          </div>

          {/* Active Filter Chips & Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E4DDD0] text-xs">
              <span className="text-[#C97A3D] flex items-center space-x-1 font-sans font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters Active</span>
              </span>

              <button
                onClick={clearFilters}
                className="text-[#2A2420]/60 hover:text-[#2A2420] underline font-sans"
              >
                {t('resetFilters')}
              </button>
            </div>
          )}
        </div>

        {/* View Content: Map View vs List View */}
        {viewMode === 'map' ? (
          <div className="h-[65vh] sm:h-[75vh] w-full rounded-2xl overflow-hidden border border-[#E4DDD0] relative isolate z-0 bg-[#FAF7F1] mb-8 shadow-xs">
            <AtlasMap
              states={regions.filter((r: any) => r.level === 'STATE') as any}
              districts={regions.filter((r: any) => r.level === 'DISTRICT') as any}
              selectedRegion={selectedMapDistrict}
              onSelectRegion={(d: any) => {
                setSelectedMapDistrict(d);
                setSelectedRegionId(d.id);
              }}
              activeLayer="language"
            />
            {selectedMapDistrict && (
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E4DDD0] rounded-xl p-3.5 sm:p-4 shadow-lg flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif text-sm font-medium text-[#2A2420]">
                    {selectedMapDistrict.name}
                  </h4>
                  <p className="text-xs text-[#2A2420]/60">
                    Filter set to this district
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1.5 rounded-lg bg-[#2F6E5D] text-white text-xs font-sans font-medium hover:bg-[#235346] transition-colors"
                >
                  View in List &rarr;
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Results Counter */}
            <div className="flex items-center justify-between mb-5 text-sm text-[#2A2420]/60 font-sans">
              <span>
                {t('showingRecords', { count: records.length })} ({totalCount} total)
              </span>

              {isLoading && (
                <span className="flex items-center space-x-1.5 text-xs text-[#C97A3D]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{tCommon('loading')}</span>
                </span>
              )}
            </div>

            {/* Record Cards Grid */}
            {records.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {records.map(record => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            ) : !isLoading ? (
              <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-none">
                <Compass className="w-12 h-12 text-[#C97A3D]/40 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-medium text-[#2A2420] mb-1">
                  {searchTerm ? `No recordings found for "${searchTerm}"` : t('emptyTitle')}
                </h3>
                <p className="text-xs text-[#2A2420]/60 mb-6 leading-relaxed">
                  {searchTerm
                    ? `Be the first to preserve an oral tradition or living concept for this community.`
                    : t('emptyDesc')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={searchTerm ? `/capture?language=${encodeURIComponent(searchTerm)}` : '/capture'}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#2F6E5D] text-[#FAF7F1] text-xs font-sans font-medium hover:bg-[#235346] transition-colors"
                  >
                    Capture a Memory &rarr;
                  </Link>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 rounded-xl bg-[#FAF7F1] border border-[#E4DDD0] text-[#2A2420] text-xs font-sans font-medium hover:bg-[#E4DDD0]/50 transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* Mobile Filter Bottom Sheet Modal */}
        {isFilterSheetOpen && (
          <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-[#FAF7F1] rounded-t-2xl border-t border-[#E4DDD0] p-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD0] mb-4">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C97A3D]" />
                  <h3 className="font-serif text-lg font-medium text-[#2A2420]">Filter Archive</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#2A2420]/60 hover:text-[#2A2420] hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <RegionSelect
                  regions={regions}
                  value={selectedRegionId}
                  onChange={setSelectedRegionId}
                />
                <CustomSelect
                  label={t('filterMediaType')}
                  value={selectedMediaType}
                  onChange={setSelectedMediaType}
                  options={[
                    { value: '', label: t('allMedia') },
                    { value: 'AUDIO', label: t('audioRecording') },
                    { value: 'VIDEO', label: t('videoDemonstration') },
                    { value: 'IMAGE', label: t('imageArtifact') },
                    { value: 'TEXT', label: t('nativeText') },
                  ]}
                />
                <CustomSelect
                  label={t('vitalityStatus')}
                  value={selectedVitality}
                  onChange={setSelectedVitality}
                  options={[
                    { value: '', label: t('allUrgencies') },
                    { value: 'CRITICAL', label: t('critical') },
                    { value: 'ENDANGERED', label: t('endangered') },
                    { value: 'VULNERABLE', label: t('vulnerable') },
                    { value: 'SAFE', label: t('safe') },
                  ]}
                />
                <CustomSelect
                  label={t('filterStatus')}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={[
                    { value: '', label: tCommon('allStatuses') },
                    { value: 'UNVERIFIED', label: tCommon('pendingReview') },
                    { value: 'COMMUNITY_SUPPORTED', label: tCommon('communitySupported') || 'Community Supported' },
                    { value: 'COMMUNITY_VERIFIED', label: tCommon('communityVerified') },
                    { value: 'STEWARD_ENDORSED', label: tCommon('stewardEndorsed') },
                    { value: 'EXPERT_REVIEWED', label: tCommon('expertReviewed') },
                  ]}
                />
                <CustomSelect
                  label={t('sortBy')}
                  value={selectedSort}
                  onChange={setSelectedSort}
                  options={[
                    { value: 'newest', label: t('newestFirst') },
                    { value: 'urgency', label: t('highestUrgency') },
                    { value: 'verified', label: t('mostVerified') },
                  ]}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    setIsFilterSheetOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4DDD0] bg-white text-xs font-sans font-medium text-[#2A2420] hover:bg-black/5 transition-colors"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2F6E5D] text-white text-xs font-sans font-medium hover:bg-[#235346] transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F1] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C97A3D]" />
        </div>
      }
    >
      <ArchiveContent />
    </Suspense>
  );
}
