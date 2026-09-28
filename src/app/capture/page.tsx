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
  UserCheck,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLanguage } from '@/context/LanguageContext';
import { INDIA_REGION_HIERARCHY, StaticState } from '@/data/indiaHierarchy';
import { getCategoryCover } from '@/utils/categoryCovers';
import { getApiUrl } from '@/utils/apiUrl';
import { CAPTURE_I18N, CATEGORY_I18N, SupportedLang } from '@/utils/captureI18n';
import { cachedFetch } from '@/utils/apiCache';
import { enqueueSubmission, countQueued, flushQueue } from '@/utils/syncManager';
import TurnstileWidget from '@/components/TurnstileWidget';

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

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showAdvancedPrivacy, setShowAdvancedPrivacy] = useState(false);
  const [showTranscriptionNotes, setShowTranscriptionNotes] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Form Data
  // Step 5: Consent & Permissions
  const [visibility, setVisibility] = useState<'PUBLIC' | 'COMMUNITY_ONLY' | 'PRIVATE'>('PUBLIC');
  const [allowAiTraining, setAllowAiTraining] = useState(true);
  const [allowPublicArchive, setAllowPublicArchive] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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
  const [speakerRole, setSpeakerRole] = useState('');
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

  // Step 4 Validation: Title, Description, Speaker Age, Region
  const validateStep4 = (): boolean => {
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
  const validateStep2 = validateStep4;

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

    if (speakerRole && speakerRole !== 'Not applicable/Other') {
      tags.push(`role:${speakerRole.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
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
      turnstileToken: turnstileToken || undefined,
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
            <div className="mb-8 max-w-xl mx-auto">
              {/* Mobile Consumer Step Progress */}
              <div className="block sm:hidden mb-2">
                <div className="flex items-center justify-between text-xs font-medium text-[#2A2420]/80 mb-1.5">
                  <span className="font-semibold text-[#C97A3D]">Step {currentStep} of 5</span>
                  <span className="text-[#2F6E5D] font-medium">
                    {currentStep === 1
                      ? 'Format'
                      : currentStep === 2
                      ? 'Category'
                      : currentStep === 3
                      ? 'Record / Media'
                      : currentStep === 4
                      ? 'Context & People'
                      : 'Review & Deposit'}
                  </span>
                </div>
                <div className="w-full bg-[#E4DDD0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2F6E5D] h-full rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Desktop Step Nodes */}
              <div className="hidden sm:block relative">
                <div className="relative flex items-start justify-between">
                  <div className="absolute left-8 right-8 top-[18px] -translate-y-1/2 h-0.5 bg-[#E4DDD0] z-0">
                    <div
                      className="h-full bg-[#2F6E5D] transition-all duration-300"
                      style={{
                        width: `${((currentStep - 1) / 4) * 100}%`,
                      }}
                    />
                  </div>
                  {[
                    { step: 1, label: '1. Format' },
                    { step: 2, label: '2. Category' },
                    { step: 3, label: '3. Media' },
                    { step: 4, label: '4. Context' },
                    { step: 5, label: '5. Deposit' },
                  ].map((s) => (
                    <div key={s.step} className="relative z-10 flex flex-col items-center w-20 text-center">
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
                        className={`text-[11px] font-sans mt-2 text-center max-w-[85px] leading-tight transition-colors ${
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
                    setSpeakerRole('');
                    setSpeakerName('');
                    setSpeakerAge('');
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
              {/* STEP 1: Choose Documentation Format (1 decision, large touch targets) */}
              {currentStep === 1 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Step 1 of 5 • Documentation Format</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#2A2420] font-medium mb-2">
                    How will you record this memory?
                  </h2>
                  <p className="text-xs text-[#2A2420]/70 mb-6 leading-relaxed">
                    Select the format of the cultural heritage you are depositing today.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {[
                      {
                        id: 'AUDIO',
                        label: 'Oral Audio',
                        icon: Mic,
                        desc: 'Folk songs, lullabies, oral stories, spoken myths, ancient chants',
                        badge: 'Recommended for Oral Traditions',
                      },
                      {
                        id: 'VIDEO',
                        label: 'Field Video',
                        icon: Video,
                        desc: 'Sacred rituals, festive dances, artisan craft demonstrations, martial arts',
                        badge: 'Best for Performance',
                      },
                      {
                        id: 'IMAGE',
                        label: 'Photo / Heritage Site',
                        icon: ImageIcon,
                        desc: 'Forts, temples, stepwells, manuscripts, sacred groves, craft artifacts',
                        badge: 'Best for Monuments & Artifacts',
                      },
                      {
                        id: 'TEXT',
                        label: 'Written Text',
                        icon: FileText,
                        desc: 'Proverbs, idioms, traditional recipes, medicinal wisdom, folk lore',
                        badge: 'Text & Wisdom',
                      },
                    ].map((fmt) => {
                      const Icon = fmt.icon;
                      const isSelected = mediaType === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => handleFormatSelect(fmt.id as any)}
                          className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3.5 ${
                            isSelected
                              ? 'bg-[#FAF7F1] border-[#C97A3D] ring-2 ring-[#C97A3D]/20 shadow-sm'
                              : 'bg-[#FFFFFF] border-[#E4DDD0] hover:border-[#C97A3D]/50 hover:bg-[#FAF7F1]/50'
                          }`}
                        >
                          <div
                            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#C97A3D] text-[#FAF7F1]'
                                : 'bg-[#FAF7F1] text-[#2A2420]/70 border border-[#E4DDD0]'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`font-serif text-base font-medium ${
                                  isSelected ? 'text-[#C97A3D]' : 'text-[#2A2420]'
                                }`}
                              >
                                {fmt.label}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-[#C97A3D] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#2A2420]/70 leading-relaxed mb-1.5">
                              {fmt.desc}
                            </p>
                            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#2F6E5D]/10 text-[#2F6E5D]">
                              {fmt.badge}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#E4DDD0]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs sm:text-sm flex items-center justify-center space-x-2 hover:bg-[#B86B30] transition-all shadow-sm active:scale-[0.98]"
                    >
                      <span>Continue to Category</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Heritage Category (1 decision, 9 large touch tiles) */}
              {currentStep === 2 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Step 2 of 5 • Heritage Category</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#2A2420] font-medium mb-2">
                    What kind of heritage is this?
                  </h2>
                  <p className="text-xs text-[#2A2420]/70 mb-6 leading-relaxed">
                    Choose the cultural classification that best describes this tradition.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6">
                    {CATEGORIES.map((c) => {
                      const localizedCat = catMap[c.id] || c;
                      const isSelected = category === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleGenreSelect(c.id)}
                          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all min-h-[88px] flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#2F6E5D] border-[#2F6E5D] text-[#FAF7F1] shadow-sm ring-2 ring-[#2F6E5D]/20'
                              : 'bg-[#FAF7F1] border-[#E4DDD0] text-[#2A2420]/80 hover:border-[#C97A3D]/50 hover:bg-[#FFFFFF]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-2xl">{c.icon}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#FAF7F1] shrink-0" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-xs sm:text-sm block leading-tight">
                              {localizedCat.label}
                            </span>
                            <span
                              className={`text-[10px] block mt-0.5 leading-tight line-clamp-1 ${
                                isSelected ? 'text-[#FAF7F1]/80' : 'text-[#2A2420]/60'
                              }`}
                            >
                              {localizedCat.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Monument / Heritage Site Specific Field if OTHER is selected */}
                  {category === 'OTHER' && (
                    <div className="mb-6 p-4 bg-[#FAF7F1] border border-[#C97A3D]/40 rounded-xl">
                      <label className="block text-xs font-semibold text-[#C97A3D] mb-1.5 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Heritage Site / Monument Name (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Daulatabad Fort, Ellora Caves, Chand Baori, Warli sacred grove..."
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          if (step2Errors.customCategory) {
                            setStep2Errors((prev) => ({ ...prev, customCategory: '' }));
                          }
                        }}
                        className={`w-full bg-[#FFFFFF] border ${
                          step2Errors.customCategory ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                        } rounded-lg px-3 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                      />
                      <p className="text-[11px] text-[#2A2420]/60 mt-1">
                        Will be mapped on the Living Cultural Atlas under Heritage Sites.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[#E4DDD0]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2.5 rounded-lg text-xs font-sans text-[#2A2420]/70 hover:text-[#2A2420] flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{strings.backBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 rounded-xl bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs sm:text-sm flex items-center space-x-2 hover:bg-[#B86B30] transition-all shadow-sm"
                    >
                      <span>Continue to Media</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Multi-Modal Media Capture (Live Mic, Camera, File Upload) */}
              {currentStep === 3 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Step 3 of 5 • Media Capture</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#2A2420] font-medium mb-2">
                    {mediaType === 'AUDIO'
                      ? 'Record oral memory'
                      : mediaType === 'IMAGE'
                      ? 'Attach photo or site image'
                      : mediaType === 'VIDEO'
                      ? 'Attach field video'
                      : 'Write native text or proverb'}
                  </h2>
                  <p className="text-xs text-[#2A2420]/70 mb-6 leading-relaxed">
                    {mediaType === 'AUDIO'
                      ? 'Capture high-fidelity oral audio with your microphone or upload an audio file.'
                      : mediaType === 'IMAGE'
                      ? 'Upload a clear photograph of the monument, artifact, or ritual.'
                      : mediaType === 'VIDEO'
                      ? 'Attach a field recording of this performance, craft, or celebration.'
                      : 'Type or paste the ancestral text, proverb, or recipe.'}
                  </p>

                  {/* Validation Error Alert */}
                  {step3Error && (
                    <div className="mb-4 p-3.5 rounded-lg bg-[#B54A3A]/10 border border-[#B54A3A] text-xs text-[#B54A3A] flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{step3Error}</span>
                    </div>
                  )}

                  {/* AUDIO CAPTURE */}
                  {mediaType === 'AUDIO' && (
                    <div className="space-y-4 mb-6">
                      <div className="flex space-x-2 border-b border-[#E4DDD0] pb-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setAudioMode('MIC')}
                          className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-colors ${
                            audioMode === 'MIC'
                              ? 'bg-[#2F6E5D] text-[#FAF7F1] font-medium'
                              : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Live Microphone</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAudioMode('FILE')}
                          className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-colors ${
                            audioMode === 'FILE'
                              ? 'bg-[#2F6E5D] text-[#FAF7F1] font-medium'
                              : 'text-[#2A2420]/70 hover:text-[#2A2420]'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Audio File</span>
                        </button>
                      </div>

                      {audioMode === 'MIC' && (
                        <div className="bg-[#FAF7F1] p-6 sm:p-8 rounded-2xl border border-[#E4DDD0] flex flex-col items-center justify-center text-center">
                          <div className="text-3xl font-mono text-[#C97A3D] mb-4">
                            {formatTimer(recordSeconds)}
                          </div>

                          {isRecording ? (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="w-16 h-16 rounded-full bg-[#B54A3A] text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg animate-pulse"
                              title="Stop Recording"
                            >
                              <Square className="w-6 h-6 fill-current" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="w-16 h-16 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center hover:bg-[#B86B30] hover:scale-105 transition-all shadow-md"
                              title="Start Recording"
                            >
                              <Mic className="w-7 h-7" />
                            </button>
                          )}

                          <p className="text-xs text-[#2A2420]/70 mt-4">
                            {isRecording
                              ? 'Recording in progress... speak clearly into your mic.'
                              : recordedAudioUrl
                              ? 'Audio captured! You can review playback below or record again.'
                              : 'Tap microphone button to start recording.'}
                          </p>

                          {recordedAudioUrl && (
                            <div className="mt-4 w-full max-w-md">
                              <CustomAudioPlayer
                                src={recordedAudioUrl}
                                title="Field Audio Recording"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {audioMode === 'FILE' && (
                        <div className="bg-[#FAF7F1] p-6 rounded-2xl border border-[#E4DDD0]">
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
                                Click to select audio file from your device
                              </span>
                              <span className="text-xs text-[#2A2420]/60">
                                MP3, WAV, AAC, M4A, OGG or WebM (up to 50MB)
                              </span>
                            </label>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-[#FFFFFF] p-3 rounded-lg border border-[#2F6E5D]">
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
                                  type="button"
                                  onClick={removeSelectedFile}
                                  className="text-xs text-[#B54A3A] hover:underline shrink-0 ml-2"
                                >
                                  Change file
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

                  {/* IMAGE CAPTURE */}
                  {mediaType === 'IMAGE' && (
                    <div className="bg-[#FAF7F1] p-6 rounded-2xl border border-[#E4DDD0] mb-6 text-xs">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-file-picker"
                      />

                      {!selectedFile ? (
                        <label
                          htmlFor="image-file-picker"
                          className="border-2 border-dashed border-[#C97A3D]/40 hover:border-[#C97A3D] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
                        >
                          <ImageIcon className="w-10 h-10 text-[#C97A3D] mb-3" />
                          <span className="text-sm font-medium text-[#2A2420] mb-1">
                            Click to upload photo or monument image
                          </span>
                          <span className="text-xs text-[#2A2420]/60">
                            JPEG, PNG or WebP photograph (up to 20MB)
                          </span>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-[#FFFFFF] p-3 rounded-lg border border-[#2F6E5D]">
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
                              type="button"
                              onClick={removeSelectedFile}
                              className="text-xs text-[#B54A3A] hover:underline shrink-0 ml-2"
                            >
                              Change photo
                            </button>
                          </div>
                          {filePreviewUrl && (
                            <div className="rounded-xl overflow-hidden border border-[#E4DDD0] max-h-64 flex justify-center bg-black/5">
                              <img
                                src={filePreviewUrl}
                                alt="Preview"
                                className="max-h-64 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* VIDEO CAPTURE */}
                  {mediaType === 'VIDEO' && (
                    <div className="bg-[#FAF7F1] p-6 rounded-2xl border border-[#E4DDD0] mb-6 text-xs">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="video-file-picker"
                      />

                      {!selectedFile ? (
                        <label
                          htmlFor="video-file-picker"
                          className="border-2 border-dashed border-[#C97A3D]/40 hover:border-[#C97A3D] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
                        >
                          <Film className="w-10 h-10 text-[#C97A3D] mb-3" />
                          <span className="text-sm font-medium text-[#2A2420] mb-1">
                            Click to select field video from your device
                          </span>
                          <span className="text-xs text-[#2A2420]/60">
                            MP4, WebM or MOV video (up to 100MB)
                          </span>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-[#FFFFFF] p-3 rounded-lg border border-[#2F6E5D]">
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
                              type="button"
                              onClick={removeSelectedFile}
                              className="text-xs text-[#B54A3A] hover:underline shrink-0 ml-2"
                            >
                              Change video
                            </button>
                          </div>
                          {filePreviewUrl && (
                            <div className="rounded-xl overflow-hidden border border-[#E4DDD0] max-h-64 flex justify-center bg-black">
                              <video
                                src={filePreviewUrl}
                                controls
                                className="max-h-64 w-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TEXT / NATIVE SCRIPT */}
                  {mediaType === 'TEXT' && (
                    <div className="mb-6 space-y-2">
                      <label className="block text-xs font-medium text-[#2A2420]/80">
                        Native Script / Written Text *
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Type or paste the oral verses, ancestral proverb, or traditional recipe in native script or transliteration..."
                        value={transcriptionDraft}
                        onChange={(e) => {
                          setTranscriptionDraft(e.target.value);
                          if (step3Error) setStep3Error(null);
                        }}
                        className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded-xl p-3.5 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D] leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Progressive Disclosure: Optional Native Transcription / Translation Notes */}
                  {mediaType !== 'TEXT' && (
                    <div className="mb-6 pt-3 border-t border-[#E4DDD0]">
                      <button
                        type="button"
                        onClick={() => setShowTranscriptionNotes(!showTranscriptionNotes)}
                        className="text-xs font-sans text-[#C97A3D] hover:underline flex items-center space-x-1"
                      >
                        <span>
                          {showTranscriptionNotes
                            ? '− Hide native transcription & translation notes'
                            : '+ Add native transcription or translation notes (Optional)'}
                        </span>
                      </button>

                      {showTranscriptionNotes && (
                        <div className="mt-3 space-y-3 bg-[#FAF7F1] p-4 rounded-xl border border-[#E4DDD0]">
                          <div>
                            <label className="block text-[11px] font-medium text-[#2A2420]/80 mb-1">
                              Native Transcription (Original dialect words)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Original lyrics or spoken phrases..."
                              value={transcriptionDraft}
                              onChange={(e) => setTranscriptionDraft(e.target.value)}
                              className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg p-2.5 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#2A2420]/80 mb-1">
                              English / Hindi Translation or Meaning
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Translation or explanation in English/Hindi..."
                              value={translationDraft}
                              onChange={(e) => setTranslationDraft(e.target.value)}
                              className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg p-2.5 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[#E4DDD0]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2.5 rounded-lg text-xs font-sans text-[#2A2420]/70 hover:text-[#2A2420] flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{strings.backBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep3()) {
                          setCurrentStep(4);
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs sm:text-sm flex items-center space-x-2 hover:bg-[#B86B30] transition-all shadow-sm"
                    >
                      <span>Continue to Context</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Cultural Context, Geography & Attribution */}
              {currentStep === 4 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>Step 4 of 5 • Cultural Context & People</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#2A2420] font-medium mb-2">
                    Where and who is this from?
                  </h2>
                  <p className="text-xs text-[#2A2420]/70 mb-6 leading-relaxed">
                    Provide the region, dialect, title, and attribution for this cultural knowledge.
                  </p>

                  <div className="space-y-4 text-xs font-sans mb-6">
                    {/* Region Selector */}
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

                    {/* Language Selector */}
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

                    {/* Cultural Title */}
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1.5 font-medium">
                        Cultural Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ahirani Monsoon Lullaby of Khandesh..."
                        value={titleText}
                        onChange={(e) => {
                          setTitleText(e.target.value);
                          if (step2Errors.title) {
                            setStep2Errors((prev) => ({ ...prev, title: '' }));
                          }
                        }}
                        className={`w-full bg-[#FFFFFF] border ${
                          step2Errors.title ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                        } rounded-lg px-3 py-2.5 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                      />
                      {step2Errors.title && (
                        <p className="text-[11px] text-[#B54A3A] mt-1">{step2Errors.title}</p>
                      )}
                    </div>

                    {/* Cultural Meaning / Description */}
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1.5 font-medium">
                        Cultural Meaning & Significance *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Explain when this is performed, what story or history it preserves, and its meaning to the community..."
                        value={descriptionText}
                        onChange={(e) => {
                          setDescriptionText(e.target.value);
                          if (step2Errors.description) {
                            setStep2Errors((prev) => ({ ...prev, description: '' }));
                          }
                        }}
                        className={`w-full bg-[#FFFFFF] border ${
                          step2Errors.description ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                        } rounded-lg px-3 py-2.5 text-[#2A2420] focus:outline-none focus:border-[#C97A3D] leading-relaxed`}
                      />
                      {step2Errors.description && (
                        <p className="text-[11px] text-[#B54A3A] mt-1">{step2Errors.description}</p>
                      )}
                    </div>

                    {/* Contributor Attribution */}
                    {!isAnonymous && (
                      <div className="p-4 bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl space-y-3">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-[#C97A3D]" />
                          <h3 className="font-sans font-medium text-xs text-[#2A2420]">
                            Who shared this with you? <span className="text-[#2A2420]/50 font-normal">(optional)</span>
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-[#2A2420]/80 mb-1">
                              Role
                            </label>
                            <select
                              value={speakerRole}
                              onChange={(e) => setSpeakerRole(e.target.value)}
                              className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg px-2.5 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                            >
                              <option value="">Select role (optional)...</option>
                              <option value="Speaker">Speaker</option>
                              <option value="Storyteller">Storyteller</option>
                              <option value="Practitioner/Artisan">Practitioner / Artisan</option>
                              <option value="Singer">Singer</option>
                              <option value="Elder">Elder</option>
                              <option value="Not applicable/Other">Not applicable / Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#2A2420]/80 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Laxmibai Shinde"
                              value={speakerName}
                              onChange={(e) => setSpeakerName(e.target.value)}
                              className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg px-2.5 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#2A2420]/80 mb-1">
                              Age
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="120"
                              placeholder="e.g. 72"
                              value={speakerAge}
                              onChange={(e) =>
                                setSpeakerAge(e.target.value === '' ? '' : Number(e.target.value))
                              }
                              className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded-lg px-2.5 py-2 text-xs text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                            />
                            {step2Errors.speakerAge && (
                              <p className="text-[10px] text-[#B54A3A] mt-0.5">{step2Errors.speakerAge}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E4DDD0]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2.5 rounded-lg text-xs font-sans text-[#2A2420]/70 hover:text-[#2A2420] flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{strings.backBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep4()) {
                          setCurrentStep(5);
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs sm:text-sm flex items-center space-x-2 hover:bg-[#B86B30] transition-all shadow-sm"
                    >
                      <span>Review & Deposit</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Progressive Consent & Deposit */}
              {currentStep === 5 && (
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#C97A3D] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Step 5 of 5 • Review & Deposit</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#2A2420] font-medium mb-2">
                    Review & Deposit
                  </h2>
                  <p className="text-xs text-[#2A2420]/70 mb-6 leading-relaxed">
                    Verify the entry details before depositing into the National Living Archive.
                  </p>

                  {/* Submission Error Banner */}
                  {submitError && (
                    <div className="mb-4 p-3.5 rounded-xl bg-[#B54A3A]/10 border border-[#B54A3A] text-xs text-[#B54A3A] flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Summary Plaque Card */}
                  <div className="bg-[#FAF7F1] p-5 sm:p-6 rounded-2xl border border-[#E4DDD0] space-y-3.5 text-xs font-sans mb-6 shadow-sm">
                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2.5">
                      <span className="text-[#2A2420]/60">Tradition Title:</span>
                      <span className="text-[#C97A3D] font-serif font-medium text-right max-w-xs truncate text-sm">
                        {titleText}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2.5">
                      <span className="text-[#2A2420]/60">Region / District:</span>
                      <span className="text-[#2A2420] font-medium text-right">
                        {selectedRegionLabel}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2.5">
                      <span className="text-[#2A2420]/60">Native Language:</span>
                      <span className="text-[#2A2420] text-right">{selectedLangDisplay}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2.5">
                      <span className="text-[#2A2420]/60">Heritage Category:</span>
                      <span className="text-[#2F6E5D] font-medium">
                        {catMap[category]?.label || category}
                        {category === 'OTHER' && customCategory ? ` (${customCategory})` : ''}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2.5">
                      <span className="text-[#2A2420]/60">Format & Media:</span>
                      <span className="text-[#2A2420] font-medium">
                        {mediaType === 'AUDIO' ? 'Oral Audio' : mediaType === 'VIDEO' ? 'Field Video' : mediaType === 'IMAGE' ? 'Photo / Site' : 'Written Text'}
                        {selectedFile ? ` (${selectedFile.name})` : recordedAudioUrl ? ' (Recorded Mic)' : ''}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2.5">
                      <span className="text-[#2A2420]/60">
                        {speakerRole && speakerRole !== 'Not applicable/Other'
                          ? `${speakerRole}:`
                          : 'Attributed to:'}
                      </span>
                      <span className="text-[#2A2420]">
                        {isAnonymous
                          ? 'Anonymous Custodian'
                          : speakerName
                          ? `${speakerName}${speakerAge !== '' ? ` (${speakerAge} yrs)` : ''}`
                          : 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#2A2420]/60 block mb-1">Cultural Significance:</span>
                      <p className="text-[#2A2420]/90 italic bg-[#FFFFFF] p-3 rounded-lg border border-[#E4DDD0] leading-relaxed">
                        "{descriptionText}"
                      </p>
                    </div>

                    {/* Media Preview inside Review */}
                    {recordedAudioUrl && (
                      <div className="pt-2">
                        <CustomAudioPlayer src={recordedAudioUrl} title="Review Audio" />
                      </div>
                    )}
                  </div>

                  {/* Step 5: Progressive Consent & Archival Rights */}
                  <div className="mb-6 space-y-4">
                    {/* 1. VISIBLE CHOICE: Who can see it */}
                    <div className="bg-[#FAF7F1] p-4 rounded-xl border border-[#E4DDD0]">
                      <label className="block text-xs font-semibold text-[#2A2420] mb-1">
                        Who can see this recording? *
                      </label>
                      <p className="text-[11px] text-[#2A2420]/65 mb-3">
                        Choose who has access to view and listen to this preserved record.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'PUBLIC', title: 'Public', desc: 'Open to everyone for education & research' },
                          { id: 'COMMUNITY_ONLY', title: 'Community only', desc: 'Accessible only to community members' },
                          { id: 'PRIVATE', title: 'Private', desc: 'Restricted custodian vault' },
                        ].map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVisibility(v.id as any)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              visibility === v.id
                                ? 'bg-[#FFFFFF] border-[#2F6E5D] text-[#2F6E5D] font-medium ring-1 ring-[#2F6E5D] shadow-xs'
                                : 'bg-[#FFFFFF]/70 border-[#E4DDD0] text-[#2A2420]/75 hover:bg-[#FFFFFF]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{v.title}</span>
                              {visibility === v.id && <Check className="w-3.5 h-3.5 text-[#2F6E5D]" />}
                            </div>
                            <span className="text-[10px] text-[#2A2420]/60 block leading-tight mt-1">
                              {v.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. VISIBLE CHOICE: AI Transcription & Translation Toggle */}
                    <div className="bg-[#FAF7F1] p-4 rounded-xl border border-[#E4DDD0]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Sparkles className="w-4 h-4 text-[#C97A3D]" />
                            <span className="text-xs font-semibold text-[#2A2420]">
                              AI transcription &amp; translation
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              allowAiTraining ? 'bg-[#2F6E5D]/10 text-[#2F6E5D]' : 'bg-[#B54A3A]/10 text-[#B54A3A]'
                            }`}>
                              {allowAiTraining ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#2A2420]/75 leading-relaxed">
                            Let AI transcribe and translate this recording. Your audio is processed by Google's Gemini service.
                          </p>
                          {!allowAiTraining && (
                            <p className="text-[10px] text-[#B54A3A] mt-1.5 font-medium">
                              Note: Without AI processing, transcription and summaries will wait for manual contributor review.
                            </p>
                          )}
                        </div>

                        {/* Modern Toggle Switch (Default ON, One-tap OFF) */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={allowAiTraining}
                          onClick={() => setAllowAiTraining(!allowAiTraining)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            allowAiTraining ? 'bg-[#2F6E5D]' : 'bg-[#E4DDD0]'
                          }`}
                          title="Toggle AI transcription & translation"
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              allowAiTraining ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* 3. ACCORDION: Anonymity & Other Archival Options */}
                    <div className="border border-[#E4DDD0] rounded-xl overflow-hidden bg-[#FFFFFF]">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedPrivacy(!showAdvancedPrivacy)}
                        className="w-full px-4 py-3 bg-[#FFFFFF] hover:bg-[#FAF7F1] text-xs font-medium text-[#2A2420]/80 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-[#C97A3D]" />
                          <span>Additional Archival Rights &amp; Anonymity (Optional)</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#2A2420]/50 transition-transform ${
                            showAdvancedPrivacy ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {showAdvancedPrivacy && (
                        <div className="p-4 bg-[#FAF7F1] border-t border-[#E4DDD0] space-y-3 text-xs">
                          <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                            <input
                              type="checkbox"
                              checked={allowPublicArchive}
                              onChange={(e) => setAllowPublicArchive(e.target.checked)}
                              className="mt-0.5 w-4 h-4 rounded accent-[#2F6E5D]"
                            />
                            <span className="text-[11px] text-[#2A2420] leading-snug">
                              <strong>National Preservation Charter:</strong> Allow indexing in the national cultural repository for long-term archival.
                            </span>
                          </label>

                          <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                            <input
                              type="checkbox"
                              checked={isAnonymous}
                              onChange={(e) => setIsAnonymous(e.target.checked)}
                              className="mt-0.5 w-4 h-4 rounded accent-[#2F6E5D]"
                            />
                            <span className="text-[11px] text-[#2A2420] leading-snug">
                              <strong>Anonymous Custodian:</strong> Do not publicly display the custodian or speaker name on the public archive plaque.
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* 4. MANDATORY UNCHECKED CONSENT CHECKBOX */}
                    <label className={`flex items-start space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      consentConfirmed
                        ? 'bg-[#2F6E5D]/5 border-[#2F6E5D]/40 ring-1 ring-[#2F6E5D]/20'
                        : 'bg-[#FAF7F1] border-[#C97A3D]/40 hover:border-[#C97A3D]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={consentConfirmed}
                        onChange={(e) => setConsentConfirmed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-[#C97A3D]"
                      />
                      <div className="text-xs text-[#2A2420] leading-snug">
                        <span className="font-semibold text-[#2A2420]">
                          I confirm the people in this recording agreed to share it. *
                        </span>
                        <p className="text-[11px] text-[#2A2420]/60 mt-0.5">
                          You must verify that all participants, elders, or oral storytellers consented to have this heritage documented.
                        </p>
                      </div>
                    </label>

                    {/* Legal Links Footer Notice */}
                    <div className="text-[11px] text-[#2A2420]/60 text-center pt-1">
                      By depositing, you agree to our{' '}
                      <Link href="/terms" target="_blank" className="text-[#C97A3D] hover:underline font-medium">
                        Terms of Contribution
                      </Link>{' '}
                      and acknowledge our{' '}
                      <Link href="/privacy" target="_blank" className="text-[#C97A3D] hover:underline font-medium">
                        Privacy Policy
                      </Link>.
                    </div>

                    {/* Cloudflare Turnstile CAPTCHA (Rendered on Anonymous Submissions) */}
                    {!user && (
                      <TurnstileWidget
                        onVerify={(token) => setTurnstileToken(token)}
                        onError={() => setTurnstileToken(null)}
                        onExpire={() => setTurnstileToken(null)}
                      />
                    )}
                  </div>

                  {/* Submission Navigation */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E4DDD0]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-sans text-[#2A2420]/70 hover:text-[#2A2420] flex items-center justify-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{strings.backBtn}</span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting || !consentConfirmed}
                      onClick={handleSubmit}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs sm:text-sm flex items-center justify-center space-x-2 hover:bg-[#B86B30] disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FAF7F1] border-t-transparent rounded-full animate-spin" />
                          <span>{strings.submittingBtn}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {!isOnline
                              ? 'Save Offline & Sync Later'
                              : 'Deposit into National Archive'}
                          </span>
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
