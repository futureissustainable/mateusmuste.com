import { useState, useEffect, useRef, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';

interface PomodoroAppProps {
  onAchievement?: (id: string) => void;
}

interface Flower {
  pot: number;
  stem: number;
  flower: number;
  id: number;
  completedAt?: number;
}

export const PomodoroApp = memo(({ onAchievement }: PomodoroAppProps) => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [view, setView] = useState<'timer' | 'room'>('timer');
  const [totalTime, setTotalTime] = useState(0);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [currentFlower, setCurrentFlower] = useState<Flower | null>(null);
  const achievementTriggered = useRef(false);

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const FLOWER_COLORS = ['#FF69B4', '#FF4500', '#9370DB', '#00CED1', '#FFD700'];
  const POT_COLORS = ['#8B4513', '#4a4a4a', '#CD853F', '#1a1a1a', '#708090'];

  useEffect(() => {
    const saved = localStorage.getItem('pomodoro_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTotalTime(data.totalTime || 0);
        setFlowers(data.flowers || []);
        setSessions(data.sessions || 0);
      } catch { /* ignore */ }
    }
    setCurrentFlower({
      pot: Math.floor(Math.random() * 5),
      stem: Math.floor(Math.random() * 5),
      flower: Math.floor(Math.random() * 5),
      id: Date.now()
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoro_data', JSON.stringify({ totalTime, flowers, sessions }));
  }, [totalTime, flowers, sessions]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (mode === 'work') {
        setTotalTime(t => t + 1);
      }
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (mode === 'work') {
            sounds.pomodoroComplete();
            setMode('break');
            setSessions(s => s + 1);
            if (currentFlower) {
              setFlowers(f => {
                const newFlowers = [...f, { ...currentFlower, completedAt: Date.now() }];
                if (newFlowers.length >= 50 && !achievementTriggered.current) {
                  achievementTriggered.current = true;
                  onAchievement?.('MASTER');
                }
                return newFlowers;
              });
              setCurrentFlower({
                pot: Math.floor(Math.random() * 5),
                stem: Math.floor(Math.random() * 5),
                flower: Math.floor(Math.random() * 5),
                id: Date.now()
              });
            }
            return BREAK_TIME;
          } else {
            setMode('work');
            return WORK_TIME;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, currentFlower, onAchievement]);

  const progress = mode === 'work' ? 1 - (timeLeft / WORK_TIME) : 1 - (timeLeft / BREAK_TIME);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const reset = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(WORK_TIME);
  };

  const renderFlower = (f: Flower, size = 48) => (
    <svg width={size} height={size * 1.3} viewBox="0 0 24 32" style={{ imageRendering: 'pixelated' }}>
      <rect x="7" y="26" width="10" height="5" fill={POT_COLORS[f.pot]} />
      <rect x="7" y="24" width="10" height="2" fill="#333" />
      <rect x="11" y="14" width="2" height="10" fill="#228B22" />
      <rect x="9" y="18" width="2" height="2" fill="#228B22" />
      <rect x="13" y="20" width="2" height="2" fill="#228B22" />
      <circle cx="12" cy="11" r="4" fill={FLOWER_COLORS[f.flower]} />
      <circle cx="12" cy="11" r="2" fill="#FFD700" />
    </svg>
  );

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <div className="flex items-center gap-2">
          <PixelartIcon name="Clock" size={16} />
          <span className="app-header-title">POMODORO.EXE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="app-footer-text">SESSIONS: {sessions}</span>
          <button
            onClick={() => setView(view === 'timer' ? 'room' : 'timer')}
            className={`px-2 py-1 font-mono text-[10px] border-2 border-black ${view === 'room' ? 'bg-black text-white' : 'bg-white'}`}
          >
            {view === 'timer' ? 'ROOM' : 'TIMER'}
          </button>
        </div>
      </div>

      {view === 'room' ? (
        <div className="flex-grow overflow-auto bg-gray-100 p-4">
          <div className="text-center mb-4">
            <div className="font-mono text-xs text-gray-500">TOTAL FOCUS TIME</div>
            <div className="font-mono text-2xl font-bold">{formatTotalTime(totalTime)}</div>
          </div>
          {flowers.length === 0 ? (
            <div className="text-center py-12 font-mono text-gray-500 text-sm">
              No flowers yet. Start focusing!
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {flowers.map(f => (
                <div key={f.id} className="flex justify-center">
                  {renderFlower(f, 40)}
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4 font-mono text-[10px] text-gray-400">
            {flowers.length} FLOWER{flowers.length !== 1 ? 'S' : ''} COLLECTED
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className={`px-4 py-1 mb-4 font-mono text-xs font-bold ${mode === 'work' ? 'bg-black text-white' : 'bg-gray-300'}`}>
            {mode === 'work' ? 'FOCUS TIME' : 'BREAK TIME'}
          </div>

          {currentFlower && (
            <div className="mb-6">
              <svg width={120} height={160} viewBox="0 0 24 32" style={{ imageRendering: 'pixelated' }}>
                <rect x="7" y="26" width="10" height="5" fill={POT_COLORS[currentFlower.pot]} />
                <rect x="7" y="24" width="10" height="2" fill="#333" />
                <rect x="11" y={24 - Math.floor(progress * 10)} width="2" height={Math.floor(progress * 10)} fill="#228B22" />
                {progress > 0.3 && <rect x="9" y="18" width="2" height="2" fill="#228B22" />}
                {progress > 0.6 && <rect x="13" y="20" width="2" height="2" fill="#228B22" />}
                {progress >= 1 && (
                  <>
                    <circle cx="12" cy="11" r="4" fill={FLOWER_COLORS[currentFlower.flower]} />
                    <circle cx="12" cy="11" r="2" fill="#FFD700" />
                  </>
                )}
              </svg>
            </div>
          )}

          <div className="font-mono text-5xl font-black mb-6 tracking-wider">
            {formatTime(timeLeft)}
          </div>

          <div className="w-48 h-2 bg-gray-200 border-2 border-black mb-6">
            <div className="h-full bg-black transition-all duration-1000" style={{ width: `${progress * 100}%` }} />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (!isRunning) sounds.pomodoroStart();
                setIsRunning(!isRunning);
              }}
              className="btn-primary"
            >
              {isRunning ? 'PAUSE' : 'START'}
            </button>
            <button onClick={reset} className="btn-secondary">
              RESET
            </button>
          </div>
        </div>
      )}

      <div className="app-footer">
        <span className="app-footer-text">
          {view === 'room' ? `TOTAL: ${formatTotalTime(totalTime)}` : (mode === 'work' ? 'GROW YOUR FOCUS' : 'PLANT IS RESTING')}
        </span>
      </div>
    </div>
  );
});

PomodoroApp.displayName = 'PomodoroApp';

export default PomodoroApp;
