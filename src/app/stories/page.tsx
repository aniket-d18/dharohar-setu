'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  BookOpen,
  Clock,
  MapPin,
  Volume2,
  ArrowRight,
  Share2,
  Bookmark,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Play,
  Pause,
  Compass,
  Heart,
  Quote,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: 'Linguistic' | 'Craft' | 'Ritual' | 'Sacred Geography' | 'Ethnobotany';
  region: string;
  state: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  audioDuration?: string;
  hasAudioSnippet?: boolean;
  archiveCategory: string;
  pullQuote: string;
  fullContent: {
    lead: string;
    section1Heading: string;
    section1Text: string;
    section2Heading: string;
    section2Text: string;
    archivalNote: string;
  };
}

const CATEGORIES = [
  'All Chronicles',
  'Linguistic',
  'Craft',
  'Ritual',
  'Sacred Geography',
  'Ethnobotany',
];

const FEATURED_STORY: Story = {
  id: 'great-andamanese',
  title: 'The Last Chants of the Great Andamanese',
  subtitle: 'Deciphering 70,000 years of unbroken human memory on the brink of silence',
  excerpt: 'On Strait Island in the Bay of Bengal, fewer than fifty living people hold the remnants of Jeru, Bo, and Sare — linguistic lineages distinct from any other language family on Earth. Their oral songs map oceanic currents, typhoon warnings, and sacred turtle migrations.',
  category: 'Linguistic',
  region: 'Strait Island, Andaman Archipelago',
  state: 'Andaman & Nicobar Islands',
  author: 'Field Expedition Team / CIIL Mysuru',
  authorRole: 'Senior Ethnolinguist',
  date: 'Archived September 2026',
  readTime: '7 min read',
  image: '/images/categories/oral-stories.jpg',
  hasAudioSnippet: true,
  audioDuration: '03:14',
  archiveCategory: 'STORY',
  pullQuote: 'When Boa Sr. passed away in 2010, an entire universe of songs disappeared overnight. We are not just cataloging words; we are rescuing human perception itself.',
  fullContent: {
    lead: 'The Great Andamanese languages represent one of the oldest human linguistic branches still partially surviving. Unlike Indo-European or Dravidian languages, the grammatical architecture of Jeru is rooted entirely in body-part somatization — where every thought, emotion, and topographical orientation is anchored to the human anatomy.',
    section1Heading: 'The Geometry of Oceanic Songs',
    section1Text: 'During the winter turtle migrations, elders would gather on the eastern reefs to sing the \'Bile-Lau\' — a rhythmic polyphonic cadence that mimics the surge of rip tides against coral shallows. The cadence was not merely aesthetic; navigators memorized the exact interval between vocal pulses to gauge tidal clearance across hidden subterranean reefs.',
    section2Heading: 'The Urgency of Digital Preservation',
    section2Text: 'With the shift toward Hindi among younger generations, the acoustic memory of phonetic clicks, glottal stops, and archaic verb conjugations is diminishing at an unprecedented velocity. Dharohar Setu has collaborated with island elders to record high-fidelity 96kHz acoustic masters, mapping over 240 phonetic variants into an immutable digital repository.',
    archivalNote: 'Recorded under Ethical Field Protocol CIIL-EFP-2024. Community consent verified by Tribal Welfare Council.',
  },
};

