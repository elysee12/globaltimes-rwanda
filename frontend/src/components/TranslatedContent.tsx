import { ReactNode } from 'react';
import { useTranslatedText } from '@/hooks/use-translated-content';
import type { Language } from '@/contexts/LanguageContext';

type LocalizedField = Partial<Record<Language, string | null | undefined>>;

interface TranslatedTextProps {
  field: LocalizedField | undefined;
  language: Language;
  fallback?: string;
  children?: (text: string) => ReactNode;
}

export const TranslatedText = ({ field, language, fallback = '', children }: TranslatedTextProps) => {
  const translatedText = useTranslatedText(field, language);
  const displayText = translatedText || fallback;

  if (children) {
    return <>{children(displayText)}</>;
  }

  return <>{displayText}</>;
};

