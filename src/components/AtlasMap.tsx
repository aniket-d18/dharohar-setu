'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

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

export interface DistrictRegion {
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
  stateName?: string;
}

export interface StateRegion {
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

export const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  // --- Maharashtra Districts (Full Coverage) ---
  'Ahilyanagar': [19.0948, 74.7480],
  'Ahmednagar': [19.0948, 74.7480],
  'Ahilyanagar (Ahmednagar)': [19.0948, 74.7480],
  'Pune': [18.5204, 73.8567],
  'Mumbai': [19.0760, 72.8777],
  'Mumbai Suburban': [19.1136, 72.8697],
  'Thane': [19.2183, 72.9781],
  'Palghar': [19.6967, 72.7699],
  'Raigad': [18.5158, 73.1822],
  'Ratnagiri': [16.9902, 73.3120],
  'Sindhudurg': [16.1216, 73.6934],
  'Nashik': [19.9975, 73.7898],
  'Dhule': [20.9042, 74.7749],
  'Nandurbar': [21.3716, 74.2405],
  'Jalgaon': [21.0077, 75.5626],
  'Buldhana': [20.5293, 76.1843],
  'Akola': [20.7002, 77.0082],
  'Washim': [20.1098, 77.1352],
  'Amravati': [20.9374, 77.7796],
  'Yavatmal': [20.3888, 78.1204],
  'Wardha': [20.7453, 78.6022],
  'Nagpur': [21.1458, 79.0882],
  'Bhandara': [21.1714, 79.6548],
  'Gondia': [21.4624, 80.1961],
  'Chandrapur': [19.9615, 79.2961],
  'Gadchiroli': [20.1849, 79.9948],
  'Chhatrapati Sambhaji Nagar': [19.8762, 75.3433],
  'Aurangabad': [19.8762, 75.3433],
  'Chhatrapati Sambhaji Nagar (Aurangabad)': [19.8762, 75.3433],
  'Jalna': [19.8347, 75.8816],
  'Parbhani': [19.2686, 76.7708],
  'Hingoli': [19.7173, 77.1471],
  'Nanded': [19.1383, 77.3210],
  'Beed': [18.9891, 75.7601],
  'Latur': [18.4088, 76.5604],
  'Dharashiv': [18.1760, 76.0407],
  'Osmanabad': [18.1760, 76.0407],
  'Dharashiv (Osmanabad)': [18.1760, 76.0407],
  'Solapur': [17.6599, 75.9064],
  'Satara': [17.6805, 73.9997],
  'Sangli': [16.8524, 74.5815],
  'Kolhapur': [16.7050, 74.2433],

