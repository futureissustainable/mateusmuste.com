import { create } from 'zustand';
import type { WindowState, IconPosition, IconPositions, DragState, IconDragState, WindowPhysics, WindowBounces } from '@/types';

// Initial window configurations
const INITIAL_WINDOWS: Record<string, WindowState> = {
  MESSAGES: { id: 'MESSAGES', title: 'MESSAGES.EXE', icon: 'Email', x: 200, y: 80, w: 380, h: 500, isOpen: false, isMin: false, z: 8, isDesktop: true },
  ABOUT: { id: 'ABOUT', title: 'ABOUT.EXE', icon: 'Terminal', x: 150, y: 50, w: 820, h: 700, isOpen: false, isMin: false, z: 9, isDesktop: true },
  SYSTEM: { id: 'SYSTEM', title: 'SYSTEM_INFO', icon: 'Terminal', x: 400, y: 50, w: 1000, h: 800, isOpen: false, isMin: false, z: 10, isDesktop: true },
  FILES: { id: 'FILES', title: 'MEDIA_LIB', icon: 'Folder', x: 100, y: 80, w: 800, h: 500, isOpen: false, isMin: false, z: 11, isDesktop: true },
  APPS: { id: 'APPS', title: 'APPS', icon: 'Apps', x: 150, y: 110, w: 700, h: 500, isOpen: false, isMin: false, z: 12, isDesktop: true },
  CONTACT: { id: 'CONTACT', title: 'CONTACT', icon: 'Email', x: 200, y: 140, w: 320, h: 380, isOpen: false, isMin: false, z: 13, isDesktop: true },
  PAINT: { id: 'PAINT', title: 'PAINT.EXE', icon: 'Palette', x: 150, y: 110, w: 700, h: 600, isOpen: false, isMin: false, z: 14 },
  SNAKE: { id: 'SNAKE', title: 'SNEK.EXE', icon: 'Snek', x: 200, y: 140, w: 640, h: 520, isOpen: false, isMin: false, z: 15 },
  TRASH: { id: 'TRASH', title: 'TRASH.BIN', icon: 'TrashCan', x: 250, y: 170, w: 500, h: 400, isOpen: false, isMin: false, z: 16, isDesktop: true },
  VOID: { id: 'VOID', title: 'VOID.TXT', icon: 'Void', x: 300, y: 50, w: 500, h: 400, isOpen: false, isMin: false, z: 17 },
  RADIO: { id: 'RADIO', title: 'RADIO.WAV', icon: 'Radio', x: 400, y: 110, w: 400, h: 400, isOpen: false, isMin: false, z: 19 },
  DICE: { id: 'DICE', title: 'DICE.EXE', icon: 'Dice', x: 450, y: 140, w: 350, h: 420, isOpen: false, isMin: false, z: 20 },
  LABYRINTH: { id: 'LABYRINTH', title: 'LABYRINTH.EXE', icon: 'Labyrinth', x: 100, y: 50, w: 600, h: 500, isOpen: false, isMin: false, z: 21 },
  MINESWEEPER: { id: 'MINESWEEPER', title: 'MINESWEEPER.EXE', icon: 'Minesweeper', x: 120, y: 40, w: 500, h: 560, isOpen: false, isMin: false, z: 26 },
  STARSHIP: { id: 'STARSHIP', title: 'STARSHIP.EXE', icon: 'Starship', x: 80, y: 40, w: 540, h: 480, isOpen: false, isMin: false, z: 27 },
  SYNTH: { id: 'SYNTH', title: 'SYNTH_001.WAV', icon: 'Synth', x: 150, y: 80, w: 500, h: 350, isOpen: false, isMin: false, z: 22 },
  DESTRUCTION: { id: 'DESTRUCTION', title: 'DESTRUCTION.EXE', icon: 'Destruction', x: 200, y: 110, w: 400, h: 400, isOpen: false, isMin: false, z: 23 },
  TAROT: { id: 'TAROT', title: 'TAROT.DAT', icon: 'Tarot', x: 100, y: 60, w: 520, h: 550, isOpen: false, isMin: false, z: 24 },
  GALLERY: { id: 'GALLERY', title: 'GALLERY.EXE', icon: 'Gallery', x: 100, y: 80, w: 500, h: 500, isOpen: false, isMin: false, z: 28 },
  MAP: { id: 'MAP', title: 'MAP.EXE', icon: 'Globe', x: 150, y: 100, w: 360, h: 400, isOpen: false, isMin: false, z: 29 },
  POMODORO: { id: 'POMODORO', title: 'POMODORO.EXE', icon: 'Pomodoro', x: 200, y: 60, w: 350, h: 620, isOpen: false, isMin: false, z: 30 },
  SCANNER: { id: 'SCANNER', title: 'SCANNER.EXE', icon: 'HealthScanner', x: 150, y: 50, w: 600, h: 700, isOpen: false, isMin: false, z: 31 },
  PERSONAL: { id: 'PERSONAL', title: 'PRIVATE.EXE', icon: 'Lock', x: 200, y: 80, w: 320, h: 340, isOpen: false, isMin: false, z: 32 },
  TERMINAL: { id: 'TERMINAL', title: 'TERMINAL.EXE', icon: 'Terminal', x: 120, y: 100, w: 650, h: 450, isOpen: false, isMin: false, z: 33 },
  TRUTH: { id: 'TRUTH', title: 'TRUTH.TXT', icon: 'FileDoc', x: 180, y: 120, w: 320, h: 380, isOpen: false, isMin: false, z: 34, isDesktop: true },
  DOG_STORY: { id: 'DOG_STORY', title: 'DOG.TXT', icon: 'FileDoc', x: 100, y: 80, w: 600, h: 500, isOpen: false, isMin: false, z: 35 },
  THIRD_EYE: { id: 'THIRD_EYE', title: 'THIRD_EYE.EXE', icon: 'ThirdEye', x: 140, y: 90, w: 450, h: 400, isOpen: false, isMin: false, z: 36 },
  THIRD_EYE_2: { id: 'THIRD_EYE_2', title: 'THIRD_EYE.EXE', icon: 'ThirdEye', x: 200, y: 150, w: 450, h: 400, isOpen: false, isMin: false, z: 37 },
  BROWSER: { id: 'BROWSER', title: 'KONAMI by zen', icon: 'Browser', x: 160, y: 70, w: 500, h: 400, isOpen: false, isMin: false, z: 38 },
  END: { id: 'END', title: 'END.EXE', icon: 'Trophy', x: 200, y: 100, w: 400, h: 350, isOpen: false, isMin: false, z: 39 },
  BOOKS: { id: 'BOOKS', title: 'BOOKS.EXE', icon: 'FileDoc', x: 150, y: 80, w: 600, h: 500, isOpen: false, isMin: false, z: 40 },
  BACKUP: { id: 'BACKUP', title: 'BACKUP.BAT', icon: 'Terminal', x: 180, y: 100, w: 500, h: 400, isOpen: false, isMin: false, z: 41 },
  TRUTH_MESSAGES: { id: 'TRUTH_MESSAGES', title: 'MESSAGES.EXE', icon: 'Email', x: 200, y: 80, w: 380, h: 500, isOpen: false, isMin: false, z: 42 },
};

