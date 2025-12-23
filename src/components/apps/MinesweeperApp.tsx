'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSounds } from '@/hooks';

interface MinesweeperAppProps {
  onAchievement?: (id: string) => void;
}

type CellValue = number; // -1 = mine, 0-8 = adjacent mine count

export function MinesweeperApp({ onAchievement }: MinesweeperAppProps) {
  const [grid, setGrid] = useState<CellValue[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [flagged, setFlagged] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [mineCount, setMineCount] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const usedFlags = useRef(false);

  const sounds = useSounds();

  const ROWS = 9;
  const COLS = 9;
  const MINES = 10;

  // Hidden background message at 20% opacity
  const HIDDEN_MESSAGE =
    'TOMOVEFORWARDYOUMUSTSOMETIMESMOVEBACKWARDFINDOUTTHETRUTHREVEALTHESTARSSUDOSHOOTER';
  const getBackgroundLetter = (r: number, c: number): string => {
    const idx = r * COLS + c;
    return HIDDEN_MESSAGE[idx] || '';
  };

  const initGame = useCallback(() => {
    // Create empty grid
    const newGrid: CellValue[][] = Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(0));
    const newRevealed: boolean[][] = Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(false));
    const newFlagged: boolean[][] = Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(false));

    // Place mines
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (newGrid[r][c] !== -1) {
        newGrid[r][c] = -1;
        placed++;
      }
    }

    // Calculate numbers
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newGrid[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr,
              nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newGrid[nr][nc] === -1) {
              count++;
            }
          }
        }
        newGrid[r][c] = count;
      }
    }

    setGrid(newGrid);
    setRevealed(newRevealed);
    setFlagged(newFlagged);
    setGameOver(false);
    setWon(false);
    setMineCount(MINES);
    setTime(0);
    setStarted(false);
    usedFlags.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initGame]);

  useEffect(() => {
    if (started && !gameOver && !won) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, gameOver, won]);

  const reveal = (r: number, c: number) => {
    if (gameOver || won || revealed[r]?.[c] || flagged[r]?.[c]) return;

    if (!started) setStarted(true);

    const newRevealed = revealed.map((row) => [...row]);

    if (grid[r][c] === -1) {
      // Hit mine - reveal all mines
      sounds.error();
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if (grid[i][j] === -1) newRevealed[i][j] = true;
        }
      }
      setRevealed(newRevealed);
      setGameOver(true);
      return;
    }

    // Safe cell - play ding
    sounds.ping();

    // Flood fill for empty cells
    const flood = (row: number, col: number) => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
      if (newRevealed[row][col] || flagged[row]?.[col]) return;
      newRevealed[row][col] = true;
      if (grid[row][col] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            flood(row + dr, col + dc);
          }
        }
      }
    };

    flood(r, c);
    setRevealed(newRevealed);

    // Check win
    let unrevealed = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (!newRevealed[i][j]) unrevealed++;
      }
    }
    if (unrevealed === MINES) {
      setWon(true);
      sounds.success();
      onAchievement?.('MINESWEEPER');
    }
  };

  const flag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won || revealed[r]?.[c]) return;
    if (!started) setStarted(true);
    usedFlags.current = true;

    const newFlagged = flagged.map((row) => [...row]);
    newFlagged[r][c] = !newFlagged[r][c];
    setFlagged(newFlagged);
    setMineCount((m) => (newFlagged[r][c] ? m - 1 : m + 1));
  };

  const getCellContent = (r: number, c: number): string => {
    if (flagged[r]?.[c]) return '⚑';
    if (!revealed[r]?.[c]) return '';
    if (grid[r]?.[c] === -1) return '●';
    if (grid[r]?.[c] === 0) return '';
    return String(grid[r][c]);
  };

  const getCellStyle = (r: number, c: number): string => {
    if (flagged[r]?.[c]) return 'bg-gray-100 text-black';
    if (!revealed[r]?.[c]) return 'bg-gray-200 hover:bg-gray-300';
    if (grid[r]?.[c] === -1) return 'bg-black text-white';
    return 'bg-white text-black';
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="h-10 px-4 flex justify-between items-center border-b border-gray-100">
        <span className="font-mono text-[10px] font-bold tracking-widest text-black">
          MINESWEEPER
        </span>
        <div className="flex gap-8 font-mono text-[10px]">
          <span className="text-gray-400">
            MINES{' '}
            <span className="text-black font-bold">{mineCount.toString().padStart(3, '0')}</span>
          </span>
          <span className="text-gray-400">
            TIME <span className="text-black font-bold">{time.toString().padStart(3, '0')}</span>
          </span>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center relative bg-gray-50 p-4">
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-2xl font-black tracking-widest">
                {won ? 'CLEARED' : 'DETONATED'}
              </div>
              <div className="font-mono text-[10px] text-gray-400 mt-2">{time}s</div>
              <button
                onClick={initGame}
                className="mt-4 px-4 py-2 bg-black text-white font-mono text-[10px] tracking-widest hover:bg-gray-800"
              >
                RETRY
              </button>
            </div>
          </div>
        )}

        <div className="border border-gray-200">
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((_, c) => (
                <button
                  key={c}
                  onClick={() => reveal(r, c)}
                  onContextMenu={(e) => flag(e, r, c)}
                  className={`w-6 h-6 border border-gray-100 font-mono text-[10px] font-bold flex items-center justify-center transition-colors relative ${getCellStyle(r, c)}`}
                >
                  {revealed[r]?.[c] && grid[r]?.[c] === 0 && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-black text-xs font-bold pointer-events-none"
                      style={{ opacity: 0.1 }}
                    >
                      {getBackgroundLetter(r, c)}
                    </span>
                  )}
                  {getCellContent(r, c)}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="h-8 px-4 flex justify-between items-center border-t border-gray-100">
        <span className="font-mono text-[10px] text-gray-300">
          LEFT CLICK REVEAL · RIGHT CLICK FLAG
        </span>
        <button
          onClick={initGame}
          className="font-mono text-[10px] text-gray-300 hover:text-black transition-colors"
        >
          NEW GAME
        </button>
      </div>
    </div>
  );
}
