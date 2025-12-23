import { useState, useEffect, useRef, memo } from 'react';
import { sounds } from '@/lib/audio';
import { HighScoreManager } from '@/lib/storage';

interface SnakeAppProps {
  onAchievement?: (id: string) => void;
}

export const SnakeApp = memo(({ onAchievement }: SnakeAppProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const achievementTriggered = useRef(false);
  const [highScore, setHighScore] = useState(() => HighScoreManager.getHighScore('snake'));
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const snake = useRef([{ x: 15, y: 10 }]);
  const food = useRef({ x: 20, y: 10 });
  const dir = useRef({ x: 1, y: 0 });
  const nextDir = useRef({ x: 1, y: 0 });
  const runningRef = useRef(false);
  const lastTimeRef = useRef(0);
  const frameRef = useRef<number>(0);

  const GRID_W = 30;
  const GRID_H = 20;
  const CELL = 20;

  // Load high score from storage when IP is ready
  useEffect(() => {
    const loadHighScore = async () => {
      await HighScoreManager.fetchIP();
      setHighScore(HighScoreManager.getHighScore('snake'));
    };
    loadHighScore();
  }, []);

  const start = () => {
    snake.current = [{ x: 15, y: 10 }, { x: 14, y: 10 }, { x: 13, y: 10 }];
    dir.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    food.current = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    runningRef.current = true;
    lastTimeRef.current = 0;
  };

  const update = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    dir.current = nextDir.current;
    const head = {
      x: snake.current[0].x + dir.current.x,
      y: snake.current[0].y + dir.current.y
    };

    // Wall collision
    if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
      endGame();
      return;
    }

    // Self collision
    if (snake.current.some(s => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    snake.current.unshift(head);

    // Eat food
    if (head.x === food.current.x && head.y === food.current.y) {
      sounds.coin();
      setScore(s => {
        const newScore = s + 10;
        setHighScore(h => {
          const newHigh = Math.max(h, newScore);
          HighScoreManager.saveHighScore('snake', newHigh);
          return newHigh;
        });
        if (newScore >= 50 && !achievementTriggered.current) {
          achievementTriggered.current = true;
          onAchievement?.('OUROBOROS');
        }
        return newScore;
      });
      food.current = {
        x: Math.floor(Math.random() * GRID_W),
        y: Math.floor(Math.random() * GRID_H)
      };
    } else {
      snake.current.pop();
    }

    // Draw
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, GRID_W * CELL, GRID_H * CELL);

    // Grid lines
    ctx.strokeStyle = '#e0e0e0';
    for (let i = 0; i <= GRID_W; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID_H * CELL);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_H; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID_W * CELL, i * CELL);
      ctx.stroke();
    }

    // Snake with letters
    const SNEK_LETTERS = ['S', 'U', 'D', 'O', 'U', 'N', 'L', 'O', 'C', 'K'];
    snake.current.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#000' : '#333';
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      if (i > 0 && i <= 10) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "PPNeueBit", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(SNEK_LETTERS[i - 1], s.x * CELL + CELL / 2, s.y * CELL + CELL / 2);
      }
    });

    // Food
    ctx.fillStyle = '#000';
    ctx.fillRect(food.current.x * CELL + 6, food.current.y * CELL + 6, CELL - 12, CELL - 12);
  };

  const endGame = () => {
    runningRef.current = false;
    setGameOver(true);
    setGameStarted(false);
    sounds.gameOver();
  };

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!runningRef.current) {
        frameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (timestamp - lastTimeRef.current >= 100) {
        lastTimeRef.current = timestamp;
        update();
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!runningRef.current) return;
      if (e.key === 'ArrowUp' && dir.current.y === 0) nextDir.current = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && dir.current.y === 0) nextDir.current = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && dir.current.x === 0) nextDir.current = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && dir.current.x === 0) nextDir.current = { x: 1, y: 0 };
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  // Initial canvas draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, GRID_W * CELL, GRID_H * CELL);
      ctx.strokeStyle = '#e0e0e0';
      for (let i = 0; i <= GRID_W; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, GRID_H * CELL);
        ctx.stroke();
      }
      for (let i = 0; i <= GRID_H; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(GRID_W * CELL, i * CELL);
        ctx.stroke();
      }
    }
  }, []);

  // Touch/swipe controls
  const handleDirection = (newDir: string) => {
    if (!runningRef.current) return;
    if (newDir === 'up' && dir.current.y === 0) nextDir.current = { x: 0, y: -1 };
    if (newDir === 'down' && dir.current.y === 0) nextDir.current = { x: 0, y: 1 };
    if (newDir === 'left' && dir.current.x === 0) nextDir.current = { x: -1, y: 0 };
    if (newDir === 'right' && dir.current.x === 0) nextDir.current = { x: 1, y: 0 };
  };

  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!runningRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) handleDirection('right');
      else if (dx < -30) handleDirection('left');
    } else {
      if (dy > 30) handleDirection('down');
      else if (dy < -30) handleDirection('up');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white select-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="app-header">
        <span className="app-header-title">SNEK.EXE</span>
        <div className="flex gap-4 font-mono text-xs">
          <span>SCORE: <span className="font-bold">{score}</span></span>
          <span>HIGH: <span className="font-bold">{highScore}</span></span>
          <span className={gameOver ? 'text-red-600' : gameStarted ? 'text-green-600' : 'text-gray-500'}>
            {gameOver ? 'DEAD' : gameStarted ? 'ALIVE' : 'READY'}
          </span>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center p-2 md:p-4 bg-gray-50 overflow-hidden">
        <div className="relative border-2 border-black" style={{ width: 'min(100%, 600px)', aspectRatio: '3/2' }}>
          <canvas ref={canvasRef} width={600} height={400} className="block w-full h-full" style={{ imageRendering: 'pixelated' }} role="img" aria-label="Snake game canvas" />
          {!gameStarted && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center">
              <div className="text-4xl font-black mb-2 tracking-widest">SNEK</div>
              {gameOver && <p className="text-red-600 mb-4 font-mono text-sm">GAME OVER</p>}
              <button onClick={start} className="btn-primary">
                {gameOver ? 'RETRY' : 'START'}
              </button>
              <p className="mt-4 text-gray-500 font-mono text-xs text-center px-4 hidden md:block">ARROW KEYS TO MOVE</p>
              <p className="mt-4 text-gray-500 font-mono text-xs text-center px-4 md:hidden">SWIPE TO MOVE</p>
            </div>
          )}
        </div>
      </div>
      <div className="app-footer">
        <span className="app-footer-text">EAT FOOD - GROW LONGER - DON'T DIE</span>
      </div>
    </div>
  );
});

SnakeApp.displayName = 'SnakeApp';

export default SnakeApp;
