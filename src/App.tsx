import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { PixelartIcon, Window } from '@/components/ui';
import {
  FileExplorer,
  AboutApp,
  TrashApp,
  ContactApp,
  MessagesApp,
  TerminalApp,
  PaintApp,
  VoidApp,
  RadioApp,
  SynthApp,
  TarotApp,
  PomodoroApp,
  GalleryApp,
  BooksApp,
  BackupBatApp,
  MapApp,
  HealthScannerApp,
  ThirdEyeApp,
  TruthApp,
  PersonalApp,
  BrowserApp,
  DestructionApp,
  EndApp,
} from '@/components/apps';
import {
  SnakeApp,
  MinesweeperApp,
  StarshipApp,
  DiceApp,
  LabyrinthApp,
} from '@/components/games';
import { sounds } from '@/lib/audio';
import { storage, STORAGE_KEYS, HighScoreManager } from '@/lib/storage';
import { isMobileDevice, getScaledSize } from '@/lib/utils';
import type {
  WindowsState,
  WindowAnimations,
  IconPositions,
  IconDragState,
  UnlockedAchievements,
  AchievementNotification,
  Position,
  DragState,
  OSMode,
  IconName,
} from '@/types';

// App/Game definitions for launcher
const APP_DEFINITIONS = [
  // Creative
  { id: 'PAINT', title: 'PAINT.EXE', icon: 'Palette' as IconName, w: 700, h: 550, category: 'creative' },
  { id: 'VOID', title: 'VOID.EXE', icon: 'Void' as IconName, w: 500, h: 400, category: 'creative' },
  { id: 'SYNTH', title: 'SYNTH.EXE', icon: 'Synth' as IconName, w: 600, h: 450, category: 'creative' },
  { id: 'RADIO', title: 'RADIO.EXE', icon: 'Radio' as IconName, w: 350, h: 300, category: 'creative' },
  // Games
  { id: 'SNAKE', title: 'SNAKE.EXE', icon: 'Snek' as IconName, w: 500, h: 550, category: 'games' },
  { id: 'MINESWEEPER', title: 'MINESWEEPER.EXE', icon: 'Minesweeper' as IconName, w: 450, h: 550, category: 'games' },
  { id: 'LABYRINTH', title: 'LABYRINTH.EXE', icon: 'Labyrinth' as IconName, w: 500, h: 550, category: 'games' },
  { id: 'STARSHIP', title: 'STARSHIP.EXE', icon: 'Starship' as IconName, w: 600, h: 700, category: 'games' },
  { id: 'DICE', title: 'DICE.EXE', icon: 'Dice' as IconName, w: 400, h: 500, category: 'games' },
  // Productivity
  { id: 'POMODORO', title: 'POMODORO.EXE', icon: 'Pomodoro' as IconName, w: 400, h: 500, category: 'productivity' },
  { id: 'MAP', title: 'MAP.EXE', icon: 'Globe' as IconName, w: 700, h: 600, category: 'productivity' },
  { id: 'GALLERY', title: 'GALLERY.EXE', icon: 'Gallery' as IconName, w: 800, h: 600, category: 'productivity' },
  { id: 'BOOKS', title: 'BOOKS.EXE', icon: 'Books' as IconName, w: 600, h: 500, category: 'productivity' },
  // Utility
  { id: 'TAROT', title: 'TAROT.EXE', icon: 'Tarot' as IconName, w: 500, h: 600, category: 'utility' },
  { id: 'SCANNER', title: 'HEALTH_SCAN.EXE', icon: 'HealthScanner' as IconName, w: 400, h: 450, category: 'utility' },
  { id: 'BACKUP', title: 'BACKUP.BAT', icon: 'Terminal' as IconName, w: 500, h: 400, category: 'utility' },
  // Hidden/unlockable
  { id: 'THIRD_EYE', title: 'THIRD_EYE.EXE', icon: 'ThirdEye' as IconName, w: 600, h: 500, category: 'hidden', hidden: true },
  { id: 'TRUTH', title: 'TRUTH.EXE', icon: 'Lock' as IconName, w: 500, h: 400, category: 'hidden', hidden: true },
  { id: 'PERSONAL', title: 'PERSONAL.EXE', icon: 'Lock' as IconName, w: 600, h: 500, category: 'hidden', hidden: true },
  { id: 'BROWSER', title: 'BROWSER.EXE', icon: 'Browser' as IconName, w: 900, h: 700, category: 'hidden', hidden: true },
  { id: 'DESTRUCTION', title: 'DESTRUCTION.EXE', icon: 'Destruction' as IconName, w: 500, h: 400, category: 'hidden', hidden: true },
  { id: 'END', title: 'END.EXE', icon: 'Trophy' as IconName, w: 600, h: 500, category: 'hidden', hidden: true },
];

