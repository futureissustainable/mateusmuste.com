// Storage Utilities - localStorage helpers with type safety

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  },

  getString(key: string, defaultValue: string = ''): string {
    if (typeof window === 'undefined') return defaultValue;
    return localStorage.getItem(key) || defaultValue;
  },

  setString(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },

  getNumber(key: string, defaultValue: number = 0): number {
    if (typeof window === 'undefined') return defaultValue;
    const value = localStorage.getItem(key);
    return value ? parseInt(value, 10) : defaultValue;
  },

  setNumber(key: string, value: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value.toString());
  },

  getBoolean(key: string, defaultValue: boolean = false): boolean {
    if (typeof window === 'undefined') return defaultValue;
    const value = localStorage.getItem(key);
    return value === 'true';
  },

  setBoolean(key: string, value: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value.toString());
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

// High Score Manager - manages game scores with IP-based keys
export const HighScoreManager = {
  userIP: null as string | null,
  ipReady: false,

  init(): void {
    // IP is optional - we can function without it
    this.fetchIP();
  },

  async fetchIP(): Promise<string> {
    // Check cache first
    const cachedIP = localStorage.getItem('user_ip_cache');
    if (cachedIP) {
      this.userIP = cachedIP;
      this.ipReady = true;
      return cachedIP;
    }

    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.userIP = data.ip;
      this.ipReady = true;
      localStorage.setItem('user_ip_cache', data.ip);
      return data.ip;
    } catch {
      // Fallback to local-only scores
      this.userIP = 'local';
      this.ipReady = true;
      return 'local';
    }
  },

  getStorageKey(game: string): string {
    return `highscore_${game}_${this.userIP || 'local'}`;
  },

  saveHighScore(game: string, score: number): boolean {
    const key = this.getStorageKey(game);
    const current = localStorage.getItem(key);
    if (!current || score > parseInt(current, 10)) {
      localStorage.setItem(key, score.toString());
      return true;
    }
    return false;
  },

  getHighScore(game: string): number {
    const key = this.getStorageKey(game);
    return parseInt(localStorage.getItem(key) || '0', 10);
  },
};

// Storage Keys Constants
export const STORAGE_KEYS = {
  // Session/State
  INTRO_COMPLETE: 'intro_complete',
  SOUND_MUTED: 'sound_muted',
  DESKTOP_BG: 'desktop_bg',
  VISITS: 'ultra_int_visits',
  CLICKS: 'ultra_int_clicks',
  COMPLETED: 'ultra_int_completed',

  // Achievements & Unlocks
  ACHIEVEMENTS: 'ultra_int_achievements',
  NARRATIVE_UNLOCKS: 'ultra_int_narrative_unlocks',

  // Desktop State
  ICON_POSITIONS: 'desktop_icon_positions',
  EXTRA_DESKTOP_ICONS: 'extra_desktop_icons',

  // Game Progress
  DOG_TRASH_COUNT: 'dog_trash_count',
  VOID_TOTAL_CHARS: 'void_total_chars',
  MEDIA_LIB_VISITED: 'media_lib_visited',
  TAROT_UNIQUE_DAYS: 'tarot_unique_days',
  TAROT_CARDS: 'tarot_cards_3',
  TERMINAL_HISTORY: 'terminal_history',
  POMODORO_DATA: 'pomodoro_data',
  LOGIC_VOLUMES: 'ultra_int_logic_volumes',
  MAP_CLICKER: 'mapclicker',

  // Visitor Tracking
  USER_IP_CACHE: 'user_ip_cache',
  VISITOR_ESTIMATE: 'visitor_estimate',
} as const;

// Type for storage keys
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
