import { useMemo } from 'react';
import type { NewsArticle } from '@/contexts/NewsContext';
import type { Language } from '@/contexts/LanguageContext';
import { useTranslatedText } from './use-translated-content';

export const useTranslatedArticle = (article: NewsArticle, language: Language) => {
  const title = useTranslatedText(article.title, language);
  const excerpt = useTranslatedText(article.excerpt, language);
  const content = useTranslatedText(article.content, language);

  return useMemo(() => ({
    id: article.id,
    title,
    excerpt,
    content,
    category: article.category,
    image: article.image,
    video: article.video,
    date: article.date,
    author: article.author,
    featured: article.featured,
  }), [article.id, title, excerpt, content, article.category, article.image, article.video, article.date, article.author, article.featured]);
};

