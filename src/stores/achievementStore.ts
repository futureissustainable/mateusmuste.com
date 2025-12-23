import { create } from 'zustand';
import type { UnlockedAchievements, AchievementNotification, AppUnlockNotification } from '@/types';

// Achievement definitions
export const ACHIEVEMENTS = {
  INCEPTION: { name: 'INCEPTION', icon: 'ThirdEye', hint: 'Stack two Third Eyes', visible: true },
  YOU_MONSTER: { name: 'YOU MONSTER', icon: 'Skull', hint: 'Delete the dog', visible: true },
  CLICKER: { name: 'CLICKER', icon: 'Cursor', hint: '100 clicks', visible: true },
  ACCEPT_FATE: { name: 'ACCEPT FATE', icon: 'Tarot', hint: 'Accept your tarot reading', visible: true },
  DESTROYER_OF_WORLDS: { name: 'DESTROYER OF WORLDS', icon: 'Bomb', hint: 'Try to destroy everything', visible: true },
  DIVINE_ROLL: { name: 'DIVINE ROLL', icon: 'Dice', hint: 'Roll a natural 20', visible: true },
  BECOME_GOD: { name: 'BECOME GOD', icon: 'Trophy', hint: 'Achieve elevation', visible: true },
  TRUTH_SEEKER: { name: 'TRUTH SEEKER', icon: 'FileDoc', hint: 'Open TRUTH.EXE', visible: true },
  COMPLETIONIST: { name: 'COMPLETIONIST', icon: 'Badge', hint: '100% completion', visible: true },
  LOCKSMITH: { name: 'LOCKSMITH', icon: 'Lock', hint: 'Unlock PRIVATE.EXE', visible: true },
  NEO: { name: 'NEO', icon: 'RainAlt', hint: 'Enter the Matrix', visible: true },
  PHYSICS: { name: 'PHYSICS', icon: 'Expand', hint: 'Bouncy icons', visible: true },
  TIMEKEEPER: { name: 'TIMEKEEPER', icon: 'Clock', hint: '10 minutes in session', visible: true },
  // Additional achievements for apps
  WORK_IN_PROGRESS: { name: 'WORK IN PROGRESS', icon: 'Terminal', hint: 'Read the about section', visible: true },
  SYSTEM_SCAN: { name: 'SYSTEM SCAN', icon: 'Terminal', hint: 'Check system info', visible: true },
  HACKER: { name: 'HACKER', icon: 'Terminal', hint: 'Find hidden files', visible: true },
  SUDO_MASTER: { name: 'SUDO MASTER', icon: 'Terminal', hint: 'Use sudo commands', visible: true },
  REVEALER: { name: 'REVEALER', icon: 'ThirdEye', hint: 'Reveal secrets', visible: true },
  SYNTHESIST: { name: 'SYNTHESIST', icon: 'Synth', hint: 'Play 20 notes', visible: true },
  EXPLORER: { name: 'EXPLORER', icon: 'Globe', hint: 'Explore the map', visible: true },
  OUROBOROS: { name: 'OUROBOROS', icon: 'Snek', hint: 'Complete snake secret', visible: true },
  MAZE_MASTER: { name: 'MAZE MASTER', icon: 'Labyrinth', hint: 'Complete 5 mazes', visible: true },
  CRITICAL_HIT: { name: 'CRITICAL HIT', icon: 'Dice', hint: 'Roll a natural 20', visible: true },
  FORTUNE_TELLER: { name: 'FORTUNE TELLER', icon: 'Tarot', hint: 'Do 3 tarot readings', visible: true },
  FOCUSED: { name: 'FOCUSED', icon: 'Pomodoro', hint: 'Complete a pomodoro', visible: true },
  INBOX_ZERO: { name: 'INBOX ZERO', icon: 'Email', hint: 'Read all messages', visible: true },
  VOID_GAZER: { name: 'VOID GAZER', icon: 'Void', hint: 'Stare into the void', visible: true },
  ACE_PILOT: { name: 'ACE PILOT', icon: 'Starship', hint: 'Score 100 in Starship', visible: true },
  DESTROYER: { name: 'DESTROYER', icon: 'Destruction', hint: 'Destroy all blocks', visible: true },
  DIAGNOSTICIAN: { name: 'DIAGNOSTICIAN', icon: 'HealthScanner', hint: 'Run a system scan', visible: true },
  INNER_CIRCLE: { name: 'INNER CIRCLE', icon: 'Lock', hint: 'Access private files', visible: true },
  RADIO_HEAD: { name: 'RADIO HEAD', icon: 'Radio', hint: 'Listen for a minute', visible: true },
  ARTIST: { name: 'ARTIST', icon: 'Palette', hint: 'Create art', visible: true },
  MINESWEEPER: { name: 'MINESWEEPER', icon: 'Minesweeper', hint: 'Complete minesweeper', visible: true },
} as const;