  // --- Prominent Cultural & Heritage Districts Across India ---
  'The Nilgiris': [11.4102, 76.6950],
  'South Andaman': [11.6234, 92.7265],
  'Nicobar': [7.0000, 93.8000],
  'Lahaul & Spiti': [32.5510, 77.0180],
  'Kutch': [23.4550, 69.8000],
  'Alipurduar': [26.4919, 89.5271],
  'Changlang': [27.1264, 95.7360],
  'North Sikkim': [27.7000, 88.5000],
  'Chandel': [24.3268, 94.0042],
  'Mon': [26.7431, 95.0607],
  'Varanasi': [25.3176, 82.9739],
  'Ayodhya': [26.7922, 82.1998],
  'Lucknow': [26.8467, 80.9462],
  'Mathura': [27.4924, 77.6737],
  'Agra': [27.1767, 78.0081],
  'Patna': [25.6127, 85.1589],
  'Gaya': [24.7955, 85.0002],
  'Madhubani': [26.3541, 86.0718],
  'Jaipur': [26.9124, 75.7873],
  'Jodhpur': [26.2389, 73.0243],
  'Udaipur': [24.5854, 73.7125],
  'Jaisalmer': [26.9157, 70.9083],
  'Barmer': [25.7521, 71.3967],
  'Ahmedabad': [23.0225, 72.5714],
  'Vadodara': [22.3072, 73.1812],
  'Surat': [21.1702, 72.8311],
  'Bengaluru Urban': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
  'Mysuru': [12.2958, 76.6394],
  'Bellary': [15.1394, 76.9214],
  'Hampi': [15.3350, 76.4600],
  'Dakshina Kannada': [12.8700, 75.2400],
  'Udupi': [13.3409, 74.7421],
  'Chennai': [13.0827, 80.2707],
  'Madurai': [9.9252, 78.1198],
  'Thanjavur': [10.7870, 79.1378],
  'Coimbatore': [11.0168, 76.9558],
  'Kanyakumari': [8.0883, 77.5385],
  'Thiruvananthapuram': [8.5241, 76.9366],
  'Kochi': [9.9312, 76.2673],
  'Wayanad': [11.6854, 76.1320],
  'Kozhikode': [11.2588, 75.7804],
  'Kolkata': [22.5726, 88.3639],
  'Darjeeling': [27.0410, 88.2663],
  'Kalimpong': [27.0594, 88.4695],
  'Bankura': [23.2324, 87.0715],
  'Birbhum': [23.8404, 87.6186],
  'Guwahati': [26.1445, 91.7362],
  'Kamrup': [26.3161, 91.5984],
  'Majuli': [26.9500, 94.2167],
  'Jorhat': [26.7509, 94.2037],
  'Kohima': [25.6751, 94.1086],
  'Imphal East': [24.8170, 93.9368],
  'Imphal West': [24.8170, 93.9368],
  'Imphal': [24.8170, 93.9368],
  'Aizawl': [23.7271, 92.7176],
  'Shillong': [25.5788, 91.8933],
  'East Khasi Hills': [25.5788, 91.8933],
  'Agartala': [23.8315, 91.2868],
  'West Tripura': [23.8315, 91.2868],
  'Gangtok': [27.3389, 88.6065],
  'Srinagar': [34.0837, 74.7973],
  'Jammu': [32.7266, 74.8570],
  'Leh': [34.1526, 77.5771],
  'Kargil': [34.5539, 76.1349],
  'Bhopal': [23.2599, 77.4126],
  'Indore': [22.7196, 75.8577],
  'Gwalior': [26.2183, 78.1828],
  'Jabalpur': [23.1815, 79.9864],
  'Ujjain': [23.1765, 75.7885],
  'Raipur': [21.2514, 81.6296],
  'Bastar': [19.0748, 82.0298],
  'Ranchi': [23.3441, 85.3096],
  'Bhubaneswar': [20.2961, 85.8245],
  'Puri': [19.8135, 85.8312],
  'Mayurbhanj': [21.9282, 86.7378],
  'Hyderabad': [17.3850, 78.4867],
  'Warangal': [17.9689, 79.5941],
  'Visakhapatnam': [17.6868, 83.2185],
  'Tirupati': [13.6288, 79.4192],

  // --- 28 Indian States (Centroids) ---
  'Andhra Pradesh': [15.9129, 79.7400],
  'Arunachal Pradesh': [28.2180, 94.7278],
  'Assam': [26.2006, 92.9376],
  'Bihar': [25.0961, 85.3131],
  'Chhattisgarh': [21.2787, 81.8661],
  'Goa': [15.2993, 74.1240],
  'Gujarat': [22.2587, 71.1924],
  'Haryana': [29.0588, 76.0856],
  'Himachal Pradesh': [31.1048, 77.1734],
  'Jharkhand': [23.6102, 85.2799],
  'Karnataka': [15.3173, 75.7139],
  'Kerala': [10.8505, 76.2711],
  'Madhya Pradesh': [22.9734, 78.6569],
  'Maharashtra': [19.7515, 75.7139],
  'Manipur': [24.6637, 93.9063],
  'Meghalaya': [25.4670, 91.3662],
  'Mizoram': [23.1645, 92.9376],
  'Nagaland': [26.1584, 94.5624],
  'Odisha': [20.9517, 85.0985],
  'Punjab': [31.1471, 75.3412],
  'Rajasthan': [27.0238, 74.2179],
  'Sikkim': [27.5330, 88.5122],
  'Tamil Nadu': [11.1271, 78.6569],
  'Telangana': [18.1124, 79.0193],
  'Tripura': [23.9408, 91.9882],
  'Uttar Pradesh': [26.8467, 80.9462],
  'Uttarakhand': [30.0668, 79.0193],
  'West Bengal': [22.9868, 87.8550],

