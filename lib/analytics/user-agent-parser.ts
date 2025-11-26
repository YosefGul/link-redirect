import { UAParser } from 'ua-parser-js';

export interface ParsedUserAgent {
  os: string | null;
  deviceType: string | null;
  browser: string | null;
  browserVersion: string | null;
}

/**
 * Parse user agent string to extract OS, device type, browser, and version
 */
export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      os: null,
      deviceType: null,
      browser: null,
      browserVersion: null,
    };
  }

  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Extract OS
    const osName = result.os.name || null;
    const osVersion = result.os.version || null;
    const os = osName ? (osVersion ? `${osName} ${osVersion}` : osName) : null;

    // Extract device type
    const deviceType = result.device.type || null;
    // Normalize device type
    let normalizedDeviceType: string | null = null;
    if (deviceType) {
      normalizedDeviceType = deviceType.toLowerCase();
      // Map common device types
      if (normalizedDeviceType === 'mobile' || normalizedDeviceType === 'smartphone') {
        normalizedDeviceType = 'Mobile';
      } else if (normalizedDeviceType === 'tablet') {
        normalizedDeviceType = 'Tablet';
      } else if (normalizedDeviceType === 'desktop' || !normalizedDeviceType) {
        // If no device type specified, check OS to infer
        if (osName && (osName.includes('Windows') || osName.includes('Mac') || osName.includes('Linux'))) {
          normalizedDeviceType = 'Desktop';
        } else if (osName && (osName.includes('iOS') || osName.includes('Android'))) {
          // Could be mobile or tablet, default to Mobile
          normalizedDeviceType = 'Mobile';
        } else {
          normalizedDeviceType = 'Desktop';
        }
      } else {
        // Capitalize first letter
        normalizedDeviceType = normalizedDeviceType.charAt(0).toUpperCase() + normalizedDeviceType.slice(1);
      }
    } else {
      // Infer from OS if device type not available
      if (osName) {
        if (osName.includes('Windows') || osName.includes('Mac') || osName.includes('Linux')) {
          normalizedDeviceType = 'Desktop';
        } else if (osName.includes('iOS') || osName.includes('Android')) {
          normalizedDeviceType = 'Mobile';
        } else {
          normalizedDeviceType = 'Desktop';
        }
      } else {
        normalizedDeviceType = 'Desktop'; // Default fallback
      }
    }

    // Extract browser and version
    const browserName = result.browser.name || null;
    const browserVersion = result.browser.version || null;
    const browser = browserName || null;

    return {
      os,
      deviceType: normalizedDeviceType,
      browser,
      browserVersion: browserVersion || null,
    };
  } catch (error) {
    console.error('Error parsing user agent:', error);
    return {
      os: null,
      deviceType: null,
      browser: null,
      browserVersion: null,
    };
  }
}

/**
 * Get browser name and version combined
 */
export function getBrowserWithVersion(userAgent: string | null): string {
  const parsed = parseUserAgent(userAgent);
  if (parsed.browser && parsed.browserVersion) {
    return `${parsed.browser} ${parsed.browserVersion}`;
  }
  return parsed.browser || 'Unknown';
}


