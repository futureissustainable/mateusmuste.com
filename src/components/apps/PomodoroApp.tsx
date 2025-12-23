'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PomodoroAppProps {
  onAchievement?: (id: string) => void;
}

type TimerMode = 'work' | 'short' | 'long';

const TIMER_DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export function PomodoroApp({ onAchievement }: PomodoroAppProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const achievementTriggered = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === 'work') {
        setCompletedPomodoros((p) => {
          const newCount = p + 1;
          if (newCount >= 1 && !achievementTriggered.current) {
            achievementTriggered.current = true;
            onAchievement?.('FOCUSED');
          }
          return newCount;
        });
        // Auto switch to break
        setMode('short');
        setTimeLeft(TIMER_DURATIONS.short);
      } else {
        // Break completed, back to work
        setMode('work');
        setTimeLeft(TIMER_DURATIONS.work);
      }
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, onAchievement]);

  const toggleTimer = () => setIsRunning((r) => !r);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / TIMER_DURATIONS[mode];

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">POMODORO.EXE</span>
        <span className="text-gray-500 text-sm">x{completedPomodoros}</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 p-4">
        {/* Mode selector */}
        <div className="flex gap-2 mb-8">
          {(['work', 'short', 'long'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 font-mono text-xs border-2 transition-colors ${
                mode === m ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'
              }`}
            >
              {m === 'work' ? 'WORK' : m === 'short' ? 'SHORT' : 'LONG'}
            </button>
          ))}
        </div>

        {/* Timer display */}
        <div className="relative w-48 h-48">
          {/* Progress ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#e5e5e5"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke={mode === 'work' ? '#000' : '#22c55e'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-bold">{formatTime(timeLeft)}</span>
            <span className="font-mono text-xs text-gray-500 mt-1">
              {mode === 'work' ? 'FOCUS' : 'BREAK'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 font-mono text-lg font-bold border-2 border-black transition-colors ${
              isRunning ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'
            }`}
          >
            {isRunning ? 'PAUSE' : 'START'}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-3 font-mono text-lg border-2 border-gray-300 hover:border-black"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Completed pomodoros */}
      <div className="h-12 px-4 flex items-center gap-2 border-t-2 border-black">
        <span className="font-mono text-xs text-gray-500">COMPLETED:</span>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(completedPomodoros, 8) }).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-black rounded-full" />
          ))}
          {completedPomodoros > 8 && (
            <span className="font-mono text-xs">+{completedPomodoros - 8}</span>
          )}
        </div>
      </div>
    </div>
  );
}
