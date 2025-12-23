'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useSounds } from '@/hooks';

interface LabyrinthAppProps {
  onAchievement?: (id: string) => void;
}

interface Position {
  x: number;
  y: number;
}

// Maze generation using recursive backtracking
const generateMaze = (width: number, height: number): number[][] => {
  // 0 = wall, 1 = path
  const maze: number[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(0));

  const carve = (x: number, y: number) => {
    maze[y][x] = 1;
    const directions = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 0) {
        maze[y + dy / 2][x + dx / 2] = 1;
        carve(nx, ny);
      }
    }
  };

  carve(1, 1);
  return maze;
};

// High score manager (localStorage-based)
const getHighScore = (game: string): number => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(`highscore_${game}`);
  return stored ? parseInt(stored, 10) : 0;
};

const saveHighScore = (game: string, score: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`highscore_${game}`, score.toString());
};

export function LabyrinthApp({ onAchievement }: LabyrinthAppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [level, setLevel] = useState(1);
  const [highestLevel, setHighestLevel] = useState(() => getHighScore('labyrinth'));
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won'>('menu');
  const [moveCount, setMoveCount] = useState(0);
  const playerPos = useRef<Position>({ x: 1, y: 1 });
  const maze = useRef<number[][]>([]);
  const exitPos = useRef<Position>({ x: 0, y: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });
  const achievementTriggered = useRef(false);

  const sounds = useSounds();

  const CELL_SIZE = 20;
  const getMazeSize = (lvl: number) => {
    const base = 11;
    const increment = Math.floor((lvl - 1) / 2) * 2;
    return Math.min(base + increment, 25); // Cap at 25x25
  };

  const initLevel = useCallback(
    (lvl: number) => {
      const size = getMazeSize(lvl);
      maze.current = generateMaze(size, size);
      playerPos.current = { x: 1, y: 1 };
      // Exit at bottom right corner (find nearest path)
      for (let y = size - 2; y > 0; y--) {
        for (let x = size - 2; x > 0; x--) {
          if (maze.current[y][x] === 1) {
            exitPos.current = { x, y };
            break;
          }
        }
        if (exitPos.current.y > 0) break;
      }
      setMoveCount(0);
      setGameState('playing');
    },
    []
  );

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || maze.current.length === 0) return;

    const mazeSize = maze.current.length;
    const canvasSize = mazeSize * CELL_SIZE;

    // Clear
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw maze
    for (let y = 0; y < mazeSize; y++) {
      for (let x = 0; x < mazeSize; x++) {
        if (maze.current[y][x] === 0) {
          ctx.fillStyle = '#000';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw exit
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(
      exitPos.current.x * CELL_SIZE + 2,
      exitPos.current.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    // Draw player
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
      playerPos.current.x * CELL_SIZE + CELL_SIZE / 2,
      playerPos.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, []);

  const move = useCallback(
    (dx: number, dy: number) => {
      if (gameState !== 'playing') return;

      const newX = playerPos.current.x + dx;
      const newY = playerPos.current.y + dy;

      if (
        newX >= 0 &&
        newX < maze.current.length &&
        newY >= 0 &&
        newY < maze.current.length &&
        maze.current[newY][newX] === 1
      ) {
        playerPos.current = { x: newX, y: newY };
        setMoveCount((m) => m + 1);
        sounds.ping();
        draw();

        // Check win
        if (newX === exitPos.current.x && newY === exitPos.current.y) {
          sounds.success();
          setGameState('won');
          const newLevel = level + 1;
          setLevel(newLevel);
          if (newLevel > highestLevel) {
            setHighestLevel(newLevel);
            saveHighScore('labyrinth', newLevel);
          }
          if (newLevel >= 5 && !achievementTriggered.current) {
            achievementTriggered.current = true;
            onAchievement?.('MAZE_MASTER');
          }
        }
      }
    },
    [gameState, draw, level, highestLevel, sounds, onAchievement]
  );

  // Keyboard controls
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp' || e.key === 'w') move(0, -1);
      if (e.key === 'ArrowDown' || e.key === 's') move(0, 1);
      if (e.key === 'ArrowLeft' || e.key === 'a') move(-1, 0);
      if (e.key === 'ArrowRight' || e.key === 'd') move(1, 0);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [move, gameState]);

  // Draw on state change
  useEffect(() => {
    if (gameState === 'playing') {
      draw();
    }
  }, [gameState, draw]);

  // Touch controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (gameState !== 'playing') return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) move(1, 0);
        else if (dx < -30) move(-1, 0);
      } else {
        if (dy > 30) move(0, 1);
        else if (dy < -30) move(0, -1);
      }
    },
    [move, gameState]
  );

  const startGame = () => {
    initLevel(level);
  };

  const continueGame = () => {
    initLevel(level);
  };

  const resetGame = () => {
    setLevel(1);
    achievementTriggered.current = false;
    initLevel(1);
  };

  const mazeSize = getMazeSize(level);
  const canvasSize = mazeSize * CELL_SIZE;

  return (
    <div
      className="h-full flex flex-col bg-white select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="app-header">
        <span className="app-header-title">LABYRINTH.EXE</span>
        <div className="flex gap-4 font-mono text-xs">
          <span>
            LEVEL: <span className="font-bold">{level}</span>
          </span>
          <span>
            BEST: <span className="font-bold">{highestLevel}</span>
          </span>
          <span>
            MOVES: <span className="font-bold">{moveCount}</span>
          </span>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-2 md:p-4 bg-gray-50 overflow-hidden">
        <div
          className="relative border-2 border-black bg-white"
          style={{ width: canvasSize, height: canvasSize, maxWidth: '100%', maxHeight: '100%' }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="block w-full h-full"
            style={{ imageRendering: 'pixelated' }}
            role="img"
            aria-label="Labyrinth game canvas"
          />
          {gameState === 'menu' && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center">
              <div className="text-4xl font-black mb-2 tracking-widest">LABYRINTH</div>
              <p className="text-gray-500 font-mono text-xs mb-4">FIND THE EXIT</p>
              <button onClick={startGame} className="btn-primary">
                START LEVEL {level}
              </button>
              {level > 1 && (
                <button onClick={resetGame} className="mt-2 btn-secondary btn-sm">
                  RESET TO LEVEL 1
                </button>
              )}
              <p className="mt-4 text-gray-500 font-mono text-xs text-center px-4 hidden md:block">
                ARROW KEYS OR WASD TO MOVE
              </p>
              <p className="mt-4 text-gray-500 font-mono text-xs text-center px-4 md:hidden">
                SWIPE TO MOVE
              </p>
            </div>
          )}
          {gameState === 'won' && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center">
              <div className="text-4xl font-black mb-2 tracking-widest text-green-600">ESCAPED!</div>
              <p className="text-gray-500 font-mono text-xs mb-4">COMPLETED IN {moveCount} MOVES</p>
              <button onClick={continueGame} className="btn-primary">
                LEVEL {level}
              </button>
              <button onClick={resetGame} className="mt-2 btn-secondary btn-sm">
                RESET
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="app-footer">
        <span className="text-gray-500 text-xs">REACH THE GREEN EXIT - AVOID THE WALLS</span>
      </div>
    </div>
  );
}
