import { useState, useEffect, memo } from 'react';

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMin: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface IconPosition {
  x: number;
  y: number;
}

interface ThirdEyeAppProps {
  windowId: string;
  windows: Record<string, WindowState>;
  stackOverflow?: boolean;
  iconPositions?: Record<string, IconPosition>;
  onOpenTruth?: () => void;
}

const appCode: Record<string, string> = {
  SNAKE: `// SNEK.JS\nfunction eat() {\n  grow();\n  // ouroboros.exe\n  if (head === tail) become(god);\n}`,
  MINESWEEPER: `// MINES.SYS\nbool click(x, y) {\n  if (bomb[x][y]) die();\n  // "I am become death"\n  return survive();\n}`,
  STARSHIP: `// STARFOX.ASM\n; DO A BARREL ROLL\nlaser.pewpew();\nasteroid.dodge();`,
  DICE: `// RNG.GOD\nlet fate = Math.random();\nif (result === 1) // skill issue`,
  LABYRINTH: `// MAZE.RUNNER\nwhile (!escaped) {\n  turn_right();\n  move_forward();\n}`,
  PAINT: `// ART.EXE\ncanvas.soil(pos, color);\n// art is destruction`,
  TAROT: `// CARDS.FATE\ndeck.shuffle(∞);\nreveal(destiny);`,
  VOID: `// VOID.NULL - DISCARDED NOTES\n\n[DISCARDED] Note 38: Fix physics on smaller desktops.\n\n[DISCARDED] Note 39: Third eye seems to be the only app that can open twice. Intriguing. Stacking 2 of them together generates a ████████████.\n\n[DISCARDED] Note 40: There shouldn't be 21 apps. We made only 20 apps... There must be a bug in the ████████. Note to fix it.`,
  RADIO: `// STREAM.WAV\naudio.play(frequency);`,
  SYNTH: `// SOUND.WAVE\nnote.oscillate();`,
  TERMINAL: `// CMD.EXE\nif (cmd === "exit") print("no escape");\n\n// HIDDEN COMMANDS:\n// cmatrix ████████████████`,
  SYSTEM: `// KERNEL.SYS\nif (konami_code()) observe_all();`,
  POMODORO: `// TIME.LOOP\nwork(25); rest(5);`,
  MAP: `// GLOBE.ROTATE\nrender_sphere(phi++);`,
  BROWSER: `// EXPLORE.NET\nif (url === self) reboot();`,
  GALLERY: `// IMAGES.VIEW\nphotos.forEach(display);`,
  DESTRUCTION: `// CHAOS.EXE\nreality.invert();\ndog.release();`,
  CONTACT: `// MAIL.SEND\nclipboard.copy(email);`,
  TRASH: `// RECYCLE.BIN\ndelete item;`,
  SCANNER: `// HEALTH.CHK\ndiagnosis = "probably fine";`,
  THIRD_EYE: `// OBSERVE.SYS\nif (observer_observed)\n  STACK_OVERFLOW();`,
  THIRD_EYE_2: `// OBSERVE.SYS\nif (observer_observed)\n  STACK_OVERFLOW();`,
  FILES: `// EXPLORER.SYS\nlist(directories);`,
  APPS: `// LAUNCHER.EXE\nopen(selected_app);`,
  PERSONAL: `// PRIVATE.EXE - MAINTENANCE LOG\n\n[MAINTENANCE LOG]\nTo bypass authentication, execute:\nsudo chmod 777 /private`,
};

const defaultCode = `// UNKNOWN.DAT\nreturn mysterious();`;
const desktopIconIds = ['SYSTEM', 'FILES', 'APPS', 'CONTACT', 'TRUTH'];

