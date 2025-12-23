// Window Management Types
export interface WindowState {
  id: string;
  title: string;
  icon: IconName;
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

export type WindowsState = Record<string, WindowState>;
export type WindowAnimations = Record<string, 'opening' | 'closing'>;

// Icon Types
export type IconName =
  | 'Terminal'
  | 'Folder'
  | 'Palette'
  | 'Snek'
  | 'TrashCan'
  | 'Undo'
  | 'Redo'
  | 'FileDoc'
  | 'X'
  | 'Minus'
  | 'Square'
  | 'Trash'
  | 'Send'
  | 'Movies'
  | 'Books'
  | 'Games'
  | 'Music'
  | 'Back'
  | 'Void'
  | 'Radio'
  | 'Dice'
  | 'Labyrinth'
  | 'Minesweeper'
  | 'Starship'
  | 'Synth'
  | 'Destruction'
  | 'Tarot'
  | 'Dog'
  | 'Email'
  | 'Apps'
  | 'Gallery'
  | 'Globe'
  | 'Pomodoro'
  | 'Charging'
  | 'Speaker'
  | 'SpeakerOff'
  | 'HealthScanner'
  | 'Lock'
  | 'FolderClosed'
  | 'GamesFolder'
  | 'ProductivityFolder'
  | 'AboutFolder'
  | 'ThirdEye'
  | 'Browser'
  | 'Trophy'
  | 'Message'
  | 'RainAlt'
  | 'Alert'
  | 'Repeat'
  | 'Sword'
  | 'Expand'
  | 'Controller'
  | 'Clock'
  | 'Cursor'
  | 'Skull'
  | 'Fire'
  | 'Bomb'
  | 'Badge'
  | 'Star'
  | 'Eye'
  | 'Heart'
  | 'ArrowLeft';

export interface Position {
  x: number;
  y: number;
}

export type IconPositions = Record<string, Position>;

export interface IconDragState {
  id: string | null;
  offsetX: number;
  offsetY: number;
  active: boolean;
}

export interface IconPhysics {
  velX: number;
  velY: number;
}

// Achievement Types
export interface Achievement {
  name: string;
  icon: IconName;
  hint: string;
  visible: boolean;
}

export interface UnlockedAchievement {
  unlockedAt: number;
}

export type AchievementsConfig = Record<string, Achievement>;
export type UnlockedAchievements = Record<string, UnlockedAchievement>;

export interface AchievementNotification extends Achievement {
  id: number;
}

// App Types
export type AppId =
  | 'MESSAGES'
  | 'ABOUT'
  | 'SYSTEM'
  | 'FILES'
  | 'APPS'
  | 'CONTACT'
  | 'PAINT'
  | 'SNAKE'
  | 'TRASH'
  | 'VOID'
  | 'RADIO'
  | 'DICE'
  | 'LABYRINTH'
  | 'MINESWEEPER'
  | 'STARSHIP'
  | 'SYNTH'
  | 'DESTRUCTION'
  | 'TAROT'
  | 'GALLERY'
  | 'MAP'
  | 'POMODORO'
  | 'SCANNER'
  | 'PERSONAL'
  | 'TERMINAL'
  | 'TRUTH'
  | 'DOG_STORY'
  | 'THIRD_EYE'
  | 'THIRD_EYE_2'
  | 'BROWSER'
  | 'END'
  | 'BOOKS'
  | 'BACKUP'
  | 'TRUTH_MESSAGES';

export interface AppUnlockNotification {
  app: string;
  id: number;
}

// Media Library Types
export interface MediaItem {
  title: string;
  artist?: string;
}

export type MediaCategory = 'CINEMA_TV' | 'LITERATURE' | 'GAMES' | 'AUDIO';
export type MediaDB = Record<MediaCategory, MediaItem[]>;

// Game State Types
export interface SnakeGameState {
  snake: Position[];
  food: Position;
  direction: Position;
  score: number;
  gameOver: boolean;
  highScore: number;
}

export interface MinesweeperCell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export interface MinesweeperGameState {
  board: MinesweeperCell[][];
  gameOver: boolean;
  won: boolean;
  mineCount: number;
  flagCount: number;
}

export interface LabyrinthGameState {
  maze: number[][];
  playerPos: Position;
  exitPos: Position;
  level: number;
  completed: boolean;
}

export interface DiceRoll {
  value: number;
  type: number; // d4, d6, d8, d10, d12, d20
}

export interface StarshipGameState {
  playerX: number;
  bullets: Position[];
  enemies: Position[];
  score: number;
  lives: number;
  gameOver: boolean;
}

// Tarot Types
export interface TarotCard {
  id: number;
  name: string;
  meaning: string;
  meaningReversed: string;
  pixels: number[][];
}

// Pomodoro Types
export interface PomodoroSession {
  id: number;
  type: 'work' | 'break';
  duration: number;
  completedAt: number;
}

export interface PomodoroState {
  isRunning: boolean;
  isBreak: boolean;
  timeLeft: number;
  sessions: PomodoroSession[];
}

// Map/Globe Types
export interface MapGameState {
  clicks: number;
  clickPower: number;
  satellites: number;
  clickMultiplier: number;
  upgrades: string[];
}

// Synth Types
export interface SynthNote {
  frequency: number;
  isPlaying: boolean;
}

export interface SynthState {
  waveform: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  notes: Record<string, SynthNote>;
}

// Terminal Types
export interface TerminalHistoryEntry {
  command: string;
  output: string;
  timestamp: number;
}

// Paint Types
export type PaintTool = 'brush' | 'eraser' | 'bucket' | 'line' | 'rect' | 'circle' | 'text';

export interface PaintState {
  tool: PaintTool;
  color: string;
  size: number;
  isDrawing: boolean;
}

// Dog Types
export interface DogState {
  released: boolean;
  pos: Position;
  facingRight: boolean;
  dragging: boolean;
}

// OS Shell Types
export type DesktopBackground = 'grid' | 'solid' | 'ascii';
export type OSMode = 'story' | 'about' | null;

export interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
}