// Binary Background Component
const BinaryBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01{}[]()<>;:=/\\|_-+*&^%$#@!?.~`';
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(240, 240, 240, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px 'PPNeueBit', sans-serif";

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const alpha = 0.08 + Math.random() * 0.08;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.3 + Math.random() * 0.2;
      }
    };

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const interval = setInterval(draw, 80);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
});

BinaryBackground.displayName = 'BinaryBackground';

// Mode Selector Component
const ModeSelector = memo(({ onSelect }: { onSelect: (mode: OSMode) => void }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 mobile-safe-height">
    <div className="text-center p-8">
      <h1 className="font-heading text-4xl mb-2">MATEUS MUSTE</h1>
      <p className="text-lg mb-8 text-gray-600">// INTERACTIVE OS</p>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => { sounds.windowOpen(); onSelect('story'); }}
          className="btn-primary btn-lg"
        >
          STORY MODE
        </button>
        <button
          onClick={() => { sounds.windowOpen(); onSelect('about'); }}
          className="btn-secondary btn-lg"
        >
          ABOUT MODE
        </button>
      </div>
      <p className="mt-8 text-sm text-gray-500">
        Story: Interactive narrative experience<br />
        About: Clean portfolio view
      </p>
    </div>
  </div>
));

ModeSelector.displayName = 'ModeSelector';

// Boot Screen Component
const BootScreen = memo(({ phase }: { phase: number }) => (
  <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
    <div className="text-center ascii-art">
      {phase === 1 && (
        <pre className="text-xs whitespace-pre text-left">
{`MATEUSMUSTE OS v3.0
==================

[OK] Loading kernel...
[OK] Mounting file systems...
[OK] Starting services...

Booting...`}
        </pre>
      )}
      {phase === 2 && (
        <pre className="text-lg">
          SYSTEM READY
        </pre>
      )}
    </div>
  </div>
));

BootScreen.displayName = 'BootScreen';

