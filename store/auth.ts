import { create } from 'zustand';
import { User } from '@/types/auth';
import { login as loginApi, register as registerApi, getCurrentUser, logout as logoutApi, getToken } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await loginApi({ email, password });
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await registerApi({ username, email, password });
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    logoutApi();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      logoutApi();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