const STORIES: Story[] = [
  {
    id: 'rogan-art',
    title: 'Rogan Art: The 400-Year Miracle of Castor Oil and Earth',
    subtitle: 'Inside Nirona village where one family preserves a Mughal-era chromatic secret',
    excerpt: 'Using whole boiled castor oil aged into a golden jelly, master artisans in Kutch pull threads of pure mineral paint with a six-inch steel rod without ever touching the fabric.',
    category: 'Craft',
    region: 'Nirona, Kutch',
    state: 'Gujarat',
    author: 'Khatri Abdulgafur & Heritage Guild',
    authorRole: 'Master Artisan & Cultural Steward',
    date: 'August 2026',
    readTime: '5 min read',
    image: '/images/categories/sacred-crafts.jpg',
    hasAudioSnippet: true,
    audioDuration: '02:40',
    archiveCategory: 'CRAFT_TECHNIQUE',
    pullQuote: 'The rod never touches the cloth. The thread of paint hangs in the air, guided only by the breath and the warmth of the palm.',
    fullContent: {
      lead: 'In the arid expanse of Kutch, the Khatri family has sustained the art of Rogan for eight generations. Castor seed oil is boiled for two continuous days until it condenses into a pliable residue known as \'rogan\'. When mixed with natural earth pigments, it forms an elastic paint that never cracks.',
      section1Heading: 'Mirror Symmetry Without Measurement',
      section1Text: 'The artisan places a small dollop of colored rogan on his palm, warms it with a blunt brass rod, and pulls micro-thin filaments across half a folded fabric. When folded and pressed together, the pattern transfers symmetrically with surgical precision, creating intricate \'Tree of Life\' and Persian floral medallions.',
      section2Heading: 'Sustainable Resurgence',
      section2Text: 'Once facing near-extinction as synthetic machine prints flooded local bazaars, Rogan has undergone an international revival through dedicated archiving and heritage tourism. The Dharohar Setu team documented the entire twelve-step preparation cycle in 4K multi-angle video.',
      archivalNote: 'Archived under Crafts & Industrial Arts Division (M-04), National Registry.',
    },
  },
  {
    id: 'spiti-chants',
    title: 'Rain Invocations of the High Monasteries',
    subtitle: 'Sacred acoustics and wind instruments at 12,500 feet in the Trans-Himalayas',
    excerpt: 'In the mud-brick chambers of Tabo and Ki monasteries, Buddhist monks sustain polyphonic overtone chanting developed over ten centuries to summon glacial melt and protective monsoons.',
    category: 'Ritual',
    region: 'Spiti Valley',
    state: 'Himachal Pradesh',
    author: 'Lobsang Tsering & Field Acoustics Team',
    authorRole: 'Ethnomusicologist',
    date: 'July 2026',
    readTime: '6 min read',
    image: '/images/categories/rituals.jpg',
    hasAudioSnippet: true,
    audioDuration: '04:12',
    archiveCategory: 'RITUAL',
    pullQuote: 'The dungchen horn does not merely make sound; it vibrates the limestone cliffs, vibrating moisture from low clouds into the riverbed.',
    fullContent: {
      lead: 'Spiti Valley remains one of the world\'s most extreme cold deserts. Here, rain is both a lifeline and a fragile miracle. The sacred liturgy of the Gyuto and Tabo traditions relies on deep-throat biphonic chanting, where a single vocalist produces both a fundamental tone and its octave simultaneously.',
      section1Heading: 'Acoustic Architecture of Mud Gompas',
      section1Text: 'The 1,000-year-old assembly halls of Tabo Monastery were built using sun-dried mud bricks and poplar timber, creating an acoustic decay time of precisely 2.4 seconds — ideal for sustaining long low-frequency vocal drone notes that resonate within the chest cavity.',
      section2Heading: 'Field Recordings Under Sub-Zero Conditions',
      section2Text: 'Our preservation unit recorded the seven-day Monlam prayer cycle using ambisonic microphone arrays, capturing both spatial acoustics and the exact overtone structure of the six-foot long dungchen brass horns.',
      archivalNote: 'Field documentation supported by Spiti Cultural Preservation Trust.',
    },
  },
  {
    id: 'toda-buffalo-odes',
    title: 'Toda Buffalo Odes: Pastoral Poetics of the Nilgiri Hills',
    subtitle: 'Ancient metered songs honoring the sacred sacred water buffalo herds',
    excerpt: 'The Toda community of the Nilgiri plateau compose unwritten epic poems describing every contour of the Shola forest, identifying hundreds of flora and sacred buffalo lineage names.',
    category: 'Linguistic',
    region: 'Nilgiri Biosphere Reserve',
    state: 'Tamil Nadu',
    author: 'Dr. Vasudevan Nambiar',
    authorRole: 'Anthropological Survey Collaborator',
    date: 'June 2026',
    readTime: '5 min read',
    image: '/images/categories/folk-songs.jpg',
    hasAudioSnippet: true,
    audioDuration: '02:18',
    archiveCategory: 'LULLABY',
    pullQuote: 'Every stream, every hilltop rock, and every sacred buffalo has its own unique sung name that exists nowhere in written literature.',
    fullContent: {
      lead: 'The Todas are an indigenous pastoral community residing on the undulating plateaus of the Nilgiri hills. Their unique barrel-vaulted huts and sacred dairy temples are the epicenter of a complex spiritual order that elevates the domestic water buffalo to an object of divine veneration.',
      section1Heading: 'The Language of \'Kón\'',
      section1Text: 'Toda poetry uses an archaic Dravidian substrate characterized by complex consonant clusters and retroflex fricatives. The songs, sung predominantly during the dairy rituals and funeral ceremonies, trace the journey of the soul through the sacred Shola valleys toward the afterlife.',
      section2Heading: 'Environmental Threats to Heritage',
      section2Text: 'The replacement of native Shola grasslands with invasive eucalyptus and tea plantations has disrupted traditional grazing routes, endangering the buffalo strains and the pastoral songs inseparable from them.',
      archivalNote: 'Cross-indexed with Dharohar Setu Geo-Atlas (Region ID: TN-NIL-04).',
    },
  },
  {
    id: 'kalamkari-srikalahasti',
    title: 'Kalamkari: The Painted Word of Temple Storytellers',
    subtitle: 'Bamboo pens, cow dung bleaching, and myrobalan dye along the Swarnamukhi River',
    excerpt: 'In Srikalahasti, temple murals are reborn on cotton fabric using hand-carved bamboo qalam, natural indigo, and madder roots in a ritualistic 23-step purification sequence.',
    category: 'Craft',
    region: 'Srikalahasti, Tirupati',
    state: 'Andhra Pradesh',
    author: 'P. Subramanian',
    authorRole: 'Textile Archivist',
    date: 'May 2026',
    readTime: '6 min read',
    image: '/images/categories/sacred-crafts.jpg',
    hasAudioSnippet: false,
    archiveCategory: 'CRAFT_TECHNIQUE',
    pullQuote: 'Water is the true painter. Without the mineral sweetness of the Swarnamukhi riverbed, the iron black never binds to the cotton thread.',
    fullContent: {
      lead: 'Srikalahasti Kalamkari is one of the few textile traditions where no printing blocks are permitted — every line is drawn freehand using a bamboo reed pen wrapped in pure sheep wool that serves as an ink reservoir.',
      section1Heading: 'Living Illustrated Scriptures',
      section1Text: 'Historically, itinerant troubadours would unroll large Kalamkari tapestries in temple courtyards, chanting the Ramayana and Mahabharata verse by verse as villagers sat by oil lamps. The fabric served as both visual spectacle and theological text.',
      section2Heading: 'Chemical Purity in the Modern Age',
      section2Text: 'The entire palette is strictly organic: yellow from pomegranate rind, blue from fermenting indigo leaves, and black from iron scrap steeped in jaggery water for twenty-one days.',
      archivalNote: 'Certified Geographical Indication (GI) preservation cohort.',
    },
  },
  {
    id: 'kani-arogyapacha',
    title: 'The Kani Tribe’s Arogyapacha: Living Ethnobotany of Agasthyamalai',
    subtitle: 'The eternal energy plant and the indigenous intellectual property revolution',
    excerpt: 'High in the sacred Agasthyamalai hills of Kerala, the Kani community holds centuries of oral medicinal knowledge about Trichopus zeylanicus, a restorative herb that defies physical fatigue.',
    category: 'Ethnobotany',
    region: 'Agasthyamalai Biosphere',
    state: 'Kerala',
    author: 'Field Botanical Council',
    authorRole: 'Ethnobotanical Researcher',
    date: 'April 2026',
    readTime: '4 min read',
    image: '/images/categories/cultural-atlas.jpg',
    hasAudioSnippet: false,
    archiveCategory: 'LIFE_SKILL',
    pullQuote: 'We do not sell the forest; we introduce the seeker to the spirit of the green world.',
    fullContent: {
      lead: 'The Kani community has lived in symbiotic relationship with the moist deciduous forests of the Southern Western Ghats for uncounted generations. In 1987, their traditional knowledge of \'Arogyapacha\' became the global gold standard for the first equitable benefit-sharing model in ethnopharmacology.',
      section1Heading: 'Oral Pharmacopeia Passed in Rhyme',
      section1Text: 'Medicinal knowledge is transmitted through mnemonic chants called \'Pattu\', sung while gathering plants during specific lunar alignments. The chants detail botanical morphology, soil humidity, and exact dosage preparation.',
      section2Heading: 'Preserving Sacred Groves (Kavu)',
      section2Text: 'The Kani maintain over 80 sacred forest pockets where cutting timber or disturbing the canopy is taboo. These groves serve as pristine genetic sanctuaries for critically rare medicinal flora.',
      archivalNote: 'In alignment with the Convention on Biological Diversity (CBD) and Biodiversity Act.',
    },
  },
  {
    id: 'sohrai-murals',
    title: 'Sohrai & Khovar Murals: Earth Pigments of the Autumn Harvest',
    subtitle: 'Women artists of Hazaribagh transform mud house walls into prehistoric canvases',
    excerpt: 'Using river mud, coal powder, kaolin clay, and broken combs, tribal women in Jharkhand paint ancestral bull gods and wildlife motifs reminiscent of 10,000-year-old rock art.',
    category: 'Craft',
    region: 'Hazaribagh',
    state: 'Jharkhand',
    author: 'Sita Devi & Tribal Arts Collective',
    authorRole: 'Community Cultural Lead',
    date: 'March 2026',
    readTime: '5 min read',
    image: '/images/categories/oral-stories.jpg',
    hasAudioSnippet: true,
    audioDuration: '01:55',
    archiveCategory: 'CRAFT_TECHNIQUE',
    pullQuote: 'Our canvas is the mother wall; when the rains arrive, the art returns to the soil, ready to be reborn after the harvest.',
    fullContent: {
      lead: 'Sohrai is the harvest festival celebrated by Santhal, Munda, and Oraon communities. Following the rice harvest, women wash their mud dwellings with cow dung and paint colossal depictions of Pashupati (Lord of Animals), peacocks, and wild stags.',
      section1Heading: 'Comb-Cutting: The Sgraffito of the Forest',
      section1Text: 'In Khovar bridal art, a layer of black manganese-rich mud is applied first, followed by white kaolin. While the white layer is still wet, the artist uses broken comb teeth or fingertips to carve out black silhouettes beneath.',
      section2Heading: 'Documenting Vulnerable Wall Murals',
      section2Text: 'As concrete pukka houses replace traditional mud dwellings, wall mural surfaces are disappearing. Dharohar Setu is creating high-resolution 3D photogrammetric scans of these seasonal murals before they wash away.',
      archivalNote: 'Includes high-resolution photographic archive ID: JH-HAZ-SOH-2026.',
    },
  },
];

