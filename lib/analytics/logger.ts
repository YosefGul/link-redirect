import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUserAgent } from './user-agent-parser';
import { lookupGeoIP, extractLanguage } from './geoip';

/**
 * Extract IP address from request
 */
function getClientIP(request: NextRequest): string | null {
  // Try various headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - this might not work in all environments
  return null;
}

/**
 * Log a visit to a link
 */
export async function logVisit(linkId: number, request: NextRequest): Promise<void> {
  try {
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || null;
    const referer = request.headers.get('referer') || null;
    const acceptLanguage = request.headers.get('accept-language') || null;

    // Parse user agent for OS and device type
    const parsedUA = parseUserAgent(userAgent);

    // Lookup GeoIP data (async)
    const geoData = await lookupGeoIP(ip);

    // Extract language preference
    const language = extractLanguage(acceptLanguage);

    // Log asynchronously (don't await - fire and forget)
    prisma.linkLog
      .create({
        data: {
          linkId,
          ip: ip || undefined,
          userAgent,
          referer,
          country: geoData.country || null,
          city: geoData.city || null,
          os: parsedUA.os || null,
          deviceType: parsedUA.deviceType || null,
          language: language || null,
        },
      })
      .catch((error) => {
        console.error('Error logging visit:', error);
      });
  } catch (error) {
    console.error('Error in logVisit:', error);
  }
}

