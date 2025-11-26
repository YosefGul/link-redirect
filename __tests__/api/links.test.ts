import { POST, GET } from '@/app/api/links/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    shortLink: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn((request) => ({
    user: { userId: '123', username: 'testuser', role: 'USER' },
    error: null,
  })),
}));

jest.mock('@/lib/link/service', () => ({
  getUserLinks: jest.fn(),
  createLink: jest.fn(),
}));

describe('Links API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/links', () => {
    it('should return user links', async () => {
      const mockLinks = [
        {
          id: 1,
          slug: 'test-slug',
          targetUrl: 'https://example.com',
          ownerId: '123',
          hits: BigInt(0),
          isActive: true,
          allowEdit: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { getUserLinks } = require('@/lib/link/service');
      getUserLinks.mockResolvedValue(mockLinks);

      const request = new NextRequest('http://localhost/api/links', {
        method: 'GET',
        headers: {
          authorization: 'Bearer mock-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.links).toBeDefined();
      expect(Array.isArray(data.links)).toBe(true);
    });
  });

  describe('POST /api/links', () => {
    it('should create a new link', async () => {
      const mockLink = {
        id: 1,
        slug: 'test-slug',
        targetUrl: 'https://example.com',
        ownerId: '123',
        hits: BigInt(0),
        isActive: true,
        allowEdit: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { createLink } = require('@/lib/link/service');
      createLink.mockResolvedValue(mockLink);

      const request = new NextRequest('http://localhost/api/links', {
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl: 'https://example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.link).toBeDefined();
      expect(data.link.targetUrl).toBe('https://example.com');
    });

    it('should return error for invalid URL', async () => {
      const request = new NextRequest('http://localhost/api/links', {
        method: 'POST',
        headers: {
          authorization: 'Bearer mock-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl: 'not-a-valid-url',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});

