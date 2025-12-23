import { useState, useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { sounds } from '@/lib/audio';
import { HighScoreManager } from '@/lib/storage';

interface StarshipAppProps {
  onAchievement?: (id: string) => void;
  onUnlockApp?: (appId: string) => void;
}

interface GameRef {
  restart: () => void;
  start: () => void;
  shoot: () => void;
}

export const StarshipApp = memo(({ onAchievement, onUnlockApp }: StarshipAppProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameRef | null>(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false, shoot: false });
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0, isDragging: false });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => HighScoreManager.getHighScore('starship'));
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const achievementTriggered = useRef(false);
  const booksUnlockTriggered = useRef(false);
  const onAchievementRef = useRef(onAchievement);
  const onUnlockAppRef = useRef(onUnlockApp);
  onAchievementRef.current = onAchievement;
  onUnlockAppRef.current = onUnlockApp;

  useEffect(() => {
    const loadHighScore = async () => {
      await HighScoreManager.fetchIP();
      setHighScore(HighScoreManager.getHighScore('starship'));
    };
    loadHighScore();
  }, []);

  const handleStart = () => {
    if (gameRef.current) {
      if (gameOver) gameRef.current.restart();
      else gameRef.current.start();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isDragging: false
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!started || gameOver) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;
    touchRef.current.isDragging = true;

    const threshold = 20;
    keysRef.current.left = dx < -threshold;
    keysRef.current.right = dx > threshold;
    keysRef.current.up = dy < -threshold;
    keysRef.current.down = dy > threshold;
  };

  const handleTouchEnd = () => {
    keysRef.current.left = false;
    keysRef.current.right = false;
    keysRef.current.up = false;
    keysRef.current.down = false;

    const elapsed = Date.now() - touchRef.current.startTime;
    if (elapsed < 200 && !touchRef.current.isDragging) {
      if (!started && !gameOver) {
        handleStart();
      } else if (gameRef.current && started && !gameOver) {
        gameRef.current.shoot();
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const width = 500;
    const height = 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 20, 80);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 0);
    camera.lookAt(0, 0, -20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Create ship
    const createShip = () => {
      const group = new THREE.Group();
      const bodyGeo = new THREE.ConeGeometry(0.3, 1.2, 4);
      bodyGeo.rotateX(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x000000, flatShading: true });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      const wingGeo = new THREE.BoxGeometry(1.8, 0.05, 0.4);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: true });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.z = 0.2;
      group.add(wings);

      const tailGeo = new THREE.BoxGeometry(0.05, 0.4, 0.3);
      const tail1 = new THREE.Mesh(tailGeo, wingMat);
      tail1.position.set(0, 0.15, 0.4);
      group.add(tail1);

      const edges = new THREE.EdgesGeometry(bodyGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x444444 }));
      group.add(line);

      return group;
    };

    const ship = createShip();
    ship.position.set(0, 0, -5);
    scene.add(ship);

    // Ground grid
    const gridGeo = new THREE.PlaneGeometry(100, 100, 20, 20);
    gridGeo.rotateX(-Math.PI / 2);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, wireframe: true });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.position.y = -3;
    scene.add(grid);

    const obstacles: THREE.Mesh[] = [];
    const lasers: THREE.Mesh[] = [];

    const createObstacle = () => {
      const types = ['asteroid', 'enemy'];
      const type = types[Math.floor(Math.random() * types.length)];
      let mesh: THREE.Mesh;

      if (type === 'asteroid') {
        const geo = new THREE.IcosahedronGeometry(0.5 + Math.random() * 0.5, 0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: true });
        mesh = new THREE.Mesh(geo, mat);
        const edges = new THREE.EdgesGeometry(geo);
        mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 })));
      } else {
        const geo = new THREE.OctahedronGeometry(0.4, 0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x000000, flatShading: true });
        mesh = new THREE.Mesh(geo, mat);
        const edges = new THREE.EdgesGeometry(geo);
        mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x666666 })));
      }

      mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
        -60 - Math.random() * 20
      );
      mesh.userData = { type, speed: 0.3 + Math.random() * 0.2 };
      scene.add(mesh);
      obstacles.push(mesh);
    };

    const createLaser = () => {
      const geo = new THREE.BoxGeometry(0.05, 0.05, 0.8);
      const mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const laser = new THREE.Mesh(geo, mat);
      laser.position.copy(ship.position);
      laser.position.z -= 0.8;
      scene.add(laser);
      lasers.push(laser);
    };

    const keys = keysRef.current;
    let canShoot = true;
    let scoreVal = 0;
    let isGameOver = false;
    let isStarted = false;

    const doShoot = () => {
      if (canShoot && isStarted && !isGameOver) {
        sounds.laser();
        createLaser();
        canShoot = false;
        setTimeout(() => canShoot = true, 150);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isStarted && e.code === 'Space') {
        isStarted = true;
        setStarted(true);
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
      if (e.code === 'Space') doShoot();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let spawnTimer = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!isStarted || isGameOver) {
        ship.rotation.z = Math.sin(Date.now() * 0.002) * 0.1;
        renderer.render(scene, camera);
        return;
      }

      const moveSpeed = 0.12;
      if (keys.left) ship.position.x -= moveSpeed;
      if (keys.right) ship.position.x += moveSpeed;
      if (keys.up) ship.position.y += moveSpeed;
      if (keys.down) ship.position.y -= moveSpeed;

      ship.position.x = Math.max(-4, Math.min(4, ship.position.x));
      ship.position.y = Math.max(-2, Math.min(2, ship.position.y));

      ship.rotation.z = (keys.left ? 0.3 : 0) - (keys.right ? 0.3 : 0);
      ship.rotation.x = (keys.down ? 0.2 : 0) - (keys.up ? 0.2 : 0);

      grid.position.z = (grid.position.z + 0.5) % 5;

      spawnTimer++;
      if (spawnTimer > 30) {
        createObstacle();
        spawnTimer = 0;
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.z += obs.userData.speed;
        obs.rotation.x += 0.02;
        obs.rotation.y += 0.01;

        if (obs.position.z > 5) {
          scene.remove(obs);
          obstacles.splice(i, 1);
          scoreVal += 10;
          setScore(scoreVal);
          if (scoreVal >= 10000 && !achievementTriggered.current) {
            achievementTriggered.current = true;
            onAchievementRef.current?.('ACE');
          }
          if (scoreVal >= 1000 && !booksUnlockTriggered.current) {
            booksUnlockTriggered.current = true;
            onUnlockAppRef.current?.('BOOKS');
          }
        }

        const dist = ship.position.distanceTo(obs.position);
        if (dist < 1) {
          isGameOver = true;
          setGameOver(true);
          sounds.starshipDamage();
          sounds.explosion();
          setHighScore(h => {
            const newHigh = Math.max(h, scoreVal);
            HighScoreManager.saveHighScore('starship', newHigh);
            return newHigh;
          });
        }
      }

      for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.position.z -= 1.5;

        if (laser.position.z < -80) {
          scene.remove(laser);
          lasers.splice(i, 1);
          continue;
        }

        for (let j = obstacles.length - 1; j >= 0; j--) {
          const obs = obstacles[j];
          if (laser.position.distanceTo(obs.position) < 0.8) {
            scene.remove(laser);
            scene.remove(obs);
            lasers.splice(i, 1);
            obstacles.splice(j, 1);
            sounds.explosion();
            scoreVal += 50;
            setScore(scoreVal);
            if (scoreVal >= 10000 && !achievementTriggered.current) {
              achievementTriggered.current = true;
              onAchievementRef.current?.('ACE');
            }
            break;
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    gameRef.current = {
      restart: () => {
        obstacles.forEach(o => scene.remove(o));
        lasers.forEach(l => scene.remove(l));
        obstacles.length = 0;
        lasers.length = 0;
        ship.position.set(0, 0, -5);
        scoreVal = 0;
        isGameOver = false;
        isStarted = true;
        setScore(0);
        setGameOver(false);
        setStarted(true);
      },
      start: () => {
        if (!isStarted) {
          isStarted = true;
          setStarted(true);
        }
      },
      shoot: doShoot
    };

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="h-10 px-4 flex justify-between items-center border-b border-gray-100">
        <span className="font-mono text-[10px] font-bold tracking-widest text-black">STARSHIP</span>
        <div className="flex gap-4">
          <span className="font-mono text-[10px] text-gray-400">HI <span className="text-gray-600 font-bold">{highScore.toString().padStart(6, '0')}</span></span>
          <span className="font-mono text-[10px] text-gray-400">SCORE <span className="text-black font-bold">{score.toString().padStart(6, '0')}</span></span>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center relative bg-gray-50 overflow-hidden">
        {!started && !gameOver && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-2xl font-black tracking-widest mb-2">STARSHIP</div>
              <div className="font-mono text-[10px] text-gray-400 mb-4">LOW POLY COMBAT</div>
              <button onClick={handleStart} className="btn-primary btn-xs tracking-widest">
                TAP TO START
              </button>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-2xl font-black tracking-widest">DESTROYED</div>
              <div className="font-mono text-[10px] text-gray-400 mt-2 mb-4">SCORE: {score}</div>
              <div className="border-2 border-black p-3 bg-white">
                <div className="font-mono text-[10px] font-bold tracking-widest mb-2 border-b border-black pb-1">HIGH SCORES</div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between gap-8">
                    <span className="text-black">MATEUS</span>
                    <span className="font-bold">1000</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-black">YOU</span>
                    <span className="font-bold">{highScore}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => gameRef.current?.restart()}
                className="mt-4 px-4 py-2 bg-black text-white font-mono text-[10px] tracking-widest hover:bg-gray-800"
              >
                RETRY
              </button>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      <div className="h-8 px-4 flex justify-between items-center border-t border-gray-100">
        <span className="font-mono text-[10px] text-gray-300 hidden md:inline">WASD/ARROWS MOVE · SPACE SHOOT</span>
        <span className="font-mono text-[10px] text-gray-300 md:hidden">DRAG TO MOVE · TAP TO SHOOT</span>
        <button
          onClick={() => gameRef.current?.restart()}
          className="font-mono text-[10px] text-gray-300 hover:text-black transition-colors"
        >
          RESTART
        </button>
      </div>
    </div>
  );
});

StarshipApp.displayName = 'StarshipApp';

export default StarshipApp;