  // --- 8 Union Territories ---
  'Andaman and Nicobar Islands': [11.7401, 92.6586],
  'Andaman & Nicobar Islands': [11.7401, 92.6586],
  'Andaman & Nicobar': [11.7401, 92.6586],
  'Chandigarh': [30.7333, 76.7794],
  'Dadra and Nagar Haveli and Daman and Diu': [20.4283, 72.8397],
  'Delhi': [28.7041, 77.1025],
  'Jammu and Kashmir': [33.7782, 76.5762],
  'Jammu & Kashmir': [33.7782, 76.5762],
  'Ladakh': [34.1526, 77.5771],
  'Lakshadweep': [10.5667, 72.6417],
  'Puducherry': [11.9416, 79.8083],
};

/**
 * Intelligent Coordinate Resolver for Dharohar Cultural Atlas
 * Ensures that ANY district (even newly submitted or custom ones) always gets an accurate
 * interactive cultural pin on the map.
 */
export function getCoordinatesForRegion(regionName: string, stateName?: string): [number, number] {
  if (!regionName) return [20.5937, 78.9629];

  // 1. Direct exact match
  if (DISTRICT_COORDINATES[regionName]) {
    return DISTRICT_COORDINATES[regionName];
  }

  // 2. Cleaned without parentheses e.g. "Ahilyanagar (Ahmednagar)" -> "Ahilyanagar" or "Ahmednagar"
  const stripped = regionName.replace(/\(.*?\)/g, '').trim();
  if (DISTRICT_COORDINATES[stripped]) {
    return DISTRICT_COORDINATES[stripped];
  }
  const matchParen = regionName.match(/\((.*?)\)/);
  if (matchParen && matchParen[1]) {
    const inside = matchParen[1].trim();
    if (DISTRICT_COORDINATES[inside]) {
      return DISTRICT_COORDINATES[inside];
    }
  }

  // 3. Case-insensitive substring match
  const lower = regionName.toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    const keyLower = key.toLowerCase();
    if (keyLower === lower || keyLower.includes(lower) || lower.includes(keyLower)) {
      return coords;
    }
  }

  // 4. Fallback to state coordinate with deterministic jitter
  const targetState = stateName || regionName;
  if (DISTRICT_COORDINATES[targetState]) {
    const base = DISTRICT_COORDINATES[targetState];
    let hash = 0;
    for (let i = 0; i < regionName.length; i++) {
      hash = (hash << 5) - hash + regionName.charCodeAt(i);
      hash |= 0;
    }
    const latOffset = ((Math.abs(hash) % 20) - 10) * 0.05;
    const lngOffset = ((Math.abs(hash >> 3) % 20) - 10) * 0.05;
    return [base[0] + latOffset, base[1] + lngOffset];
  }

  // 5. Default Center of India
  return [20.5937, 78.9629];
}

// Comprehensive vitality data for all 36 Indian States & Union Territories
interface StateVitalityData {
  status: 'CRITICAL' | 'ENDANGERED' | 'VULNERABLE' | 'SAFE';
  score: number;
  highlight: string;
  hasCraft?: boolean;
}

