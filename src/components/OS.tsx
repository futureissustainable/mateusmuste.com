'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWindowStore, useSettingsStore, useAchievementStore } from '@/stores';
import { useSounds } from '@/hooks';
import { Window } from '@/components/ui/Window';
import { Taskbar } from '@/components/ui/Taskbar';
import { DesktopIcon } from '@/components/ui/DesktopIcon';
import {
  AboutApp,
  ContactApp,
  TrashApp,
  BooksApp,
  GalleryApp,
  SnakeApp,
  MinesweeperApp,
  LabyrinthApp,
  SynthApp,
  RadioApp,
  MapApp,
  SystemInfoApp,
  PaintApp,
  TerminalApp,
  DiceApp,
  TarotApp,
  PomodoroApp,
  FilesApp,
  AppsApp,
  MessagesApp,
  VoidApp,
  StarshipApp,
  DestructionApp,
  ScannerApp,
  PersonalApp,
} from '@/components/apps';

// Boot screen component
function BootScreen({ visitCount }: { visitCount: number }) {
  const sounds = useSounds();

  useEffect(() => {
    sounds.bootWindup();
  }, [sounds]);

  const getVisitMessage = (count: number) => {
    const messages: Record<number, string> = {
      1: '',
      2: 'WELCOME BACK.',
      3: 'YOU RETURNED.',
      5: 'I REMEMBER YOU.',
      10: 'TEN VISITS. WE KNOW EACH OTHER NOW.',
      20: 'TWENTY. ARE WE FRIENDS NOW?',
      50: 'FIFTY. HALFWAY TO SOMETHING.',
      100: "YOU'VE UNLOCKED SOMETHING.",
    };

    const thresholds = Object.keys(messages)
      .map(Number)
      .sort((a, b) => b - a);
    for (const threshold of thresholds) {
      if (count >= threshold) return messages[threshold];
    }
    return '';
  };

  const visitMessage = getVisitMessage(visitCount);

  return (
    <div className="h-screen w-screen font-mono flex flex-col items-center justify-center bg-white text-black">
      <pre className="ascii-art text-[7px] md:text-[9px] leading-tight select-none whitespace-pre">
        {`
                                                     ___   ___
    //   / / / /     /__  ___/ //   ) )  // | |         / /    /|    / / /__  ___/
   //   / / / /        / /    //___/ /  //__| |        / /    //|   / /    / /
  //   / / / /        / /    / ___ (   / ___  |       / /    // |  / /    / /
 //   / / / /        / /    //   | |  //    | |      / /    //  | / /    / /
((___/ / / /____/ / / /    //    | | //     | |   __/ /___ //   |/ /    / /
`}
      </pre>

      <div className="text-[10px] tracking-[0.3em] mt-2 text-gray-500">N0/SIDE 4Z H353</div>

      {visitMessage && (
        <div className="text-[10px] tracking-wider mt-3 text-gray-400">{visitMessage}</div>
      )}

      <div className="mt-8 text-[10px] text-gray-500 animate-pulse">LOADING...</div>
    </div>
  );
}

// Mode selector component
function ModeSelector({ onSelectMode }: { onSelectMode: (mode: 'about' | 'story') => void }) {
  const isMobile = useSettingsStore((state) => state.isMobile);

  return (
    <div
      className="min-h-screen w-screen bg-white flex flex-col items-center justify-center font-mono select-none"
      style={{ minHeight: '100dvh' }}
    >
      <div className="flex flex-col items-center gap-12">
        {/* Title */}
        <div className="text-center">
          <div className="text-black text-[10px] tracking-[0.5em] uppercase mb-2">
            SELECT EXPERIENCE
          </div>
          <div className="w-32 h-[2px] bg-black mx-auto" />
        </div>

        {/* Mode Buttons */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12">
          {/* ABOUT Button */}
          <button
            onClick={() => onSelectMode('about')}
            className="group relative border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-150 px-12 py-8 min-w-[200px]"
          >
            <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] tracking-widest group-hover:bg-black transition-all duration-150">
              01
            </div>
            <div className="text-2xl font-bold tracking-tight mb-2">ABOUT</div>
            <div className="text-[10px] tracking-widest opacity-60">PORTFOLIO</div>
          </button>

          {/* STORY Button */}
          <button
            onClick={() => !isMobile && onSelectMode('story')}
            disabled={isMobile}
            className={`group relative border-2 px-12 py-8 min-w-[200px] transition-all duration-150 ${
              isMobile
                ? 'border-black/30 bg-white text-black/30 cursor-not-allowed'
                : 'border-black bg-white hover:bg-black hover:text-white'
            }`}
          >
            <div
              className={`absolute -top-3 left-4 bg-white px-2 text-[10px] tracking-widest transition-all duration-150 ${
                isMobile ? 'text-black/30' : 'group-hover:bg-black'
              }`}
            >
              02
            </div>
            <div className="text-2xl font-bold tracking-tight mb-2">STORY</div>
            <div className={`text-[10px] tracking-widest ${isMobile ? 'opacity-100' : 'opacity-60'}`}>
              {isMobile ? 'DESKTOP ONLY' : 'EXPERIENCE'}
            </div>
          </button>
        </div>

        {/* Decorative line */}
        <div className="flex items-center gap-4 text-[10px] tracking-widest text-black/40">
          <div className="w-8 h-[1px] bg-black/20" />
          <span>MATEUS MUSTE</span>
          <div className="w-8 h-[1px] bg-black/20" />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-black" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-black" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-black" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-black" />
    </div>
  );
}

