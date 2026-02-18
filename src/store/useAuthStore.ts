/**
 * Auth Store — Zustand
 * Manages user session, login modal state, and API calls
 */

import { create } from 'zustand';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  loginModalOpen: boolean;
  loginRedirect: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  openLoginModal: (redirect?: string) => void;
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  loginModalOpen: false,
  loginRedirect: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      set({ user: res.data.user, isLoading: false, loginModalOpen: false });
    } catch {
      set({ isLoading: false });
      throw new Error('Invalid credentials');
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null });
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user });
    } catch {
      set({ user: null });
    }
  },

  openLoginModal: (redirect?: string) => {
    set({ loginModalOpen: true, loginRedirect: redirect ?? null });
  },

  closeLoginModal: () => {
    set({ loginModalOpen: false, loginRedirect: null });
  },
}));
