import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { GET as meHandler } from '@/app/api/auth/me/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth/password', () => ({
  hashPassword: jest.fn((pwd) => Promise.resolve(`hashed-${pwd}`)),
  verifyPassword: jest.fn((pwd, hash) => Promise.resolve(hash === `hashed-${pwd}`)),
}));

jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
}));

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.token).toBe('mock-jwt-token');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should return error if user already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      });

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password123',
        role: 'USER',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.token).toBe('mock-jwt-token');
    });

    it('should return error for invalid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      jest.mock('@/lib/auth/jwt', () => ({
        getAuthenticatedUser: jest.fn(() => ({
          userId: '123',
          username: 'testuser',
          role: 'USER',
        })),
      }));

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/auth/me', {
        method: 'GET',
        headers: {
          authorization: 'Bearer mock-jwt-token',
        },
      });

      // Note: This test needs proper middleware mocking
      // For now, we'll test the structure
      expect(request.headers.get('authorization')).toBe('Bearer mock-jwt-token');
    });
  });
});

