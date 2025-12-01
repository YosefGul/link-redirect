import { prisma } from '@/lib/prisma';
import { generateSlug, validateURL, sanitizeURL, validateSlug } from './utils';
import { setCachedTarget, invalidateSlug } from '@/lib/cache';
import { CreateLinkRequest, UpdateLinkRequest } from '@/types/link';
import {
  parseRefererCategory,
  calculateUniqueVisitors,
  calculateHourlyHits,
  calculateWeeklyHits,
  calculateMonthlyHits,
  calculatePeakHours,
  calculateGrowthRate,
  calculateClickVelocity,
  parseBrowserVersions,
  calculateReturnVisitorRate,
} from './stats-utils';
import { hashLinkPassword } from './password';
import { validateExpirationDate, checkLinkExpiration } from './expiration-check';
import { checkMaxClicks } from './max-clicks';

/**
 * Create a new short link
 */
export async function createLink(data: CreateLinkRequest, userId: string) {
  // Validate and sanitize URL
  if (!validateURL(data.targetUrl)) {
    throw new Error('Invalid URL');
  }

  const sanitizedUrl = sanitizeURL(data.targetUrl);

  // Validate expiration date if provided
  if (data.expiresAt) {
    const expirationValidation = validateExpirationDate(data.expiresAt);
    if (!expirationValidation.valid) {
      throw new Error(expirationValidation.error || 'Invalid expiration date');
    }
  }

  // Validate max clicks if provided
  if (data.maxClicks !== undefined && data.maxClicks !== null) {
    if (data.maxClicks < 1) {
      throw new Error('Max clicks must be at least 1');
    }
  }

  // Hash password if provided
  let passwordHash: string | null = null;
  if (data.password) {
    passwordHash = await hashLinkPassword(data.password);
  }

  // Generate or validate slug
  let slug = data.slug;
  if (slug) {
    if (!validateSlug(slug)) {
      throw new Error('Invalid slug format');
    }
    // Check if slug already exists
    const existing = await prisma.shortLink.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new Error('Slug already exists');
    }
  } else {
    // Generate unique slug
    let attempts = 0;
    do {
      slug = generateSlug();
      const existing = await prisma.shortLink.findUnique({
        where: { slug },
      });
      if (!existing) break;
      attempts++;
      if (attempts > 10) {
        throw new Error('Failed to generate unique slug');
      }
    } while (true);
  }

  // Convert expiresAt to Date if it's a string
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  // Create link
  const link = await prisma.shortLink.create({
    data: {
      slug,
      targetUrl: sanitizedUrl,
      ownerId: userId,
      expiresAt,
      passwordHash,
      maxClicks: data.maxClicks || null,
    },
  });

  // Cache the target URL
  await setCachedTarget(slug, sanitizedUrl);

  return link;
}

/**
 * Update a link
 */
export async function updateLink(slug: string, data: UpdateLinkRequest, userId: string) {
  // Check ownership
  const existing = await prisma.shortLink.findUnique({
    where: { slug },
  });

  if (!existing) {
    throw new Error('Link not found');
  }

  if (existing.ownerId !== userId) {
    throw new Error('Unauthorized');
  }

  if (!existing.allowEdit) {
    throw new Error('Link editing is disabled');
  }

  // Validate and sanitize URL if provided
  let targetUrl = existing.targetUrl;
  if (data.targetUrl) {
    if (!validateURL(data.targetUrl)) {
      throw new Error('Invalid URL');
    }
    targetUrl = sanitizeURL(data.targetUrl);
  }

  // Validate expiration date if provided
  let expiresAt = existing.expiresAt;
  if (data.expiresAt !== undefined) {
    if (data.expiresAt === null) {
      expiresAt = null; // Remove expiration
    } else {
      const expirationValidation = validateExpirationDate(data.expiresAt);
      if (!expirationValidation.valid) {
        throw new Error(expirationValidation.error || 'Invalid expiration date');
      }
      expiresAt = new Date(data.expiresAt);
    }
  }

  // Handle password update
  let passwordHash = existing.passwordHash;
  if (data.password !== undefined) {
    if (data.password === null || data.password === '') {
      passwordHash = null; // Remove password protection
    } else {
      passwordHash = await hashLinkPassword(data.password);
    }
  }

  // Handle max clicks update
  let maxClicks = existing.maxClicks;
  if (data.maxClicks !== undefined) {
    if (data.maxClicks === null) {
      maxClicks = null; // Remove limit
    } else {
      if (data.maxClicks < 1) {
        throw new Error('Max clicks must be at least 1');
      }
      maxClicks = data.maxClicks;
    }
  }

  // Update link
  const link = await prisma.shortLink.update({
    where: { slug },
    data: {
      targetUrl,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      allowEdit: data.allowEdit !== undefined ? data.allowEdit : existing.allowEdit,
      expiresAt,
      passwordHash,
      maxClicks,
    },
  });

  // Invalidate cache
  await invalidateSlug(slug);
  // Re-cache with new target
  await setCachedTarget(slug, targetUrl);

  return link;
}

/**
 * Delete a link
 */
