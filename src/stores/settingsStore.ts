import { create } from 'zustand';
import type { AppMode, DesktopBackground, ContextMenuState } from '@/types';

interface SettingsState {
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

  // Hydration
  _hasHydrated: boolean;
}

interface SettingsActions {
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
  hydrate: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultState: SettingsState = {
  modeSelected: null,
  booted: false,
  bootPhase: 0,
  isMobile: false,
  desktopBg: 'grid',
  matrixMode: false,
  thirdEyeWorld: false,
  destructionMode: false,
  introComplete: false,
  revealingApps: false,
  revealedApps: [],
  isMuted: false,
  contextMenu: { show: false, x: 0, y: 0 },
  visitCount: 1,
  _hasHydrated: false,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultState,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    if (get()._hasHydrated) return;

    const desktopBg = (localStorage.getItem('desktop_bg') as DesktopBackground) || 'grid';
    const introComplete = localStorage.getItem('intro_complete') === 'true';
    const isMuted = localStorage.getItem('sound_muted') === 'true';

    // Increment visit count on hydration
    const storedVisits = localStorage.getItem('ultra_int_visits');
    const visitCount = storedVisits ? parseInt(storedVisits, 10) + 1 : 1;
    localStorage.setItem('ultra_int_visits', visitCount.toString());

    set({
      desktopBg,
      introComplete,
      isMuted,
      visitCount,
      _hasHydrated: true,
    });
  },

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
