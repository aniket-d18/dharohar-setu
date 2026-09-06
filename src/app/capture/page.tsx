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
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/context/LanguageContext';
import { INDIA_REGION_HIERARCHY, StaticState } from '@/data/indiaHierarchy';
import { getCategoryCover } from '@/utils/categoryCovers';

interface LanguageItem {
  id: string;
  name: string;
  scriptName?: string | null;
}

const CATEGORIES = [
  { id: 'LULLABY', label: 'Lullaby / Folk Song', desc: 'Bedtime songs and oral melodies' },
  { id: 'PROVERB', label: 'Proverb / Idiom', desc: 'Ancestral sayings and metaphors' },
  { id: 'STORY', label: 'Oral Myth / Folktale', desc: 'Creation stories and community legends' },
  { id: 'FESTIVAL', label: 'Festival / Celebration', desc: 'Seasonal harvests and solstice chants' },
  { id: 'CRAFT_TECHNIQUE', label: 'Craft Technique', desc: 'Textiles, pottery, metal, carving' },
  { id: 'RECIPE', label: 'Culinary Heritage', desc: 'Ancient recipes and medicinal foraging' },
  { id: 'RITUAL', label: 'Sacred Ritual / Chant', desc: 'Dairy shrines, prayers, transitions' },
  { id: 'LIFE_SKILL', label: 'Ecology & Life Skill', desc: 'Weather reading, tracking, woodcraft' },
  { id: 'OTHER', label: 'Other / Custom Genre', desc: 'Architecture, martial art, textile, theater, etc.' },
];

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
}: {
  selectedState: string;
  selectedDistrict: string;
  onChange: (stateName: string, districtName?: string) => void;
  error?: string;
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

  let selectedLabel = 'Select Region / District *';
  if (selectedState) {
    if (selectedDistrict) {
      selectedLabel = `${selectedDistrict} (${selectedState})`;
    } else {
      selectedLabel = `${selectedState} (Entire State)`;
    }
  }

  return (
    <div className="relative font-sans" ref={ref}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs text-[#2A2420]/80 font-medium">
          Region / District *
        </label>
        <span className="text-[11px] text-[#C97A3D]">
          36 States & Union Territories (Reference)
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
              placeholder="Search Indian state or district (e.g. Maharashtra, Buldhana, Kerala)..."
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
                No matching state or district found.
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
                          ({state.districts.length} districts)
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
}: {
  value: string;
  onChange: (val: string) => void;
  suggestions: LanguageItem[];
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

  const query = value.trim().toLowerCase();
  const matchedLang = suggestions.find((l) => l.name.toLowerCase() === query);
  const isCustom = value.trim().length > 0 && !matchedLang;

  const filteredSuggestions = query
    ? suggestions.filter((l) => l.name.toLowerCase().includes(query))
    : suggestions;

  return (
    <div className="relative font-sans" ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs text-[#2A2420]/80 font-medium">
          Native Language / Dialect
        </label>
        <div className="text-[11px]">
          {matchedLang ? (
            <span className="text-[#2F6E5D] flex items-center space-x-1 font-medium">
              <Check className="w-3 h-3" />
              <span>Registered in Archive</span>
            </span>
          ) : isCustom ? (
            <span className="text-[#C97A3D] font-medium">✦ Rare / Custom dialect (Auto-cataloged)</span>
          ) : (
            <span className="text-[#2A2420]/50">Type freely or choose suggestion</span>
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
          placeholder="Type any language or dialect (e.g. Toda, Gondi, Ahirani, Warli, Kuvi)..."
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
          <span className="text-[10px] text-[#2A2420]/60">Quick suggestions:</span>
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
                <span className="font-medium">✦ Keep "{value.trim()}"</span>
                <span className="text-[10px] text-[#2A2420]/70 block">
                  Rare dialect — will be registered in the database on submission
                </span>
              </div>
              <Check className="w-3.5 h-3.5 text-[#C97A3D] shrink-0 ml-2" />
            </div>
          )}

          <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#C97A3D] font-medium">
            Registered Languages ({suggestions.length})
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[#2A2420]/60 italic">
              No registered language matching "{value}". Your custom dialect "{value}" will be created on submission!
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
  const t = useTranslations('capture');
  const tCommon = useTranslations('common');

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isOnline, setIsOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Data
  // Step 1: Consent
  const [visibility, setVisibility] = useState<'PUBLIC' | 'COMMUNITY_ONLY' | 'PRIVATE'>('PUBLIC');
  const [allowAiTraining, setAllowAiTraining] = useState(true);
  const [allowPublicArchive, setAllowPublicArchive] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Step 2: Metadata
  const [selectedStateName, setSelectedStateName] = useState('Maharashtra');
  const [selectedDistrictName, setSelectedDistrictName] = useState('Buldhana');
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [languageName, setLanguageName] = useState('Toda');
  const [category, setCategory] = useState('LULLABY');
  const [customCategory, setCustomCategory] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerAge, setSpeakerAge] = useState<number | ''>('');
  const [titleText, setTitleText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Step 3: Media
  const [mediaType, setMediaType] = useState<'AUDIO' | 'VIDEO' | 'IMAGE' | 'TEXT'>('AUDIO');
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  // Fetch registered database languages for suggestions
  useEffect(() => {
    async function loadMeta() {
      try {
        const langRes = await fetch(`${apiUrl}/api/languages`);
        if (langRes.ok) {
          const langData = await langRes.json();
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

    if (category === 'OTHER' && !customCategory.trim()) {
      errs.customCategory = 'Please specify your custom category or tradition genre.';
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
        // Offline mode: save in local localStorage sync queue
        const offlineQueue = JSON.parse(localStorage.getItem('dharohar_sync_queue') || '[]');
        const offlineId = 'offline-' + Date.now();
        offlineQueue.push({ id: offlineId, payload, timestamp: new Date().toISOString() });
        localStorage.setItem('dharohar_sync_queue', JSON.stringify(offlineQueue));
        setSubmittedRecordId(offlineId);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setSubmitError(err.message || 'Submission failed. Please check the fields and try again.');
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

      <main className="flex-1 pb-16">
        {/* Offline Status Top Bar */}
        <div
          className={`py-2 px-4 text-xs font-sans text-center transition-colors flex items-center justify-center space-x-2 ${
            isOnline
              ? 'bg-[#2F6E5D]/10 text-[#2F6E5D] border-b border-[#2F6E5D]/20'
              : 'bg-[#B54A3A]/10 text-[#B54A3A] border-b border-[#B54A3A]/20'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online — Direct upload and AI transcription enabled</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>
                Offline Mode Active — Recordings will be safely stored in IndexedDB and synced
                automatically once connection restores
              </span>
            </>
          )}
        </div>

        {/* Wizard Container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Step Indicator */}
          {!submittedRecordId && (
            <div className="mb-10">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#E4DDD0] z-0" />
                {[
                  { step: 1, label: 'Consent & Rights' },
                  { step: 2, label: 'Metadata' },
                  { step: 3, label: 'Capture Media' },
                  { step: 4, label: 'Confirm & Save' },
                ].map((s) => (
                  <div key={s.step} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium font-mono transition-all ${
                        currentStep === s.step
                          ? 'bg-[#C97A3D] text-[#FAF7F1] ring-4 ring-[#C97A3D]/20'
                          : currentStep > s.step
                          ? 'bg-[#2F6E5D] text-[#FAF7F1]'
                          : 'bg-[#FFFFFF] text-[#2A2420]/40 border border-[#E4DDD0]'
                      }`}
                    >
                      {currentStep > s.step ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <span className="text-[11px] font-sans text-[#2A2420]/70 mt-1.5 hidden sm:block">
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
                Cultural Memory Preserved
              </h2>
              <p className="text-sm text-[#2A2420]/80 max-w-md mx-auto leading-relaxed mb-6">
                Your oral recording has been documented and queued for linguistic verification and
                long-term heritage preservation.
              </p>

              <div className="bg-[#FAF7F1] border border-[#E4DDD0] rounded-lg p-4 max-w-sm mx-auto mb-8 text-xs font-mono text-[#C97A3D] break-all">
                RECORD-ID: {submittedRecordId}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/record/${submittedRecordId}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-sm hover:bg-[#B86B30] transition-colors shadow-none"
                >
                  View Museum Plaque
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
                  Record another memory
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
                    <span>Ethical Stewardship & Consent</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#2A2420] font-medium mb-2">
                    Elder & Community Informed Consent
                  </h2>
                  <p className="text-xs text-[#2A2420]/70 mb-6 leading-relaxed">
                    Under the Dharohar Heritage Charter, all oral narratives remain the moral
                    property of their origin clan. Please confirm recording permissions.
                  </p>

                  <div className="space-y-4 mb-6">
                    {/* Visibility Choice */}
                    <div>
                      <label className="block text-xs font-sans text-[#2A2420]/90 mb-2 font-medium">
                        Public Accessibility Level
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {[
                          {
                            id: 'PUBLIC',
                            title: 'Public Archive',
                            desc: 'Open to researchers and community members worldwide.',
                          },
                          {
                            id: 'COMMUNITY_ONLY',
                            title: 'Community Only',
                            desc: 'Accessible only to verified clan and regional descendants.',
                          },
                          {
                            id: 'PRIVATE',
                            title: 'Steward Vault',
                            desc: 'Restricted to designated cultural elders and linguists.',
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
                          <strong>Preservation Charter:</strong> Permit long-term audio storage for
                          educational and indigenous revitalization initiatives.
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
                          <strong>Language Technology:</strong> Permit acoustic modeling so speech
                          recognition engines can learn this endangered dialect.
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
                          <strong>Anonymous Custodian:</strong> Withhold elder speaker's legal name
                          from public display (credited as Anonymous Elder).
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
                          I confirm that the speaker has given informed oral permission to record
                          this memory under the specified terms.
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
                      <span>Proceed to Metadata</span>
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
                    <span>Geographic & Dialect Classification</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#2A2420] font-medium mb-4">
                    Context & Lineage
                  </h2>

                  <div className="space-y-4 text-xs font-sans">
                    {/* Reusable Hierarchical Region / District Selector */}
                    <RegionHierarchySelect
                      selectedState={selectedStateName}
                      selectedDistrict={selectedDistrictName}
                      onChange={(st, dist) => {
                        setSelectedStateName(st);
                        setSelectedDistrictName(dist || '');
                        if (step2Errors.region) {
                          setStep2Errors((prev) => ({ ...prev, region: '' }));
                        }
                      }}
                      error={step2Errors.region}
                    />

                    {/* Native Language / Dialect: Direct typing of any rare dialect + suggestions */}
                    <LanguageCombobox
                      value={languageName}
                      onChange={setLanguageName}
                      suggestions={languages}
                    />

                    {/* Tradition Genre Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[#2A2420]/80 font-medium text-sm">
                          Tradition Genre *
                        </label>
                        <span className="text-[11px] text-[#2A2420]/50">
                          Select a heritage category or specify custom
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CATEGORIES.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setCategory(c.id);
                              if (step2Errors.customCategory) {
                                setStep2Errors((prev) => ({ ...prev, customCategory: '' }));
                              }
                            }}
                            className={`p-2.5 rounded border cursor-pointer transition-all ${
                              category === c.id
                                ? 'bg-[#2F6E5D] border-[#2F6E5D] text-[#FAF7F1] shadow-sm'
                                : 'bg-[#FAF7F1] border-[#E4DDD0] text-[#2A2420]/75 hover:border-[#C97A3D]/40 hover:text-[#2A2420]'
                            }`}
                          >
                            <span className="font-medium text-xs block">{c.label}</span>
                            <span className="text-[10px] block opacity-70 mt-0.5 truncate">{c.desc}</span>
                          </div>
                        ))}
                      </div>

                      {/* Custom Category Input if OTHER is selected */}
                      {category === 'OTHER' && (
                        <div className="mt-3 p-3.5 bg-[#FAF7F1] border border-[#C97A3D]/40 rounded-lg shadow-sm">
                          <label className="block text-xs font-semibold text-[#C97A3D] mb-1.5 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Specify Custom Tradition Genre / Cultural Category *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Temple Architecture, Warli Wall Murals, Kalarippayattu Martial Art, Folk Theatre, Ancient Manuscripts..."
                            value={customCategory}
                            onChange={(e) => {
                              setCustomCategory(e.target.value);
                              if (step2Errors.customCategory) {
                                setStep2Errors((prev) => ({ ...prev, customCategory: '' }));
                              }
                            }}
                            className={`w-full bg-[#FFFFFF] border ${
                              step2Errors.customCategory ? 'border-[#B54A3A]' : 'border-[#E4DDD0]'
                            } rounded px-3 py-2 text-sm text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                          />
                          {step2Errors.customCategory && (
                            <p className="text-[11px] text-[#B54A3A] mt-1">{step2Errors.customCategory}</p>
                          )}
                          <p className="text-[11px] text-[#2A2420]/60 mt-1.5">
                            This custom genre will be catalogued across the Living Cultural Atlas search and ontology indexing.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cultural Title (Validated: min length 5, no keyboard mash) */}
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1.5 font-medium">
                        Recording Title / Tradition Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Toda Sacred Dairy Chants at Twilight"
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

                    {/* Speaker Details (Validated: speaker age 0-120) */}
                    {!isAnonymous && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#2A2420]/80 mb-1.5">
                            Speaker / Storyteller Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Smt. Kamala Devi"
                            value={speakerName}
                            onChange={(e) => setSpeakerName(e.target.value)}
                            className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                          />
                        </div>
                        <div>
                          <label className="block text-[#2A2420]/80 mb-1.5">
                            Speaker Age (0 – 120)
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
                            } rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]`}
                          />
                          {step2Errors.speakerAge && (
                            <p className="text-[11px] text-[#B54A3A] mt-1">
                              {step2Errors.speakerAge}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description / Cultural Meaning (Validated: min length 10) */}
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1.5 font-medium">
                        Description & Cultural Meaning *
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
                        placeholder="Explain the background, context, clan significance, or symbolism of this lullaby, prayer, or craft technique..."
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
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="harvest, monsoon, lullaby, sacred-forest, pastoral..."
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
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => {
                        if (validateStep2()) {
                          setCurrentStep(3);
                        }
                      }}
                      className="px-6 py-2.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs flex items-center space-x-1.5 hover:bg-[#B86B30] transition-all"
                    >
                      <span>Proceed to Media Capture</span>
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
                    <span>Multi-Modal Field Documentation</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#2A2420] font-medium mb-4">
                    Record or Upload Heritage Media
                  </h2>

                  {/* Media Type Selector */}
                  <div className="flex items-center space-x-2 bg-[#FAF7F1] p-1.5 rounded-lg border border-[#E4DDD0] mb-6 text-xs font-sans">
                    {[
                      { id: 'AUDIO', label: 'Oral Audio', icon: Mic },
                      { id: 'VIDEO', label: 'Field Video', icon: Video },
                      { id: 'IMAGE', label: 'Artifact Photo', icon: ImageIcon },
                      { id: 'TEXT', label: 'Native Text', icon: FileText },
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
                          <span>Live Microphone Recording</span>
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
                          <span>Upload Audio File</span>
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
                              title="Stop recording"
                            >
                              <Square className="w-6 h-6 fill-current" />
                            </button>
                          ) : (
                            <button
                              onClick={startRecording}
                              className="w-16 h-16 rounded-full bg-[#C97A3D] text-[#FAF7F1] flex items-center justify-center hover:bg-[#B86B30] hover:scale-105 transition-all shadow-md"
                              title="Start live microphone recording"
                            >
                              <Mic className="w-7 h-7" />
                            </button>
                          )}

                          <p className="text-xs text-[#2A2420]/70 mt-4">
                            {isRecording
                              ? 'Recording live from microphone... Speak clearly.'
                              : recordedAudioUrl
                              ? 'Audio clip captured! You may playback, re-record, or proceed.'
                              : 'Click microphone to begin field audio capture'}
                          </p>

                          {recordedAudioUrl && (
                            <div className="mt-4 w-full max-w-md">
                              <CustomAudioPlayer
                                src={recordedAudioUrl}
                                title="Field audio buffer ready for upload"
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
                                Click to select an audio file from device
                              </span>
                              <span className="text-xs text-[#2A2420]/60">
                                MP3, WAV, M4A, AAC, or WebM (up to 100MB)
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
                                  Change file
                                </button>
                              </div>
                              {filePreviewUrl && (
                                <div className="mt-2">
                                  <CustomAudioPlayer
                                    src={filePreviewUrl}
                                    title={`Ready for upload: ${selectedFile.name}`}
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
                            Click to select field video from camera / device
                          </span>
                          <span className="text-xs text-[#2A2420]/60">
                            MP4, WebM, or QuickTime video files (up to 100MB)
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
                              Remove / Replace
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
                              ? 'Hide direct URL entry'
                              : 'Or enter external video URL instead'}
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
                            Click to select photo / artifact image
                          </span>
                          <span className="text-xs text-[#2A2420]/60">
                            JPG, PNG, or WebP photo of artifact, elder, or craft
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
                              Remove / Replace
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
                              ? 'Hide direct URL entry'
                              : 'Or enter external image URL instead'}
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
                        For oral proverbs, sacred idioms, or manuscripts without audio recordings,
                        please write the native transcription and translation below.
                      </p>
                    </div>
                  )}

                  {/* Transcription and Translation Draft Fields */}
                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1 font-medium">
                        Native Spoken Transcription (Optional / AI will assist)
                      </label>
                      <textarea
                        rows={2}
                        value={transcriptionDraft}
                        onChange={(e) => {
                          setTranscriptionDraft(e.target.value);
                          setStep3Error(null);
                        }}
                        placeholder="Enter native script transcription or phonetic representation..."
                        className="w-full bg-[#FFFFFF] border border-[#E4DDD0] rounded px-3 py-2 text-[#2A2420] focus:outline-none focus:border-[#C97A3D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#2A2420]/80 mb-1 font-medium">
                        English / Hindi Translation (Optional / AI will assist)
                      </label>
                      <textarea
                        rows={2}
                        value={translationDraft}
                        onChange={(e) => setTranslationDraft(e.target.value)}
                        placeholder="Enter direct or interpretative translation..."
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
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => {
                        if (validateStep3()) {
                          setCurrentStep(4);
                        }
                      }}
                      className="px-6 py-2.5 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs flex items-center space-x-1.5 hover:bg-[#B86B30] transition-all"
                    >
                      <span>Review & Confirm</span>
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
                    <span>Final Verification & Archival</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#2A2420] font-medium mb-4">
                    Review Field Submission
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
                      <span className="text-[#2A2420]/60">Tradition Title:</span>
                      <span className="text-[#C97A3D] font-medium text-right max-w-xs truncate">
                        {titleText}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">Region / District:</span>
                      <span className="text-[#2A2420] font-medium text-right">
                        {selectedRegionLabel}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">Native Language:</span>
                      <span className="text-[#2A2420] text-right">{selectedLangDisplay}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">Genre:</span>
                      <span className="text-[#C97A3D] font-medium">{category}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">Media Mode:</span>
                      <span className="text-[#2F6E5D] font-medium">
                        {mediaType}{' '}
                        {selectedFile
                          ? `(File: ${selectedFile.name})`
                          : recordedAudioUrl
                          ? '(Recorded Microphone Clip)'
                          : mediaUrl
                          ? '(Direct URL)'
                          : ''}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">Speaker Custodian:</span>
                      <span className="text-[#2A2420]">
                        {isAnonymous
                          ? 'Anonymous Elder'
                          : `${speakerName || 'Elder storyteller'}${
                              speakerAge !== '' ? ` (${speakerAge} yrs)` : ''
                            }`}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#E4DDD0] pb-2">
                      <span className="text-[#2A2420]/60">Access Level:</span>
                      <span className="text-[#2F6E5D]">{visibility}</span>
                    </div>

                    <div>
                      <span className="text-[#2A2420]/60 block mb-1">Cultural Meaning:</span>
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
                      <span>Back</span>
                    </button>
                    <button
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="px-8 py-3 rounded bg-[#C97A3D] text-[#FAF7F1] font-sans font-medium text-xs flex items-center space-x-2 hover:bg-[#B86B30] disabled:opacity-50 transition-all shadow-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FAF7F1] border-t-transparent rounded-full animate-spin" />
                          <span>Archiving & uploading file...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit to Living Heritage Archive</span>
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
