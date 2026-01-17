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

// Placeholder prefix for protecting HTML tags during translation
const HTML_PLACEHOLDER_PREFIX = '__HTML_TAG_PLACEHOLDER_';

/**
 * Protects HTML tags (especially img tags) by replacing them with placeholders
 * This prevents translation services from corrupting HTML structure
 * 
 * @param html - HTML content string
 * @returns Object with protected HTML and placeholder map
 */
function protectHtmlTags(html: string): { protectedHtml: string; placeholders: Map<string, string> } {
  const placeholders = new Map<string, string>();
  let counter = 0;

  // Protect img tags
  let protectedHtml = html.replace(/<img[^>]*>/gi, (match) => {
    const placeholder = `${HTML_PLACEHOLDER_PREFIX}IMG_${counter++}__`;
    placeholders.set(placeholder, match);
    return placeholder;
  });

  // Protect other common HTML tags that might be corrupted
  protectedHtml = protectedHtml.replace(/<video[^>]*>.*?<\/video>/gis, (match) => {
    const placeholder = `${HTML_PLACEHOLDER_PREFIX}VIDEO_${counter++}__`;
    placeholders.set(placeholder, match);
    return placeholder;
  });

  protectedHtml = protectedHtml.replace(/<iframe[^>]*>.*?<\/iframe>/gis, (match) => {
    const placeholder = `${HTML_PLACEHOLDER_PREFIX}IFRAME_${counter++}__`;
    placeholders.set(placeholder, match);
    return placeholder;
  });

  return { protectedHtml, placeholders };
}

/**
 * Restores HTML tags from placeholders after translation
 * 
 * @param translatedHtml - Translated HTML with placeholders
 * @param placeholders - Map of placeholder to original HTML tag
 * @returns HTML with restored tags
 */
function restoreHtmlTags(translatedHtml: string, placeholders: Map<string, string>): string {
  let restored = translatedHtml;
  placeholders.forEach((originalTag, placeholder) => {
    // Replace placeholder with original tag (use global replace to handle multiple instances)
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    restored = restored.replace(regex, originalTag);
  });
  return restored;
}

// Translate text using Google Translate API
// For HTML content, this preserves HTML tags (especially img tags) during translation
export const translateText = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  if (!text?.trim() || sourceLang === targetLang) {
    return text;
  }

  // Use original text for cache key to ensure consistency
  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Check if the text contains HTML tags (especially img tags)
  const hasHtmlTags = /<img[^>]*>|<video[^>]*>|<iframe[^>]*>/i.test(text);
  
  let textToTranslate = text;
  let placeholders: Map<string, string> | null = null;

  // Protect HTML tags before translation
  if (hasHtmlTags) {
    const protectedResult = protectHtmlTags(text);
    textToTranslate = protectedResult.protectedHtml;
    placeholders = protectedResult.placeholders;
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${languageCodes[sourceLang]}&tl=${languageCodes[targetLang]}&dt=t&q=${encodeURIComponent(textToTranslate)}`
    );
    
    if (!response.ok) {
      console.warn('Translation failed, returning original text');
      return text;
    }

    const data = await response.json();
    let translated = data?.[0]?.map((item: any[]) => item[0]).join('') || textToTranslate;
    
    // Restore HTML tags after translation
    if (placeholders) {
      translated = restoreHtmlTags(translated, placeholders);
    }
    
    // Cache the final translated result (with HTML restored) using original text as key
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

