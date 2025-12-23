// General Utilities

/**
 * Clamp a number between min and max
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Generate a random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generate a random float between min and max
 */
export const randomFloat = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

/**
 * Check if two rectangles overlap
 */
export const rectsOverlap = (
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
): boolean => {
  return !(
    r1.x + r1.w < r2.x ||
    r2.x + r2.w < r1.x ||
    r1.y + r1.h < r2.y ||
    r2.y + r2.h < r1.y
  );
};

/**
 * Calculate distance between two points
 */
export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

/**
 * Format time in MM:SS
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (num: number): string =>
  num.toLocaleString('en-US');

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

/**
 * Get window/viewport dimensions
 */
export const getViewportSize = (): { width: number; height: number } => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 1920,
  height: typeof window !== 'undefined' ? window.innerHeight : 1080,
});

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  );
};

/**
 * Scale window dimensions for viewport
 * Designed for 1920x1080, scales down for smaller screens
 */
export const getScaledSize = (
  baseW: number,
  baseH: number
): { w: number; h: number } => {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const baseWidth = 1920;
  const baseHeight = 1080;

  // Calculate scale factor (use the smaller of width/height ratios)
  const scaleX = vw / baseWidth;
  const scaleY = vh / baseHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Never scale up, only down

  // Apply scale with minimum sizes
  const scaledW = Math.max(280, Math.round(baseW * scale));
  const scaledH = Math.max(200, Math.round(baseH * scale));

  // Ensure it fits in viewport with padding
  const maxW = vw - 40;
  const maxH = vh - 80;

  return {
    w: Math.min(scaledW, maxW),
    h: Math.min(scaledH, maxH),
  };
};

/**
 * Create a unique ID
 */
export const createId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Sleep for a specified duration
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Shuffle an array (Fisher-Yates)
 */
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Pick random element from array
 */
export const randomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

/**
 * Check if point is inside rectangle
 */
export const pointInRect = (
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean => px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
