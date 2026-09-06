'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enMessages from '../messages/en.json';
import hiMessages from '../messages/hi.json';
import mrMessages from '../messages/mr.json';
import taMessages from '../messages/ta.json';
import bnMessages from '../messages/bn.json';

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'bn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'EN', nativeName: 'English' },
  { code: 'hi', label: 'HI', nativeName: 'हिंदी' },
  { code: 'mr', label: 'MR', nativeName: 'मराठी' },
  { code: 'ta', label: 'TA', nativeName: 'தமிழ்' },
  { code: 'bn', label: 'BN', nativeName: 'বাংলা' },
];

const MESSAGES_MAP: Record<SupportedLanguage, Record<string, any>> = {
  en: enMessages,
  hi: hiMessages,
  mr: mrMessages,
  ta: taMessages,
  bn: bnMessages,
};

// Static Indian State Centroids for Geolocation detection
interface StateCentroid {
  state: string;
  lat: number;
  lng: number;
  lang: SupportedLanguage;
}

const INDIAN_STATE_CENTROIDS: StateCentroid[] = [
  // Maharashtra -> Marathi
  { state: 'Maharashtra', lat: 19.7515, lng: 75.7139, lang: 'mr' },

  // Tamil Nadu -> Tamil
  { state: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, lang: 'ta' },

  // West Bengal & Tripura -> Bengali
  { state: 'West Bengal', lat: 22.9868, lng: 87.8550, lang: 'bn' },
  { state: 'Tripura', lat: 23.9408, lng: 91.9882, lang: 'bn' },

  // Hindi Belt States -> Hindi
  { state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, lang: 'hi' },
  { state: 'Bihar', lat: 25.0961, lng: 85.3131, lang: 'hi' },
  { state: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569, lang: 'hi' },
  { state: 'Rajasthan', lat: 27.0238, lng: 74.2179, lang: 'hi' },
  { state: 'Delhi', lat: 28.7041, lng: 77.1025, lang: 'hi' },
  { state: 'Haryana', lat: 29.0588, lng: 76.0856, lang: 'hi' },
  { state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, lang: 'hi' },
  { state: 'Jharkhand', lat: 23.6102, lng: 85.2799, lang: 'hi' },
  { state: 'Chhattisgarh', lat: 21.2787, lng: 81.8661, lang: 'hi' },
  { state: 'Uttarakhand', lat: 30.0668, lng: 79.0193, lang: 'hi' },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function detectStateLanguage(lat: number, lng: number): SupportedLanguage {
  let closestLang: SupportedLanguage = 'en';
  let minDistance = 750; // max radius threshold in km

  for (const item of INDIAN_STATE_CENTROIDS) {
    const dist = getDistanceKm(lat, lng, item.lat, item.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestLang = item.lang;
    }
  }

  return closestLang;
}

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  detectedState: string | null;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  detectedState: null,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [detectedState, setDetectedState] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if user already manually selected a language
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dharohar_ui_lang') as SupportedLanguage;
      if (stored && MESSAGES_MAP[stored]) {
        setLanguageState(stored);
        return;
      }

      // 2. Geolocation auto-detection on first visit
      const prompted = sessionStorage.getItem('dharohar_geo_attempted');
      if (!prompted && 'geolocation' in navigator) {
        sessionStorage.setItem('dharohar_geo_attempted', 'true');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const detected = detectStateLanguage(latitude, longitude);
            if (detected && detected !== 'en') {
              setLanguageState(detected);
              localStorage.setItem('dharohar_ui_lang', detected);
              console.log(`[Dharohar Setu i18n] Geolocation mapped coords (${latitude.toFixed(2)}, ${longitude.toFixed(2)}) -> ${detected}`);
            }
          },
          (error) => {
            // Permission denied or timeout -> default quietly to English
            console.log('[Dharohar Setu i18n] Geolocation default fallback to English.');
          },
          { timeout: 8000, maximumAge: 3600000 }
        );
      }
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dharohar_ui_lang', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, detectedState }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Hook to retrieve translated strings with guaranteed silent English fallback
 * Usage:
 *   const t = useTranslations('home');
 *   <h1>{t('heroTitle')}</h1>
 *   <p>{t('criticalThreshold', { years: 3 })}</p>
 */
export function useTranslations(namespace?: string) {
  const { language } = useLanguage();

  return (key: string, params?: Record<string, string | number>): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const parts = fullKey.split('.');

    const resolveKey = (obj: any): string | undefined => {
      let curr = obj;
      for (const p of parts) {
        if (curr && typeof curr === 'object' && p in curr) {
          curr = curr[p];
        } else {
          return undefined;
        }
      }
      return typeof curr === 'string' ? curr : undefined;
    };

    // 1. Try active language
    let result = resolveKey(MESSAGES_MAP[language]);

    // 2. Fallback to English if missing
    if (!result && language !== 'en') {
      result = resolveKey(MESSAGES_MAP.en);
    }

    // 3. Fallback to readable title case if missing in English too (never leak camelCase code identifiers)
    if (!result) {
      const raw = parts[parts.length - 1] || key;
      result = raw
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    }

    // Interpolate {param} placeholders
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = (result as string).replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return result;
  };
}