// Get initial icon positions from localStorage or defaults
const getInitialIconPositions = (): IconPositions => {
  if (typeof window === 'undefined') {
    return getDefaultIconPositions(false);
  }

  const stored = localStorage.getItem('desktop_icon_positions');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to defaults
    }
  }

  const isMobile = window.innerWidth < 768;
  return getDefaultIconPositions(isMobile);
};

const getDefaultIconPositions = (isMobile: boolean): IconPositions => {
  const iconSize = 100;
  const padding = 16;
  const topOffset = isMobile ? 80 : 16;

  return {
    MESSAGES: { x: padding, y: topOffset },
    ABOUT: { x: padding, y: topOffset },
    SYSTEM: { x: padding, y: topOffset },
    FILES: { x: padding, y: topOffset + iconSize },
    APPS: { x: padding, y: topOffset + iconSize * 2 },
    CONTACT: { x: padding, y: topOffset + iconSize * 3 },
    TRUTH: { x: padding, y: topOffset + iconSize * 4 },
    TRASH: { x: Math.min(typeof window !== 'undefined' ? window.innerWidth - 100 : 100, padding), y: topOffset + iconSize * 5 },
  };
};

interface WindowStore {
  // State
  windows: Record<string, WindowState>;
  topZ: number;
  iconPositions: IconPositions;
  selectedIcon: string | null;
  drag: DragState;
  iconDrag: IconDragState;
  windowAnimations: Record<string, 'opening' | 'closing'>;
  windowPhysics: Record<string, WindowPhysics>;
  windowBounces: Record<string, WindowBounces>;
  extraDesktopIcons: string[];

