import axios, { AxiosError } from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';
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

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  if (typeof window !== 'undefined' && response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  if (typeof window !== 'undefined' && response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data.user;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

