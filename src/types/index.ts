// Window state types
export interface WindowState {
  id: string
  appId: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

export interface WindowConfig {
  id: string
  title: string
  icon: string
  defaultWidth?: number
  defaultHeight?: number
  minWidth?: number
  minHeight?: number
  resizable?: boolean
}

// Icon/App types
export interface DesktopIcon {
  id: string
  label: string
  icon: string
  x: number
  y: number
  hidden?: boolean
  locked?: boolean
  folder?: string
}

export interface AppDefinition {
  id: string
  title: string
  icon: string
  component: React.ComponentType<AppProps>
  defaultWidth?: number
  defaultHeight?: number
  hidden?: boolean
  folder?: string
}

export interface AppProps {
  onClose?: () => void
  onAchievement?: (id: string) => void
  showHint?: boolean
}

// Achievement types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  secret?: boolean
  unlockedAt?: number
}

// Sound types
export type SoundName =
  | 'click'
  | 'windowOpen'
  | 'windowClose'
  | 'windowMinimize'
  | 'windowRestore'
  | 'dragStart'
  | 'dragStop'
  | 'bounce'
  | 'bounceIcon'
  | 'success'
  | 'error'
  | 'bootSequence'
  | 'bootWindup'
  | 'laser'
  | 'explosion'
  | 'coin'
  | 'gameOver'
  | 'bark'
  | 'ping'
  | 'diceRoll'
  | 'diceCrit20'
  | 'diceCrit1'
  | 'mineDing'
  | 'copy'
  | 'keyPress'
  | 'noteToggle'
  | 'iconSelect'
  | 'achievementUnlock'
  | 'appUnlock'
  | 'menuOpen'
  | 'terminalSubmit'
  | 'konamiActivate'
  | 'godMode'
  | 'tarotShuffle'
  | 'tarotFlip'
  | 'pomodoroStart'
  | 'pomodoroComplete'
  | 'flowerBloom'
  | 'snekMove'
  | 'snekLetter'
  | 'labyrinthStep'
  | 'labyrinthBump'
  | 'labyrinthExit'
  | 'starshipThrust'
  | 'starshipDamage'
  | 'folderOpen'
  | 'folderClose'
  | 'truthReveal'
  | 'passwordWrong'
  | 'passwordCorrect'
  | 'upgradePurchase'
  | 'visitMilestone'

// Game state types
export interface SnakeGameState {
  snake: Array<{ x: number; y: number }>
  direction: { x: number; y: number }
  food: { x: number; y: number }
  score: number
  gameOver: boolean
  paused: boolean
}

export interface MinesweeperCell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

// Media types (for file explorer)
export interface MediaItem {
  title: string
  year?: number
  genre?: string
  note?: string
}

export interface MediaCategory {
  cinema: MediaItem[]
  literature: MediaItem[]
  games: MediaItem[]
  audio: MediaItem[]
}

// Tarot types
export interface TarotCard {
  name: string
  meaning: string
  art: string[]
}

// Physics types (for window/icon dragging)
export interface DragPhysics {
  velX: number
  velY: number
  lastX: number
  lastY: number
  lastTime: number
}

// LocalStorage keys
export type StorageKey =
  | 'sound_muted'
  | 'achievements'
  | 'unlocked_apps'
  | 'visit_count'
  | 'first_visit'
  | 'matrix_mode'
  | 'tarot_cards'
  | 'tarot_unique_days'
  | 'high_scores'
  | 'icon_positions'