// Taskbar Component
const Taskbar = memo(({
  isMobile,
  isMuted,
  onToggleMute,
  windows,
  onWindowClick,
}: {
  isMobile: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  windows: WindowsState;
  onWindowClick: (id: string) => void;
}) => {
  const openWindows = Object.values(windows).filter(w => w.isOpen);

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 h-14 bg-black text-white flex items-center justify-between px-4 z-[1000] mobile-taskbar-top">
        <div className="font-heading text-lg">MATEUS MUSTE</div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <PixelartIcon
              name={isMuted ? 'SpeakerOff' : 'Speaker'}
              size={24}
              style={{ filter: 'invert(1)' }}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-black text-white flex items-center justify-between px-4 z-[1000]">
      <div className="flex items-center gap-4">
        <div className="font-heading text-lg">MATEUS MUSTE</div>
        <div className="flex gap-1">
          {openWindows.slice(0, 5).map(w => (
            <button
              key={w.id}
              onClick={() => onWindowClick(w.id)}
              className={`px-3 py-1 text-sm border border-white ${w.isMin ? 'opacity-50' : ''}`}
            >
              {w.title.slice(0, 12)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="p-2"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          <PixelartIcon
            name={isMuted ? 'SpeakerOff' : 'Speaker'}
            size={24}
            style={{ filter: 'invert(1)' }}
          />
        </button>
        <span className="text-sm">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
});

Taskbar.displayName = 'Taskbar';

// Desktop Icon Component
const DesktopIcon = memo(({
  id,
  title,
  position,
  isSelected,
  isDragging,
  onClick,
  onMouseDown,
  onTouchStart,
}: {
  id: string;
  title: string;
  position: Position;
  isSelected: boolean;
  isDragging: boolean;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}) => {
  const iconName = id === 'TRASH' ? 'TrashCan' : id === 'APPS' ? 'Apps' : 'Folder';

  return (
    <div
      className={`
        absolute w-20 flex flex-col items-center cursor-pointer select-none
        ${isDragging ? 'icon-dragging' : ''}
        ${isSelected ? 'bg-blue-200 bg-opacity-50' : ''}
      `}
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 99999 : 1,
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      draggable={false}
    >
      <div className="w-16 h-16 flex items-center justify-center">
        <PixelartIcon name={iconName} size={48} />
      </div>
      <span className="text-xs text-center mt-1 px-1 truncate w-full">
        {title}
      </span>
    </div>
  );
});

DesktopIcon.displayName = 'DesktopIcon';

// App Launcher Component
const AppLauncher = memo(({
  unlockedApps,
  onOpenApp,
}: {
  unlockedApps: Set<string>;
  onOpenApp: (appId: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'games' | 'creative' | 'productivity' | 'utility'>('all');

  const visibleApps = APP_DEFINITIONS.filter(app => {
    if (app.hidden && !unlockedApps.has(app.id)) return false;
    if (activeTab === 'all') return true;
    return app.category === activeTab;
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab bar */}
      <div className="flex border-b-2 border-black">
        {(['all', 'games', 'creative', 'productivity', 'utility'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold uppercase ${activeTab === tab ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* App grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-4 gap-4">
          {visibleApps.map(app => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="flex flex-col items-center p-3 hover:bg-gray-100 border border-transparent hover:border-black"
            >
              <PixelartIcon name={app.icon} size={48} />
              <span className="mt-2 text-xs text-center truncate w-full">{app.title}</span>
            </button>
          ))}
        </div>

        {visibleApps.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No apps in this category yet.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t-2 border-black text-center text-sm text-gray-500">
        Open TERMINAL.EXE to unlock hidden apps!
      </div>
    </div>
  );
});

AppLauncher.displayName = 'AppLauncher';

// Main OS Component
function App() {
  // Mode selection state
  const [modeSelected, setModeSelected] = useState<OSMode>(null);
  const [booted, setBooted] = useState(false);
  const [bootPhase, setBootPhase] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Core state
  const [introComplete, setIntroComplete] = useState(() =>
    storage.getBoolean(STORAGE_KEYS.INTRO_COMPLETE, false)
  );
  const [isMuted, setIsMuted] = useState(() =>
    storage.getBoolean(STORAGE_KEYS.SOUND_MUTED, false)
  );
  const [, setTopZ] = useState(100);
  const topZRef = useRef(100);

  // Build initial windows state
  const buildInitialWindows = (): WindowsState => {
    const base: WindowsState = {
      MESSAGES: { id: 'MESSAGES', title: 'MESSAGES.EXE', icon: 'Email', x: 200, y: 80, w: 380, h: 500, isOpen: false, isMin: false, z: 8, isDesktop: true },
      ABOUT: { id: 'ABOUT', title: 'ABOUT.EXE', icon: 'Terminal', x: 150, y: 50, w: 820, h: 700, isOpen: false, isMin: false, z: 9, isDesktop: true },
      SYSTEM: { id: 'SYSTEM', title: 'SYSTEM_INFO', icon: 'Terminal', x: 400, y: 50, w: 1000, h: 800, isOpen: false, isMin: false, z: 10, isDesktop: true },
      FILES: { id: 'FILES', title: 'MEDIA_LIB', icon: 'Folder', x: 100, y: 80, w: 800, h: 500, isOpen: false, isMin: false, z: 11, isDesktop: true },
      APPS: { id: 'APPS', title: 'APPS', icon: 'Apps', x: 150, y: 110, w: 700, h: 500, isOpen: false, isMin: false, z: 12, isDesktop: true },
      CONTACT: { id: 'CONTACT', title: 'CONTACT', icon: 'Email', x: 200, y: 140, w: 320, h: 380, isOpen: false, isMin: false, z: 13, isDesktop: true },
      TRASH: { id: 'TRASH', title: 'TRASH.BIN', icon: 'TrashCan', x: 250, y: 170, w: 500, h: 400, isOpen: false, isMin: false, z: 16, isDesktop: true },
      TERMINAL: { id: 'TERMINAL', title: 'TERMINAL.EXE', icon: 'Terminal', x: 300, y: 100, w: 600, h: 450, isOpen: false, isMin: false, z: 17, isDesktop: false },
    };

    // Add all apps from APP_DEFINITIONS
    APP_DEFINITIONS.forEach((app, i) => {
      if (!base[app.id]) {
        base[app.id] = {
          id: app.id,
          title: app.title,
          icon: app.icon,
          x: 100 + (i % 5) * 50,
          y: 80 + Math.floor(i / 5) * 40,
          w: app.w,
          h: app.h,
          isOpen: false,
          isMin: false,
          z: 20 + i,
          isDesktop: false,
        };
      }
    });

    return base;
  };

  // Window state
  const [windows, setWindows] = useState<WindowsState>(buildInitialWindows);

  // Unlocked apps tracking
  const [unlockedApps, setUnlockedApps] = useState<Set<string>>(() => {
    const stored = storage.get(STORAGE_KEYS.UNLOCKED_APPS, []);
    return new Set(stored);
  });

  // Save unlocked apps
  useEffect(() => {
    storage.set(STORAGE_KEYS.UNLOCKED_APPS, Array.from(unlockedApps));
  }, [unlockedApps]);

  const [windowAnimations, setWindowAnimations] = useState<WindowAnimations>({});

  // Icon state
  const [iconPositions] = useState<IconPositions>(() => {
    const stored = storage.get(STORAGE_KEYS.ICON_POSITIONS, null);
    if (stored) return stored;

    const mobile = isMobileDevice();
    const iconSize = 100;
    const padding = 16;
    const topOffset = mobile ? 80 : 16;

    return {
      ABOUT: { x: padding, y: topOffset },
      FILES: { x: padding, y: topOffset + iconSize },
      APPS: { x: padding, y: topOffset + iconSize * 2 },
      CONTACT: { x: padding, y: topOffset + iconSize * 3 },
      TRASH: { x: Math.min(window.innerWidth - 100, padding), y: Math.min(window.innerHeight - 120, topOffset + iconSize * 4) },
    };
  });
  const [iconDrag] = useState<IconDragState>({ id: null, offsetX: 0, offsetY: 0, active: false });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  // Drag state
  const [drag, setDrag] = useState<DragState>({ id: null, offsetX: 0, offsetY: 0 });

  // Achievement state
  const [achievements, setAchievements] = useState<UnlockedAchievements>(() =>
    storage.get(STORAGE_KEYS.ACHIEVEMENTS, {})
  );
  const [achievementNotifications] = useState<AchievementNotification[]>([]);

  // Narrative unlocks
  const [narrativeUnlocks] = useState<string[]>(() =>
    storage.get(STORAGE_KEYS.NARRATIVE_UNLOCKS, [])
  );

  // Desktop icons to show
  const desktopIcons = introComplete
    ? (modeSelected === 'about' ? ['ABOUT', 'FILES', 'CONTACT'] : ['ABOUT', 'APPS', 'FILES', 'CONTACT', 'TRASH'])
    : ['MESSAGES'];

  // Initialize
  useEffect(() => {
    const checkMobile = isMobileDevice();
    setIsMobile(checkMobile);
    HighScoreManager.init();
  }, []);

  // Boot sequence
  useEffect(() => {
    if (!modeSelected) return;

    setBootPhase(1);
    sounds.bootSequence();

    setTimeout(() => {
      setBootPhase(2);
      setBooted(true);
    }, 2000);
  }, [modeSelected]);

  // Save achievements
  useEffect(() => {
    storage.set(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }, [achievements]);

  // Save narrative unlocks
  useEffect(() => {
    storage.set(STORAGE_KEYS.NARRATIVE_UNLOCKS, narrativeUnlocks);
  }, [narrativeUnlocks]);

  // Window operations
  const focus = useCallback((id: string) => {
    topZRef.current += 1;
    const newZ = topZRef.current;
    setWindows(p => ({ ...p, [id]: { ...p[id], z: newZ } }));
    setTopZ(newZ);
  }, []);

  const open = useCallback((id: string) => {
    sounds.windowOpen();
    topZRef.current += 1;
    const newZ = topZRef.current;
    setWindows(p => ({ ...p, [id]: { ...p[id], isOpen: true, isMin: false, z: newZ } }));
    setWindowAnimations(p => ({ ...p, [id]: 'opening' }));
    setTimeout(() => setWindowAnimations(p => { const n = {...p}; delete n[id]; return n; }), 200);
    setTopZ(newZ);
  }, []);

  const close = useCallback((id: string) => {
    sounds.windowClose();
    setWindowAnimations(p => ({ ...p, [id]: 'closing' }));
    setTimeout(() => {
      setWindows(p => ({ ...p, [id]: { ...p[id], isOpen: false } }));
      setWindowAnimations(p => { const n = {...p}; delete n[id]; return n; });
    }, 150);
  }, []);

  const toggleMin = useCallback((id: string) => {
    const wasMin = windows[id]?.isMin;
    if (wasMin) {
      sounds.windowRestore();
    } else {
      sounds.windowMinimize();
    }
    setWindows(p => ({ ...p, [id]: { ...p[id], isMin: !p[id].isMin } }));
  }, [windows]);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    storage.setBoolean(STORAGE_KEYS.SOUND_MUTED, newMuted);
  }, [isMuted]);

  // Handle taskbar window click
  const handleTaskbarWindowClick = useCallback((id: string) => {
    const win = windows[id];
    if (win.isMin) {
      toggleMin(id);
    }
    focus(id);
  }, [windows, toggleMin, focus]);

  // Window drag handlers
  const handleWindowDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    focus(id);
    const win = windows[id];
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDrag({
      id,
      offsetX: clientX - win.x,
      offsetY: clientY - win.y,
    });
  }, [windows, focus]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (drag.id) {
      const scaled = getScaledSize(windows[drag.id].w, windows[drag.id].h);
      const maxX = Math.max(0, window.innerWidth - scaled.w);
      const maxY = Math.max(0, window.innerHeight - 60 - scaled.h);
      const minY = isMobile ? 60 : 0;

      const newX = Math.max(0, Math.min(maxX, e.clientX - drag.offsetX));
      const newY = Math.max(minY, Math.min(maxY, e.clientY - drag.offsetY));

      setWindows(prev => ({
        ...prev,
        [drag.id!]: { ...prev[drag.id!], x: newX, y: newY }
      }));
    }
  }, [drag, windows, isMobile]);

  const handleMouseUp = useCallback(() => {
    setDrag({ id: null, offsetX: 0, offsetY: 0 });
  }, []);

  // Icon handlers
  const handleIconClick = useCallback((id: string) => {
    open(id);
    setSelectedIcon(null);
  }, [open]);

  const handleIconMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    sounds.iconSelect();
    setSelectedIcon(id);
  }, []);

  const handleIconTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    if (isMobile) return; // Disable icon dragging on mobile
    e.preventDefault();
    e.stopPropagation();
    setSelectedIcon(id);
  }, [isMobile]);

  // Global mouse handlers
  useEffect(() => {
    if (drag.id) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [drag.id, handleMouseMove, handleMouseUp]);

  // Achievement handler
  const handleAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => {
      if (prev[achievementId]) return prev;
      sounds.achievementUnlock();
      return { ...prev, [achievementId]: { unlockedAt: Date.now() } };
    });
  }, []);

  // App unlock handler
  const handleUnlockApp = useCallback((appId: string) => {
    setUnlockedApps(prev => {
      if (prev.has(appId)) return prev;
      sounds.appUnlock();
      const newSet = new Set(prev);
      newSet.add(appId);
      return newSet;
    });
  }, []);

  // Open app from launcher
  const handleOpenApp = useCallback((appId: string) => {
    close('APPS');
    setTimeout(() => open(appId), 200);
  }, [close, open]);

  // Render window content
  const getWindowContent = (id: string) => {
    switch (id) {
      case 'ABOUT':
        return <AboutApp onAchievement={handleAchievement} />;
      case 'CONTACT':
        return (
          <ContactApp
            onOpenPaint={() => {
              close('CONTACT');
              open('PAINT');
            }}
          />
        );
      case 'TRASH':
        return <TrashApp />;
      case 'FILES':
        return <FileExplorer onAchievement={handleAchievement} />;
      case 'APPS':
        return (
          <AppLauncher
            unlockedApps={unlockedApps}
            onOpenApp={handleOpenApp}
          />
        );
      case 'MESSAGES':
        return (
          <MessagesApp
            onIntroComplete={() => {
              setIntroComplete(true);
              storage.setBoolean(STORAGE_KEYS.INTRO_COMPLETE, true);
              close('MESSAGES');
              setTimeout(() => open('ABOUT'), 500);
            }}
          />
        );
      case 'TERMINAL':
        return (
          <TerminalApp
            onAchievement={handleAchievement}
            onUnlockApp={handleUnlockApp}
            unlockedApps={unlockedApps}
          />
        );
      // Creative Apps
      case 'PAINT':
        return <PaintApp onAchievement={handleAchievement} />;
      case 'VOID':
        return <VoidApp onAchievement={handleAchievement} />;
      case 'SYNTH':
        return <SynthApp />;
      case 'RADIO':
        return <RadioApp />;
      // Games
      case 'SNAKE':
        return <SnakeApp onAchievement={handleAchievement} />;
      case 'MINESWEEPER':
        return <MinesweeperApp onAchievement={handleAchievement} />;
      case 'LABYRINTH':
        return <LabyrinthApp onAchievement={handleAchievement} />;
      case 'STARSHIP':
        return <StarshipApp onAchievement={handleAchievement} />;
      case 'DICE':
        return <DiceApp onAchievement={handleAchievement} />;
      // Productivity
      case 'POMODORO':
        return <PomodoroApp />;
      case 'MAP':
        return <MapApp onAchievement={handleAchievement} />;
      case 'GALLERY':
        return <GalleryApp />;
      case 'BOOKS':
        return <BooksApp />;
      // Utility
      case 'TAROT':
        return <TarotApp onAchievement={handleAchievement} />;
      case 'SCANNER':
        return <HealthScannerApp />;
      case 'BACKUP':
        return <BackupBatApp />;
      // Hidden/Unlockable
      case 'THIRD_EYE':
        return <ThirdEyeApp windowId="THIRD_EYE" windows={windows} />;
      case 'TRUTH':
        return <TruthApp onAchievement={handleAchievement} />;
      case 'PERSONAL':
        return <PersonalApp />;
      case 'BROWSER':
        return <BrowserApp />;
      case 'DESTRUCTION':
        return <DestructionApp onAchievement={handleAchievement} />;
      case 'END':
        return <EndApp achievements={achievements} />;
      default:
        return (
          <div className="p-6 text-center">
            <p className="text-gray-600">Content coming soon...</p>
          </div>
        );
    }
  };

  // Mode selector
  if (!modeSelected) {
    return <ModeSelector onSelect={setModeSelected} />;
  }

  // Boot screen
  if (!booted) {
    return <BootScreen phase={bootPhase} />;
  }

  // Main desktop
  return (
    <div className="fixed inset-0 desktop-bg-grid mobile-safe-height">
      {/* Binary background for ASCII mode */}
      <BinaryBackground />

      {/* Desktop Icons */}
      {desktopIcons.map(id => {
        const pos = iconPositions[id] || { x: 16, y: 16 };
        const titles: Record<string, string> = {
          ABOUT: 'ABOUT.EXE',
          FILES: 'MEDIA_LIB',
          APPS: 'APPS',
          CONTACT: 'CONTACT',
          TRASH: 'TRASH.BIN',
          MESSAGES: 'MESSAGES.EXE',
        };
        return (
          <DesktopIcon
            key={id}
            id={id}
            title={titles[id] || id}
            position={pos}
            isSelected={selectedIcon === id}
            isDragging={iconDrag.active && iconDrag.id === id}
            onClick={() => handleIconClick(id)}
            onMouseDown={(e) => handleIconMouseDown(e, id)}
            onTouchStart={(e) => handleIconTouchStart(e, id)}
          />
        );
      })}

      {/* Windows */}
      {Object.values(windows)
        .filter(w => w.isOpen && !w.isMin)
        .map(win => (
          <Window
            key={win.id}
            id={win.id}
            title={win.title}
            icon={win.icon}
            x={win.x}
            y={win.y}
            w={win.w}
            h={win.h}
            z={win.z}
            isMin={win.isMin}
            animation={windowAnimations[win.id]}
            isMobile={isMobile}
            onClose={close}
            onMinimize={toggleMin}
            onFocus={focus}
            onDragStart={handleWindowDragStart}
          >
            {getWindowContent(win.id)}
          </Window>
        ))}

      {/* Taskbar */}
      <Taskbar
        isMobile={isMobile}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        windows={windows}
        onWindowClick={handleTaskbarWindowClick}
      />

      {/* Achievement Notifications */}
      {achievementNotifications.map((notif, i) => (
        <div
          key={notif.id}
          className="fixed top-4 right-4 bg-black text-white p-4 border-2 border-white animate-fade-in"
          style={{ zIndex: 10000, top: 16 + i * 80 }}
        >
          <div className="flex items-center gap-2">
            <PixelartIcon name={notif.icon} size={24} style={{ filter: 'invert(1)' }} />
            <div>
              <div className="font-bold">{notif.name}</div>
              <div className="text-sm text-gray-400">Achievement Unlocked!</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