export default function StoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Chronicles');
  const [activeStoryModal, setActiveStoryModal] = useState<Story | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [bookmarkedStories, setBookmarkedStories] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredStories = selectedCategory === 'All Chronicles'
    ? STORIES
    : STORIES.filter(s => s.category === selectedCategory);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedStories(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleShare = (story: Story, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText?.(window.location.origin + `/stories#${story.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#2A2420] flex flex-col selection:bg-[#C97A3D]/20">
      <Navbar />

      <main className="flex-1 pb-24 md:pb-12">
        {/* ========================================================= */}
        {/* 1. CINEMATIC EDITORIAL HERO BANNER                        */}
        {/* ========================================================= */}
        <section className="relative bg-[#1A1714] text-[#FAF7F1] overflow-hidden pt-12 sm:pt-16 pb-20 sm:pb-24 border-b border-[#C5A55A]/20">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-15">
            <img
              src="/images/hero-banner.jpg"
              alt=""
              className="w-full h-full object-cover scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1714]/80 via-[#1A1714]/90 to-[#1A1714]" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs font-sans text-[#FAF7F1]/40 mb-6">
              <Link href="/" className="hover:text-[#C5A55A] transition-colors">Home</Link>
              <span className="text-[#C5A55A]">›</span>
              <span className="text-[#C5A55A]">Field Chronicles &amp; Stories</span>
            </div>

            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#C5A55A]/15 border border-[#C5A55A]/30 text-xs font-sans text-[#C5A55A] mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="tracking-wider uppercase font-semibold">Living Heritage Gazette</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#FAF7F1] mb-5 leading-[1.12]">
                Chronicles from the Field
              </h1>
              <p className="text-sm sm:text-lg text-[#FAF7F1]/65 leading-relaxed font-sans mb-8">
                In-depth investigative reports, ethnolinguistic essays, and oral historiography documenting the custodians of India's most vulnerable living heritage.
              </p>

              {/* Statistics Strip */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 border-t border-[#FAF7F1]/10 text-xs sm:text-sm font-sans">
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-gradient-gold font-medium">6</p>
                  <p className="text-[#FAF7F1]/40 text-[11px] uppercase tracking-wider mt-0.5">In-Depth Chronicles</p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-[#FAF7F1] font-medium">14</p>
                  <p className="text-[#FAF7F1]/40 text-[11px] uppercase tracking-wider mt-0.5">States Documented</p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-[#2F6E5D] font-medium">96kHz</p>
                  <p className="text-[#FAF7F1]/40 text-[11px] uppercase tracking-wider mt-0.5">Acoustic Masters</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gold-divider absolute bottom-0 inset-x-0" />
        </section>

        {/* ========================================================= */}
        {/* 2. FEATURED CHRONICLE HERO CARD                           */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20 mb-16">
          <div className="bg-[#FFFCF7] border border-[#E4DDD0] rounded-2xl shadow-xl overflow-hidden group hover:border-[#C5A55A]/50 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Media image */}
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden min-h-[300px] lg:min-h-[440px]">
                <img
                  src={FEATURED_STORY.image}
                  alt={FEATURED_STORY.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1714]/80 via-transparent to-transparent lg:hidden" />
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#B54A3A] text-white shadow-md">
                    Featured Long-Read
                  </span>
                  {FEATURED_STORY.hasAudioSnippet && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1A1714]/80 text-[#C5A55A] backdrop-blur-md flex items-center space-x-1.5 border border-[#C5A55A]/30">
                      <Volume2 className="w-3.5 h-3.5 text-[#C5A55A]" />
                      <span>Audio Field Recording</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Text & Content */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[#FFFCF7]">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#2A2420]/50 mb-3">
                    <span className="text-[#C97A3D] font-medium uppercase tracking-wider">{FEATURED_STORY.category}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#2F6E5D]" />
                      <span>{FEATURED_STORY.region}</span>
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2A2420] mb-3 leading-snug group-hover:text-[#C97A3D] transition-colors">
                    {FEATURED_STORY.title}
                  </h2>

                  <p className="text-xs sm:text-sm font-sans font-medium text-[#2A2420]/75 mb-3 italic">
                    "{FEATURED_STORY.subtitle}"
                  </p>

                  <p className="text-sm text-[#2A2420]/60 leading-relaxed font-sans mb-5 line-clamp-3">
                    {FEATURED_STORY.excerpt}
                  </p>

                  {/* Audio player preview widget */}
                  {FEATURED_STORY.hasAudioSnippet && (
                    <div className="mb-6 p-3.5 rounded-xl bg-[#FAF7F1] border border-[#E4DDD0] flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="w-9 h-9 rounded-full bg-[#2F6E5D] text-white flex items-center justify-center hover:bg-[#25584a] transition-colors shadow-sm"
                          aria-label="Play field audio excerpt"
                        >
                          {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div>
                          <p className="text-xs font-medium text-[#2A2420]">Oral Song Excerpt</p>
                          <p className="text-[10px] text-[#2A2420]/50 font-mono">Bile-Lau • {FEATURED_STORY.audioDuration}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#2F6E5D] tracking-wider bg-[#2F6E5D]/10 px-2 py-1 rounded">
                        Raw Master
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E4DDD0] flex items-center justify-between">
                  <div className="text-xs text-[#2A2420]/50 font-sans">
                    <p className="font-medium text-[#2A2420]">{FEATURED_STORY.author}</p>
                    <p className="text-[11px]">{FEATURED_STORY.readTime} • {FEATURED_STORY.date}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStoryModal(FEATURED_STORY)}
                    className="btn-gold inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-medium rounded-xl shadow-sm"
                  >
                    <span>Read Chronicle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. CATEGORY FILTER TABS & ALL STORIES GRID                */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="gold-accent-line">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2A2420]">
                All Field Chronicles
              </h2>
              <p className="text-xs sm:text-sm text-[#2A2420]/55 mt-1">
                Verified ethnographic studies and oral testimonies from indigenous communities
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#2F6E5D] text-[#FAF7F1] font-semibold shadow-xs'
                      : 'bg-[#FFFCF7] border border-[#E4DDD0] text-[#2A2420]/75 hover:border-[#C97A3D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredStories.map((story) => (
              <article
                key={story.id}
                id={story.id}
                onClick={() => setActiveStoryModal(story)}
                className="heritage-card overflow-hidden flex flex-col justify-between cursor-pointer group hover:border-[#C5A55A]/50 transition-all duration-300"
              >
                <div>
                  {/* Card Image */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-[#E4DDD0]">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-[#1A1714]/80 text-[#C5A55A] backdrop-blur-sm border border-[#C5A55A]/30">
                        {story.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(story.id, e)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
                          bookmarkedStories.includes(story.id)
                            ? 'bg-[#C5A55A] text-white'
                            : 'bg-[#1A1714]/60 text-white/80 hover:text-white'
                        }`}
                        title="Bookmark chronicle"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center space-x-1 text-[10px] font-sans text-white/90 bg-[#1A1714]/70 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      <MapPin className="w-3 h-3 text-[#2F6E5D]" />
                      <span>{story.region}, {story.state}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6">
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2A2420] mb-2 leading-snug group-hover:text-[#C97A3D] transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-xs font-sans text-[#2A2420]/55 line-clamp-1 italic mb-3">
                      "{story.subtitle}"
                    </p>
                    <p className="text-xs sm:text-sm text-[#2A2420]/65 leading-relaxed font-sans line-clamp-3 mb-4">
                      {story.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#E4DDD0]/60 flex items-center justify-between text-xs text-[#2A2420]/50 font-sans">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{story.readTime}</span>
                    {story.hasAudioSnippet && (
                      <span className="flex items-center space-x-1 text-[#2F6E5D] font-medium ml-1">
                        <Volume2 className="w-3 h-3" />
                        <span>Audio</span>
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center space-x-1 text-xs font-medium text-[#C97A3D] group-hover:translate-x-0.5 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. INSTITUTIONAL ETHICAL CHARTER                          */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="rounded-2xl bg-[#1A1714] text-[#FAF7F1] p-8 sm:p-10 relative overflow-hidden border border-[#C5A55A]/25">
            <div className="absolute -right-10 -bottom-10 opacity-5">
              <Quote className="w-64 h-64 text-[#C5A55A]" />
            </div>

            <div className="relative z-10 max-w-3xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A55A] font-semibold">
                Archival Protocol &amp; Provenance
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#FAF7F1] mt-2 mb-3">
                Indigenous Sovereignty &amp; Ethical Fieldwork Standards
              </h3>
              <p className="text-xs sm:text-sm text-[#FAF7F1]/60 leading-relaxed font-sans mb-6">
                Every story and oral record published on Dharohar Setu complies with the Nagoya Protocol and Free, Prior, and Informed Consent (FPIC). Intellectual property rights over oral recordings, medicinal ethnobotany, and sacred songs remain unequivocally with the host tribal and artisan communities.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-[#C5A55A]">
                <Link
                  href="/about"
                  className="inline-flex items-center space-x-1.5 underline hover:text-[#FAF7F1] transition-colors"
                >
                  <span>Read Institutional Charter</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span>•</span>
                <Link
                  href="/archive"
                  className="inline-flex items-center space-x-1.5 underline hover:text-[#FAF7F1] transition-colors"
                >
                  <span>Explore Raw Audio Masters in Archive</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. MODAL: FULL LONG-FORM STORY READER                     */}
        {/* ========================================================= */}
        {activeStoryModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1714]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
            <div className="bg-[#FAF7F1] text-[#2A2420] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E4DDD0] overflow-hidden my-8 max-h-[92vh] flex flex-col">
              {/* Modal Top Bar */}
              <div className="sticky top-0 z-20 bg-[#FAF7F1]/95 backdrop-blur-md px-6 py-4 border-b border-[#E4DDD0] flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-sans text-[#2A2420]/60">
                  <span className="text-[#C97A3D] font-medium">{activeStoryModal.category}</span>
                  <span>•</span>
                  <span>{activeStoryModal.readTime}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => handleShare(activeStoryModal, e)}
                    className="p-2 rounded-lg hover:bg-[#EAE4D9] text-[#2A2420]/70 hover:text-[#2A2420] transition-colors"
                    title="Share chronicle link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStoryModal(null)}
                    className="p-2 rounded-lg hover:bg-[#EAE4D9] text-[#2A2420]/70 hover:text-[#2A2420] transition-colors"
                    aria-label="Close chronicle"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 sm:p-10 space-y-6">
                {copiedLink && (
                  <div className="p-3 bg-[#2F6E5D]/15 border border-[#2F6E5D]/30 rounded-xl text-xs text-[#2F6E5D] flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chronicle link copied to clipboard!</span>
                  </div>
                )}

                {/* Story Image */}
                <div className="rounded-xl overflow-hidden aspect-[16/9] relative shadow-md">
                  <img
                    src={activeStoryModal.image}
                    alt={activeStoryModal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-[#1A1714]/80 text-[#FAF7F1] text-[11px] px-3 py-1 rounded-full backdrop-blur-sm">
                    {activeStoryModal.region}, {activeStoryModal.state}
                  </div>
                </div>

                {/* Header Information */}
                <div>
                  <h2 className="font-serif text-2xl sm:text-4xl font-medium text-[#2A2420] leading-tight mb-2">
                    {activeStoryModal.title}
                  </h2>
                  <p className="font-serif italic text-base sm:text-lg text-[#C97A3D] mb-4">
                    {activeStoryModal.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#2A2420]/50 font-sans pb-4 border-b border-[#E4DDD0]">
                    <span>By <strong>{activeStoryModal.author}</strong> ({activeStoryModal.authorRole})</span>
                    <span>•</span>
                    <span>{activeStoryModal.date}</span>
                  </div>
                </div>

                {/* Pull Quote */}
                <div className="p-5 sm:p-6 bg-[#FFFCF7] border-l-4 border-[#C5A55A] rounded-r-xl shadow-xs">
                  <p className="font-serif text-base sm:text-lg text-[#2A2420] italic leading-relaxed">
                    "{activeStoryModal.pullQuote}"
                  </p>
                </div>

                {/* Lead Text */}
                <p className="text-base sm:text-lg font-sans text-[#2A2420]/80 leading-relaxed first-letter:text-4xl first-letter:font-serif first-letter:text-[#C97A3D] first-letter:mr-2 first-letter:float-left">
                  {activeStoryModal.fullContent.lead}
                </p>

                {/* Section 1 */}
                <div className="pt-4">
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#2A2420] mb-3">
                    {activeStoryModal.fullContent.section1Heading}
                  </h3>
                  <p className="text-sm sm:text-base font-sans text-[#2A2420]/75 leading-relaxed">
                    {activeStoryModal.fullContent.section1Text}
                  </p>
                </div>

                {/* Section 2 */}
                <div className="pt-2">
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#2A2420] mb-3">
                    {activeStoryModal.fullContent.section2Heading}
                  </h3>
                  <p className="text-sm sm:text-base font-sans text-[#2A2420]/75 leading-relaxed">
                    {activeStoryModal.fullContent.section2Text}
                  </p>
                </div>

                {/* Archival Metadata Box */}
                <div className="mt-8 p-4 rounded-xl bg-[#2F6E5D]/8 border border-[#2F6E5D]/20 text-xs text-[#2F6E5D]">
                  <p className="font-semibold uppercase tracking-wider mb-1">Archival Registry Note</p>
                  <p className="text-[#2A2420]/70">{activeStoryModal.fullContent.archivalNote}</p>
                </div>

                {/* Link to Archive Records */}
                <div className="pt-6 border-t border-[#E4DDD0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <Link
                    href={`/archive?category=${activeStoryModal.archiveCategory}`}
                    className="btn-teal inline-flex items-center justify-center space-x-2 px-6 py-3 text-xs font-semibold rounded-xl"
                  >
                    <span>View Related Archive Records</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveStoryModal(null)}
                    className="btn-secondary px-6 py-3 text-xs font-semibold rounded-xl"
                  >
                    Close Chronicle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
