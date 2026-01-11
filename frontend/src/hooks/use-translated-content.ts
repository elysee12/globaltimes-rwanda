import { useState, useEffect } from 'react';
import type { Language } from '@/contexts/LanguageContext';
import { getLocalizedText, getLocalizedTextSync } from '@/lib/localization';

type LocalizedField = Partial<Record<Language, string | null | undefined>>;

export const useTranslatedText = (field: LocalizedField | undefined, language: Language): string => {
  const [translatedText, setTranslatedText] = useState<string>('');

  useEffect(() => {
    const loadTranslation = async () => {
      if (!field) {
        setTranslatedText('');
        return;
      }

      // First check if we have the text in the selected language (synchronous)
      const syncText = getLocalizedTextSync(field, language);
      if (syncText) {
        setTranslatedText(syncText);
        return;
      }

      // If not available in selected language, translate it
      try {
        const translated = await getLocalizedText(field, language);
        setTranslatedText(translated);
      } catch (error) {
        console.warn('Translation failed:', error);
        setTranslatedText('');
      }
    };

    loadTranslation();
  }, [field, language]);

  return translatedText;
};

