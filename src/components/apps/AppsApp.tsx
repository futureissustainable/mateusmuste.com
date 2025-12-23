'use client';

interface AppsAppProps {
  onOpenWindow?: (id: string) => void;
}

interface AppItem {
  id: string;
  name: string;
  icon: string;
}

const APPS: AppItem[] = [
  { id: 'PAINT', name: 'PAINT.EXE', icon: 'P' },
  { id: 'SNAKE', name: 'SNEK.EXE', icon: 'S' },
  { id: 'MINESWEEPER', name: 'MINESWEEPER.EXE', icon: 'M' },
  { id: 'LABYRINTH', name: 'LABYRINTH.EXE', icon: 'L' },
  { id: 'SYNTH', name: 'SYNTH_001.WAV', icon: '~' },
  { id: 'RADIO', name: 'RADIO.WAV', icon: 'R' },
  { id: 'MAP', name: 'MAP.EXE', icon: 'G' },
  { id: 'DICE', name: 'DICE.EXE', icon: 'D' },
  { id: 'TAROT', name: 'TAROT.DAT', icon: '*' },
  { id: 'POMODORO', name: 'POMODORO.EXE', icon: 'T' },
  { id: 'GALLERY', name: 'GALLERY.EXE', icon: 'I' },
  { id: 'BOOKS', name: 'BOOKS.EXE', icon: 'B' },
  { id: 'TERMINAL', name: 'TERMINAL.EXE', icon: '>' },
  { id: 'SYSTEM', name: 'SYSTEM_INFO', icon: '#' },
];

export function AppsApp({ onOpenWindow }: AppsAppProps) {
  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">APPS</span>
        <span className="text-gray-500 text-sm">{APPS.length} INSTALLED</span>
      </div>

      <div className="flex-grow overflow-auto p-4">
        <div className="grid grid-cols-4 gap-3">
          {APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => onOpenWindow?.(app.id)}
              className="group flex flex-col items-center gap-2 p-3 border-2 border-transparent hover:border-black transition-colors"
            >
              <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center font-mono text-xl font-bold group-hover:bg-black group-hover:text-white transition-colors">
                {app.icon}
              </div>
              <span className="font-mono text-[8px] text-center break-all">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-8 px-4 flex items-center border-t-2 border-black">
        <span className="font-mono text-[10px] text-gray-500">CLICK TO LAUNCH</span>
      </div>
    </div>
  );
}
