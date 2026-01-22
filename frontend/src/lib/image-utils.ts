const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Normalizes an image URL to ensure it's an absolute URL.
 * If the URL is relative, it will be converted to an absolute URL using the API base URL.
 * 
 * @param url - The image URL (can be relative or absolute)
 * @returns The normalized absolute URL
 */
export const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url || !url.trim()) {
    return '';
  }

  const trimmedUrl = url.trim();

  // If already an absolute URL (http:// or https://), return as is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }

  // If it starts with //, it's a protocol-relative URL - add https:
  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }

  // If it starts with /, it's an absolute path on the same domain
  if (trimmedUrl.startsWith('/')) {
    // Check if it's already pointing to uploads or the API
    if (trimmedUrl.startsWith('/uploads/')) {
      return `${API_BASE_URL}${trimmedUrl}`;
    }
    // For other absolute paths, assume they're relative to the API base
    return `${API_BASE_URL}${trimmedUrl}`;
  }

  // For relative paths (e.g., "uploads/image.jpg"), construct full URL
  // Remove leading ./ if present
  const cleanPath = trimmedUrl.replace(/^\.\//, '');
  
  // If it doesn't start with uploads/, prepend it
  const uploadPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  
  return `${API_BASE_URL}/${uploadPath}`;
};

/**
 * Normalizes an array of image URLs
 * 
 * @param urls - Array of image URLs
 * @returns Array of normalized absolute URLs
 */
export const normalizeImageUrls = (urls: (string | undefined | null)[]): string[] => {
  return urls
    .map(normalizeImageUrl)
    .filter(url => url.length > 0);
};

/**
 * Converts plain text with line breaks to HTML paragraphs
 * Double line breaks create new paragraphs, single line breaks create <br> tags
 * Also handles content that has HTML tags but missing paragraph tags
 * 
 * @param text - The text content (may contain line breaks or HTML)
 * @returns HTML content with proper paragraph tags
 */
export const convertTextToParagraphs = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Check if content already has paragraph tags
  if (/<p[\s>]/i.test(text)) {
    // Already has paragraphs, return as is
    return text;
  }

  // Check if content has other HTML tags (like img, video, etc.)
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(text);
  
  if (hasHtmlTags) {
    // Content has HTML tags but no paragraphs - wrap text blocks in paragraphs
    // Split by double line breaks or HTML tags
    const parts = text.split(/(\n\s*\n|<(?:img|video|iframe|figure)[^>]*>)/i);
    let result = '';
    let currentParagraph = '';
    
    for (const part of parts) {
      if (/<(?:img|video|iframe|figure)[^>]*>/i.test(part)) {
        // If we have accumulated text, wrap it in a paragraph
        if (currentParagraph.trim()) {
          result += `<p>${currentParagraph.trim().replace(/\n/g, '<br>')}</p>`;
          currentParagraph = '';
        }
        // Add the HTML tag as-is
        result += part;
      } else if (/^\n\s*\n$/.test(part)) {
        // Double line break - end current paragraph and start new one
        if (currentParagraph.trim()) {
          result += `<p>${currentParagraph.trim().replace(/\n/g, '<br>')}</p>`;
          currentParagraph = '';
        }
      } else {
        // Regular text - add to current paragraph
        currentParagraph += part;
      }
    }
    
    // Add any remaining text as a paragraph
    if (currentParagraph.trim()) {
      result += `<p>${currentParagraph.trim().replace(/\n/g, '<br>')}</p>`;
    }
    
    return result || text;
  }

  // Plain text - split by double line breaks (paragraph breaks)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length === 0) {
    // No double line breaks, treat entire text as one paragraph
    return `<p>${text.trim().replace(/\n/g, '<br>')}</p>`;
  }
  
  // Wrap each paragraph in <p> tags and convert single line breaks to <br>
  return paragraphs
    .map(para => {
      // Replace single line breaks with <br> tags
      const withBreaks = para.trim().replace(/\n/g, '<br>');
      return `<p>${withBreaks}</p>`;
    })
    .join('');
};

/**
 * Processes HTML content to normalize all image src attributes
 * This ensures images embedded in HTML content (like contentRW) use absolute URLs
 * Also adds styling to make images smaller and responsive
 * 
 * @param html - The HTML content string
 * @returns HTML content with normalized image URLs and size constraints
 */
