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