const ALL_INDIA_STATES_VITALITY: Record<string, StateVitalityData> = {
  'Andaman & Nicobar': { status: 'CRITICAL', score: 9.8, highlight: 'Great Andamanese, Sentinelese, Onge' },
  'Arunachal Pradesh': { status: 'CRITICAL', score: 9.5, highlight: 'Meyor, Sartang, Koro, Bugun' },
  'Manipur': { status: 'CRITICAL', score: 9.3, highlight: 'Aimol, Tarao, Purum, Koireng' },
  'Nagaland': { status: 'CRITICAL', score: 9.2, highlight: 'Konyak chants, Rengma, Khiamniungan' },
  'Tripura': { status: 'CRITICAL', score: 9.0, highlight: 'Reang oral ballads, Kokborok dialects' },
  'Sikkim': { status: 'CRITICAL', score: 8.9, highlight: 'Lepcha sacred scrolls, Bhutia songs' },
  'Meghalaya': { status: 'CRITICAL', score: 8.7, highlight: 'War-Jaintia, Lyngngam, Garo oral verse' },
  'Mizoram': { status: 'CRITICAL', score: 8.6, highlight: 'Mara, Lai oral traditions' },
  'Ladakh': { status: 'CRITICAL', score: 8.5, highlight: 'Balti, Brokskat, Zanskari' },

  'Tamil Nadu': { status: 'CRITICAL', score: 8.9, highlight: 'Toda in Nilgiris, Kota, Pukhoor embroidery', hasCraft: true },
  'West Bengal': { status: 'CRITICAL', score: 9.1, highlight: 'Toto script & language, Lepcha', hasCraft: false },
  'Maharashtra': { status: 'CRITICAL', score: 9.4, highlight: 'Nihali language isolate, Buldhana', hasCraft: false },
  'Himachal Pradesh': { status: 'ENDANGERED', score: 7.3, highlight: 'Spiti Bhoti, Kinnauri, Buddhist murals', hasCraft: true },
  'Gujarat': { status: 'VULNERABLE', score: 5.8, highlight: 'Kachchhi, Rogan castor oil painting', hasCraft: true },

  'Jammu & Kashmir': { status: 'ENDANGERED', score: 7.8, highlight: 'Shina, Burushaski, Gojri' },
  'Uttarakhand': { status: 'ENDANGERED', score: 7.5, highlight: 'Jaunsari, Rung, Tolchha' },
  'Assam': { status: 'ENDANGERED', score: 7.4, highlight: 'Tiwa, Deori, Bodo folk traditions' },
  'Odisha': { status: 'ENDANGERED', score: 7.6, highlight: 'Bonda, Kuvi, Saora rock painting' },
  'Jharkhand': { status: 'ENDANGERED', score: 7.5, highlight: 'Birhor, Asur ironcraft, Malto' },
  'Chhattisgarh': { status: 'ENDANGERED', score: 7.2, highlight: 'Dhurwa, Dorli, Bell-metal Dhokra' },
  'Goa': { status: 'VULNERABLE', score: 5.5, highlight: 'Ancient Konkani sea shanties' },
  'Lakshadweep': { status: 'VULNERABLE', score: 5.9, highlight: 'Mahil, coral reef oral navigation' },
  'Dadra and Nagar Haveli and Daman and Diu': { status: 'VULNERABLE', score: 5.4, highlight: 'Varli oral heritage' },

  'Karnataka': { status: 'SAFE', score: 3.2, highlight: 'Tulu, Kodava, Yakshagana folklore' },
  'Kerala': { status: 'SAFE', score: 2.8, highlight: 'Kurumba, Theyyam oral chants' },
  'Andhra Pradesh': { status: 'SAFE', score: 2.9, highlight: 'Chenchu, Kolam folk traditions' },
  'Telangana': { status: 'SAFE', score: 3.1, highlight: 'Gondi, Lambadi folk epics' },
  'Madhya Pradesh': { status: 'SAFE', score: 3.5, highlight: 'Gond, Baiga, Bhil traditions' },
  'Rajasthan': { status: 'SAFE', score: 3.4, highlight: 'Kalbelia ballads, Manganiyar music' },
  'Punjab': { status: 'SAFE', score: 2.2, highlight: 'Ancient Punjabi Sufi & Qissa poetry' },
  'Haryana': { status: 'SAFE', score: 2.1, highlight: 'Ragini oral performance' },
  'Bihar': { status: 'SAFE', score: 2.5, highlight: 'Maithili, Bhojpuri, Madhubani lore' },
  'Uttar Pradesh': { status: 'SAFE', score: 2.4, highlight: 'Awadhi, Braj Bhasha, Biraha songs' },
  'Delhi': { status: 'SAFE', score: 1.8, highlight: 'Living urban confluence archive' },
  'Chandigarh': { status: 'SAFE', score: 1.5, highlight: 'Subcontinental folklore hub' },
  'Puducherry': { status: 'SAFE', score: 2.0, highlight: 'Coastal Franco-Tamil heritage' },
};

interface AtlasMapProps {
  states: StateRegion[];
  districts: DistrictRegion[];
  selectedRegion: DistrictRegion | null;
  onSelectRegion: (district: DistrictRegion) => void;
  activeLayer: 'language' | 'craft' | 'density';
}