export const normalizeHtmlImageUrls = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return html;
  }

  // Replace all img tags with normalized URLs and size constraints
  return html.replace(
    /<img([^>]*)>/gi,
    (match, attributes) => {
      // Extract src attribute
      const srcMatch = attributes.match(/\s+src=["']([^"']+)["']/i);
      if (!srcMatch) {
        return match; // Return original if no src found
      }

      const url = srcMatch[1];
      const normalizedUrl = normalizeImageUrl(url);

      // Check if style attribute already exists
      let updatedAttributes = attributes;
      
      // Replace or add src with normalized URL
      updatedAttributes = updatedAttributes.replace(
        /\s+src=["'][^"']+["']/i,
        ` src="${normalizedUrl}"`
      );

      // Add or update style attribute for images (full width, centered)
      const styleMatch = updatedAttributes.match(/\s+style=["']([^"']*)["']/i);
      const imageStyle = 'width: 100%; max-width: 100%; height: auto; margin: 24px 0; border-radius: 4px; display: block;';
      
      if (styleMatch) {
        // Replace existing style with new one
        updatedAttributes = updatedAttributes.replace(
          /\s+style=["'][^"']*["']/i,
          ` style="${imageStyle}"`
        );
      } else {
        // Add new style attribute
        updatedAttributes += ` style="${imageStyle}"`;
      }

      // Add class for additional styling if not present
      if (!updatedAttributes.includes('class=')) {
        updatedAttributes += ' class="content-image"';
      }

      return `<img${updatedAttributes}>`;
    }
  );
};

/**
 * Processes HTML content to add captions below images based on imageCaptions data
 * 
 * @param html - The HTML content string
 * @param imageCaptions - Map of image URLs to captions: { "url": { "EN": "...", "RW": "...", "FR": "..." } }
 * @param language - Current language code ('EN', 'RW', or 'FR')
 * @returns HTML content with captions added below images
 */
export const addImageCaptions = (
  html: string,
  imageCaptions?: Record<string, { EN?: string; RW?: string; FR?: string }>,
  language: 'EN' | 'RW' | 'FR' = 'EN'
): string => {
  if (!html || typeof html !== 'string') {
    return html;
  }
  
  if (!imageCaptions || Object.keys(imageCaptions).length === 0) {
    console.log('addImageCaptions: No imageCaptions provided or empty');
    return html;
  }

  console.log('addImageCaptions: Processing HTML with', Object.keys(imageCaptions).length, 'caption keys');
  console.log('addImageCaptions: Caption keys:', Object.keys(imageCaptions));
  console.log('addImageCaptions: Language:', language);

  // Replace img tags with img + caption
  // Match img tags that are not already inside figure tags
  return html.replace(
    /<img([^>]*)>/gi,
    (match, attributes, offset) => {
      // Check if this img tag is already inside a figure tag
      const beforeMatch = html.substring(Math.max(0, offset - 200), offset);
      if (beforeMatch.includes('<figure') && !beforeMatch.includes('</figure>')) {
        console.log('addImageCaptions: Skipping img tag already inside figure');
        return match;
      }
      
      // Extract src attribute - handle both quoted and unquoted attributes
      const srcMatch = attributes.match(/\s+src\s*=\s*["']?([^"'\s>]+)["']?/i);
      if (!srcMatch) {
        console.log('addImageCaptions: No src attribute found in img tag');
        return match; // Return original if no src found
      }

      const url = srcMatch[1];
      const normalizedUrl = normalizeImageUrl(url);
      
      console.log('addImageCaptions: Found img tag with URL:', url);
      console.log('addImageCaptions: Normalized URL:', normalizedUrl);
      
      // Find matching caption - try multiple URL variations for robust matching
      let caption: string | undefined;
      let captionData = imageCaptions[normalizedUrl] || imageCaptions[url];
      
      // If not found, try matching against all keys (normalize each key and compare)
      if (!captionData) {
        for (const [key, value] of Object.entries(imageCaptions)) {
          const normalizedKey = normalizeImageUrl(key);
          // Try multiple matching strategies
          if (
            normalizedKey === normalizedUrl || 
            normalizedKey === url || 
            key === normalizedUrl || 
            key === url ||
            normalizedKey.replace(/\/$/, '') === normalizedUrl.replace(/\/$/, '') ||
            key.replace(/\/$/, '') === url.replace(/\/$/, '')
          ) {
            console.log('addImageCaptions: Found matching caption for key:', key);
            captionData = value;
            break;
          }
        }
      } else {
        console.log('addImageCaptions: Found caption data directly');
      }
      
      if (captionData) {
        caption = captionData[language] || captionData.EN || captionData.RW || captionData.FR;
        console.log('addImageCaptions: Caption text:', caption);
      } else {
        console.log('addImageCaptions: No caption found for URL:', url);
      }

      // If no caption found, return original img tag
      if (!caption) {
        return match;
      }

      // Return img tag wrapped with figure and figcaption
      const result = `<figure class="image-with-caption">${match}<figcaption class="image-caption text-sm text-muted-foreground mt-2 text-center italic">${caption}</figcaption></figure>`;
      console.log('addImageCaptions: Returning wrapped img with caption');
      return result;
    }
  );
};