// Get app content by window ID
function getAppContent(id: string, callbacks: AppCallbacks) {
  switch (id) {
    case 'ABOUT':
      return <AboutApp onAchievement={callbacks.onAchievement} />;
    case 'CONTACT':
      return <ContactApp onOpenPaint={callbacks.onOpenPaint} />;
    case 'TRASH':
      return <TrashApp />;
    case 'BOOKS':
      return <BooksApp onUnlockApp={callbacks.onUnlockApp} unlockedApps={callbacks.unlockedApps} />;
    case 'GALLERY':
      return <GalleryApp />;
    case 'SNAKE':
      return <SnakeApp onAchievement={callbacks.onAchievement} />;
    case 'MINESWEEPER':
      return <MinesweeperApp onAchievement={callbacks.onAchievement} />;
    case 'LABYRINTH':
      return <LabyrinthApp onAchievement={callbacks.onAchievement} />;
    case 'SYNTH':
      return <SynthApp onAchievement={callbacks.onAchievement} />;
    case 'RADIO':
      return <RadioApp onAchievement={callbacks.onAchievement} />;
    case 'MAP':
      return <MapApp onAchievement={callbacks.onAchievement} />;
    case 'SYSTEM':
      return <SystemInfoApp onAchievement={callbacks.onAchievement} />;
    case 'PAINT':
      return <PaintApp onAchievement={callbacks.onAchievement} />;
    case 'TERMINAL':
      return <TerminalApp onAchievement={callbacks.onAchievement} onOpenWindow={callbacks.onOpenWindow} onUnlockApp={callbacks.onUnlockApp} />;
    case 'DICE':
      return <DiceApp onAchievement={callbacks.onAchievement} />;
    case 'TAROT':
      return <TarotApp onAchievement={callbacks.onAchievement} />;
    case 'POMODORO':
      return <PomodoroApp onAchievement={callbacks.onAchievement} />;
    case 'FILES':
      return <FilesApp onOpenWindow={callbacks.onOpenWindow} />;
    case 'APPS':
      return <AppsApp onOpenWindow={callbacks.onOpenWindow} />;
    case 'MESSAGES':
      return <MessagesApp onAchievement={callbacks.onAchievement} onComplete={callbacks.onComplete} />;
    case 'VOID':
      return <VoidApp onAchievement={callbacks.onAchievement} />;
    case 'STARSHIP':
      return <StarshipApp onAchievement={callbacks.onAchievement} />;
    case 'DESTRUCTION':
      return <DestructionApp onAchievement={callbacks.onAchievement} />;
    case 'SCANNER':
      return <ScannerApp onAchievement={callbacks.onAchievement} />;
    case 'PERSONAL':
      return <PersonalApp onAchievement={callbacks.onAchievement} />;
    default:
      // Placeholder for apps not yet implemented
      return (
        <div className="h-full flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{id}</div>
            <div className="text-gray-500">Coming soon...</div>
          </div>
        </div>
      );
  }
}

interface AppCallbacks {
  onAchievement?: (id: string) => void;
  onOpenPaint?: () => void;
  onOpenWindow?: (id: string) => void;
  onUnlockApp?: (appId: string) => void;
  onComplete?: () => void;
  unlockedApps?: Set<string>;
}

