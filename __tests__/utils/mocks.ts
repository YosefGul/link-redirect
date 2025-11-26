export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER' as const,
  createdAt: new Date(),
};

export const mockShortLink = {
  id: 1,
  slug: 'test-slug',
  targetUrl: 'https://example.com',
  ownerId: mockUser.id,
  hits: BigInt(42),
  isActive: true,
  allowEdit: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockLinkStats = {
  totalHits: 100,
  dailyHits: [
    { date: '2024-01-01', count: 10 },
    { date: '2024-01-02', count: 20 },
  ],
  topReferers: [
    { referer: 'https://google.com', count: 50 },
    { referer: 'direct', count: 30 },
  ],
  topCountries: [
    { country: 'US', count: 60 },
    { country: 'UK', count: 40 },
  ],
  topBrowsers: [
    { browser: 'Chrome', count: 70 },
    { browser: 'Firefox', count: 30 },
  ],
};

