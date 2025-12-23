// Window Types
export interface WindowState {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isOpen: boolean;
  isMin: boolean;
  z: number;
  isDesktop?: boolean;
}

export interface WindowPhysics {
  velX: number;
  velY: number;
  scaleX: number;
  scaleY: number;
}

export interface WindowBounces {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

// Icon Types
export interface IconPosition {
  x: number;
  y: number;
}

export type IconPositions = Record<string, IconPosition>;

// Achievement Types
export interface Achievement {
  name: string;
  icon: string;
  hint: string;
  visible: boolean;
}

export interface UnlockedAchievement {
  unlockedAt: number;
}

export type Achievements = Record<string, Achievement>;
export type UnlockedAchievements = Record<string, UnlockedAchievement>;

// Settings Types
export type DesktopBackground = 'grid' | 'solid' | 'ascii';
export type AppMode = 'story' | 'about' | null;

// App Notification
export interface AppUnlockNotification {
  app: string;
  id: number;
}

export interface AchievementNotification {
  id: number;
  name: string;
  icon?: string;
  hint?: string;
}

// Drag State
export interface DragState {
  id: string | null;
  offsetX: number;
  offsetY: number;
}

export interface IconDragState extends DragState {
  active: boolean;
}

// Context Menu
export interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
}

// Media DB Types
export interface MediaItem {
  title: string;
  artist?: string;
}

export interface MediaDatabase {
  CINEMA_TV: MediaItem[];
  LITERATURE: MediaItem[];
  GAMES: MediaItem[];
  AUDIO: MediaItem[];
}
