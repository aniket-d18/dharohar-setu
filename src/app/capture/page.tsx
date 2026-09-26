'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  FileText,
  Mic,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Square,
  Sparkles,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  X,
  FileAudio,
  Film,
  Link as LinkIcon,
  Wrench,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLanguage } from '@/context/LanguageContext';
import { INDIA_REGION_HIERARCHY, StaticState } from '@/data/indiaHierarchy';
import { getCategoryCover } from '@/utils/categoryCovers';
import { getApiUrl } from '@/utils/apiUrl';
import { CAPTURE_I18N, CATEGORY_I18N, SupportedLang } from '@/utils/captureI18n';
import { cachedFetch } from '@/utils/apiCache';
import { enqueueSubmission, countQueued, flushQueue } from '@/utils/syncManager';

interface LanguageItem {
  id: string;
  name: string;
  scriptName?: string | null;
}

const CATEGORIES = [
  { id: 'OTHER',          label: 'Fort, Monument & Heritage Site', desc: 'Forts, temples, stepwells, monuments, architectural wonders', icon: '🏛️' },
  { id: 'LULLABY',        label: 'Song / Lullaby',        desc: 'Folk songs, lullabies, oral melodies',   icon: '🎵' },
  { id: 'STORY',          label: 'Story / Folktale',      desc: 'Myths, legends, oral narratives',         icon: '📖' },
  { id: 'PROVERB',        label: 'Proverb / Saying',      desc: 'Ancestral wisdom, idioms',                icon: '💬' },
  { id: 'RITUAL',         label: 'Ritual / Chant',        desc: 'Sacred ceremonies, prayers, chants',      icon: '🙏' },
  { id: 'FESTIVAL',       label: 'Festival / Event',      desc: 'Seasonal events, harvest rituals',        icon: '🎉' },
  { id: 'RECIPE',         label: 'Culinary Heritage',     desc: 'Traditional recipes, food practices',     icon: '🍲' },
  { id: 'CRAFT_TECHNIQUE',label: 'Craft / Skill',         desc: 'Weaving, pottery, metalwork, woodcraft',  icon: '🏺' },
  { id: 'LIFE_SKILL',     label: 'Ecology / Life Skill',  desc: 'Farming, tracking, weather reading',      icon: '🌿' },
];

// Primary State -> Native Language Mapping for Living Cultural Archive
const REGIONAL_PRIMARY_LANGUAGES: Record<string, string> = {
  'Maharashtra': 'Marathi',
  'Tamil Nadu': 'Tamil',
  'West Bengal': 'Bengali',
  'Gujarat': 'Gujarati',
  'Karnataka': 'Kannada',
  'Kerala': 'Malayalam',
  'Andhra Pradesh': 'Telugu',
  'Telangana': 'Telugu',
  'Punjab': 'Punjabi',
  'Odisha': 'Odia',
  'Assam': 'Assamese',
  'Bihar': 'Maithili',
  'Uttar Pradesh': 'Hindi',
  'Madhya Pradesh': 'Hindi',
  'Rajasthan': 'Hindi',
  'Haryana': 'Hindi',
  'Delhi': 'Hindi',
  'Himachal Pradesh': 'Hindi',
  'Uttarakhand': 'Hindi',
  'Chhattisgarh': 'Hindi',
  'Jharkhand': 'Hindi',
  'Jammu & Kashmir': 'Kashmiri',
  'Ladakh': 'Ladakhi',
  'Goa': 'Konkani',
  'Manipur': 'Manipuri',
  'Sikkim': 'Nepali',
  'Nagaland': 'Nagamese',
  'Tripura': 'Bengali',
  'Meghalaya': 'Khasi',
  'Mizoram': 'Mizo',
  'Andaman & Nicobar Islands': 'Great Andamanese (Jero)',
  'Chandigarh': 'Punjabi',
  'Puducherry': 'Tamil',
  'Lakshadweep': 'Malayalam',
};

// District-Specific Endangered Language Overrides (UNESCO Cataloged)
const DISTRICT_LANGUAGE_OVERRIDES: Record<string, string> = {
  'Buldhana': 'Nihali',
  'The Nilgiris': 'Toda',
  'Alipurduar': 'Toto',
  'Lahaul & Spiti': 'Spiti Bhoti',
  'Kutch': 'Kachchhi',
  'South Andaman': 'Great Andamanese (Jero)',
  'Changlang': 'Tangsa',
  'North Sikkim': 'Lepcha (Róng)',
  'Chandel': 'Tarao',
};

function isKeyboardMash(str: string): boolean {
  const clean = str.replace(/[^a-zA-Z]/g, '');
  if (clean.length >= 6 && !/[aeiouy]/i.test(clean)) return true;
  return false;
}

