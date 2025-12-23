import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { sounds } from '@/lib/audio';
import { HighScoreManager } from '@/lib/storage';

interface LabyrinthAppProps {
  onAchievement?: (id: string) => void;
}

export const LabyrinthApp = memo(({ onAchievement }: LabyrinthAppProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [, setHighScore] = useState(() => HighScoreManager.getHighScore('labyrinth'));
  const [won, setWon] = useState(false);
  const [showingMaze, setShowingMaze] = useState(false);
  const [levelWord, setLevelWord] = useState<string | null>(null);
  const [showOpenFlash, setShowOpenFlash] = useState(true);
  const mazeRef = useRef<number[][] | null>(null);
  const playerRef = useRef({ x: 1, y: 1 });
  const exitRef = useRef({ x: 0, y: 0 });
  const stepLeftRef = useRef(true);

  const LEVEL_WORDS = ['PASSWORD', 'IS', 'ALWAYS', 'PATIENCE', 'TEN'];
  const CELL_SIZE = 8;

  // Flash "THE" on app open
  useEffect(() => {
    if (showOpenFlash) {
      const timer = setTimeout(() => setShowOpenFlash(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showOpenFlash]);

  // Load high score
  useEffect(() => {
    const loadHighScore = async () => {
      await HighScoreManager.fetchIP();
      setHighScore(HighScoreManager.getHighScore('labyrinth'));
    };
    loadHighScore();
  }, []);

  const generateMaze = useCallback((width: number, height: number): number[][] => {
    const maze: number[][] = Array(height).fill(null).map(() => Array(width).fill(1));
    const stack: [number, number][] = [[1, 1]];
    maze[1][1] = 0;

    while (stack.length > 0) {
      const [x, y] = stack[stack.length - 1];
      const directions: [number, number][] = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5) as [number, number][];
      let found = false;

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
          maze[y + dy / 2][x + dx / 2] = 0;
          maze[ny][nx] = 0;
          stack.push([nx, ny]);
          found = true;
          break;
        }
      }

      if (!found) stack.pop();
    }
    return maze;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mazeRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const maze = mazeRef.current;

    canvas.width = maze[0].length * CELL_SIZE;
    canvas.height = maze.length * CELL_SIZE;

    // Draw maze
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        ctx.fillStyle = maze[y][x] === 1 ? '#111' : '#fafafa';
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw exit
    const ex = exitRef.current.x * CELL_SIZE;
    const ey = exitRef.current.y * CELL_SIZE;
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(ex, ey, CELL_SIZE, CELL_SIZE);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(ex + 2, ey + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    // Draw player
    const px = playerRef.current.x * CELL_SIZE;
    const py = playerRef.current.y * CELL_SIZE;
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
  }, []);

  const startLevel = useCallback((lvl: number) => {
    const size = 7 + Math.floor(Math.pow(1.5, lvl) * 2);
    const cappedSize = Math.min(size | 1, 151);
    const maze = generateMaze(cappedSize | 1, cappedSize | 1);
    mazeRef.current = maze;
    playerRef.current = { x: 1, y: 1 };

    // Find exit
    exitRef.current = { x: 0, y: 0 };
    for (let y = maze.length - 2; y > maze.length / 2; y--) {
      for (let x = maze[0].length - 2; x > maze[0].length / 2; x--) {
        if (maze[y][x] === 0) {
          exitRef.current = { x, y };
          break;
        }
      }
      if (exitRef.current.x !== 0) break;
    }

    setWon(false);
    setShowingMaze(false);
    draw();
  }, [generateMaze, draw]);

  const move = useCallback((dx: number, dy: number) => {
    if (won || showingMaze) return;
    const maze = mazeRef.current;
    if (!maze) return;

    const nx = playerRef.current.x + dx;
    const ny = playerRef.current.y + dy;

    if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && maze[ny][nx] === 0) {
      sounds.labyrinthStep();
      stepLeftRef.current = !stepLeftRef.current;
      playerRef.current = { x: nx, y: ny };
      draw();

      if (nx === exitRef.current.x && ny === exitRef.current.y) {
        const points = level * 100;
        setScore(s => {
          const newScore = s + points;
          setHighScore(h => {
            const newHigh = Math.max(h, newScore);
            HighScoreManager.saveHighScore('labyrinth', newHigh);
            return newHigh;
          });
          return newScore;
        });
        if (level <= LEVEL_WORDS.length) {
          setLevelWord(LEVEL_WORDS[level - 1]);
        } else {
          setLevelWord('CLEAR');
        }
        setWon(true);
        sounds.labyrinthExit();
        onAchievement?.('FIRST_BLOOD');
        if (level >= 10) onAchievement?.('DAEDALUS');

        setTimeout(() => {
          setShowingMaze(true);
          setTimeout(() => {
            setLevel(l => l + 1);
            startLevel(level + 1);
          }, 2000);
        }, 1000);
      }
    } else {
      sounds.labyrinthBump();
    }
  }, [won, showingMaze, level, draw, onAchievement, startLevel]);

  const giveUp = () => {
    setLevel(1);
    setScore(0);
    startLevel(1);
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move(0, -1);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
    };
    window.addEventListener('keydown', handle);
    startLevel(1);
    return () => window.removeEventListener('keydown', handle);
  }, [move, startLevel]);

  // Touch controls
  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const threshold = 20;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) move(1, 0);
      else if (dx < -threshold) move(-1, 0);
    } else {
      if (dy > threshold) move(0, 1);
      else if (dy < -threshold) move(0, -1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white select-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="h-8 px-3 flex justify-between items-center">
        <span className="font-mono text-[10px] font-bold tracking-widest text-black">LABYRINTH</span>
        <div className="flex gap-6 font-mono text-[10px]">
          <span className="text-gray-400">LVL <span className="text-black font-bold">{level}</span></span>
          <span className="text-gray-400">PTS <span className="text-black font-bold">{score}</span></span>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center relative bg-white">
        {showOpenFlash && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
            <div className="text-4xl font-black tracking-widest text-white animate-pulse">THE</div>
          </div>
        )}
        {won && !showingMaze && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-2xl font-black tracking-widest">{levelWord || 'CLEAR'}</div>
              <div className="font-mono text-[10px] text-gray-400 mt-1">+{level * 100}</div>
            </div>
          </div>
        )}
        {showingMaze && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="font-mono text-[10px] text-gray-400 tracking-widest animate-pulse">
              GENERATING LEVEL {level}
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="block" style={{ imageRendering: 'pixelated' }} role="img" aria-label="Labyrinth maze game" />
      </div>
      <div className="h-8 px-3 flex justify-between items-center">
        <span className="font-mono text-[10px] text-gray-300 hidden md:inline">↑↓←→</span>
        <span className="font-mono text-[10px] text-gray-300 md:hidden">SWIPE TO MOVE</span>
        <button onClick={giveUp} className="font-mono text-[10px] text-gray-300 hover:text-black transition-colors">
          RESTART
        </button>
      </div>
    </div>
  );
});

LabyrinthApp.displayName = 'LabyrinthApp';

export default LabyrinthApp;
