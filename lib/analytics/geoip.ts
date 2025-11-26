export interface GeoIPResult {
  country: string | null;
  city: string | null;
  region: string | null;
}

/**
 * Lookup geographic information from IP address
 * Uses geoip-lite for offline lookup (lazy loaded to avoid edge runtime issues)
 */
export async function lookupGeoIP(ip: string | null): Promise<GeoIPResult> {
  if (!ip) {
    return {
      country: null,
      city: null,
      region: null,
    };
  }

  try {
    // Remove port if present (e.g., "127.0.0.1:12345" -> "127.0.0.1")
    const cleanIP = ip.split(':')[0].trim();

    // Skip localhost/private IPs
    if (
      cleanIP === '127.0.0.1' ||
      cleanIP === 'localhost' ||
      cleanIP.startsWith('192.168.') ||
      cleanIP.startsWith('10.') ||
      cleanIP.startsWith('172.16.') ||
      cleanIP.startsWith('172.17.') ||
      cleanIP.startsWith('172.18.') ||
      cleanIP.startsWith('172.19.') ||
      cleanIP.startsWith('172.20.') ||
      cleanIP.startsWith('172.21.') ||
      cleanIP.startsWith('172.22.') ||
      cleanIP.startsWith('172.23.') ||
      cleanIP.startsWith('172.24.') ||
      cleanIP.startsWith('172.25.') ||
      cleanIP.startsWith('172.26.') ||
      cleanIP.startsWith('172.27.') ||
      cleanIP.startsWith('172.28.') ||
      cleanIP.startsWith('172.29.') ||
      cleanIP.startsWith('172.30.') ||
      cleanIP.startsWith('172.31.')
    ) {
      return {
        country: null,
        city: null,
        region: null,
      };
    }

    // Dynamic import to avoid edge runtime issues
    const geoipModule = await import('geoip-lite');
    const geoip = geoipModule.default || geoipModule;
    const geo = geoip.lookup(cleanIP);

    if (!geo) {
      return {
        country: null,
        city: null,
        region: null,
      };
    }

    return {
      country: geo.country || null,
      city: geo.city || null,
      region: geo.region || null,
    };
  } catch (error) {
    // Silently fail - GeoIP is optional
    console.error('Error looking up GeoIP:', error);
    return {
      country: null,
      city: null,
      region: null,
    };
  }
}

/**
 * Extract language from Accept-Language header
 * Returns the primary language code (e.g., "en", "tr", "fr")
 */
export function extractLanguage(acceptLanguage: string | null): string | null {
  if (!acceptLanguage) {
    return null;
  }

  try {
    // Accept-Language format: "en-US,en;q=0.9,tr;q=0.8"
    // Extract the first language code
    const languages = acceptLanguage.split(',');
    if (languages.length > 0) {
      const primaryLang = languages[0].split(';')[0].trim().toLowerCase();
      // Extract just the language code (e.g., "en" from "en-US")
      const langCode = primaryLang.split('-')[0];
      return langCode || null;
    }
  } catch (error) {
    console.error('Error extracting language:', error);
  }

  return null;
}

