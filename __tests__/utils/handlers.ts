import { http, HttpResponse } from 'msw';
import { mockUser, mockShortLink, mockLinkStats } from './mocks';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: mockUser,
      token: 'mock-jwt-token',
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      user: mockUser,
      token: 'mock-jwt-token',
    });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      user: mockUser,
    });
  }),

  // Link endpoints
  http.get('/api/links', () => {
    return HttpResponse.json({
      links: [mockShortLink],
    });
  }),

  http.post('/api/links', () => {
    return HttpResponse.json({
      link: mockShortLink,
    });
  }),

  http.get('/api/links/:slug', () => {
    return HttpResponse.json({
      link: mockShortLink,
    });
  }),

  http.put('/api/links/:slug', () => {
    return HttpResponse.json({
      link: { ...mockShortLink, targetUrl: 'https://updated.com' },
    });
  }),

  http.delete('/api/links/:slug', () => {
    return HttpResponse.json({
      message: 'Link deleted successfully',
    });
  }),

  http.get('/api/links/:slug/stats', () => {
    return HttpResponse.json({
      stats: mockLinkStats,
    });
  }),
];