// Drag State Types
export interface DragState {
  id: string | null;
  offsetX: number;
  offsetY: number;
}

// High Score Types
export interface HighScoreManager {
  userIP: string | null;
  ipReady: boolean;
  init: () => void;
  fetchIP: () => Promise<string>;
  getStorageKey: (game: string) => string;
  saveHighScore: (game: string, score: number) => boolean;
  getHighScore: (game: string) => number;
}

// Component Props Types
export interface WindowProps {
  id: string;
  title: string;
  icon: IconName;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  isMin: boolean;
  animation?: 'opening' | 'closing';
  isMobile: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  children: React.ReactNode;
}

export interface DesktopIconProps {
  id: string;
  icon: IconName;
  title: string;
  position: Position;
  isSelected: boolean;
  isDragging: boolean;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

// Callback Types
export type AchievementCallback = (id: string) => void;
export type UnlockAppCallback = (appId: string) => void;
export type OpenAppCallback = (appId: string) => void;
export type CloseAppCallback = (appId: string) => void;

// Sound Types
export type SoundName =
  | 'dragStart'
  | 'dragStop'
  | 'windowOpen'
  | 'windowClose'
  | 'success'
  | 'error'
  | 'bounce'
  | 'bounceIcon'
  | 'bootSequence'
  | 'laser'
  | 'explosion'
  | 'coin'
  | 'gameOver'
  | 'bark'
  | 'ping'
  | 'diceRoll'
  | 'mineDing'
  | 'click'
  | 'copy'
  | 'keyPress'
  | 'noteToggle'
  | 'bootWindup'
  | 'windowMinimize'
  | 'windowRestore'
  | 'iconSelect'
  | 'achievementUnlock'
  | 'appUnlock'
  | 'menuOpen'
  | 'diceCrit20'
  | 'diceCrit1'
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
  | 'visitMilestone';

export type Sounds = Record<SoundName, (...args: unknown[]) => void>;
