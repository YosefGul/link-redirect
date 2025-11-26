import axios, { AxiosError } from 'axios';
import { ShortLink, CreateLinkRequest, UpdateLinkRequest, LinkStats } from '@/types/link';
import { extractAxiosError, isErrorStatus } from '@/lib/utils/error-utils';
import { handleApiError } from './error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      // Handle 401 Unauthorized - auto logout
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }

      // Handle 403 Forbidden
      if (status === 403) {
        const apiError = handleApiError(error);
        console.error('Forbidden:', apiError.error);
      }
    }

    return Promise.reject(error);
  }
);

export async function getLinks(): Promise<ShortLink[]> {
  try {
    const response = await api.get<{ links: ShortLink[] }>('/links');
    
    // Ensure we always return an array
    if (!response.data || !response.data.links) {
      return [];
    }
    
    return Array.isArray(response.data.links) ? response.data.links : [];
  } catch (error) {
    // If it's a 404 or "not found" error, return empty array instead
    if (isErrorStatus(error, 404)) {
      return [];
    }
    
    const errorMessage = extractAxiosError(error);
    if (errorMessage.toLowerCase().includes('not found')) {
      return [];
    }
    
    // For other errors, re-throw to be handled by React Query
    throw error;
  }
}

export async function createLink(data: CreateLinkRequest): Promise<ShortLink> {
  const response = await api.post<{ link: ShortLink }>('/links', data);
  return response.data.link;
}

export async function updateLink(slug: string, data: UpdateLinkRequest): Promise<ShortLink> {
  const response = await api.put<{ link: ShortLink }>(`/links/${slug}`, data);
  return response.data.link;
}

export async function deleteLink(slug: string): Promise<void> {
  await api.delete(`/links/${slug}`);
}

export async function getLinkStats(slug: string): Promise<LinkStats> {
  const response = await api.get<{ stats: LinkStats }>(`/links/${slug}/stats`);
  return response.data.stats;
}

export async function getLink(slug: string): Promise<ShortLink> {
  const response = await api.get<{ link: ShortLink }>(`/links/${slug}`);
  return response.data.link;
}