  // Actions
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  setWindowAnimation: (id: string, animation: 'opening' | 'closing' | null) => void;

  // Icon actions
  setIconPosition: (id: string, pos: IconPosition) => void;
  setSelectedIcon: (id: string | null) => void;
  resetIconPositions: () => void;
  addExtraDesktopIcon: (id: string) => void;

  // Drag actions
  startDrag: (id: string, offsetX: number, offsetY: number) => void;
  endDrag: () => void;
  startIconDrag: (id: string, offsetX: number, offsetY: number) => void;
  endIconDrag: () => void;

  // Physics
  initWindowPhysics: (id: string) => WindowPhysics;
  setWindowVelocity: (id: string, velX: number, velY: number) => void;
  updatePhysics: () => boolean;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  // Initial state
  windows: INITIAL_WINDOWS,
  topZ: 100,
  iconPositions: typeof window !== 'undefined' ? getInitialIconPositions() : getDefaultIconPositions(false),
  selectedIcon: null,
  drag: { id: null, offsetX: 0, offsetY: 0 },
  iconDrag: { id: null, offsetX: 0, offsetY: 0, active: false },
  windowAnimations: {},
  windowPhysics: {},
  windowBounces: {},
  extraDesktopIcons: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('extra_desktop_icons') || '[]')
    : [],

  // Window actions
  openWindow: (id) => {
    const { topZ } = get();
    const newZ = topZ + 1;

    set((state) => ({
      topZ: newZ,
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isOpen: true, isMin: false, z: newZ },
      },
      windowAnimations: { ...state.windowAnimations, [id]: 'opening' },
    }));

    // Clear animation after it completes
    setTimeout(() => {
      set((state) => {
        const { [id]: _, ...rest } = state.windowAnimations;
        return { windowAnimations: rest };
      });
    }, 200);
  },

  closeWindow: (id) => {
    set((state) => ({
      windowAnimations: { ...state.windowAnimations, [id]: 'closing' },
    }));

    setTimeout(() => {
      set((state) => {
        const { [id]: _, ...restAnimations } = state.windowAnimations;
        return {
          windows: {
            ...state.windows,
            [id]: { ...state.windows[id], isOpen: false },
          },
          windowAnimations: restAnimations,
        };
      });
    }, 150);
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMin: true },
      },
    }));
  },

  focusWindow: (id) => {
    const { topZ } = get();
    const newZ = topZ + 1;

    set((state) => ({
      topZ: newZ,
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], z: newZ },
      },
    }));
  },

  updateWindowPosition: (id, x, y) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], x, y },
      },
    }));
  },

  setWindowAnimation: (id, animation) => {
    set((state) => {
      if (animation === null) {
        const { [id]: _, ...rest } = state.windowAnimations;
        return { windowAnimations: rest };
      }
      return { windowAnimations: { ...state.windowAnimations, [id]: animation } };
    });
  },

  // Icon actions
  setIconPosition: (id, pos) => {
    set((state) => {
      const newPositions = { ...state.iconPositions, [id]: pos };
      if (typeof window !== 'undefined') {
        localStorage.setItem('desktop_icon_positions', JSON.stringify(newPositions));
      }
      return { iconPositions: newPositions };
    });
  },

  setSelectedIcon: (id) => set({ selectedIcon: id }),

  resetIconPositions: () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const defaultPositions = getDefaultIconPositions(isMobile);
    set({ iconPositions: defaultPositions });
    if (typeof window !== 'undefined') {
      localStorage.setItem('desktop_icon_positions', JSON.stringify(defaultPositions));
    }
  },

  addExtraDesktopIcon: (id) => {
    set((state) => {
      if (state.extraDesktopIcons.includes(id)) return state;
      const newExtra = [...state.extraDesktopIcons, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('extra_desktop_icons', JSON.stringify(newExtra));
      }
      return { extraDesktopIcons: newExtra };
    });
  },

  // Drag actions
  startDrag: (id, offsetX, offsetY) => {
    set({ drag: { id, offsetX, offsetY } });
    get().focusWindow(id);
  },

  endDrag: () => {
    set({ drag: { id: null, offsetX: 0, offsetY: 0 } });
  },

  startIconDrag: (id, offsetX, offsetY) => {
    set({ iconDrag: { id, offsetX, offsetY, active: true } });
  },

  endIconDrag: () => {
    set({ iconDrag: { id: null, offsetX: 0, offsetY: 0, active: false } });
  },

  // Physics
  initWindowPhysics: (id) => {
    const { windowPhysics } = get();
    if (!windowPhysics[id]) {
      const physics = { velX: 0, velY: 0, scaleX: 1, scaleY: 1 };
      set((state) => ({
        windowPhysics: { ...state.windowPhysics, [id]: physics },
      }));
      return physics;
    }
    return windowPhysics[id];
  },

  setWindowVelocity: (id, velX, velY) => {
    set((state) => ({
      windowPhysics: {
        ...state.windowPhysics,
        [id]: { ...state.windowPhysics[id], velX, velY },
      },
      windowBounces: {
        ...state.windowBounces,
        [id]: { left: false, right: false, top: false, bottom: false },
      },
    }));
  },

  updatePhysics: () => {
    const { windows, windowPhysics, windowBounces, drag } = get();
    let hasChanges = false;

    const FRICTION = 0.94;
    const BOUNCE_DAMPING = 0.6;
    const MIN_VELOCITY = 0.25;

    const updates: Record<string, WindowState> = {};
    const physicsUpdates: Record<string, WindowPhysics> = {};
    const bounceUpdates: Record<string, WindowBounces> = {};

    Object.keys(windows).forEach((id) => {
      const win = windows[id];
      if (!win.isOpen || win.isMin || drag.id === id) return;

      const physics = windowPhysics[id];
      if (!physics) return;

      if (Math.abs(physics.velX) < MIN_VELOCITY && Math.abs(physics.velY) < MIN_VELOCITY) {
        if (physics.velX !== 0 || physics.velY !== 0) {
          physicsUpdates[id] = { ...physics, velX: 0, velY: 0 };
        }
        return;
      }

      hasChanges = true;

      let newVelX = physics.velX * FRICTION;
      let newVelY = physics.velY * FRICTION;
      let newX = win.x + newVelX;
      let newY = win.y + newVelY;

      const maxX = Math.max(0, (typeof window !== 'undefined' ? window.innerWidth : 1920) - win.w);
      const maxY = Math.max(0, (typeof window !== 'undefined' ? window.innerHeight : 1080) - 60 - win.h);
      const minY = 0;

      const bounces = bounceUpdates[id] || windowBounces[id] || { left: false, right: false, top: false, bottom: false };

      if (newX <= 0) {
        newX = 0;
        newVelX = -newVelX * BOUNCE_DAMPING;
        bounces.left = true;
      } else if (newX >= maxX) {
        newX = maxX;
        newVelX = -newVelX * BOUNCE_DAMPING;
        bounces.right = true;
      }

      if (newY <= minY) {
        newY = minY;
        newVelY = -newVelY * BOUNCE_DAMPING;
        bounces.top = true;
      } else if (newY >= maxY) {
        newY = maxY;
        newVelY = -newVelY * BOUNCE_DAMPING;
        bounces.bottom = true;
      }

      updates[id] = { ...win, x: newX, y: newY };
      physicsUpdates[id] = { ...physics, velX: newVelX, velY: newVelY };
      bounceUpdates[id] = bounces;
    });

    if (hasChanges) {
      set((state) => ({
        windows: { ...state.windows, ...updates },
        windowPhysics: { ...state.windowPhysics, ...physicsUpdates },
        windowBounces: { ...state.windowBounces, ...bounceUpdates },
      }));
    }

    return hasChanges;
  },
}));
