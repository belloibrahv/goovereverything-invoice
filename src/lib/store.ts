import { create } from 'zustand';
import type { CompanySettings } from '@/types';

interface AppState {
  settings: CompanySettings | null;
  setSettings: (settings: CompanySettings) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  isOnline: true, // Default to true, will be updated on client
  setIsOnline: (isOnline) => set({ isOnline }),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