// Initial apps that are always available
export const INITIAL_APPS = [
  'TERMINAL', 'ABOUT', 'SYSTEM', 'FILES', 'APPS', 'CONTACT', 'TRASH', 'END', 'MESSAGES'
];

interface AchievementStore {
  // State
  achievements: UnlockedAchievements;
  narrativeUnlocks: string[];
  achievementNotifications: AchievementNotification[];
  appUnlockNotifications: AppUnlockNotification[];
  totalClicks: number;
  startTime: number;
  privateUnlocked: boolean;
  dogTrashCount: number;

  // Computed
  getUnlockedApps: (mode: 'story' | 'about' | null, visitCount: number) => Set<string>;

  // Actions
  unlockAchievement: (id: string, playSound?: () => void) => void;
  unlockApp: (appId: string, playSound?: () => void) => void;
  removeAchievementNotification: (id: number) => void;
  removeAppNotification: (id: number) => void;
  incrementClicks: () => void;
  setPrivateUnlocked: (unlocked: boolean) => void;
  incrementDogTrashCount: () => void;
  handleGodMode: (playSound?: () => void) => void;
}

// Get stored value with SSR safety
const getStoredJSON = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};

const getStoredNumber = (key: string, defaultValue: number): number => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : defaultValue;
};

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  // Initial state
  achievements: getStoredJSON('ultra_int_achievements', {}),
  narrativeUnlocks: getStoredJSON('ultra_int_narrative_unlocks', []),
  achievementNotifications: [],
  appUnlockNotifications: [],
  totalClicks: getStoredNumber('ultra_int_clicks', 0),
  startTime: Date.now(),
  privateUnlocked: false,
  dogTrashCount: getStoredNumber('dog_trash_count', 0),

  // Computed
  getUnlockedApps: (mode, visitCount) => {
    const { narrativeUnlocks, achievements } = get();
    const unlocked = new Set(INITIAL_APPS);

    // About mode: clean slate, no story unlocks
    if (mode === 'about') {
      return unlocked;
    }

    // Story mode: add all narrative-driven unlocks
    narrativeUnlocks.forEach((app) => unlocked.add(app));

    // TRUTH unlocks at 100 visits OR after god mode
    if (visitCount >= 100 || achievements.BECOME_GOD) {
      unlocked.add('TRUTH');
    }

    // God mode unlocks bonus apps
    if (achievements.BECOME_GOD) {
      ['RADIO', 'SYNTH', 'POMODORO', 'SCANNER', 'GALLERY', 'DESTRUCTION'].forEach((app) =>
        unlocked.add(app)
      );
    }

    return unlocked;
  },

  // Actions
  unlockAchievement: (id, playSound) => {
    const { achievements } = get();
    if (achievements[id]) return; // Already unlocked

    const achievement = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
    if (!achievement) return;

    const notifId = Date.now() + Math.random();

    set((state) => {
      const newAchievements = {
        ...state.achievements,
        [id]: { unlockedAt: Date.now() },
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('ultra_int_achievements', JSON.stringify(newAchievements));
      }

      return {
        achievements: newAchievements,
        achievementNotifications: [
          ...state.achievementNotifications,
          { ...achievement, id: notifId },
        ],
      };
    });

    playSound?.();

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      get().removeAchievementNotification(notifId);
    }, 3000);

    // Check for completionist
    const { achievements: currentAchievements } = get();
    const achievementCount = Object.keys(currentAchievements).filter(
      (k) => k !== 'COMPLETIONIST'
    ).length;
    const totalAchievements = Object.keys(ACHIEVEMENTS).length - 1;

    if (achievementCount >= totalAchievements && !currentAchievements.COMPLETIONIST) {
      setTimeout(() => get().unlockAchievement('COMPLETIONIST', playSound), 5000);
    }
  },

  unlockApp: (appId, playSound) => {
    const { narrativeUnlocks } = get();
    if (narrativeUnlocks.includes(appId)) return;

    const notifId = Date.now() + Math.random();

    set((state) => {
      const newUnlocks = [...state.narrativeUnlocks, appId];

      if (typeof window !== 'undefined') {
        localStorage.setItem('ultra_int_narrative_unlocks', JSON.stringify(newUnlocks));
      }

      return {
        narrativeUnlocks: newUnlocks,
        appUnlockNotifications: [
          ...state.appUnlockNotifications,
          { app: appId, id: notifId },
        ],
      };
    });

    playSound?.();

    setTimeout(() => {
      get().removeAppNotification(notifId);
    }, 3000);
  },

  removeAchievementNotification: (id) => {
    set((state) => ({
      achievementNotifications: state.achievementNotifications.filter((n) => n.id !== id),
    }));
  },

  removeAppNotification: (id) => {
    set((state) => ({
      appUnlockNotifications: state.appUnlockNotifications.filter((n) => n.id !== id),
    }));
  },

  incrementClicks: () => {
    set((state) => {
      const newCount = state.totalClicks + 1;

      if (typeof window !== 'undefined') {
        localStorage.setItem('ultra_int_clicks', newCount.toString());
      }

      return { totalClicks: newCount };
    });
  },

  setPrivateUnlocked: (unlocked) => set({ privateUnlocked: unlocked }),

  incrementDogTrashCount: () => {
    set((state) => {
      const newCount = state.dogTrashCount + 1;

      if (typeof window !== 'undefined') {
        localStorage.setItem('dog_trash_count', newCount.toString());
      }

      return { dogTrashCount: newCount };
    });
  },

  handleGodMode: (playSound) => {
    // Unlock all achievements
    const allAchievements: UnlockedAchievements = {};
    Object.keys(ACHIEVEMENTS).forEach((id) => {
      allAchievements[id] = { unlockedAt: Date.now() };
    });

    // Unlock all apps
    const ALL_UNLOCKABLE_APPS = [
      'PAINT', 'SNAKE', 'VOID', 'RADIO', 'DICE', 'LABYRINTH',
      'MINESWEEPER', 'STARSHIP', 'SYNTH', 'DESTRUCTION', 'TAROT',
      'GALLERY', 'MAP', 'POMODORO', 'SCANNER', 'PERSONAL',
      'DOG_STORY', 'THIRD_EYE', 'THIRD_EYE_2', 'BROWSER',
      'BOOKS', 'BACKUP', 'TRUTH',
    ];

    if (typeof window !== 'undefined') {
      localStorage.setItem('ultra_int_achievements', JSON.stringify(allAchievements));
      localStorage.setItem('ultra_int_narrative_unlocks', JSON.stringify(ALL_UNLOCKABLE_APPS));
    }

    const notifId = Date.now();

    set({
      achievements: allAchievements,
      narrativeUnlocks: ALL_UNLOCKABLE_APPS,
      achievementNotifications: [
        { id: notifId, name: 'GOD MODE', hint: 'All achievements and apps unlocked' },
      ],
    });

    playSound?.();

    setTimeout(() => {
      get().removeAchievementNotification(notifId);
    }, 3000);
  },
}));