// Reusable Hierarchical Region Selector backed by INDIA_REGION_HIERARCHY (36 States & UTs reference list)
function RegionHierarchySelect({
  selectedState,
  selectedDistrict,
  onChange,
  error,
  label,
  sublabel,
  suggestedBadge,
}: {
  selectedState: string;
  selectedDistrict: string;
  onChange: (stateName: string, districtName?: string) => void;
  error?: string;
  label?: string;
  sublabel?: string;
  suggestedBadge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleState = (e: React.MouseEvent, stateId: string) => {
    e.stopPropagation();
    setExpandedStates((prev) => ({ ...prev, [stateId]: !prev[stateId] }));
  };

  const { language } = useLanguage();
  const curLang: SupportedLang = (['en', 'hi', 'mr', 'ta', 'bn'].includes(language as SupportedLang)) ? (language as SupportedLang) : 'en';

  const query = searchQuery.trim().toLowerCase();
  const filteredStates = INDIA_REGION_HIERARCHY.map((st) => {
    if (!query) return st;
    const stateMatches = st.name.toLowerCase().includes(query);
    const matchedDistricts = st.districts.filter((d) =>
      d.name.toLowerCase().includes(query)
    );
    if (stateMatches) return st;
    if (matchedDistricts.length > 0) {
      return {
        ...st,
        districts: matchedDistricts,
      };
    }
    return null;
  }).filter((st): st is StaticState => st !== null);

  let selectedLabel =
    curLang === 'mr' ? 'प्रदेश / जिल्हा निवडा *' :
    curLang === 'hi' ? 'क्षेत्र / ज़िला चुनें *' :
    curLang === 'ta' ? 'பகுதி / மாவட்டத்தைத் தேர்ந்தெடுக்கவும் *' :
    curLang === 'bn' ? 'অঞ্চল / জেলা নির্বাচন করুন *' :
    'Select Region / District *';

  if (selectedState) {
    if (selectedDistrict) {
      selectedLabel = `${selectedDistrict} (${selectedState})`;
    } else {
      const stateSuffix =
        curLang === 'mr' ? 'संपूर्ण राज्य' :
        curLang === 'hi' ? 'संपूर्ण राज्य' :
        curLang === 'ta' ? 'முழு மாநிலம்' :
        curLang === 'bn' ? 'সমগ্র রাজ্য' :
        'Entire State';
      selectedLabel = `${selectedState} (${stateSuffix})`;
    }
  }

  return (
    <div className="relative font-sans" ref={ref}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <label className="block text-xs text-[#2A2420]/80 font-medium">
            {label || (
              curLang === 'mr' ? 'प्रदेश / जिल्हा *' :
              curLang === 'hi' ? 'क्षेत्र / ज़िला *' :
              curLang === 'ta' ? 'பகுதி / மாவட்டம் *' :
              curLang === 'bn' ? 'অঞ্চল / জেলা *' :
              'Region / District *'
            )}
          </label>
          {suggestedBadge}
        </div>
        <span className="text-[11px] text-[#C97A3D]">
          {sublabel || (
            curLang === 'mr' ? '३६ राज्ये व केंद्रशासित प्रदेश (संदर्भ)' :
            curLang === 'hi' ? '३६ राज्य एवं केंद्र शासित प्रदेश (संदर्भ)' :
            curLang === 'ta' ? '36 மாநிலங்கள் & ஒன்றியப் பகுதிகள் (குறிப்பு)' :
            curLang === 'bn' ? '৩৬টি রাজ্য ও কেন্দ্রশাসিত অঞ্চল (রেফারেন্স)' :
            '36 States & Union Territories (Reference)'
          )}
        </span>
      </div>

      <div
        className={`w-full px-3 py-2.5 rounded bg-[#FFFFFF] border ${
          error ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
        } text-xs text-[#2A2420] cursor-pointer flex justify-between items-center hover:border-[#C97A3D] transition-colors shadow-sm`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-[#C97A3D] shrink-0" />
          <span className={selectedState ? 'text-[#2A2420] font-medium' : 'text-[#2A2420]/50'}>
            {selectedLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#C97A3D] shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {error && <p className="text-[11px] text-[#B54A3A] mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg shadow-xl max-h-72 overflow-hidden flex flex-col font-sans">
          {/* Quick search filter */}
          <div className="p-2 border-b border-[#E4DDD0] bg-[#FAF7F1]">
            <input
              type="text"
              placeholder={
                curLang === 'mr' ? 'भारतीय राज्य किंवा जिल्हा शोधा (उदा. महाराष्ट्र, बुलढाणा, केरळ)...' :
                curLang === 'hi' ? 'भारतीय राज्य या ज़िला खोजें (उदा. महाराष्ट्र, बुलढाणा, केरल)...' :
                curLang === 'ta' ? 'இந்திய மாநிலம் அல்லது மாவட்டத்தைத் தேடுங்கள் (எ.கா: தமிழ்நாடு, மதுரை)...' :
                curLang === 'bn' ? 'ভারতীয় রাজ্য বা জেলা অনুসন্ধান করুন (যেমন: পশ্চিমবঙ্গ, বাঁকুড়া)...' :
                'Search Indian state or district (e.g. Maharashtra, Buldhana, Kerala)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-2.5 py-1.5 text-xs text-[#2A2420] placeholder-[#2A2420]/40 focus:outline-none focus:border-[#C97A3D]"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-60 py-1">
            {filteredStates.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#2A2420]/50">
                {
                  curLang === 'mr' ? 'कोणतेही जुळणारे राज्य किंवा जिल्हा आढळला नाही.' :
                  curLang === 'hi' ? 'कोई मेल खाता राज्य या ज़िला नहीं मिला।' :
                  curLang === 'ta' ? 'பொருந்தக்கூடிய மாநிலம் அல்லது மாவட்டம் எதுவும் கிடைக்கவில்லை.' :
                  curLang === 'bn' ? 'কোনো মিল থাকা রাজ্য বা জেলা পাওয়া যায়নি।' :
                  'No matching state or district found.'
                }
              </div>
            ) : (
              filteredStates.map((state) => {
                const isSelectedState = selectedState === state.name && !selectedDistrict;
                const isExpanded = expandedStates[state.id] || query.length > 0;

                return (
                  <div key={state.id} className="border-b border-[#E4DDD0]/60 last:border-b-0">
                    <div
                      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between group transition-colors ${
                        isSelectedState
                          ? 'bg-[#C97A3D]/10 text-[#C97A3D] font-medium'
                          : 'text-[#2A2420] hover:bg-[#FAF7F1]'
                      }`}
                      onClick={() => {
                        onChange(state.name, undefined);
                        setIsOpen(false);
                      }}
                    >
                      <span className="truncate flex-1 font-serif font-medium">
                        {state.name}{' '}
                        <span className="text-[10px] text-[#2A2420]/50 font-sans">
                          ({state.districts.length}{' '}
                          {
                            curLang === 'mr' ? 'जिल्हे' :
                            curLang === 'hi' ? 'ज़िले' :
                            curLang === 'ta' ? 'மாவட்டங்கள்' :
                            curLang === 'bn' ? 'জেলা' :
                            'districts'
                          })
                        </span>
                      </span>

                      <div className="flex items-center space-x-1 ml-2">
                        {isSelectedState && <Check className="w-3.5 h-3.5 text-[#C97A3D]" />}
                        {state.districts.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleState(e, state.id)}
                            className="p-1 rounded hover:bg-[#2A2420]/10 transition-colors"
                            title={isExpanded ? 'Collapse districts' : 'Expand districts'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-[#2A2420]/60 group-hover:text-[#2A2420]" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-[#2A2420]/60 group-hover:text-[#2A2420]" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded &&
                      state.districts.map((district) => {
                        const isSelectedDistrict =
                          selectedState === state.name && selectedDistrict === district.name;
                        return (
                          <div
                            key={district.id}
                            className={`px-3 py-1.5 pl-7 text-[11px] cursor-pointer flex items-center justify-between transition-colors ${
                              isSelectedDistrict
                                ? 'bg-[#C97A3D]/15 text-[#C97A3D] font-medium'
                                : 'text-[#2A2420]/80 hover:bg-[#FAF7F1] hover:text-[#2A2420]'
                            }`}
                            onClick={() => {
                              onChange(state.name, district.name);
                              setIsOpen(false);
                            }}
                          >
                            <span className="truncate">↳ {district.name}</span>
                            {isSelectedDistrict && (
                              <Check className="w-3.5 h-3.5 text-[#C97A3D]" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Unified Native Language / Dialect Selector allowing free-text entry of any rare language plus living archive suggestions
function LanguageCombobox({
  value,
  onChange,
  suggestions,
  label,
  autoCatalogLabel,
  suggestedBadge,
}: {
  value: string;
  onChange: (val: string) => void;
  suggestions: LanguageItem[];
  label?: string;
  autoCatalogLabel?: string;
  suggestedBadge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { language } = useLanguage();
  const curLang = (language === 'mr' || language === 'hi') ? language : 'en';

  const query = value.trim().toLowerCase();
  const matchedLang = suggestions.find((l) => l.name.toLowerCase() === query);
  const isCustom = value.trim().length > 0 && !matchedLang;

  const filteredSuggestions = query
    ? suggestions.filter((l) => l.name.toLowerCase().includes(query))
    : suggestions;

  const registeredLabel = curLang === 'mr' ? 'अभिलेखागारात नोंदणीकृत' : curLang === 'hi' ? 'अभिलेखागार में पंजीकृत' : 'Registered in Archive';
  const typeFreelyLabel = curLang === 'mr' ? 'मुक्तपणे टाइप करा किंवा निवडा' : curLang === 'hi' ? 'स्वतंत्र रूप से लिखें या सुझाव चुनें' : 'Type freely or choose suggestion';
  const placeholderText = curLang === 'mr' ? 'कोणतीही भाषा किंवा बोली टाइप करा (उदा. तोडा, गोंडी, अहिरणी, वारली, कुवी)...' : curLang === 'hi' ? 'कोई भी भाषा या बोली लिखें (उदा. तोडा, गोंडी, अहिरानी, वारली, कुवी)...' : 'Type any language or dialect (e.g. Toda, Gondi, Ahirani, Warli, Kuvi)...';
  const quickSuggestionsLabel = curLang === 'mr' ? 'द्रुत सूचना:' : curLang === 'hi' ? 'त्वरित सुझाव:' : 'Quick suggestions:';
  const keepLabel = curLang === 'mr' ? `✦ "${value.trim()}" ठेवा` : curLang === 'hi' ? `✦ "${value.trim()}" रखें` : `✦ Keep "${value.trim()}"`;
  const rareDialectNote = curLang === 'mr' ? 'दुर्मिळ बोली — सबमिट केल्यावर डेटाबेसमध्ये नोंदणीकृत केली जाईल' : curLang === 'hi' ? 'दुर्लभ बोली — सबमिट करने पर डेटाबेस में पंजीकृत की जाएगी' : 'Rare dialect — will be registered in the database on submission';
  const registeredLangsHeader = curLang === 'mr' ? `नोंदणीकृत भाषा (${suggestions.length})` : curLang === 'hi' ? `पंजीकृत भाषाएँ (${suggestions.length})` : `Registered Languages (${suggestions.length})`;

  return (
    <div className="relative font-sans" ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <label className="block text-xs text-[#2A2420]/80 font-medium">
            {label || (curLang === 'mr' ? 'स्थानिक भाषा / बोली' : curLang === 'hi' ? 'स्थानीय भाषा / बोली' : 'Native Language / Dialect')}
          </label>
          {suggestedBadge}
        </div>
        <div className="text-[11px]">
          {matchedLang ? (
            <span className="text-[#2F6E5D] flex items-center space-x-1 font-medium">
              <Check className="w-3 h-3" />
              <span>{registeredLabel}</span>
            </span>
          ) : isCustom ? (
            <span className="text-[#C97A3D] font-medium">
              ✦ {autoCatalogLabel || (curLang === 'mr' ? 'दुर्मिळ / सानुकूल बोली (स्वयं-कॅटलॉग)' : curLang === 'hi' ? 'दुर्लभ / कस्टम बोली (स्वतः-कैटलॉग)' : 'Rare / Custom dialect (Auto-cataloged)')}
            </span>
          ) : (
            <span className="text-[#2A2420]/50">{typeFreelyLabel}</span>
          )}
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholderText}
          className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2.5 pr-16 text-xs text-[#2A2420] placeholder-[#2A2420]/40 focus:outline-none focus:border-[#C97A3D] transition-colors"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="p-1 rounded text-[#2A2420]/40 hover:text-[#2A2420] hover:bg-[#FAF7F1] transition-colors"
              title="Clear language input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-[#C97A3D] hover:text-[#C97A3D] hover:bg-[#FAF7F1] transition-colors"
            title="Toggle suggestions list"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Suggested Quick Chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[10px] text-[#2A2420]/60">{quickSuggestionsLabel}</span>
          {suggestions.slice(0, 6).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange(s.name);
                setIsOpen(false);
              }}
              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                value.toLowerCase() === s.name.toLowerCase()
                  ? 'bg-[#C97A3D]/15 border-[#C97A3D] text-[#C97A3D] font-medium'
                  : 'bg-[#FAF7F1] border-[#E4DDD0] text-[#2A2420]/75 hover:border-[#C97A3D]/40 hover:text-[#2A2420]'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown Suggestions List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg shadow-xl max-h-56 overflow-y-auto font-sans py-1">
          {/* Custom option prompt if user typed something not in suggestions */}
          {isCustom && (
            <div
              className="px-3 py-2 text-xs bg-[#C97A3D]/10 border-b border-[#E4DDD0] text-[#C97A3D] cursor-pointer hover:bg-[#C97A3D]/15 flex items-center justify-between"
              onClick={() => setIsOpen(false)}
            >
              <div className="truncate">
                <span className="font-medium">{keepLabel}</span>
                <span className="text-[10px] text-[#2A2420]/70 block">
                  {rareDialectNote}
                </span>
              </div>
              <Check className="w-3.5 h-3.5 text-[#C97A3D] shrink-0 ml-2" />
            </div>
          )}

          <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#C97A3D] font-medium">
            {registeredLangsHeader}
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[#2A2420]/60 italic">
              {curLang === 'mr' ? `"${value}" शी जुळणारी कोणतीही नोंदणीकृत भाषा नाही. तुमची ही बोली सबमिट केल्यावर जतन केली जाईल!` : curLang === 'hi' ? `"${value}" से मेल खाती कोई पंजीकृत भाषा नहीं। आपकी यह बोली सबमिट करने पर पंजीकृत होगी!` : `No registered language matching "${value}". Your custom dialect "${value}" will be created on submission!`}
            </div>
          ) : (
            filteredSuggestions.map((lang) => {
              const isSelected = value.toLowerCase() === lang.name.toLowerCase();
              return (
                <div
                  key={lang.id}
                  onClick={() => {
                    onChange(lang.name);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#C97A3D]/10 text-[#C97A3D] font-medium'
                      : 'text-[#2A2420] hover:bg-[#FAF7F1]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-serif">{lang.name}</span>
                    {lang.scriptName && (
                      <span className="text-[10px] text-[#2A2420]/50">({lang.scriptName})</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C97A3D] shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// Themed Archival Field Audio Player matching Record Detail aesthetic
function CustomAudioPlayer({
  src,
  title = 'Field audio buffer ready for upload',
}: {
  src: string;
  title?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    const dur = audioRef.current.duration || duration || 1;
    setCurrentTime(curr);
    setProgress((curr / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    if (
      audioRef.current.duration &&
      audioRef.current.duration !== Infinity &&
      !isNaN(audioRef.current.duration)
    ) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const dur = audioRef.current.duration || duration;
    if (dur && !isNaN(dur)) {
      const newTime = (newPct / 100) * dur;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(newPct);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const waveformHeights = [
    35, 65, 40, 85, 95, 45, 75, 90, 30, 60, 100, 70, 45, 80, 95, 60, 40, 75, 85, 50, 65, 80, 45, 60,
  ];

  return (
    <div className="w-full bg-[#FAF7F1] p-4 rounded-xl border border-[#E4DDD0] font-sans shadow-sm">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
        }}
        className="hidden"
      />

      {/* Header status */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center space-x-2 text-[#2F6E5D] font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#2F6E5D]" />
          <span>{title}</span>
        </div>
        <span className="text-[11px] text-[#C97A3D] font-mono">
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </span>
      </div>

      {/* Visual Waveform Representation */}
      <div
        onClick={handleSeek}
        className="w-full h-12 mb-3.5 flex items-end justify-center space-x-1 sm:space-x-1.5 px-2 py-1 bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg cursor-pointer hover:bg-[#F3EBDD] transition-colors group"
        title="Click anywhere on waveform to seek"
      >
        {waveformHeights.map((h, i) => {
          const barPct = (i / (waveformHeights.length - 1)) * 100;
          const isActive = barPct <= progress;
          return (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isActive
                  ? 'bg-[#C97A3D]'
                  : 'bg-[#2A2420]/20 group-hover:bg-[#2A2420]/30'
              }`}
            />
          );
        })}
      </div>

      {/* Playback Controls & Progress Bar */}
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center hover:bg-[#B86B30] transition-all transform hover:scale-105 shrink-0 shadow-sm"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Scrub Track */}
        <div
          onClick={handleSeek}
          className="flex-1 h-2 bg-[#E4DDD0] rounded-full cursor-pointer relative overflow-hidden group"
          title="Scrub audio"
        >
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-[#C97A3D] rounded-full relative group-hover:bg-[#B86B30] transition-all"
          />
        </div>

        {/* Replay button */}
        <button
          type="button"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
              setProgress(0);
              audioRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }}
          className="p-1.5 text-[#2A2420]/60 hover:text-[#C97A3D] transition-colors rounded hover:bg-[#FFFFFF]"
          title="Replay from beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function CaptureWizardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, detectedState } = useLanguage();
  const curLang: SupportedLang = (['en', 'hi', 'mr', 'ta', 'bn'].includes(language as SupportedLang)) ? (language as SupportedLang) : 'en';
  const strings = CAPTURE_I18N[curLang] || CAPTURE_I18N.en;
  const catMap = CATEGORY_I18N[curLang] || CATEGORY_I18N.en;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isOnline, setIsOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Form Data
  // Step 1: Consent
  const [visibility, setVisibility] = useState<'PUBLIC' | 'COMMUNITY_ONLY' | 'PRIVATE'>('PUBLIC');
  const [allowAiTraining, setAllowAiTraining] = useState(true);
  const [allowPublicArchive, setAllowPublicArchive] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(true);

  // Step 2 & 3: Metadata & Media Type
  const [mediaType, setMediaType] = useState<'AUDIO' | 'VIDEO' | 'IMAGE' | 'TEXT'>('AUDIO');
  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [isRegionAutoSuggested, setIsRegionAutoSuggested] = useState(false);

  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [languageName, setLanguageName] = useState('');
  const [isLanguageAutoSuggested, setIsLanguageAutoSuggested] = useState(false);

  const [category, setCategory] = useState('LULLABY');
  const [isGenreAutoSuggested, setIsGenreAutoSuggested] = useState(true);
  const [customCategory, setCustomCategory] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerAge, setSpeakerAge] = useState<number | ''>('');
  const [titleText, setTitleText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Auto-suggestion: pre-select Region & Language based on detected location
  useEffect(() => {
    if (!selectedStateName) {
      const targetState = detectedState || 'Maharashtra';
      const matchedState =
        INDIA_REGION_HIERARCHY.find(
          (s) => s.name.toLowerCase() === targetState.toLowerCase()
        ) || INDIA_REGION_HIERARCHY.find((s) => s.name === 'Maharashtra') || INDIA_REGION_HIERARCHY[0];

      if (matchedState) {
        setSelectedStateName(matchedState.name);
        const defaultDistrict = matchedState.districts[0]?.name || '';
        setSelectedDistrictName(defaultDistrict);
        setIsRegionAutoSuggested(true);

        const suggestedLang =
          (defaultDistrict && DISTRICT_LANGUAGE_OVERRIDES[defaultDistrict]) ||
          REGIONAL_PRIMARY_LANGUAGES[matchedState.name] ||
          'Marathi';
        setLanguageName(suggestedLang);
        setIsLanguageAutoSuggested(true);
      }
    }
  }, [detectedState, selectedStateName]);

  // Region selection handler with cascading language auto-suggestion
  const handleRegionChange = (st: string, dist?: string) => {
    setSelectedStateName(st);
    setSelectedDistrictName(dist || '');
    setIsRegionAutoSuggested(false); // User actively chose/confirmed

    if (step2Errors.region) {
      setStep2Errors((prev) => ({ ...prev, region: '' }));
    }

    // Update language suggestion if language was auto-suggested or empty
    if (isLanguageAutoSuggested || !languageName.trim()) {
      const suggestedLang =
        (dist && DISTRICT_LANGUAGE_OVERRIDES[dist]) ||
        REGIONAL_PRIMARY_LANGUAGES[st] ||
        'Hindi';
      setLanguageName(suggestedLang);
      setIsLanguageAutoSuggested(true);
    }
  };

  // Language input change handler
  const handleLanguageChange = (newLang: string) => {
    setLanguageName(newLang);
    setIsLanguageAutoSuggested(false); // User made manual choice
  };

  // Tradition genre selection handler
  const handleGenreSelect = (catId: string) => {
    setCategory(catId);
    setIsGenreAutoSuggested(false); // User made manual choice

    if (catId === 'OTHER') {
      setSpeakerName('');
      setSpeakerAge('');
    }
    if (step2Errors.customCategory) {
      setStep2Errors((prev) => ({ ...prev, customCategory: '' }));
    }
  };

  // Step 3: Media
  const [audioMode, setAudioMode] = useState<'MIC' | 'FILE'>('MIC');
  const [transcriptionDraft, setTranscriptionDraft] = useState('');
  const [translationDraft, setTranslationDraft] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Validation errors
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [step3Error, setStep3Error] = useState<string | null>(null);

  const apiUrl = getApiUrl();

  // Monitor browser network status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Register Service Worker for Background Sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
    }
  }, []);

  // Refresh queued count on mount and after sync events
  useEffect(() => {
    countQueued().then(setQueuedCount).catch(() => {});
    const handleSyncComplete = () => {
      countQueued().then(setQueuedCount).catch(() => {});
    };
    window.addEventListener('dharohar:sync-complete', handleSyncComplete);
    // Also listen to SW messages asking us to flush
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DHAROHAR_FLUSH_QUEUE') {
        setSyncing(true);
        flushQueue()
          .then(({ synced }) => {
            if (synced > 0) countQueued().then(setQueuedCount).catch(() => {});
          })
          .finally(() => setSyncing(false));
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);
    return () => {
      window.removeEventListener('dharohar:sync-complete', handleSyncComplete);
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, []);

  // Fetch registered database languages for suggestions
  useEffect(() => {
    async function loadMeta() {
      try {
        const langData = await cachedFetch(`${apiUrl}/api/languages`);
        if (Array.isArray(langData)) {
          setLanguages(langData);
        }
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    }
    loadMeta();
  }, [apiUrl]);

  // Handle generic file picker selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean up previous blob URL if exists
    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(objectUrl);
    setMediaUrl(objectUrl);
    setStep3Error(null);
  };

  const removeSelectedFile = () => {
    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setMediaUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format selection handler with matching tradition genre auto-suggestion
  const handleFormatSelect = (fmt: 'AUDIO' | 'VIDEO' | 'IMAGE' | 'TEXT') => {
    setMediaType(fmt);
    removeSelectedFile();

    // Auto-suggest matching tradition genre
    if (fmt === 'AUDIO') {
      setCategory('LULLABY');
    } else if (fmt === 'IMAGE') {
      setCategory('OTHER');
      setSpeakerName('');
      setSpeakerAge('');
    } else if (fmt === 'VIDEO') {
      setCategory('RITUAL');
    } else if (fmt === 'TEXT') {
      setCategory('PROVERB');
    }
    setIsGenreAutoSuggested(true);
  };

  // Audio Recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setMediaUrl(url);
        setStep3Error(null);
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
    } catch (err) {
      console.warn('Microphone access unavailable, using simulated recording mode:', err);
      setIsRecording(true);
      setRecordSeconds(0);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    if (!recordedAudioUrl) {
      const fallbackUrl = 'https://archive.org/download/sample-heritage-audio/oral_recording.mp3';
      setRecordedAudioUrl(fallbackUrl);
      setMediaUrl(fallbackUrl);
      setStep3Error(null);
    }
  };

  // Recording Timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Step 2 Validation: Title, Description, Speaker Age, Region
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!selectedStateName) {
      errs.region = 'Please select an Indian state or district.';
    }

    const cleanTitle = titleText.trim();
    if (cleanTitle.length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    } else if (cleanTitle.length < 15 && isKeyboardMash(cleanTitle)) {
      errs.title = 'Please provide a meaningful cultural title (not random keyboard characters).';
    }

    const cleanDesc = descriptionText.trim();
    if (cleanDesc.length < 10) {
      errs.description = 'Description must be at least 10 characters explaining cultural context.';
    } else if (cleanDesc.length < 15 && isKeyboardMash(cleanDesc)) {
      errs.description = 'Please enter a meaningful cultural description.';
    }

    if (speakerAge !== '' && speakerAge !== undefined && speakerAge !== null) {
      const ageNum = Number(speakerAge);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        errs.speakerAge = 'Speaker age must be a realistic number between 0 and 120.';
      }
    }

    if (category === 'OTHER' && customCategory.trim() && customCategory.trim().length < 2) {
      errs.customCategory = 'Please specify at least 2 characters for the heritage site name.';
    }

    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation: Media or Transcription non-empty
  const validateStep3 = (): boolean => {
    const hasMedia =
      (mediaType === 'AUDIO' && (recordedAudioUrl || selectedFile || mediaUrl)) ||
      (mediaType !== 'AUDIO' && (selectedFile || mediaUrl.trim().length > 0));

    const hasTranscription = transcriptionDraft.trim().length >= 5;

    if (!hasMedia && !hasTranscription) {
      setStep3Error(
        strings.step3RequiredError ||
        'At minimum, please attach/record a media file (audio, video, photo) or enter native transcription text before proceeding.'
      );
      return false;
    }

    setStep3Error(null);
    return true;
  };

  // Final Submission Handler
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    let finalMediaUrl = mediaUrl;

    // 1. If a recorded mic audio or a picked file exists, upload it to the backend endpoint
    let fileToUpload: File | Blob | null = selectedFile;
    if (!fileToUpload && recordedAudioBlob) {
      fileToUpload = new File([recordedAudioBlob], `recording-${Date.now()}.webm`, {
        type: 'audio/webm',
      });
    }

    if (fileToUpload) {
      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        const uploadRes = await fetch(`${apiUrl}/api/records/upload`, {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalMediaUrl = uploadData.url.startsWith('http')
            ? uploadData.url
            : `${apiUrl}${uploadData.url}`;
        } else {
          console.warn('File upload endpoint returned error, using local fallback');
        }
      } catch (uploadErr) {
        console.warn('Upload error, continuing with local reference:', uploadErr);
      }
    }

    // Default fallback if mediaUrl is still empty or a transient blob: URL
    if ((!finalMediaUrl || finalMediaUrl.startsWith('blob:')) && mediaType === 'AUDIO') {
      finalMediaUrl = 'https://archive.org/download/sample-heritage-audio/oral_recording.mp3';
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const cleanLangName = languageName.trim();
    const matchedLang = languages.find(
      (l) => l.name.toLowerCase() === cleanLangName.toLowerCase()
    );

    if (cleanLangName) {
      tags.push(`lang:${cleanLangName.toLowerCase()}`);
      tags.push(cleanLangName.toLowerCase());
    }

    if (category === 'OTHER' && customCategory.trim()) {
      tags.push(`genre:${customCategory.trim().toLowerCase()}`);
      tags.push(customCategory.trim().toLowerCase());
    }

    const scopesGranted: string[] = [];
    if (allowPublicArchive) scopesGranted.push('PUBLIC_ARCHIVE');
    if (allowAiTraining) scopesGranted.push('AI_TRAINING');
    scopesGranted.push('EXPORT_PRESERVATION');

    // Combine Title and Description into rich summaryText
    const finalSummary = `${titleText.trim()} — ${descriptionText.trim()}`;

    const payload = {
      contributorId: user?.id || null,
      mediaType,
      mediaUrl: finalMediaUrl,
      thumbnailUrl:
        mediaType === 'AUDIO'
          ? getCategoryCover(category)
          : (mediaType === 'IMAGE'
              ? finalMediaUrl
              : (selectedFile && selectedFile.type.startsWith('image/') ? finalMediaUrl : null)),
      stateName: selectedStateName,
      districtName: selectedDistrictName || null,
      languageId: matchedLang ? matchedLang.id : null,
      customLanguageName: cleanLangName || null,
      category,
      tags,
      speakerName: isAnonymous ? null : speakerName || null,
      speakerAge: speakerAge !== '' ? Number(speakerAge) : null,
      visibility,
      transcriptionText: transcriptionDraft.trim() || null,
      translationText: translationDraft.trim() || null,
      summaryText: finalSummary,
      consentScopes: scopesGranted,
      isAnonymous,
    };

    // Determine blob to save for offline queuing (if any)
    const blobForQueue = selectedFile
      ? selectedFile
      : recordedAudioBlob
      ? new File([recordedAudioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
      : null;
    const blobName = selectedFile?.name ?? (recordedAudioBlob ? `recording-${Date.now()}.webm` : null);
    const blobMime = selectedFile?.type ?? (recordedAudioBlob ? 'audio/webm' : null);

    try {
      if (isOnline) {
        const res = await fetch(`${apiUrl}/api/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const created = await res.json();
          setSubmittedRecordId(created.id);
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'API submission returned validation error');
        }
      } else {
        // Offline mode: save to IndexedDB with media blob
        const queueId = await enqueueSubmission(
          payload as Record<string, unknown>,
          blobForQueue,
          blobName,
          blobMime,
          apiUrl
        );
        await countQueued().then(setQueuedCount).catch(() => {});
        setSubmittedRecordId(`offline-${queueId}`);
        // Request Background Sync if SW supports it
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const reg = await navigator.serviceWorker.ready;
          await (reg as any).sync.register('dharohar-sync').catch(() => {});
        }
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      // If online submission failed transiently, enqueue for retry
      if (isOnline && blobForQueue !== null) {
        try {
          await enqueueSubmission(
            payload as Record<string, unknown>,
            blobForQueue,
            blobName,
            blobMime,
            apiUrl
          );
          await countQueued().then(setQueuedCount).catch(() => {});
          setSubmitError(
            'Submission failed but has been saved offline and will retry when your connection improves.'
          );
        } catch {
          setSubmitError(err.message || 'Submission failed. Please check the fields and try again.');
        }
      } else {
        setSubmitError(err.message || 'Submission failed. Please check the fields and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Determine selected labels for confirmation step
  let selectedRegionLabel = 'Select Region / District';
  if (selectedStateName) {
    if (selectedDistrictName) {
      selectedRegionLabel = `${selectedDistrictName} (${selectedStateName})`;
    } else {
      selectedRegionLabel = `${selectedStateName} (Entire State)`;
    }
  }

  const matchedLang = languages.find(
    (l) => l.name.toLowerCase() === languageName.trim().toLowerCase()
  );
  const selectedLangDisplay = languageName.trim()
    ? matchedLang
      ? `${matchedLang.name} ${matchedLang.scriptName ? `(${matchedLang.scriptName})` : ''} (Registered)`
      : `${languageName.trim()} (Custom / Rare Dialect)`
    : 'Not specified (General oral heritage)';

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col justify-between selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 pb-24 md:pb-16">
        {/* Offline Status Top Bar */}
        <div
          className={`py-2 px-4 text-xs font-sans text-center transition-all duration-300 flex items-center justify-center gap-3 ${
            !isOnline
              ? 'bg-[#B54A3A]/10 text-[#B54A3A] border-b border-[#B54A3A]/20'
              : queuedCount > 0
              ? 'bg-[#C97A3D]/10 text-[#C97A3D] border-b border-[#C97A3D]/20'
              : 'bg-[#2F6E5D]/10 text-[#2F6E5D] border-b border-[#2F6E5D]/20'
          }`}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>{strings.offlineStatus} — submissions will be saved and synced automatically when you reconnect.</span>
            </>
          ) : queuedCount > 0 ? (
            <>
              <Clock className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span>
                <strong>{queuedCount}</strong> offline submission{queuedCount !== 1 ? 's' : ''} pending sync.
              </span>
              <button
                type="button"
                disabled={syncing}
                onClick={() => {
                  setSyncing(true);
                  flushQueue()
                    .then(() => countQueued().then(setQueuedCount).catch(() => {}))
                    .finally(() => setSyncing(false));
                }}
                className="px-2 py-0.5 rounded bg-[#C97A3D] text-white text-[10px] font-medium hover:bg-[#B86B30] transition-colors disabled:opacity-50"
              >
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 shrink-0" />
              <span>{strings.onlineStatus}</span>
            </>
          )}
        </div>

        {/* Wizard Container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Step Indicator */}
          {!submittedRecordId && (
            <div className="mb-10 max-w-xl mx-auto">
              <div className="relative flex items-start justify-between">
                {/* Connecting Line — anchored precisely at the 18px vertical center of the w-9 (36px) circles on both desktop & mobile */}
                <div className="absolute left-10 right-10 sm:left-14 sm:right-14 top-[18px] -translate-y-1/2 h-0.5 bg-[#E4DDD0] z-0">
                  {/* Active progress track */}
                  <div
                    className="h-full bg-[#2F6E5D] transition-all duration-300"
                    style={{
                      width: `${((currentStep - 1) / 3) * 100}%`,
                    }}
                  />
                </div>
                {[
                  { step: 1, label: strings.step1Label },
                  { step: 2, label: strings.step2Label },
                  { step: 3, label: strings.step3Label },
                  { step: 4, label: strings.step4Label },
                ].map((s) => (
                  <div key={s.step} className="relative z-10 flex flex-col items-center w-20 sm:w-28 text-center">
                    <button
                      type="button"
                      disabled={s.step > currentStep}
                      onClick={() => {
                        if (s.step < currentStep) setCurrentStep(s.step as any);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium font-mono transition-all ${
                        currentStep === s.step
                          ? 'bg-[#C97A3D] text-[#FAF7F1] ring-4 ring-[#C97A3D]/20 shadow-sm'
                          : currentStep > s.step
                          ? 'bg-[#2F6E5D] text-[#FAF7F1] cursor-pointer'
                          : 'bg-[#FFFFFF] text-[#2A2420]/40 border border-[#E4DDD0]'
                      }`}
                    >
                      {currentStep > s.step ? <Check className="w-4 h-4 stroke-[2.5]" /> : s.step}
                    </button>
                    <span
                      className={`text-[11px] font-sans mt-2 text-center max-w-[100px] leading-tight hidden sm:block transition-colors ${
                        currentStep === s.step
                          ? 'text-[#C97A3D] font-semibold'
                          : currentStep > s.step
                          ? 'text-[#2F6E5D] font-medium'
                          : 'text-[#2A2420]/50'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Screen */}
          {submittedRecordId ? (
            <div className="bg-[#FFFFFF] border border-[#2F6E5D] rounded-2xl p-8 sm:p-12 text-center shadow-none">
              <div className="w-16 h-16 rounded-full bg-[#2F6E5D]/10 border-2 border-[#2F6E5D] flex items-center justify-center mx-auto mb-6 text-[#2F6E5D]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="font-serif text-3xl text-[#2A2420] font-medium mb-3">
                {strings.successTitle}
              </h2>
              <p className="text-sm text-[#2A2420]/80 max-w-md mx-auto leading-relaxed mb-6">
                {strings.successDesc}
              </p>

              <div className="bg-[#FAF7F1] border border-[#E4DDD0] rounded-lg p-4 max-w-sm mx-auto mb-8 text-xs font-mono text-[#C97A3D] break-all">
                RECORD-ID: {submittedRecordId}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/record/${submittedRecordId}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-sm hover:bg-[#B86B30] transition-colors shadow-none"
                >
                  {strings.viewMuseumPlaque}
                </Link>
                <button
                  onClick={() => {
                    setSubmittedRecordId(null);
                    setCurrentStep(1);
                    setTitleText('');
                    setDescriptionText('');
                    setTranscriptionDraft('');
                    setTranslationDraft('');
                    setRecordedAudioUrl(null);
                    setSelectedFile(null);
                    setFilePreviewUrl(null);
                    setConsentConfirmed(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#E4DDD0] text-[#2A2420] font-sans text-sm hover:bg-[#FAF7F1] transition-colors"
                >
                  {strings.recordAnother}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E4DDD0] rounded-2xl p-6 sm:p-10 shadow-none">
              {/* STEP 1: Consent & Cultural Rights */}
              {currentStep === 1 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{strings.consentBadge}</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#2A2420] font-medium mb-2">
                    {strings.consentTitle}
                  </h2>
                  <p className="text-xs text-[#2A2420]/70 mb-6 leading-relaxed">
                    {strings.consentDesc}
                  </p>

                  <div className="space-y-4 mb-6">
                    {/* Visibility Choice */}
                    <div>
                      <label className="block text-xs font-sans text-[#2A2420]/90 mb-2 font-medium">
                        {strings.accessibilityLevel}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {[
                          {
                            id: 'PUBLIC',
                            title: strings.publicTitle,
                            desc: strings.publicDesc,
                          },
                          {
                            id: 'COMMUNITY_ONLY',
                            title: strings.communityTitle,
                            desc: strings.communityDesc,
                          },
                          {
                            id: 'PRIVATE',
                            title: strings.privateTitle,
                            desc: strings.privateDesc,
                          },
                        ].map((v) => (
                          <div
                            key={v.id}
                            onClick={() => setVisibility(v.id as any)}
                            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                              visibility === v.id
                                ? 'bg-[#FAF7F1] border-[#C97A3D] text-[#2A2420] shadow-sm'
                                : 'bg-[#FFFFFF] border-[#E4DDD0] text-[#2A2420]/70 hover:border-[#C97A3D]/40'
                            }`}
                          >
                            <span className="font-serif font-medium block text-sm mb-1 text-[#C97A3D]">
                              {v.title}
                            </span>
                            <p className="text-[11px] leading-relaxed text-[#2A2420]/70">{v.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scopes Granted */}
                    <div className="pt-3 border-t border-[#E4DDD0] space-y-3 text-xs font-sans text-[#2A2420]">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowPublicArchive}
                          onChange={(e) => setAllowPublicArchive(e.target.checked)}
                          className="mt-0.5 rounded accent-[#C97A3D]"
                        />
                        <span>
                          <strong>{strings.preservationCharter}</strong> {strings.preservationCharterDesc}
                        </span>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowAiTraining}
                          onChange={(e) => setAllowAiTraining(e.target.checked)}
                          className="mt-0.5 rounded accent-[#C97A3D]"
                        />
                        <span>
                          <strong>{strings.langTechnology}</strong> {strings.langTechnologyDesc}
                        </span>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="mt-0.5 rounded accent-[#C97A3D]"
                        />
                        <span>
                          <strong>{strings.anonCustodian}</strong> {strings.anonCustodianDesc}
                        </span>
                      </label>
                    </div>

                    {/* Mandatory agreement tick */}
                    <div className="pt-4 border-t border-[#E4DDD0]">
                      <label className="flex items-start space-x-3 p-3 rounded-lg bg-[#FAF7F1] border border-[#E4DDD0] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consentConfirmed}
                          onChange={(e) => setConsentConfirmed(e.target.checked)}
                          className="mt-1 rounded accent-[#C97A3D]"
                        />
                        <span className="text-xs text-[#2A2420]">
                          {strings.consentAgreement}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      disabled={!consentConfirmed}
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs flex items-center space-x-1.5 hover:bg-[#B86B30] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <span>{strings.proceedMetadata}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Cultural Metadata */}
              {currentStep === 2 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>{strings.contextBadge}</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#2A2420] font-medium mb-4">
                    {strings.contextTitle}
                  </h2>

                  <div className="space-y-4 text-xs font-sans">
                    {/* Documentation Format Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[#2A2420]/80 font-medium text-xs">
                          Documentation Format *
                        </label>
                        <span className="text-[11px] text-[#2A2420]/50">Select media style</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'AUDIO', label: 'Oral Audio', icon: <Mic className="w-4 h-4" />, hint: 'Songs, folktales, chants' },
                          { id: 'IMAGE', label: 'Photo / Site', icon: <ImageIcon className="w-4 h-4" />, hint: 'Forts, temples, crafts' },
                          { id: 'VIDEO', label: 'Field Video', icon: <Video className="w-4 h-4" />, hint: 'Rituals, dances, performances' },
                          { id: 'TEXT', label: 'Written Text', icon: <FileText className="w-4 h-4" />, hint: 'Proverbs, idioms, scripts' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleFormatSelect(m.id as any)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              mediaType === m.id
                                ? 'bg-[#2F6E5D] border-[#2F6E5D] text-[#FAF7F1] shadow-sm'
                                : 'bg-[#FAF7F1] border-[#E4DDD0] text-[#2A2420]/80 hover:border-[#C97A3D]'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 font-medium text-xs mb-0.5">
                              {m.icon}
                              <span>{m.label}</span>
                            </div>
                            <span
                              className={`text-[10px] block leading-tight ${
                                mediaType === m.id ? 'text-[#FAF7F1]/80' : 'text-[#2A2420]/50'
                              }`}
                            >
                              {m.hint}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tradition Genre Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <label className="block text-[#2A2420]/80 font-medium text-xs">
                            {strings.genreLabel} *
                          </label>
                          {isGenreAutoSuggested && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/20">
                              <Sparkles className="w-2.5 h-2.5" /> Suggested for format
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#2A2420]/50">
                          {strings.genrePrompt}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#2A2420]/55 italic mb-2">
                        {isGenreAutoSuggested
                          ? 'Auto-suggested based on format above. Click any genre to change.'
                          : 'Select the traditional genre that best classifies this cultural record.'}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CATEGORIES.map((c) => {
                          const localizedCat = catMap[c.id] || c;
                          const isSelected = category === c.id;
                          return (
                            <div
                              key={c.id}
                              onClick={() => handleGenreSelect(c.id)}
                              className={`p-2.5 rounded border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#2F6E5D] border-[#2F6E5D] text-[#FAF7F1] shadow-sm'
                                  : 'bg-[#FAF7F1] border-[#E4DDD0] text-[#2A2420]/75 hover:border-[#C97A3D]/40 hover:text-[#2A2420]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-base">{c.icon}</span>
                                {isSelected && isGenreAutoSuggested && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-sans font-medium px-1.5 py-0.5 rounded bg-white/20 text-[#FAF7F1]">
                                    <Sparkles className="w-2.5 h-2.5" /> Suggested
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-xs block">{localizedCat.label}</span>
                              <span className="text-[10px] block opacity-70 mt-0.5 leading-tight">{localizedCat.desc}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Category Input if OTHER is selected */}
                      {category === 'OTHER' && (
                        <div className="mt-3 p-3.5 bg-[#FAF7F1] border border-[#C97A3D]/40 rounded-lg shadow-sm">
                          <label className="block text-xs font-semibold text-[#C97A3D] mb-1.5 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Describe the heritage site or monument name (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Daulatabad Fort, Chand Baori, Ellora Caves, Warli sacred grove..."
                            value={customCategory}
                            onChange={(e) => {
                              setCustomCategory(e.target.value);
                              if (step2Errors.customCategory) {
                                setStep2Errors((prev) => ({ ...prev, customCategory: '' }));
                              }
                            }}
                            className={`w-full bg-[#FFFFFF] border ${
                              step2Errors.customCategory ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                            } rounded px-3 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                          />
                          <p className="text-[11px] text-[#2A2420]/60 mt-1.5">
                            This will be catalogued in the Living Cultural Atlas and searchable by name.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Reusable Hierarchical Region / District Selector */}
                    <RegionHierarchySelect
                      selectedState={selectedStateName}
                      selectedDistrict={selectedDistrictName}
                      label={strings.regionLabel}
                      sublabel={strings.regionRef}
                      suggestedBadge={
                        isRegionAutoSuggested ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/20">
                            <Sparkles className="w-2.5 h-2.5" /> Suggested from location
                          </span>
                        ) : undefined
                      }
                      onChange={handleRegionChange}
                      error={step2Errors.region}
                    />

                    {/* Native Language / Dialect: Direct typing of any rare dialect + suggestions */}
                    <LanguageCombobox
                      value={languageName}
                      onChange={handleLanguageChange}
                      suggestions={languages}
                      label={strings.langLabel}
                      autoCatalogLabel={strings.langAutoCatalog}
                      suggestedBadge={
                        isLanguageAutoSuggested ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#2F6E5D]/10 text-[#2F6E5D] border border-[#2F6E5D]/20">
                            <Sparkles className="w-2.5 h-2.5" /> Suggested for region
                          </span>
                        ) : undefined
                      }
                    />

                    {/* Cultural Title (Validated: min length 5, no keyboard mash) */}
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1.5 font-medium">
                        {strings.titleLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={strings.titlePlaceholder}
                        value={titleText}
                        onChange={(e) => {
                          setTitleText(e.target.value);
                          if (step2Errors.title) {
                            setStep2Errors((prev) => ({ ...prev, title: '' }));
                          }
                        }}
                        className={`w-full bg-[#FFFFFF] border ${
                          step2Errors.title ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                        } rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                      />
                      {step2Errors.title && (
                        <p className="text-[11px] text-[#B54A3A] mt-1">{step2Errors.title}</p>
                      )}
                    </div>

                    {/* Speaker / Practitioner Details — conditional based on Tradition Genre */}
                    {!isAnonymous && category !== 'OTHER' && (
                      <div>
                        {category === 'CRAFT_TECHNIQUE' || category === 'LIFE_SKILL' || category === 'RECIPE' ? (
                          // Craft / Ecology / Skill / Recipe Practitioner
                          <div>
                            <div className="flex items-center space-x-2 mb-2 p-2.5 bg-[#FAF7F1] border border-[#E4DDD0] rounded-lg">
                              <Wrench className="w-3.5 h-3.5 text-[#C97A3D] shrink-0" />
                              <p className="text-[11px] text-[#2A2420]/70">
                                <strong>Practitioner / Artisan details</strong> — who crafted or demonstrated this technique? (optional)
                              </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[#2A2420]/80 mb-1.5 font-medium text-xs">
                                  Practitioner / Artisan Name <span className="text-[#2A2420]/40 font-normal">(optional)</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Ramdev Suthar, Devaki Amma"
                                  value={speakerName}
                                  onChange={(e) => setSpeakerName(e.target.value)}
                                  className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                                />
                              </div>
                              <div>
                                <label className="block text-[#2A2420]/80 mb-1.5 font-medium text-xs">
                                  Practitioner Age <span className="text-[#2A2420]/40 font-normal">(optional)</span>
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={120}
                                  placeholder="e.g. 58"
                                  value={speakerAge}
                                  onChange={(e) => {
                                    setSpeakerAge(e.target.value ? Number(e.target.value) : '');
                                    if (step2Errors.speakerAge) {
                                      setStep2Errors((prev) => ({ ...prev, speakerAge: '' }));
                                    }
                                  }}
                                  className={`w-full bg-[#FFFFFF] border ${
                                    step2Errors.speakerAge ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                                  } rounded px-3 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                                />
                                {step2Errors.speakerAge && (
                                  <p className="text-[11px] text-[#B54A3A] mt-1">
                                    {step2Errors.speakerAge}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Spoken / Oral Tradition Storyteller
                          <div>
                            <div className="flex items-center space-x-2 mb-2 p-2.5 bg-[#FAF7F1] border border-[#E4DDD0] rounded-lg">
                              <Mic className="w-3.5 h-3.5 text-[#C97A3D] shrink-0" />
                              <p className="text-[11px] text-[#2A2420]/70">
                                <strong>Speaker / Storyteller details</strong> — who is sharing this oral recording or lore? (optional)
                              </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[#2A2420]/80 mb-1.5 font-medium text-xs">
                                  Speaker / Storyteller Name <span className="text-[#2A2420]/40 font-normal">(optional)</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Gangubai Thakar, Elder Toda singer"
                                  value={speakerName}
                                  onChange={(e) => setSpeakerName(e.target.value)}
                                  className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                                />
                              </div>
                              <div>
                                <label className="block text-[#2A2420]/80 mb-1.5 font-medium text-xs">
                                  Speaker Age <span className="text-[#2A2420]/40 font-normal">(optional)</span>
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={120}
                                  placeholder="e.g. 74"
                                  value={speakerAge}
                                  onChange={(e) => {
                                    setSpeakerAge(e.target.value ? Number(e.target.value) : '');
                                    if (step2Errors.speakerAge) {
                                      setStep2Errors((prev) => ({ ...prev, speakerAge: '' }));
                                    }
                                  }}
                                  className={`w-full bg-[#FFFFFF] border ${
                                    step2Errors.speakerAge ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                                  } rounded px-3 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                                />
                                {step2Errors.speakerAge && (
                                  <p className="text-[11px] text-[#B54A3A] mt-1">
                                    {step2Errors.speakerAge}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description / Cultural Meaning (Validated: min length 10) */}
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1.5 font-medium">
                        {strings.descLabel}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={descriptionText}
                        onChange={(e) => {
                          setDescriptionText(e.target.value);
                          if (step2Errors.description) {
                            setStep2Errors((prev) => ({ ...prev, description: '' }));
                          }
                        }}
                        placeholder={strings.descPlaceholder}
                        className={`w-full bg-[#FFFFFF] border ${
                          step2Errors.description ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                        } rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                      />
                      {step2Errors.description && (
                        <p className="text-[11px] text-[#B54A3A] mt-1">
                          {step2Errors.description}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1.5">
                        {strings.tagsLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={strings.tagsPlaceholder}
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#E4DDD0]">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 rounded text-xs font-sans text-[#2A2420]/70 hover:text-[#2A2420] flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{strings.backBtn}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (validateStep2()) {
                          setCurrentStep(3);
                        }
                      }}
                      className="px-6 py-2.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs flex items-center space-x-1.5 hover:bg-[#B86B30] transition-all"
                    >
                      <span>{strings.proceedMedia}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Multi-Modal Media Capture & Real File Upload */}
              {currentStep === 3 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>{strings.mediaBadge}</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#2A2420] font-medium mb-4">
                    {strings.mediaTitle}
                  </h2>

                  {/* Media Type Selector */}
                  <div className="flex items-center space-x-2 bg-[#FAF7F1] p-1.5 rounded-lg border border-[#E4DDD0] mb-6 text-xs font-sans">
                    {[
                      { id: 'AUDIO', label: strings.mediaModeAudio, icon: Mic },
                      { id: 'VIDEO', label: strings.mediaModeVideo, icon: Video },
                      { id: 'IMAGE', label: strings.mediaModeImage, icon: ImageIcon },
                      { id: 'TEXT', label: strings.mediaModeText, icon: FileText },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setMediaType(m.id as any);
                            removeSelectedFile();
                            setStep3Error(null);
                          }}
                          className={`flex-1 py-2 rounded flex items-center justify-center space-x-1.5 transition-colors ${
                            mediaType === m.id
                              ? 'bg-[#C97A3D] text-[#FAF7F1] font-medium shadow-sm'
                              : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* --- AUDIO CAPTURE: Mic or File Upload --- */}
                  {mediaType === 'AUDIO' && (
                    <div className="space-y-4 mb-6">
                      {/* Audio Mode Tabs */}
                      <div className="flex space-x-2 border-b border-[#E4DDD0] pb-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setAudioMode('MIC')}
                          className={`px-3 py-1.5 rounded flex items-center space-x-1.5 transition-colors ${
                            audioMode === 'MIC'
                              ? 'bg-[#2F6E5D] text-[#FAF7F1] font-medium'
                              : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{strings.audioLiveTab}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAudioMode('FILE')}
                          className={`px-3 py-1.5 rounded flex items-center space-x-1.5 transition-colors ${
                            audioMode === 'FILE'
                              ? 'bg-[#2F6E5D] text-[#FAF7F1] font-medium'
                              : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{strings.audioUploadTab}</span>
                        </button>
                      </div>

                      {/* Mic Recording UI */}
                      {audioMode === 'MIC' && (
                        <div className="bg-[#FAF7F1] p-6 sm:p-8 rounded-xl border border-[#E4DDD0] flex flex-col items-center justify-center text-center">
                          <div className="text-3xl font-mono text-[#C97A3D] mb-4">
                            {formatTimer(recordSeconds)}
                          </div>

                          {isRecording ? (
                            <button
                              onClick={stopRecording}
                              className="w-16 h-16 rounded-full bg-[#B54A3A] text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg animate-pulse"
                              title={strings.stopRecord}
                            >
                              <Square className="w-6 h-6 fill-current" />
                            </button>
                          ) : (
                            <button
                              onClick={startRecording}
                              className="w-16 h-16 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center hover:bg-[#B86B30] hover:scale-105 transition-all shadow-md"
                              title={strings.startRecord}
                            >
                              <Mic className="w-7 h-7" />
                            </button>
                          )}

                          <p className="text-xs text-[#2A2420]/70 mt-4">
                            {isRecording
                              ? strings.audioPromptRecording
                              : recordedAudioUrl
                              ? strings.audioPromptDone
                              : strings.audioPromptIdle}
                          </p>

                          {recordedAudioUrl && (
                            <div className="mt-4 w-full max-w-md">
                              <CustomAudioPlayer
                                src={recordedAudioUrl}
                                title={strings.recordedSuccess}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Audio File Picker */}
                      {audioMode === 'FILE' && (
                        <div className="bg-[#FAF7F1] p-6 rounded-xl border border-[#E4DDD0]">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/webm,audio/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="audio-file-picker"
                          />

                          {!selectedFile ? (
                            <label
                              htmlFor="audio-file-picker"
                              className="border-2 border-dashed border-[#C97A3D]/40 hover:border-[#C97A3D] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
                            >
                              <FileAudio className="w-10 h-10 text-[#C97A3D] mb-3" />
                              <span className="text-sm font-medium text-[#2A2420] mb-1">
                                {strings.audioFileClick}
                              </span>
                              <span className="text-xs text-[#2A2420]/60">
                                {strings.audioFileTypes}
                              </span>
                            </label>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-[#FFFFFF] p-3 rounded border border-[#2F6E5D]">
                                <div className="flex items-center space-x-2 truncate">
                                  <CheckCircle2 className="w-4 h-4 text-[#2F6E5D] shrink-0" />
                                  <span className="text-xs text-[#2A2420] font-medium truncate">
                                    {selectedFile.name}
                                  </span>
                                  <span className="text-[11px] text-[#C97A3D]">
                                    ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                                  </span>
                                </div>
                                <button
                                  onClick={removeSelectedFile}
                                  className="text-xs text-[#B54A3A] hover:underline shrink-0 ml-2"
                                >
                                  {strings.changeFile}
                                </button>
                              </div>
                              {filePreviewUrl && (
                                <div className="mt-2">
                                  <CustomAudioPlayer
                                    src={filePreviewUrl}
                                    title={`Ready: ${selectedFile.name}`}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- VIDEO CAPTURE: Real File Picker --- */}
                  {mediaType === 'VIDEO' && (
                    <div className="bg-[#FAF7F1] p-6 rounded-xl border border-[#E4DDD0] mb-6 text-xs">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="video-file-picker"
                      />

                      {!selectedFile && !mediaUrl ? (
                        <label
                          htmlFor="video-file-picker"
                          className="border-2 border-dashed border-[#C97A3D]/40 hover:border-[#C97A3D] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
                        >
                          <Film className="w-10 h-10 text-[#C97A3D] mb-3" />
                          <span className="text-sm font-medium text-[#2A2420] mb-1">
                            {strings.videoFileClick}
                          </span>
                          <span className="text-xs text-[#2A2420]/60">
                            {strings.videoFileTypes}
                          </span>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-[#FFFFFF] p-3 rounded border border-[#2F6E5D]">
                            <div className="flex items-center space-x-2 truncate">
                              <CheckCircle2 className="w-4 h-4 text-[#2F6E5D] shrink-0" />
                              <span className="text-xs text-[#2A2420] font-medium truncate">
                                {selectedFile?.name || 'External Video URL'}
                              </span>
                              {selectedFile && (
                                <span className="text-[11px] text-[#C97A3D]">
                                  ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                                </span>
                              )}
                            </div>
                            <button
                              onClick={removeSelectedFile}
                              className="text-xs text-[#B54A3A] hover:underline shrink-0 ml-2"
                            >
                              {strings.removeReplace}
                            </button>
                          </div>

                          {(filePreviewUrl || mediaUrl) && (
                            <div className="rounded overflow-hidden border border-[#E4DDD0] bg-black">
                              <video
                                src={filePreviewUrl || mediaUrl}
                                controls
                                className="w-full max-h-60 mx-auto"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Manual URL toggle */}
                      <div className="mt-3 pt-3 border-t border-[#E4DDD0]">
                        <button
                          type="button"
                          onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                          className="text-[11px] text-[#C97A3D] hover:underline flex items-center space-x-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>
                            {showManualUrlInput
                              ? strings.hideDirectUrl
                              : strings.enterDirectVideoUrl}
                          </span>
                        </button>
                        {showManualUrlInput && (
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="https://archive.org/download/.../video.mp4"
                              value={mediaUrl}
                              onChange={(e) => {
                                setMediaUrl(e.target.value);
                                setStep3Error(null);
                              }}
                              className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- IMAGE CAPTURE: Real File Picker --- */}
                  {mediaType === 'IMAGE' && (
                    <div className="bg-[#FAF7F1] p-6 rounded-xl border border-[#E4DDD0] mb-6 text-xs">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-file-picker"
                      />

                      {!selectedFile && !mediaUrl ? (
                        <label
                          htmlFor="image-file-picker"
                          className="border-2 border-dashed border-[#C97A3D]/40 hover:border-[#C97A3D] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
                        >
                          <ImageIcon className="w-10 h-10 text-[#C97A3D] mb-3" />
                          <span className="text-sm font-medium text-[#2A2420] mb-1">
                            {strings.imageFileClick}
                          </span>
                          <span className="text-xs text-[#2A2420]/60">
                            {strings.imageFileTypes}
                          </span>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-[#FFFFFF] p-3 rounded border border-[#2F6E5D]">
                            <div className="flex items-center space-x-2 truncate">
                              <CheckCircle2 className="w-4 h-4 text-[#2F6E5D] shrink-0" />
                              <span className="text-xs text-[#2A2420] font-medium truncate">
                                {selectedFile?.name || 'External Image URL'}
                              </span>
                              {selectedFile && (
                                <span className="text-[11px] text-[#C97A3D]">
                                  ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                                </span>
                              )}
                            </div>
                            <button
                              onClick={removeSelectedFile}
                              className="text-xs text-[#B54A3A] hover:underline shrink-0 ml-2"
                            >
                              {strings.removeReplace}
                            </button>
                          </div>

                          {(filePreviewUrl || mediaUrl) && (
                            <div className="p-2 rounded bg-[#FFFFFF] border border-[#E4DDD0] text-center">
                              <img
                                src={filePreviewUrl || mediaUrl}
                                alt="Artifact preview"
                                className="max-h-56 rounded object-contain mx-auto border border-[#E4DDD0]"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Manual URL toggle */}
                      <div className="mt-3 pt-3 border-t border-[#E4DDD0]">
                        <button
                          type="button"
                          onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                          className="text-[11px] text-[#C97A3D] hover:underline flex items-center space-x-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>
                            {showManualUrlInput
                              ? strings.hideDirectUrl
                              : strings.enterDirectImageUrl}
                          </span>
                        </button>
                        {showManualUrlInput && (
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="https://images.unsplash.com/... or image link"
                              value={mediaUrl}
                              onChange={(e) => {
                                setMediaUrl(e.target.value);
                                setStep3Error(null);
                              }}
                              className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- NATIVE TEXT TRADITIONS --- */}
                  {mediaType === 'TEXT' && (
                    <div className="bg-[#FAF7F1] p-4 rounded-xl border border-[#E4DDD0] mb-6 text-xs">
                      <p className="text-[#2A2420]/80 leading-relaxed mb-2">
                        {strings.textTraditionDesc}
                      </p>
                    </div>
                  )}

                  {/* Transcription and Translation Draft Fields */}
                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1 font-medium">
                        {strings.nativeTransLabel}
                      </label>
                      <textarea
                        rows={2}
                        value={transcriptionDraft}
                        onChange={(e) => {
                          setTranscriptionDraft(e.target.value);
                          setStep3Error(null);
                        }}
                        placeholder={strings.nativeTransPlaceholder}
                        className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1 font-medium">
                        {strings.translationLabel}
                      </label>
                      <textarea
                        rows={2}
                        value={translationDraft}
                        onChange={(e) => setTranslationDraft(e.target.value)}
                        placeholder={strings.translationPlaceholder}
                        className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                      />
                    </div>
                  </div>

                  {/* Validation Error Banner for Step 3 */}
                  {step3Error && (
                    <div className="mt-4 p-3 rounded bg-[#B54A3A]/10 border border-[#B54A3A]/30 text-xs text-[#B54A3A] flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{step3Error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#E4DDD0]">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded text-xs font-sans text-[#2A2420]/70 hover:text-[#2A2420] flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{strings.backBtn}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (validateStep3()) {
                          setCurrentStep(4);
                        }
                      }}
                      className="px-6 py-2.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs flex items-center space-x-1.5 hover:bg-[#B86B30] transition-all"
                    >
                      <span>{strings.reviewConfirm}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirmation & Submission */}
              {currentStep === 4 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>{strings.reviewBadge}</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#2A2420] font-medium mb-4">
                    {strings.reviewTitle}
                  </h2>

                  {/* Error banner if submission failed */}
                  {submitError && (
                    <div className="mb-4 p-3.5 rounded bg-[#B54A3A]/10 border border-[#B54A3A] text-xs text-[#B54A3A] flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="bg-[#FAF7F1] p-5 rounded-xl border border-[#E4DDD0] space-y-4 text-xs font-sans mb-6">
                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">{strings.reviewTraditionTitle}</span>
                      <span className="text-[#C97A3D] font-medium text-right max-w-xs truncate">
                        {titleText}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">{strings.reviewRegion}</span>
                      <span className="text-[#2A2420] font-medium text-right">
                        {selectedRegionLabel}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">{strings.reviewNativeLang}</span>
                      <span className="text-[#2A2420] text-right">{selectedLangDisplay}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">{strings.reviewGenre}</span>
                      <span className="text-[#C97A3D] font-medium">{catMap[category]?.label || category}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">{strings.reviewMediaMode}</span>
                      <span className="text-[#2F6E5D] font-medium">
                        {mediaType === 'AUDIO' ? strings.mediaModeAudio : mediaType === 'VIDEO' ? strings.mediaModeVideo : mediaType === 'IMAGE' ? strings.mediaModeImage : strings.mediaModeText}{' '}
                        {selectedFile
                          ? `(${selectedFile.name})`
                          : recordedAudioUrl
                          ? `(${strings.recordedSuccess})`
                          : mediaUrl
                          ? '(URL)'
                          : ''}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">
                        {mediaType === 'IMAGE'
                          ? 'Contributor / Photographer:'
                          : mediaType === 'TEXT'
                          ? 'Script / Text Contributor:'
                          : strings.reviewSpeaker}
                      </span>
                      <span className="text-[#2A2420]">
                        {isAnonymous
                          ? (strings.anonCustodian.replace(':', '') || 'Anonymous Custodian')
                          : speakerName
                          ? `${speakerName}${speakerAge !== '' ? ` (${speakerAge} yrs)` : ''}`
                          : mediaType === 'IMAGE'
                          ? (user?.displayName || 'Community Heritage Contributor')
                          : 'Elder Tradition Bearer'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">{strings.reviewAccessLevel}</span>
                      <span className="text-[#2F6E5D]">
                        {visibility === 'PUBLIC'
                          ? strings.publicTitle
                          : visibility === 'COMMUNITY_ONLY'
                          ? strings.communityTitle
                          : strings.privateTitle}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#2A2420]/60 block mb-1">{strings.reviewCulturalMeaning}</span>
                      <p className="text-[#2A2420]/90 italic bg-[#FFFFFF] p-2.5 rounded border border-[#E4DDD0] leading-relaxed">
                        "{descriptionText}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E4DDD0]">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 rounded text-xs font-sans text-[#2A2420]/70 hover:text-[#2A2420] flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{strings.backBtn}</span>
                    </button>
                    <button
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="px-8 py-3 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs flex items-center space-x-2 hover:bg-[#B86B30] disabled:opacity-50 transition-all shadow-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FAF7F1] border-t-transparent rounded-full animate-spin" />
                          <span>{strings.submittingBtn}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{strings.submitArchiveBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
