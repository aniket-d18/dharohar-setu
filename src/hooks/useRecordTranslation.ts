'use client';

import { useState, useEffect } from 'react';
import { useLanguage, SupportedLanguage } from '@/context/LanguageContext';

export interface TranslatedContent {
  translatedTitle?: string | null;
  translatedSummary?: string | null;
  translatedText?: string | null;
  translatedTags?: string[];
  aiModel?: string;
  cached?: boolean;
  isFallback?: boolean;
}

// In-session memory cache to avoid repeat fetches while navigating
const translationMemoryCache = new Map<string, TranslatedContent>();

export function useRecordTranslation(
  recordId: string,
  original: {
    summaryText?: string | null;
    translationText?: string | null;
    transcriptionText?: string | null;
    tags?: string[];
  }
) {
  const { language } = useLanguage();
  const [showOriginal, setShowOriginal] = useState(false);
  const [translation, setTranslation] = useState<TranslatedContent | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // If English, no translation needed
    if (language === 'en') {
      setTranslation(null);
      setIsTranslating(false);
      return;
    }

    const cacheKey = `${recordId}_${language}`;
    if (translationMemoryCache.has(cacheKey)) {
      setTranslation(translationMemoryCache.get(cacheKey)!);
      setIsTranslating(false);
      return;
    }

    let isMounted = true;
    setIsTranslating(true);

    // Request translation from same-origin Next.js route (or fallback to port 4000)
    fetch('/api/records/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recordId,
        languageCode: language,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          return fetch(`${API_URL}/api/records/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordId, languageCode: language }),
          }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data && (data.translatedTitle || data.translatedSummary || data.translatedText)) {
          translationMemoryCache.set(cacheKey, data);
          setTranslation(data);
        } else {
          setTranslation(null);
        }
        setIsTranslating(false);
      })
      .catch((err) => {
        console.warn(`[useRecordTranslation] Translation fetch notice for ${recordId}:`, err);
        if (isMounted) {
          setIsTranslating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [recordId, language]);

  // When language switches, default to showing the translation if not English
  useEffect(() => {
    setShowOriginal(false);
  }, [language]);

  const hasTranslation = Boolean(translation && !translation.isFallback && language !== 'en');

  const displayedTitle =
    !showOriginal && hasTranslation && translation?.translatedTitle
      ? translation.translatedTitle
      : original.summaryText;

  const displayedSummary =
    !showOriginal && hasTranslation && translation?.translatedSummary
      ? translation.translatedSummary
      : original.summaryText;

  const displayedTranslation =
    !showOriginal && hasTranslation && translation?.translatedText
      ? translation.translatedText
      : original.translationText;

  const displayedTags =
    !showOriginal &&
    hasTranslation &&
    translation?.translatedTags &&
    translation.translatedTags.length > 0
      ? translation.translatedTags
      : original.tags || [];

  return {
    language,
    isTranslating,
    hasTranslation,
    showOriginal,
    setShowOriginal,
    displayedTitle,
    displayedSummary,
    displayedTranslation,
    displayedTags,
    translation,
  };
}
