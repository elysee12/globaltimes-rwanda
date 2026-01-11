import { useMemo } from 'react';
import type { NewsArticle } from '@/contexts/NewsContext';
import type { Language } from '@/contexts/LanguageContext';
import { useTranslatedArticle } from './use-translated-article';

export const useTranslatedArticles = (articles: NewsArticle[], language: Language) => {
  return useMemo(() => {
    return articles.map(article => {
      // We'll use a component-level hook, so for now return the article with translation fields
      return {
        article,
        language,
      };
    });
  }, [articles, language]);
};

