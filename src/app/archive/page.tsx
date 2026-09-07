'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
} from 'lucide-react';

import { useTranslations, useLanguage } from '@/context/LanguageContext';
import { getApiUrl } from '@/utils/apiUrl';
import { cachedFetch } from '@/utils/apiCache';
import { CATEGORY_I18N } from '@/utils/captureI18n';

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

export default function ArchivePage() {
  const t = useTranslations('archive');
  const tCommon = useTranslations('common');
  const { language } = useLanguage();
  const curLang = (language === 'mr' || language === 'hi') ? language : 'en';
  const catMap = CATEGORY_I18N[curLang] || CATEGORY_I18N.en;

  const [records, setRecords] = useState<RecordCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState<RegionItem[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState('');
  const [selectedVitality, setSelectedVitality] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'urgency' | 'verified'>('newest');

  const API_URL = getApiUrl();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [deletedNotice, setDeletedNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('deleted=true')) {
      setDeletedNotice(true);
      setTimeout(() => setDeletedNotice(false), 5000);
    }
  }, []);

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
        <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg p-4 sm:p-5 mb-8 shadow-none">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-[#2A2420]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#FAF7F1] border border-[#E4DDD0] text-sm text-[#2A2420] placeholder-[#2A2420]/40 focus:outline-none focus:border-[#C97A3D] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2A2420]/40 hover:text-[#2A2420]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Region Filter */}
            <RegionSelect 
              regions={regions} 
              value={selectedRegionId} 
              onChange={setSelectedRegionId} 
            />

            {/* Category Filter */}
            <CustomSelect
              label={t('filterCategory')}
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: '', label: tCommon('allCategories') },
                { value: 'LULLABY', label: catMap.LULLABY?.label || 'Lullaby' },
                { value: 'PROVERB', label: catMap.PROVERB?.label || 'Proverb' },
                { value: 'STORY', label: catMap.STORY?.label || 'Story / Folktale' },
                { value: 'CRAFT_TECHNIQUE', label: catMap.CRAFT_TECHNIQUE?.label || 'Craft Technique' },
                { value: 'FESTIVAL', label: catMap.FESTIVAL?.label || 'Festival Practice' },
                { value: 'RECIPE', label: catMap.RECIPE?.label || 'Ancestral Recipe' },
                { value: 'RITUAL', label: catMap.RITUAL?.label || 'Sacred Ritual' },
                { value: 'LIFE_SKILL', label: catMap.LIFE_SKILL?.label || 'Life Skill / Indigenous Knowledge' },
              ]}
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
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E4DDD0]">
              <span className="text-xs text-[#C97A3D] flex items-center space-x-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t('filtersApplied')}</span>
              </span>

              <button
                onClick={clearFilters}
                className="text-xs text-[#2A2420]/60 hover:text-[#2A2420] underline"
              >
                {t('resetFilters')}
              </button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-sm text-[#2A2420]/60">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map(record => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        ) : !isLoading ? (
          <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-12 text-center max-w-lg mx-auto shadow-none">
            <Compass className="w-12 h-12 text-[#C97A3D]/40 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-medium text-[#2A2420] mb-1">
              {t('emptyTitle')}
            </h3>
            <p className="text-xs text-[#2A2420]/60 mb-6">
              {t('emptyDesc')}
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-md bg-[#C97A3D] text-[#FAF7F1] text-xs font-sans font-medium hover:bg-[#B86B30] transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
