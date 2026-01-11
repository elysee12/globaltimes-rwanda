import type { NewsArticle } from '@/contexts/NewsContext';
import type { Language } from '@/contexts/LanguageContext';

type LocalizedField = Partial<Record<Language, string | null | undefined>>;

const FALLBACK_ORDER: Language[] = ['EN', 'RW', 'FR'];

const languageCodes: Record<Language, string> = {
  EN: 'en',
  RW: 'rw',
  FR: 'fr',
};

// Translation cache to avoid repeated API calls
const translationCache = new Map<string, string>();

// Translate text using Google Translate API
export const translateText = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  if (!text?.trim() || sourceLang === targetLang) {
    return text;
  }

  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${languageCodes[sourceLang]}&tl=${languageCodes[targetLang]}&dt=t&q=${encodeURIComponent(text)}`
    );
    
    if (!response.ok) {
      console.warn('Translation failed, returning original text');
      return text;
    }

    const data = await response.json();
    const translated = data?.[0]?.map((item: any[]) => item[0]).join('') || text;
    
    // Cache the translation
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    console.warn('Translation error:', error);
    return text;
  }
};

// Get text in the selected language ONLY, with automatic translation if needed
export const getLocalizedText = async (
  field: LocalizedField | undefined,
  language: Language
): Promise<string> => {
  if (!field) {
    return '';
  }

  // First, try to get the text in the selected language
  const selectedValue = field[language];
  if (typeof selectedValue === 'string' && selectedValue.trim().length > 0) {
    return selectedValue;
  }

  // If not available, find the first available text in any language and translate it
  const fallbackOrder: Language[] = ['EN', 'RW', 'FR'].filter(lang => lang !== language);
  
  for (const fallbackLang of fallbackOrder) {
    const fallbackValue = field[fallbackLang];
    if (typeof fallbackValue === 'string' && fallbackValue.trim().length > 0) {
      // Translate from fallback language to selected language
      return await translateText(fallbackValue, fallbackLang, language);
    }
  }

  return '';
};

// Synchronous version that returns the selected language only (no translation)
// Use this for immediate display, translation will happen asynchronously
export const getLocalizedTextSync = (field: LocalizedField | undefined, language: Language): string => {
  if (!field) {
    return '';
  }

  const value = field[language];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return '';
};

// Synchronous version for immediate rendering - returns selected language only
// If content doesn't exist in selected language, returns empty string
// Use useTranslatedText hook in components for automatic translation
export const getLocalizedArticleFields = (article: NewsArticle, language: Language) => ({
  title: getLocalizedTextSync(article.title, language),
  excerpt: getLocalizedTextSync(article.excerpt, language),
  content: getLocalizedTextSync(article.content, language),
  // Include the full field objects for translation hooks
  titleField: article.title,
  excerptField: article.excerpt,
  contentField: article.content,
});

// Async version with automatic translation
export const getLocalizedArticleFieldsAsync = async (article: NewsArticle, language: Language) => ({
  title: await getLocalizedText(article.title, language),
  excerpt: await getLocalizedText(article.excerpt, language),
  content: await getLocalizedText(article.content, language),
});

// Category name translation helper
// Translates category names based on the selected language
export const getTranslatedCategory = (category: string, t: (key: string) => string): string => {
  if (!category) return category;
  
  // Normalize category name: capitalize first letter, lowercase the rest
  // e.g., "politics" -> "Politics", "BUSINESS" -> "Business"
  const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  
  const categoryKey = `categories.${normalizedCategory}`;
  const translated = t(categoryKey);
  
  // The t() function returns the key if translation is not found
  // If translation was found, it returns the translated string
  // So if translated !== categoryKey, it means we got a valid translation
  if (translated && translated !== categoryKey) {
    return translated;
  }
  
  // Fallback to normalized category if translation not found
  return normalizedCategory;
};

