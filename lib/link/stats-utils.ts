import { LinkLog } from '@prisma/client';
import { parseUserAgent, getBrowserWithVersion } from '@/lib/analytics/user-agent-parser';

/**
 * Categorize referrer into: social, search, direct, email, other
 */
export function parseRefererCategory(referer: string | null): 'social' | 'search' | 'direct' | 'email' | 'other' {
  if (!referer || referer === 'direct' || referer === 'null') {
    return 'direct';
  }

  const lowerReferer = referer.toLowerCase();

  // Social media platforms
  const socialDomains = [
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'linkedin.com',
    'pinterest.com',
    'reddit.com',
    'tiktok.com',
    'youtube.com',
    'whatsapp.com',
    'telegram.org',
    'snapchat.com',
    'discord.com',
  ];

  for (const domain of socialDomains) {
    if (lowerReferer.includes(domain)) {
      return 'social';
    }
  }

  // Search engines
  const searchDomains = [
    'google.com',
    'bing.com',
    'yahoo.com',
    'duckduckgo.com',
    'yandex.com',
    'baidu.com',
    'ask.com',
  ];

  for (const domain of searchDomains) {
    if (lowerReferer.includes(domain)) {
      return 'search';
    }
  }

  // Email clients
  const emailDomains = [
    'mail.google.com',
    'outlook.com',
    'mail.yahoo.com',
    'gmail.com',
    'mail.',
    'email.',
  ];

  for (const domain of emailDomains) {
    if (lowerReferer.includes(domain)) {
      return 'email';
    }
  }

  return 'other';
}

/**
 * Calculate unique visitors count (unique IPs)
 */
export function calculateUniqueVisitors(logs: LinkLog[]): number {
  const uniqueIPs = new Set<string>();
  logs.forEach((log) => {
    if (log.ip) {
      uniqueIPs.add(log.ip);
    }
  });
  return uniqueIPs.size;
}

/**
 * Group hits by hour of day (0-23)
 */
export function calculateHourlyHits(logs: LinkLog[]): Array<{ hour: number; count: number }> {
  const hourlyMap = new Map<number, number>();

  // Initialize all hours with 0
  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, 0);
  }

  logs.forEach((log) => {
    const hour = log.createdAt.getHours();
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
  });

  return Array.from(hourlyMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);
}

/**
 * Group hits by day of week
 */
export function calculateWeeklyHits(logs: LinkLog[]): Array<{ day: string; count: number }> {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyMap = new Map<string, number>();

  // Initialize all days with 0
  dayNames.forEach((day) => {
    weeklyMap.set(day, 0);
  });

  logs.forEach((log) => {
    const dayName = dayNames[log.createdAt.getDay()];
    weeklyMap.set(dayName, (weeklyMap.get(dayName) || 0) + 1);
  });

  return Array.from(weeklyMap.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => {
      const dayOrder = dayNames.indexOf(a.day) - dayNames.indexOf(b.day);
      return dayOrder;
    });
}

/**
 * Group hits by month
 */
export function calculateMonthlyHits(logs: LinkLog[]): Array<{ month: string; count: number }> {
  const monthlyMap = new Map<string, number>();

  logs.forEach((log) => {
    const month = log.createdAt.toISOString().slice(0, 7); // YYYY-MM format
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
  });

  return Array.from(monthlyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Find peak hours (hours with most activity)
 */
export function calculatePeakHours(logs: LinkLog[], topN: number = 5): Array<{ hour: number; count: number }> {
  const hourlyHits = calculateHourlyHits(logs);
  return hourlyHits
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Calculate growth rate (day-over-day percentage change)
 */
export function calculateGrowthRate(logs: LinkLog[]): number {
  if (logs.length < 2) {
    return 0;
  }

  // Group by date
  const dailyMap = new Map<string, number>();
  logs.forEach((log) => {
    const date = log.createdAt.toISOString().split('T')[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
  });

  const sortedDates = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sortedDates.length < 2) {
    return 0;
  }

  const yesterday = sortedDates[sortedDates.length - 2];
  const today = sortedDates[sortedDates.length - 1];

  if (yesterday.count === 0) {
    return today.count > 0 ? 100 : 0;
  }

  const growth = ((today.count - yesterday.count) / yesterday.count) * 100;
  return Math.round(growth * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate click velocity (clicks per hour and per day)
 */
export function calculateClickVelocity(logs: LinkLog[]): { perHour: number; perDay: number } {
  if (logs.length === 0) {
    return { perHour: 0, perDay: 0 };
  }

  const sortedLogs = [...logs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const firstLog = sortedLogs[0];
  const lastLog = sortedLogs[sortedLogs.length - 1];

  const timeDiffMs = lastLog.createdAt.getTime() - firstLog.createdAt.getTime();
  const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
  const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);

  const perHour = timeDiffHours > 0 ? Math.round((logs.length / timeDiffHours) * 100) / 100 : 0;
  const perDay = timeDiffDays > 0 ? Math.round((logs.length / timeDiffDays) * 100) / 100 : 0;

  return { perHour, perDay };
}

/**
 * Parse browser versions from logs
 */
export function parseBrowserVersions(logs: LinkLog[]): Array<{ browser: string; version: string; count: number }> {
  const versionMap = new Map<string, number>();

  logs.forEach((log) => {
    if (log.userAgent) {
      const browserWithVersion = getBrowserWithVersion(log.userAgent);
      versionMap.set(browserWithVersion, (versionMap.get(browserWithVersion) || 0) + 1);
    }
  });

  return Array.from(versionMap.entries())
    .map(([browserVersion, count]) => {
      // Split browser and version
      const parts = browserVersion.split(' ');
      const browser = parts[0] || 'Unknown';
      const version = parts.slice(1).join(' ') || 'Unknown';
      return { browser, version, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Calculate return visitor rate
 */
export function calculateReturnVisitorRate(logs: LinkLog[]): number {
  if (logs.length === 0) {
    return 0;
  }

  const ipCounts = new Map<string, number>();
  logs.forEach((log) => {
    if (log.ip) {
      ipCounts.set(log.ip, (ipCounts.get(log.ip) || 0) + 1);
    }
  });

  const returnVisitors = Array.from(ipCounts.values()).filter((count) => count > 1).length;
  const totalUniqueVisitors = ipCounts.size;

  if (totalUniqueVisitors === 0) {
    return 0;
  }

  return Math.round((returnVisitors / totalUniqueVisitors) * 100 * 100) / 100; // Percentage with 2 decimals
}


