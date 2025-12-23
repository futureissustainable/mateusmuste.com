import { useState, useEffect, useRef, memo } from 'react';
import createGlobe from 'cobe';
import { sounds } from '@/lib/audio';

interface MapAppProps {
  onAchievement?: (id: string) => void;
}

interface GameState {
  clicks: number;
  totalClicks: number;
  clickPower: number;
  satellites: number;
  clickMultiplier: number;
  upgrades: Record<string, boolean>;
  dogModeMultiplier: number;
}

interface ShopItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  effect?: () => Partial<GameState>;
  requires?: string;
}

interface ShopCategory {
  category: string;
  items: ShopItem[];
}

const getStorageKey = (key: string) => `ultra_int_${key}`;

export const MapApp = memo(({ onAchievement }: MapAppProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0);
  const scaleRef = useRef(0.85);
  const isHoveringRef = useRef(false);
  const rotationSpeedRef = useRef(0.003);

  const [gameStarted, setGameStarted] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [clickEffect, setClickEffect] = useState<{ value: number; id: number } | null>(null);
  const [, setGlobeReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState(400);
  const tycoonAchieved = useRef(false);

  const defaultGameState: GameState = {
    clicks: 0,
    totalClicks: 0,
    clickPower: 1,
    satellites: 0,
    clickMultiplier: 1,
    upgrades: {
      power1: false, power2: false, power3: false,
      power4: false, power5: false, power6: false,
      sat1: false, sat2: false, sat3: false,
      sat4: false, sat5: false, sat6: false,
      multi1: false, multi2: false, multi3: false,
      godMode: false, dogMode: false
    },
    dogModeMultiplier: 1
  };

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(getStorageKey('mapclicker'));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultGameState, ...parsed, upgrades: { ...defaultGameState.upgrades, ...parsed.upgrades } };
      } catch {
        return defaultGameState;
      }
    }
    return defaultGameState;
  });

  useEffect(() => {
    localStorage.setItem(getStorageKey('mapclicker'), JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    if (gameState.satellites > 0) {
      const interval = setInterval(() => {
        const autoAmount = gameState.satellites * gameState.clickMultiplier * gameState.dogModeMultiplier;
        setGameState(prev => ({
          ...prev,
          clicks: prev.clicks + autoAmount,
          totalClicks: prev.totalClicks + autoAmount
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.satellites, gameState.clickMultiplier, gameState.dogModeMultiplier]);

  const getSatelliteCount = () => {
    let count = 0;
    if (gameState.upgrades.sat1) count++;
    if (gameState.upgrades.sat2) count++;
    if (gameState.upgrades.sat3) count++;
    if (gameState.upgrades.sat4) count++;
    if (gameState.upgrades.sat5) count++;
    if (gameState.upgrades.sat6) count++;
    return count;
  };

  const getRingCount = () => {
    let count = 0;
    if (gameState.upgrades.multi1) count++;
    if (gameState.upgrades.multi2) count++;
    if (gameState.upgrades.multi3) count++;
    return count;
  };

  const shopItems: ShopCategory[] = [
    {
      category: 'CLICK POWER', items: [
        { id: 'power1', name: 'TREMOR I', desc: '+1 power', cost: 50, effect: () => ({ clickPower: gameState.clickPower + 1 }) },
        { id: 'power2', name: 'TREMOR II', desc: '+2 power', cost: 200, effect: () => ({ clickPower: gameState.clickPower + 2 }), requires: 'power1' },
        { id: 'power3', name: 'QUAKE I', desc: '+5 power', cost: 1000, effect: () => ({ clickPower: gameState.clickPower + 5 }), requires: 'power2' },
        { id: 'power4', name: 'QUAKE II', desc: '+10 power', cost: 5000, effect: () => ({ clickPower: gameState.clickPower + 10 }), requires: 'power3' },
        { id: 'power5', name: 'CATACLYSM I', desc: '+25 power', cost: 25000, effect: () => ({ clickPower: gameState.clickPower + 25 }), requires: 'power4' },
        { id: 'power6', name: 'CATACLYSM II', desc: '+50 power', cost: 100000, effect: () => ({ clickPower: gameState.clickPower + 50 }), requires: 'power5' },
      ]
    },
    {
      category: 'SATELLITES', items: [
        { id: 'sat1', name: 'SPUTNIK', desc: '1/sec', cost: 100, effect: () => ({ satellites: gameState.satellites + 1 }) },
        { id: 'sat2', name: 'EXPLORER', desc: '+2/sec', cost: 500, effect: () => ({ satellites: gameState.satellites + 2 }), requires: 'sat1' },
        { id: 'sat3', name: 'VOYAGER', desc: '+5/sec', cost: 2500, effect: () => ({ satellites: gameState.satellites + 5 }), requires: 'sat2' },
        { id: 'sat4', name: 'HUBBLE', desc: '+10/sec', cost: 10000, effect: () => ({ satellites: gameState.satellites + 10 }), requires: 'sat3' },
        { id: 'sat5', name: 'JAMES WEBB', desc: '+25/sec', cost: 50000, effect: () => ({ satellites: gameState.satellites + 25 }), requires: 'sat4' },
        { id: 'sat6', name: 'DYSON SWARM', desc: '+50/sec', cost: 200000, effect: () => ({ satellites: gameState.satellites + 50 }), requires: 'sat5' },
      ]
    },
    {
      category: 'MULTIPLIERS', items: [
        { id: 'multi1', name: 'INNER RING', desc: '2x clicks', cost: 2000, effect: () => ({ clickMultiplier: gameState.clickMultiplier * 2 }) },
        { id: 'multi2', name: 'MIDDLE RING', desc: '2x (4x)', cost: 15000, effect: () => ({ clickMultiplier: gameState.clickMultiplier * 2 }), requires: 'multi1' },
        { id: 'multi3', name: 'OUTER RING', desc: '2x (8x)', cost: 75000, effect: () => ({ clickMultiplier: gameState.clickMultiplier * 2 }), requires: 'multi2' },
      ]
    },
    {
      category: 'ASCENSION', items: [
        { id: 'godMode', name: 'GOD MODE', desc: '1M/click', cost: 1000000 },
        { id: 'dogMode', name: 'DOG MODE', desc: 'RESET: 1M×', cost: 100000000, requires: 'godMode' },
      ]
    },
  ];

  const getActualCost = (baseCost: number) => baseCost * gameState.dogModeMultiplier;

  const buyUpgrade = (item: ShopItem) => {
    const actualCost = getActualCost(item.cost);
    if (gameState.clicks >= actualCost && !gameState.upgrades[item.id]) {
      if (item.requires && !gameState.upgrades[item.requires]) return;
      sounds.upgradePurchase();
      if (item.id === 'dogMode') {
        setGameState({
          ...defaultGameState,
          dogModeMultiplier: gameState.dogModeMultiplier * 1000000,
          upgrades: { ...defaultGameState.upgrades, dogMode: true }
        });
        onAchievement?.('ASCENDED');
        return;
      }
      const effectResult = item.effect ? item.effect() : {};
      setGameState(prev => ({
        ...prev,
        clicks: prev.clicks - actualCost,
        ...effectResult,
        upgrades: { ...prev.upgrades, [item.id]: true }
      }));
    }
  };

  const canBuy = (item: ShopItem) => {
    if (gameState.upgrades[item.id]) return false;
    if (gameState.clicks < getActualCost(item.cost)) return false;
    if (item.requires && !gameState.upgrades[item.requires]) return false;
    return true;
  };

  const isLocked = (item: ShopItem) => item.requires && !gameState.upgrades[item.requires];

  const handleGlobeClick = () => {
    if (!gameStarted) return;
    const clickValue = gameState.clickPower * gameState.clickMultiplier * gameState.dogModeMultiplier;
    setGameState(prev => {
      const newTotal = prev.totalClicks + clickValue;
      if (newTotal >= 1e9 && !tycoonAchieved.current) {
        tycoonAchieved.current = true;
        onAchievement?.('TYCOON');
      }
      return {
        ...prev,
        clicks: prev.clicks + clickValue,
        totalClicks: newTotal
      };
    });
    setClickEffect({ value: clickValue, id: Date.now() });
    setTimeout(() => setClickEffect(null), 500);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let retryCount = 0;
    let initTimeout: ReturnType<typeof setTimeout> | null = null;
    const maxRetries = 40;

    const initGlobe = () => {
      if (!containerRef.current || !canvasRef.current) {
        if (retryCount < maxRetries) {
          retryCount++;
          initTimeout = setTimeout(initGlobe, 50);
        }
        return;
      }

      const container = containerRef.current;
      const size = Math.min(container.clientWidth, container.clientHeight);
      setCanvasSize(size);

      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: size * 2,
        height: size * 2,
        phi: 0,
        theta: 0,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 8,
        baseColor: [0.4, 0.4, 0.4],
        markerColor: [1, 0.5, 0.5],
        glowColor: [0.3, 0.3, 0.3],
        scale: 1,
        offset: [0, 0],
        markers: [
          { location: [44.4268, 26.1025], size: 0.05 },
        ],
        onRender: (state) => {
          const targetSpeed = isHoveringRef.current ? 0.0005 : 0.003;
          rotationSpeedRef.current += (targetSpeed - rotationSpeedRef.current) * 0.05;

          if (!pointerInteracting.current) {
            phiRef.current += rotationSpeedRef.current;
          }
          state.phi = phiRef.current;
          state.theta = thetaRef.current;
          state.scale = scaleRef.current;
        }
      });

      globeRef.current = globe;
      setGlobeReady(true);
    };

    initGlobe();

    return () => {
      if (initTimeout) clearTimeout(initTimeout);
      if (globe) globe.destroy();
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerInteracting.current) {
      const dx = e.clientX - pointerInteracting.current.x;
      const dy = e.clientY - pointerInteracting.current.y;
      phiRef.current += dx * 0.005;
      thetaRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, thetaRef.current + dy * 0.005));
      pointerInteracting.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    scaleRef.current = Math.max(0.5, Math.min(2, scaleRef.current - e.deltaY * 0.001));
  };

  const lastTouchDistance = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const delta = distance - lastTouchDistance.current;
      scaleRef.current = Math.max(0.5, Math.min(2, scaleRef.current + delta * 0.005));
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  const handleMouseEnter = () => { isHoveringRef.current = true; };
  const handleMouseLeave = () => { isHoveringRef.current = false; };

  const satelliteCount = getSatelliteCount();
  const ringCount = getRingCount();

  return (
    <div className="h-full flex flex-col bg-black select-none overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/20">
        <span className="font-mono text-xs font-bold text-white">{gameStarted ? 'PLANET CLICKER' : 'MAP.EXE'}</span>
        {gameStarted ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-white font-bold">{formatNumber(gameState.clicks)}</span>
            <button onClick={() => setShowShop(!showShop)} className="px-2 py-0.5 bg-white text-black font-mono text-[10px] font-bold border-2 border-white hover:invert">
              SHOP
            </button>
          </div>
        ) : (
          <button
            onClick={() => setGameStarted(true)}
            className="px-2 py-0.5 bg-white text-black font-mono text-[10px] font-bold border-2 border-white hover:invert"
          >
            START MINING
          </button>
        )}
      </div>

      <div ref={containerRef} className="flex-grow relative overflow-hidden flex items-center justify-center" style={{ minHeight: 0 }}>
        {ringCount >= 1 && (
          <div
            className="absolute rounded-full border-2 border-white/30 pointer-events-none"
            style={{
              width: '60%', height: '60%', maxWidth: 400, maxHeight: 400,
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              animation: 'spin 20s linear infinite'
            }}
          />
        )}
        {ringCount >= 2 && (
          <div
            className="absolute rounded-full border-2 border-white/20 pointer-events-none"
            style={{
              width: '70%', height: '70%', maxWidth: 480, maxHeight: 480,
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              animation: 'spin 30s linear infinite reverse'
            }}
          />
        )}
        {ringCount >= 3 && (
          <div
            className="absolute rounded-full border-2 border-white/15 pointer-events-none"
            style={{
              width: '80%', height: '80%', maxWidth: 560, maxHeight: 560,
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              animation: 'spin 40s linear infinite'
            }}
          />
        )}

        {Array.from({ length: satelliteCount }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${55 + i * 5}%`,
              height: `${55 + i * 5}%`,
              maxWidth: 360 + i * 40,
              maxHeight: 360 + i * 40,
              left: '50%', top: '50%',
              animation: `spin ${8 + i * 3}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
              transform: `translate(-50%, -50%) rotate(${i * 60}deg)`
            }}
          >
            <div
              className="absolute bg-white"
              style={{
                width: 6,
                height: 6,
                top: 0,
                left: '50%',
                marginLeft: -3,
                boxShadow: '0 0 4px #fff'
              }}
            />
          </div>
        ))}

        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Interactive 3D globe"
          style={{
            width: canvasSize,
            height: canvasSize,
            cursor: 'grab',
            touchAction: 'none'
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerOut={handlePointerUp}
          onPointerMove={handlePointerMove}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleGlobeClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {clickEffect && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-mono text-xl font-bold text-white animate-ping">+{formatNumber(clickEffect.value)}</span>
          </div>
        )}

        {showShop && (
          <div className="absolute inset-0 bg-black/90 overflow-y-auto p-3">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-sm font-bold text-white">UPGRADES</span>
              <button onClick={() => setShowShop(false)} className="font-mono text-white hover:text-red-400">✕</button>
            </div>
            {shopItems.map(cat => (
              <div key={cat.category} className="mb-3">
                <div className="font-mono text-[10px] text-gray-500 mb-1">{cat.category}</div>
                <div className="space-y-1">
                  {cat.items.map(item => {
                    const owned = gameState.upgrades[item.id];
                    const locked = isLocked(item);
                    const affordable = canBuy(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => buyUpgrade(item)}
                        disabled={owned || locked || !affordable}
                        className={`w-full text-left p-2 font-mono text-[10px] border ${
                          owned ? 'border-green-500/50 bg-green-500/10 text-green-400' :
                          locked ? 'border-gray-700 text-gray-600 cursor-not-allowed' :
                          affordable ? 'border-white/30 text-white hover:bg-white/10 cursor-pointer' :
                          'border-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{owned ? '✓' : formatNumber(getActualCost(item.cost))}</span>
                        </div>
                        <div className="text-gray-500">{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-white/20 text-center">
        <span className="font-mono text-[10px] text-gray-500">
          {gameStarted ? `POWER: ${gameState.clickPower} | AUTO: ${gameState.satellites}/s | MULTI: ${gameState.clickMultiplier}x` : 'BUCHAREST, ROMANIA'}
        </span>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

MapApp.displayName = 'MapApp';

export default MapApp;
