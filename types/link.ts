export interface ShortLink {
  id: number;
  slug: string;
  targetUrl: string;
  ownerId: string;
  hits: bigint | number;
  isActive: boolean;
  allowEdit: boolean;
  expiresAt?: Date | null;
  passwordHash?: string | null;
  maxClicks?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLinkRequest {
  targetUrl: string;
  slug?: string; // Optional custom slug
  expiresAt?: string | Date; // Optional expiration date
  password?: string; // Optional password (will be hashed)
  maxClicks?: number; // Optional maximum click limit
}

export interface UpdateLinkRequest {
  targetUrl?: string;
  isActive?: boolean;
  allowEdit?: boolean;
  expiresAt?: string | Date | null; // Optional expiration date (null to remove)
  password?: string | null; // Optional password (null to remove, string to set/update)
  maxClicks?: number | null; // Optional maximum click limit (null to remove)
}

export interface LinkStats {
  // Existing stats
  totalHits: number;
  dailyHits: Array<{ date: string; count: number }>;
  topReferers: Array<{ referer: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
  
  // Device Analytics
  topDevices: Array<{ device: string; count: number }>;
  topOperatingSystems: Array<{ os: string; count: number }>;
  
  // Time Analytics
  hourlyHits: Array<{ hour: number; count: number }>;
  weeklyHits: Array<{ day: string; count: number }>;
  monthlyHits: Array<{ month: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
  
  // Visitor Analytics
  uniqueVisitors: number;
  averageClicksPerVisitor: number;
  returnVisitorRate: number;
  
  // Referrer Analytics
  referrerCategories: {
    social: number;
    search: number;
    direct: number;
    email: number;
    other: number;
  };
  
  // Geographic Analytics
  topCities?: Array<{ city: string; count: number }>;
  
  // Performance Metrics
  growthRate: number;
  clickVelocity: { perHour: number; perDay: number };
  
  // Browser Analytics
  browserVersions: Array<{ browser: string; version: string; count: number }>;
  
  // Language Analytics
  topLanguages: Array<{ language: string; count: number }>;
}