export default function AtlasMap({
  states,
  districts,
  selectedRegion,
  onSelectRegion,
  activeLayer,
}: AtlasMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');

  // Fetch local GeoJSON once
  useEffect(() => {
    let isMounted = true;
    fetch('/data/india_states.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('GeoJSON fetch failed');
        return res.json();
      })
      .then((data) => {
        if (isMounted) setGeoJsonData(data);
      })
      .catch((err) => {
        console.warn('Could not load local GeoJSON, falling back to remote gist:', err);
        fetch(
          'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson'
        )
          .then((r) => r.json())
          .then((data) => {
            if (isMounted) setGeoJsonData(data);
          })
          .catch((e) => console.error('Failed to load India GeoJSON:', e));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map centered on geographic center of India (~22.5°N, 80°E) at zoom 4.5
    const map = L.map(mapContainerRef.current, {
      center: [22.5, 80.0],
      zoom: 4.5,
      zoomSnap: 0.25,
      minZoom: 3.5,
      maxZoom: 12,
      maxBounds: [
        [2.0, 58.0],
        [40.0, 104.0],
      ],
      maxBoundsViscosity: 0.8,
      zoomControl: false,
      attributionControl: true,
    });

    // Clean ESRI World Dark Gray Canvas Base — zero API key required, zero watermarks, sleek dark theme
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
      }
    ).addTo(map);

    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidate map size so tiles immediately render without gray gaps
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Determine state vitality information (database takes precedence, then national cultural matrix)
  const getStateVitality = (stateName: string) => {
    // 1. Check live database state
    const dbState = states.find(
      (s) =>
        normalize(s.name).includes(normalize(stateName)) ||
        normalize(stateName).includes(normalize(s.name))
    );

    // 2. Check national cultural matrix
    const matrixEntry = Object.entries(ALL_INDIA_STATES_VITALITY).find(
      ([key]) =>
        normalize(key).includes(normalize(stateName)) ||
        normalize(stateName).includes(normalize(key))
    );

    const matrixData = matrixEntry ? matrixEntry[1] : null;

    if (dbState) {
      const recordsCount =
        dbState._count.records +
        dbState.childRegions.reduce((acc, c) => acc + c._count.records, 0);
      const hasCrafts = dbState.childRegions.some((c) => c.crafts && c.crafts.length > 0);
      return {
        status: dbState.vitalityStatus as 'CRITICAL' | 'ENDANGERED' | 'VULNERABLE' | 'SAFE',
        score: dbState.vitalityScore,
        highlight: dbState.childRegions.map((c) => c.name).join(', ') || 'Cultural documentation active',
        hasCraft: hasCrafts,
        recordsCount,
        dbState,
      };
    }

    if (matrixData) {
      return {
        status: matrixData.status,
        score: matrixData.score,
        highlight: matrixData.highlight,
        hasCraft: matrixData.hasCraft || false,
        recordsCount: 0,
        dbState: null,
      };
    }

    return {
      status: 'SAFE' as const,
      score: 3.0,
      highlight: 'Documented heritage',
      hasCraft: false,
      recordsCount: 0,
      dbState: null,
    };
  };

  // Helper to determine polygon fill based on state data and active layer
  const getStateColor = (stateName: string) => {
    const info = getStateVitality(stateName);

    if (activeLayer === 'craft') {
      if (info.hasCraft) {
        return { color: '#F3ECDD', fill: '#E8A33D', fillOpacity: 0.65 };
      }
      return { color: '#E8A33D', fill: '#7C9473', fillOpacity: 0.45 };
    }

    if (activeLayer === 'density') {
      if (info.recordsCount > 0) {
        return { color: '#68BAA4', fill: '#2F6E5D', fillOpacity: 0.7 };
      }
      return { color: '#E57A6C', fill: '#B54A3A', fillOpacity: 0.6 };
    }

    // Default: Language vitality choropleth
    switch (info.status) {
      case 'CRITICAL':
        return { color: '#F3ECDD', fill: '#B54A3A', fillOpacity: 0.68 };
      case 'ENDANGERED':
        return { color: '#F3ECDD', fill: '#E8A33D', fillOpacity: 0.65 };
      case 'VULNERABLE':
        return { color: '#E8A33D', fill: '#D4882E', fillOpacity: 0.58 };
      case 'SAFE':
      default:
        return { color: '#E8A33D', fill: '#2F6E5D', fillOpacity: 0.52 };
    }
  };

  // Render / Update GeoJSON boundaries
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoJsonData) return;

    // Remove existing GeoJSON layer
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const stateName = feature?.properties?.ST_NM || '';
        const { color, fill, fillOpacity } = getStateColor(stateName);
        return {
          color,
          weight: 1.5,
          opacity: 0.85,
          fillColor: fill,
          fillOpacity,
        };
      },
      onEachFeature: (feature, layer) => {
        const stateName = feature?.properties?.ST_NM || '';
        const info = getStateVitality(stateName);

        const statusColor =
          info.status === 'CRITICAL'
            ? '#E57A6C'
            : info.status === 'ENDANGERED'
            ? '#E8A33D'
            : '#68BAA4';

        // Rich Tooltip with Vitality Score & Heritage Highlight
        layer.bindTooltip(
          `<div class="font-sans p-1">
            <div class="flex items-center justify-between gap-3 mb-1">
              <span class="font-serif font-semibold text-sm text-[#F3ECDD]">${stateName}</span>
              <span style="color: ${statusColor};" class="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-[#121526]/80 border border-current">
                ${info.status} (${info.score.toFixed(1)})
              </span>
            </div>
            <div class="text-[11px] text-[#E8A33D] font-medium">${info.highlight}</div>
            ${
              info.recordsCount > 0
                ? `<div class="text-[10px] text-[#F3ECDD]/60 mt-1">📚 ${info.recordsCount} preserved recordings in database</div>`
                : ''
            }
          </div>`,
          {
            className: 'dharohar-leaflet-tooltip',
            sticky: true,
            direction: 'top',
          }
        );

        // Hover & Click events
        layer.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 3,
              opacity: 1,
              color: '#F3ECDD',
              fillOpacity: 0.88,
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            geoJsonLayer.resetStyle(e.target);
          },
          click: () => {
            const stateCoords =
              DISTRICT_COORDINATES[stateName] ||
              (info.dbState?.name ? DISTRICT_COORDINATES[info.dbState.name] : null);
            if (info.dbState) {
              const stateRegionItem: DistrictRegion = {
                id: info.dbState.id,
                name: info.dbState.name,
                level: info.dbState.level,
                vitalityStatus: info.dbState.vitalityStatus,
                vitalityScore: info.dbState.vitalityScore,
                languages: info.dbState.languages || [],
                crafts: [],
                _count: { records: info.recordsCount },
                stateName: info.dbState.name,
              };
              onSelectRegion(stateRegionItem);
              if (stateCoords) {
                map.flyTo(stateCoords, 7, { duration: 1.2 });
              }
            } else {
              const pseudoDistrict: DistrictRegion = {
                id: `state-${stateName}`,
                name: stateName,
                level: 'STATE',
                vitalityStatus: info.status,
                vitalityScore: info.score,
                languages: [],
                crafts: [],
                _count: { records: info.recordsCount },
                stateName: stateName,
              };
              onSelectRegion(pseudoDistrict);
              if (stateCoords) {
                map.flyTo(stateCoords, 7, { duration: 1.2 });
              }
            }
          },
        });
      },
    }).addTo(map);

    geoJsonLayerRef.current = geoJsonLayer;
  }, [geoJsonData, states, activeLayer]);

  // Marker colors by vitality and active layer
  const getMarkerColor = (d: DistrictRegion) => {
    if (activeLayer === 'craft') {
      return d.crafts.length > 0 ? '#E8A33D' : '#7C9473';
    }
    if (activeLayer === 'density') {
      return d._count.records > 0 ? '#2F6E5D' : '#B54A3A';
    }
    switch (d.vitalityStatus) {
      case 'CRITICAL':
        return '#B54A3A';
      case 'ENDANGERED':
      case 'VULNERABLE':
        return '#E8A33D';
      default:
        return '#7C9473';
    }
  };

  // Render / Update District Cultural Pin Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    districts.forEach((d) => {
      const coords = getCoordinatesForRegion(d.name, d.stateName);
      if (!coords) return;

      const isSelected = selectedRegion?.id === d.id;
      const markerColor = getMarkerColor(d);
      const isCritical = d.vitalityStatus === 'CRITICAL';

      const iconHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          ${
            isCritical
              ? `<span style="background-color: ${markerColor};" class="absolute w-8 h-8 rounded-full opacity-50 animate-ping"></span>`
              : ''
          }
          <div 
            style="background-color: ${markerColor}; border-color: ${
        isSelected ? '#F3ECDD' : 'rgba(232, 163, 61, 0.85)'
      };"
            class="w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-2xl transition-transform hover:scale-125 ${
              isSelected ? 'ring-4 ring-[#E8A33D] scale-125' : ''
            }"
          >
            <div class="w-1.5 h-1.5 bg-[#1E2340] rounded-full"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'dharohar-pin-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(coords, { icon: customIcon });

      const primaryLang = d.languages[0]?.language.name || 'Oral Lore';
      const recordsCount = d._count?.records || 0;
      marker.bindTooltip(
        `<div class="font-sans text-xs px-2 py-1">
          <div class="font-serif font-semibold text-[#F3ECDD] text-sm">${d.name}</div>
          <div class="text-[#E8A33D] text-[11px] font-medium">${primaryLang}</div>
          <div class="text-[#F3ECDD]/60 text-[10px] mt-0.5">${recordsCount} preserved recordings</div>
        </div>`,
        {
          className: 'dharohar-leaflet-tooltip',
          direction: 'top',
          offset: [0, -12],
        }
      );

      marker.on('click', () => {
        onSelectRegion(d);
        map.flyTo(coords, 8, { duration: 1.2 });
      });

      markersGroup.addLayer(marker);
    });
  }, [districts, selectedRegion, activeLayer]);

  // When selectedRegion changes, fly map smoothly to its coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRegion) return;

    const coords = getCoordinatesForRegion(selectedRegion.name, selectedRegion.stateName);
    if (coords) {
      map.flyTo(coords, 7, {
        duration: 1.2,
      });
    }
  }, [selectedRegion]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () =>
    mapInstanceRef.current?.flyTo([22.5, 80.0], 4.5, { duration: 1.0 });

  return (
    <div className="relative w-full h-full bg-[#121526] overflow-hidden">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded bg-[#1E2340]/90 backdrop-blur border border-[#E8A33D]/30 flex items-center justify-center text-[#F3ECDD] hover:bg-[#E8A33D] hover:text-[#1E2340] transition-colors shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded bg-[#1E2340]/90 backdrop-blur border border-[#E8A33D]/30 flex items-center justify-center text-[#F3ECDD] hover:bg-[#E8A33D] hover:text-[#1E2340] transition-colors shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset Whole India View"
          className="w-8 h-8 rounded bg-[#1E2340]/90 backdrop-blur border border-[#E8A33D]/30 flex items-center justify-center text-[#F3ECDD] hover:bg-[#E8A33D] hover:text-[#1E2340] transition-colors shadow-lg"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-6 left-6 z-[400] bg-[#1E2340]/95 backdrop-blur-md border border-[#E8A33D]/35 rounded-lg p-3 text-xs shadow-2xl pointer-events-auto">
        <span className="block font-serif text-xs font-semibold text-[#F3ECDD] mb-2">
          {activeLayer === 'craft'
            ? 'Craft Vitality Matrix'
            : activeLayer === 'density'
            ? 'Contribution Density Matrix'
            : 'Language Vitality Matrix'}
        </span>
        <div className="space-y-1.5 font-sans">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#B54A3A] shadow-sm border border-black/30" />
            <span className="text-[#F3ECDD]/90 font-medium">
              {activeLayer === 'density'
                ? 'Preservation Gap (0 records)'
                : 'Critical (Score 8.0+)'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#E8A33D] shadow-sm border border-black/30" />
            <span className="text-[#F3ECDD]/90 font-medium">
              {activeLayer === 'craft' ? 'Endangered Master Craft' : 'Endangered / Vulnerable'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#2F6E5D] shadow-sm border border-black/30" />
            <span className="text-[#F3ECDD]/90 font-medium">
              {activeLayer === 'density'
                ? 'Active Documentation (1+ records)'
                : 'Safe / Documented'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
