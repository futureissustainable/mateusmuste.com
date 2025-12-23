import { create } from 'zustand';
import type { AppMode, DesktopBackground, ContextMenuState } from '@/types';

interface SettingsStore {
  // Boot state
  modeSelected: AppMode;
  booted: boolean;
  bootPhase: number;

  // Display
  isMobile: boolean;
  desktopBg: DesktopBackground;
  matrixMode: boolean;
  thirdEyeWorld: boolean;
  destructionMode: boolean;

  // Intro
  introComplete: boolean;
  revealingApps: boolean;
  revealedApps: string[];

  // Sound
  isMuted: boolean;

  // Context menu
  contextMenu: ContextMenuState;

  // Visit tracking
  visitCount: number;

  // Actions
  setMode: (mode: AppMode) => void;
  setBoot: (booted: boolean) => void;
  setBootPhase: (phase: number) => void;
  setIsMobile: (mobile: boolean) => void;
  setDesktopBg: (bg: DesktopBackground) => void;
  toggleMatrixMode: () => void;
  setThirdEyeWorld: (active: boolean) => void;
  setDestructionMode: (active: boolean) => void;
  setIntroComplete: (complete: boolean) => void;
  setRevealingApps: (revealing: boolean) => void;
  addRevealedApp: (app: string) => void;
  clearRevealedApps: () => void;
  toggleMute: () => void;
  setContextMenu: (menu: ContextMenuState) => void;
  incrementVisitCount: () => void;
}

// Get stored values with SSR safety
const getStoredValue = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  if (typeof defaultValue === 'boolean') return (stored === 'true') as T;
  if (typeof defaultValue === 'number') return parseInt(stored, 10) as T;
  return stored as T;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state
  modeSelected: null,
  booted: false,
  bootPhase: 0,
  isMobile: false,
  desktopBg: (typeof window !== 'undefined'
    ? (localStorage.getItem('desktop_bg') as DesktopBackground) || 'grid'
    : 'grid') as DesktopBackground,
  matrixMode: false,
  thirdEyeWorld: false,
  destructionMode: false,
  introComplete: getStoredValue('intro_complete', false),
  revealingApps: false,
  revealedApps: [],
  isMuted: getStoredValue('sound_muted', false),
  contextMenu: { show: false, x: 0, y: 0 },
  visitCount: (() => {
    if (typeof window === 'undefined') return 1;
    const stored = localStorage.getItem('ultra_int_visits');
    const count = stored ? parseInt(stored, 10) + 1 : 1;
    localStorage.setItem('ultra_int_visits', count.toString());
    return count;
  })(),

  // Actions
  setMode: (mode) => set({ modeSelected: mode }),

  setBoot: (booted) => set({ booted }),

  setBootPhase: (phase) => set({ bootPhase: phase }),

  setIsMobile: (mobile) => set({ isMobile: mobile }),

  setDesktopBg: (bg) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('desktop_bg', bg);
    }
    set({ desktopBg: bg });
  },

  toggleMatrixMode: () => set((state) => ({ matrixMode: !state.matrixMode })),

  setThirdEyeWorld: (active) => set({ thirdEyeWorld: active }),

  setDestructionMode: (active) => set({ destructionMode: active }),

  setIntroComplete: (complete) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('intro_complete', complete.toString());
    }
    set({ introComplete: complete });
  },

  setRevealingApps: (revealing) => set({ revealingApps: revealing }),

  addRevealedApp: (app) => set((state) => ({
    revealedApps: [...state.revealedApps, app],
  })),

  clearRevealedApps: () => set({ revealedApps: [] }),

  toggleMute: () => {
    const newMuted = !get().isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound_muted', newMuted.toString());
    }
    set({ isMuted: newMuted });
    return newMuted;
  },

  setContextMenu: (menu) => set({ contextMenu: menu }),

  incrementVisitCount: () => {
    const newCount = get().visitCount + 1;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ultra_int_visits', newCount.toString());
    }
    set({ visitCount: newCount });
  },
}));
