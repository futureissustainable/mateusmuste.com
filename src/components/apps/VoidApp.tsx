'use client';

import { useState, useEffect, useRef } from 'react';

interface VoidAppProps {
  onAchievement?: (id: string) => void;
}

export function VoidApp({ onAchievement }: VoidAppProps) {
  const [revealed, setRevealed] = useState(false);
  const [stareTime, setStareTime] = useState(0);
  const achievementTriggered = useRef(false);

  // Track how long user stares at the void
  useEffect(() => {
    const timer = setInterval(() => {
      setStareTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Reveal message after 10 seconds
  useEffect(() => {
    if (stareTime >= 10 && !revealed) {
      setRevealed(true);
      if (!achievementTriggered.current) {
        achievementTriggered.current = true;
        onAchievement?.('VOID_GAZER');
      }
    }
  }, [stareTime, revealed, onAchievement]);

  return (
    <div className="h-full flex flex-col bg-black select-none">
      <div className="h-8 px-4 flex items-center border-b border-gray-900">
        <span className="font-mono text-[10px] text-gray-700">VOID.TXT</span>
      </div>

      <div className="flex-grow flex items-center justify-center relative overflow-hidden">
        {/* The void */}
        <div
          className="w-48 h-48 rounded-full bg-black border border-gray-900 relative"
          style={{
            boxShadow: 'inset 0 0 50px 20px rgba(255,255,255,0.02)',
          }}
        >
          {/* Subtle animation */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%)',
            }}
          />
        </div>

        {/* Revealed text */}
        {revealed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <pre className="font-mono text-[10px] text-gray-600 leading-relaxed">
{`IF YOU STARE LONG ENOUGH
INTO THE VOID,

THE VOID STARES BACK.

BUT WHAT DID YOU EXPECT?
IT'S JUST A BLACK CIRCLE.

SOME THINGS HAVE NO MEANING.
SOME THINGS JUST ARE.

THAT'S OKAY.

NOT EVERYTHING NEEDS
TO BE A SECRET.

SOMETIMES THE ABSENCE
IS THE POINT.`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Timer hint */}
      <div className="h-8 px-4 flex items-center border-t border-gray-900">
        <span className="font-mono text-[10px] text-gray-800">
          {revealed ? 'THE VOID ACKNOWLEDGES YOU' : `STARING INTO THE VOID... ${stareTime}s`}
        </span>
      </div>
    </div>
  );
}