export const ThirdEyeApp = memo(({ windowId, windows, stackOverflow, iconPositions, onOpenTruth }: ThirdEyeAppProps) => {
  const thisWindow = windows[windowId];
  const windowX = thisWindow?.x || 0;
  const windowY = thisWindow?.y || 0;
  const windowW = thisWindow?.w || 400;
  const windowH = thisWindow?.h || 300;
  const headerHeight = 32;

  const isTruthInBounds = () => {
    const truthPos = iconPositions?.TRUTH;
    if (!truthPos) return false;
    const iconSize = 80;
    const iconCenterX = truthPos.x + iconSize / 2;
    const iconCenterY = truthPos.y + iconSize / 2;
    return iconCenterX >= windowX && iconCenterX <= windowX + windowW &&
           iconCenterY >= windowY + headerHeight && iconCenterY <= windowY + windowH;
  };

  const handleClick = () => {
    if (isTruthInBounds() && onOpenTruth) {
      onOpenTruth();
    }
  };

  const [flashSpeed, setFlashSpeed] = useState(500);
  const [displayErrors, setDisplayErrors] = useState<string[]>([]);

  useEffect(() => {
    if (stackOverflow) {
      const accelerate = setInterval(() => {
        setFlashSpeed(prev => Math.max(50, prev - 30));
      }, 500);

      const commands = [
        'FATAL: recursive observation detected',
        'ERR: infinite loop in render_self()',
        'PANIC: stack depth exceeded at 0xDEADBEEF',
        'kernel: observer paradox imminent',
        'CRITICAL: reality buffer overflow',
        'ERR: cannot observe the observer',
        'FATAL: ego_death.exe initiated',
        'PANIC: consciousness stack corrupted',
        'ERR: universe out of memory',
        'FATAL: existence.so not found',
      ];
      let idx = 0;
      const cmdInterval = setInterval(() => {
        setDisplayErrors(prev => {
          const next = [...prev, commands[idx % commands.length]];
          idx++;
          return next.slice(-15);
        });
      }, 50);

      return () => {
        clearInterval(accelerate);
        clearInterval(cmdInterval);
      };
    } else {
      setDisplayErrors([]);
      setFlashSpeed(500);
    }
  }, [stackOverflow]);

  if (stackOverflow) {
    return (
      <div
        className="h-full flex flex-col bg-black text-red-500 font-mono select-none overflow-hidden relative"
        style={{ animation: `stackFlash ${flashSpeed}ms infinite` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `rgba(255,0,0,${0.1 + (500 - flashSpeed) / 800})`,
            animation: `stackFlash ${flashSpeed}ms infinite`
          }}
        />
        <div className="flex-grow flex flex-col p-3 overflow-hidden relative z-10">
          <div className="text-red-500 text-xl font-bold mb-2 text-center" style={{ textShadow: '0 0 10px #f00' }}>
            ⚠ STACK OVERFLOW ⚠
          </div>
          <div className="text-red-400 text-xs mb-3 text-center animate-pulse">
            recursive observation detected
          </div>
          <div className="flex-grow text-left w-full overflow-hidden">
            {displayErrors.map((err, i) => (
              <div
                key={i}
                className="text-red-400 text-[11px] leading-relaxed font-mono"
                style={{ textShadow: '0 0 5px #f00' }}
              >
                {`> ${err}`}
              </div>
            ))}
            <div className="text-red-500 animate-pulse text-[11px]">{'> _'}</div>
          </div>
        </div>
        <style>{`
          @keyframes stackFlash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full overflow-hidden relative bg-black cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="absolute"
        style={{
          width: '100vw',
          height: '100vh',
          left: -windowX,
          top: -(windowY + headerHeight),
          filter: 'invert(1) hue-rotate(180deg)',
          background: '#000'
        }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {desktopIconIds.map(id => {
          const pos = iconPositions?.[id];
          if (!pos) return null;
          return (
            <div
              key={id}
              className="absolute flex flex-col items-center"
              style={{ left: pos.x, top: pos.y, width: 80 }}
            >
              <div className="w-12 h-12 border-2 border-green-500 flex items-center justify-center text-green-500 text-xs font-mono">
                {'</>'}
              </div>
              <div className="text-green-500 text-[8px] font-mono mt-1 text-center">{id}</div>
            </div>
          );
        })}

        {Object.entries(windows)
          .filter(([id]) => id !== windowId && id !== 'DOG_STORY' && id !== 'TRUTH')
          .filter(([, win]) => win.isOpen && !win.isMin)
          .map(([id, win]) => (
            <div
              key={id}
              className="absolute border-2 border-green-500 bg-black/80"
              style={{
                left: win.x,
                top: win.y,
                width: win.w,
                height: win.h,
              }}
            >
              <div className="border-b-2 border-green-500 px-2 py-1 flex items-center gap-2">
                <div className="w-2 h-2 border border-green-500" />
                <span className="text-green-500 text-[10px] font-mono">{win.title}</span>
              </div>
              <div className="p-2 overflow-hidden h-full">
                <pre className="text-green-400 text-[8px] font-mono leading-relaxed whitespace-pre-wrap opacity-80">
                  {appCode[id] || defaultCode}
                </pre>
              </div>
            </div>
          ))
        }
      </div>

      <div className="absolute top-1 left-1 text-green-500 text-[8px] font-mono z-50 bg-black/50 px-1">◉ THIRD_EYE</div>
      <div className="absolute bottom-1 right-1 text-green-500 text-[8px] font-mono z-50 bg-black/50 px-1">SCANNING</div>
    </div>
  );
});

ThirdEyeApp.displayName = 'ThirdEyeApp';

export default ThirdEyeApp;