export function OS() {
  const animationFrameRef = useRef<number>();

  // Settings store
  const {
    modeSelected,
    booted,
    bootPhase,
    isMobile,
    desktopBg,
    introComplete,
    visitCount,
    setMode,
    setBoot,
    setBootPhase,
    setIsMobile,
    setIntroComplete,
  } = useSettingsStore();

  // Window store
  const windows = useWindowStore((state) => state.windows);
  const updatePhysics = useWindowStore((state) => state.updatePhysics);
  const { openWindow, setSelectedIcon, resetIconPositions } = useWindowStore();
  const setContextMenu = useSettingsStore((state) => state.setContextMenu);

  // Achievement store
  const { unlockAchievement, unlockApp, incrementClicks } = useAchievementStore();
  const unlockedApps = useAchievementStore((state) => state.getUnlockedApps(modeSelected, visitCount));
  const totalClicks = useAchievementStore((state) => state.totalClicks);
  const startTime = useAchievementStore((state) => state.startTime);
  const achievements = useAchievementStore((state) => state.achievements);

  const sounds = useSounds();

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile =
      window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Boot sequence after mode selection
  useEffect(() => {
    if (!modeSelected) return;

    setBootPhase(1);

    const bootTimer = setTimeout(() => {
      setBootPhase(2);
      setBoot(true);
    }, 2000);

    return () => clearTimeout(bootTimer);
  }, [modeSelected, setBootPhase, setBoot]);

  // Handle about mode - skip intro and open ABOUT
  useEffect(() => {
    if (booted && modeSelected === 'about' && !introComplete) {
      setIntroComplete(true);
      setTimeout(() => openWindow('ABOUT'), 100);
    }
  }, [booted, modeSelected, introComplete, setIntroComplete, openWindow]);

  // Physics loop
  useEffect(() => {
    if (!booted) return;

    const physicsLoop = () => {
      updatePhysics();
      animationFrameRef.current = requestAnimationFrame(physicsLoop);
    };

    animationFrameRef.current = requestAnimationFrame(physicsLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [booted, updatePhysics]);

  // TIMEKEEPER achievement check (10 minutes in session)
  useEffect(() => {
    if (!booted || achievements.TIMEKEEPER) return;

    const checkTimekeeper = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 10 * 60 * 1000) { // 10 minutes
        unlockAchievement('TIMEKEEPER', sounds.achievementUnlock);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkTimekeeper);
  }, [booted, startTime, achievements.TIMEKEEPER, unlockAchievement, sounds]);

  // CLICKER achievement check (100 clicks)
  useEffect(() => {
    if (totalClicks >= 100 && !achievements.CLICKER) {
      unlockAchievement('CLICKER', sounds.achievementUnlock);
    }
  }, [totalClicks, achievements.CLICKER, unlockAchievement, sounds]);

  // Desktop icons to show
  const desktopIcons = introComplete
    ? modeSelected === 'about'
      ? ['ABOUT', 'FILES', 'CONTACT']
      : ['ABOUT', 'APPS', 'FILES', 'CONTACT', 'TRASH']
    : ['MESSAGES'];

  // Context menu handler
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target === e.currentTarget ||
        (e.target as HTMLElement).classList.contains('desktop-bg-grid')
      ) {
        e.preventDefault();
        sounds.menuOpen();
        setContextMenu({ show: true, x: e.clientX, y: e.clientY });
      }
    },
    [sounds, setContextMenu]
  );

  // Clear selection on desktop click and track clicks
  const handleDesktopClick = useCallback(() => {
    setSelectedIcon(null);
    incrementClicks();
  }, [setSelectedIcon, incrementClicks]);

  // Mode selector screen
  if (!modeSelected) {
    return <ModeSelector onSelectMode={setMode} />;
  }

  // Boot screen
  if (!booted && bootPhase === 1) {
    return <BootScreen visitCount={visitCount} />;
  }

  // Main OS
  return (
    <div
      className={`w-screen relative overflow-hidden desktop-bg-${desktopBg} ${
        isMobile ? 'mobile-safe-height' : 'h-screen'
      }`}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Desktop Icons */}
      {desktopIcons.map((iconId) => {
        const win = windows[iconId];
        if (!win) return null;
        return <DesktopIcon key={iconId} id={iconId} title={win.title} icon={win.icon} />;
      })}

      {/* Windows */}
      {Object.values(windows)
        .filter((w) => w.isOpen)
        .map((win) => (
          <Window key={win.id} id={win.id}>
            {getAppContent(win.id, {
              onAchievement: (achievementId) => {
                unlockAchievement(achievementId, sounds.achievementUnlock);
              },
              onOpenPaint: () => {
                openWindow('PAINT');
              },
              onOpenWindow: (windowId) => {
                openWindow(windowId);
              },
              onUnlockApp: (appId) => {
                unlockApp(appId, sounds.appUnlock);
              },
              onComplete: () => {
                // Handle intro completion
                setIntroComplete(true);
              },
              unlockedApps,
            })}
          </Window>
        ))}

      {/* Achievement Notifications */}
      <AchievementNotifications />

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}

// Achievement notification display component
function AchievementNotifications() {
  const achievementNotifications = useAchievementStore((state) => state.achievementNotifications);
  const appUnlockNotifications = useAchievementStore((state) => state.appUnlockNotifications);

  if (achievementNotifications.length === 0 && appUnlockNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {achievementNotifications.map((notif) => (
        <div
          key={notif.id}
          className="bg-black text-white px-4 py-3 font-mono text-sm border-2 border-white animate-pulse"
        >
          <div className="text-yellow-400 font-bold text-xs tracking-widest mb-1">
            ACHIEVEMENT UNLOCKED
          </div>
          <div className="font-bold">{notif.name}</div>
          {notif.hint && <div className="text-gray-400 text-xs mt-1">{notif.hint}</div>}
        </div>
      ))}
      {appUnlockNotifications.map((notif) => (
        <div
          key={notif.id}
          className="bg-white text-black px-4 py-3 font-mono text-sm border-2 border-black animate-pulse"
        >
          <div className="text-green-600 font-bold text-xs tracking-widest mb-1">
            APP UNLOCKED
          </div>
          <div className="font-bold">{notif.app}.EXE</div>
        </div>
      ))}
    </div>
  );
}
