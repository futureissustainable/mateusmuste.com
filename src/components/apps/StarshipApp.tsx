'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface StarshipAppProps {
  onAchievement?: (id: string) => void;
}

interface Star {
  x: number;
  y: number;
  speed: number;
}

interface Bullet {
  x: number;
  y: number;
}

interface Enemy {
  x: number;
  y: number;
  speed: number;
}

export function StarshipApp({ onAchievement }: StarshipAppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const achievementTriggered = useRef(false);

  const playerRef = useRef({ x: 250, y: 350, width: 20, height: 30 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const lastShotRef = useRef(0);

  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 400;

  // Initialize stars
  useEffect(() => {
    starsRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      speed: 1 + Math.random() * 2,
    }));
  }, []);

  const start = useCallback(() => {
    playerRef.current = { x: 250, y: 350, width: 20, height: 30 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    lastShotRef.current = 0;
  }, []);

  const spawnEnemy = useCallback(() => {
    enemiesRef.current.push({
      x: Math.random() * (CANVAS_WIDTH - 30) + 15,
      y: -30,
      speed: 2 + Math.random() * 2,
    });
  }, []);

  const update = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || gameOver || !gameStarted) return;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw and update stars
    ctx.fillStyle = '#fff';
    starsRef.current.forEach((star) => {
      ctx.fillRect(star.x, star.y, 1, 1);
      star.y += star.speed;
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }
    });

    // Player movement
    const player = playerRef.current;
    if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
      player.x = Math.max(player.width / 2, player.x - 5);
    }
    if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
      player.x = Math.min(CANVAS_WIDTH - player.width / 2, player.x + 5);
    }
    if (keysRef.current.has(' ') && Date.now() - lastShotRef.current > 200) {
      bulletsRef.current.push({ x: player.x, y: player.y - player.height / 2 });
      lastShotRef.current = Date.now();
    }

    // Draw player (triangle ship)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height / 2);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.closePath();
    ctx.fill();

    // Update and draw bullets
    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      bullet.y -= 10;
      if (bullet.y < 0) return false;

      ctx.fillStyle = '#ff0';
      ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
      return true;
    });

    // Spawn enemies
    if (Math.random() < 0.02) {
      spawnEnemy();
    }

    // Update and draw enemies
    let hitPlayer = false;
    enemiesRef.current = enemiesRef.current.filter((enemy) => {
      enemy.y += enemy.speed;

      // Check collision with player
      if (
        Math.abs(enemy.x - player.x) < 20 &&
        Math.abs(enemy.y - player.y) < 25
      ) {
        hitPlayer = true;
        return false;
      }

      // Check collision with bullets
      const hitByBullet = bulletsRef.current.some((bullet, i) => {
        if (Math.abs(bullet.x - enemy.x) < 15 && Math.abs(bullet.y - enemy.y) < 15) {
          bulletsRef.current.splice(i, 1);
          setScore((s) => {
            const newScore = s + 10;
            if (newScore >= 100 && !achievementTriggered.current) {
              achievementTriggered.current = true;
              onAchievement?.('ACE_PILOT');
            }
            return newScore;
          });
          return true;
        }
        return false;
      });

      if (hitByBullet) return false;
      if (enemy.y > CANVAS_HEIGHT + 30) return false;

      // Draw enemy
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y + 15);
      ctx.lineTo(enemy.x - 10, enemy.y - 15);
      ctx.lineTo(enemy.x + 10, enemy.y - 15);
      ctx.closePath();
      ctx.fill();

      return true;
    });

    if (hitPlayer) {
      setGameOver(true);
      setGameStarted(false);
    }
  }, [gameOver, gameStarted, spawnEnemy, onAchievement]);

  // Game loop
  useEffect(() => {
    const loop = () => {
      update();
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [update]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-black select-none">
      <div className="h-10 px-4 flex justify-between items-center border-b border-gray-800">
        <span className="font-mono text-[10px] font-bold tracking-widest text-white">
          STARSHIP.EXE
        </span>
        <span className="font-mono text-[10px] text-white">
          SCORE: {score.toString().padStart(5, '0')}
        </span>
      </div>

      <div className="flex-grow flex items-center justify-center p-2 overflow-hidden">
        <div className="relative border-2 border-white">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block"
          />
          {!gameStarted && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
              <div className="font-mono text-2xl text-white font-bold mb-2">STARSHIP</div>
              {gameOver && (
                <div className="font-mono text-sm text-red-500 mb-2">
                  DESTROYED - SCORE: {score}
                </div>
              )}
              <button
                onClick={start}
                className="px-6 py-2 border-2 border-white text-white font-mono text-sm hover:bg-white hover:text-black transition-colors"
              >
                {gameOver ? 'RETRY' : 'START'}
              </button>
              <div className="font-mono text-[10px] text-gray-500 mt-4 text-center">
                ARROWS/WASD TO MOVE<br />
                SPACE TO SHOOT
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