export async function deleteLink(slug: string, userId: string) {
  // Check ownership
  const existing = await prisma.shortLink.findUnique({
    where: { slug },
  });

  if (!existing) {
    throw new Error('Link not found');
  }

  if (existing.ownerId !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete link (cascade will delete logs)
  await prisma.shortLink.delete({
    where: { slug },
  });

  // Invalidate cache
  await invalidateSlug(slug);
}

/**
 * Get user's links
 */
export async function getUserLinks(userId: string) {
  return prisma.shortLink.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get link by slug (with ownership check)
 */
export async function getLinkBySlug(slug: string, userId: string) {
  const link = await prisma.shortLink.findUnique({
    where: { slug },
  });

  if (!link) {
    throw new Error('Link not found');
  }

  if (link.ownerId !== userId) {
    throw new Error('Unauthorized');
  }

  return link;
}

/**
 * Get link stats/analytics
 */
export async function getLinkStats(slug: string, userId: string) {
  const link = await getLinkBySlug(slug, userId);

  // Get logs for this link
  const logs = await prisma.linkLog.findMany({
    where: { linkId: link.id },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate basic stats
  const totalHits = logs.length;

  // Daily hits
  const dailyHitsMap = new Map<string, number>();
  logs.forEach((log) => {
    const date = log.createdAt.toISOString().split('T')[0];
    dailyHitsMap.set(date, (dailyHitsMap.get(date) || 0) + 1);
  });
  const dailyHits = Array.from(dailyHitsMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top referers
  const refererMap = new Map<string, number>();
  logs.forEach((log) => {
    const referer = log.referer || 'direct';
    refererMap.set(referer, (refererMap.get(referer) || 0) + 1);
  });
  const topReferers = Array.from(refererMap.entries())
    .map(([referer, count]) => ({ referer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top countries
  const countryMap = new Map<string, number>();
  logs.forEach((log) => {
    const country = log.country || 'unknown';
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  });
  const topCountries = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top browsers (parse from user agent)
  const browserMap = new Map<string, number>();
  logs.forEach((log) => {
    const browser = parseBrowser(log.userAgent || 'unknown');
    browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
  });
  const topBrowsers = Array.from(browserMap.entries())
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Device Analytics
  const deviceMap = new Map<string, number>();
  logs.forEach((log) => {
    const device = log.deviceType || 'unknown';
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
  });
  const topDevices = Array.from(deviceMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Operating Systems
  const osMap = new Map<string, number>();
  logs.forEach((log) => {
    const os = log.os || 'unknown';
    osMap.set(os, (osMap.get(os) || 0) + 1);
  });
  const topOperatingSystems = Array.from(osMap.entries())
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Time Analytics
  const hourlyHits = calculateHourlyHits(logs);
  const weeklyHits = calculateWeeklyHits(logs);
  const monthlyHits = calculateMonthlyHits(logs);
  const peakHours = calculatePeakHours(logs, 5);

  // Visitor Analytics
  const uniqueVisitors = calculateUniqueVisitors(logs);
  const averageClicksPerVisitor = uniqueVisitors > 0 ? Math.round((totalHits / uniqueVisitors) * 100) / 100 : 0;
  const returnVisitorRate = calculateReturnVisitorRate(logs);

  // Referrer Categories
  const referrerCategories = {
    social: 0,
    search: 0,
    direct: 0,
    email: 0,
    other: 0,
  };
  logs.forEach((log) => {
    const category = parseRefererCategory(log.referer);
    referrerCategories[category]++;
  });

  // Geographic Analytics - Top Cities
  const cityMap = new Map<string, number>();
  logs.forEach((log) => {
    if (log.city) {
      cityMap.set(log.city, (cityMap.get(log.city) || 0) + 1);
    }
  });
  const topCities = Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Performance Metrics
  const growthRate = calculateGrowthRate(logs);
  const clickVelocity = calculateClickVelocity(logs);

  // Browser Versions
  const browserVersions = parseBrowserVersions(logs);

  // Language Analytics
  const languageMap = new Map<string, number>();
  logs.forEach((log) => {
    const language = log.language || 'unknown';
    languageMap.set(language, (languageMap.get(language) || 0) + 1);
  });
  const topLanguages = Array.from(languageMap.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalHits,
    dailyHits,
    topReferers,
    topCountries,
    topBrowsers,
    topDevices,
    topOperatingSystems,
    hourlyHits,
    weeklyHits,
    monthlyHits,
    peakHours,
    uniqueVisitors,
    averageClicksPerVisitor,
    returnVisitorRate,
    referrerCategories,
    topCities: topCities.length > 0 ? topCities : undefined,
    growthRate,
    clickVelocity,
    browserVersions,
    topLanguages,
  };
}

/**
 * Check if link is expired
 */
export function checkLinkExpirationStatus(link: { expiresAt: Date | null }): ReturnType<typeof checkLinkExpiration> {
  return checkLinkExpiration(link.expiresAt);
}

/**
 * Re-export checkMaxClicks for backward compatibility
 * @deprecated Import directly from '@/lib/link/max-clicks' instead
 */
export { checkMaxClicks };

/**
 * Get expired links (for cleanup jobs)
 */
export async function getExpiredLinks(): Promise<Array<{ id: number; slug: string; expiresAt: Date | null }>> {
  const now = new Date();
  
  return prisma.shortLink.findMany({
    where: {
      expiresAt: {
        lte: now,
        not: null, // Only get links with expiration date
      },
      isActive: true, // Only get active expired links
    },
    select: {
      id: true,
      slug: true,
      expiresAt: true,
    },
  });
}

/**
 * Simple browser parser from user agent (kept for backward compatibility)
 */
function parseBrowser(userAgent: string): string {
  if (!userAgent || userAgent === 'unknown') return 'unknown';
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Other';
}

