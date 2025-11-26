/**
 * Generate a random slug
 */
export function generateSlug(length: number = 7): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize URL to prevent open redirect attacks
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }

    // Prevent javascript: and data: URLs
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'javascript:' || protocol === 'data:') {
      throw new Error('Invalid protocol');
    }

    return parsed.toString();
  } catch {
    throw new Error('Invalid URL');
  }
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): boolean {
  // Only alphanumeric characters and hyphens/underscores
  return /^[a-zA-Z0-9_-]+$/.test(slug) && slug.length >= 3 && slug.length <= 64;
}

