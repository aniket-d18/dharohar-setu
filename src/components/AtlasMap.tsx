'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';

import {
  type UserLocation,
  DISTRICT_COORDINATES,
  getCoordinatesForRegion,
} from '@/utils/coordinates';
export type { UserLocation };
export { DISTRICT_COORDINATES, getCoordinatesForRegion };

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

export interface AtlasMapProps {
  states: StateRegion[];
  districts: DistrictRegion[];
  selectedRegion: DistrictRegion | null;
  onSelectRegion: (district: DistrictRegion) => void;
  activeLayer: 'language' | 'craft' | 'density';
  userLocation?: UserLocation | null;
  onFindNearMe?: () => void;
  isLocating?: boolean;
}

export default function AtlasMap({
  states,
  districts,
  selectedRegion,
  onSelectRegion,
  activeLayer,
  userLocation,
  onFindNearMe,
  isLocating,
}: AtlasMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerGroupRef = useRef<L.LayerGroup | null>(null);
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
    userLocationLayerGroupRef.current = L.layerGroup().addTo(map);
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

  // When selectedRegion changes, fly map smoothly to its coordinates (unless user location just flew)
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

  // Render User Location Beacon Marker & Proximity Radar Ring
  useEffect(() => {
    const map = mapInstanceRef.current;
    const userGroup = userLocationLayerGroupRef.current;
    if (!map || !userGroup) return;

    userGroup.clearLayers();

    if (!userLocation) return;

    const { lat, lng } = userLocation;

    // Glowing Cyan / Blue Animated Pulse Beacon
    const userBeaconHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <div class="absolute w-14 h-14 rounded-full bg-cyan-400/25 animate-ping"></div>
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-pulse"></div>
        <div class="w-5 h-5 rounded-full bg-[#00D2FF] border-2 border-white shadow-[0_0_15px_rgba(0,210,255,0.9)] flex items-center justify-center ring-2 ring-[#121526]">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    `;

    const userBeaconIcon = L.divIcon({
      html: userBeaconHtml,
      className: 'dharohar-user-location-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([lat, lng], {
      icon: userBeaconIcon,
      zIndexOffset: 1000,
    });

    userMarker.bindTooltip(
      `<div class="font-sans text-xs px-2.5 py-1 text-center">
        <div class="font-serif font-bold text-[#00D2FF] text-xs">📍 Your Location</div>
        <div class="text-[#F3ECDD]/80 text-[10px] mt-0.5">${userLocation.address || 'Heritage Near You Active'}</div>
      </div>`,
      {
        className: 'dharohar-leaflet-tooltip',
        permanent: false,
        direction: 'top',
        offset: [0, -14],
      }
    );

    // Aesthetic 45km Exploration Radar Ring
    const radarCircle = L.circle([lat, lng], {
      radius: 45000,
      color: '#00D2FF',
      weight: 1.5,
      dashArray: '4, 6',
      fillColor: '#00D2FF',
      fillOpacity: 0.07,
    });

    userGroup.addLayer(radarCircle);
    userGroup.addLayer(userMarker);

    // Smoothly fly to user's location with detailed zoom
    map.flyTo([lat, lng], 8, { duration: 1.4 });
  }, [userLocation]);

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
        {onFindNearMe && (
          <button
            onClick={onFindNearMe}
            disabled={isLocating}
            title={userLocation ? 'Your Location Active (Click to re-center)' : 'Heritage Near Me (Fly to closest living traditions)'}
            className={`w-8 h-8 rounded border flex items-center justify-center transition-all shadow-lg ${
              userLocation
                ? 'bg-[#00D2FF] text-[#121526] border-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.6)] hover:brightness-110'
                : 'bg-[#1E2340]/90 backdrop-blur border-[#E8A33D]/30 text-[#F3ECDD] hover:bg-[#E8A33D] hover:text-[#1E2340]'
            }`}
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin text-[#00D2FF]' : ''}`} />
          </button>
        )}
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
