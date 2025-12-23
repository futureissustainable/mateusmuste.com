'use client';

import { useState, useEffect, useRef } from 'react';

interface ThirdEyeAppProps {
  onAchievement?: (id: string) => void;
  instanceId?: string;
  onOpenSecondEye?: () => void;
}

export function ThirdEyeApp({ onAchievement, instanceId = '1', onOpenSecondEye }: ThirdEyeAppProps) {
  const [gazeTime, setGazeTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setGazeTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gazeTime >= 5 && !eyeOpen) {
      setEyeOpen(true);
    }
    if (gazeTime >= 15 && !revealed) {
      setRevealed(true);
    }
  }, [gazeTime, eyeOpen, revealed]);

  return (
    <div className="h-full flex flex-col bg-purple-950 select-none overflow-hidden">
      <div className="h-8 px-4 flex items-center border-b border-purple-800">
        <span className="font-mono text-[10px] text-purple-400">
          THIRD_EYE.EXE {instanceId === '2' ? '(MIRROR)' : ''}
        </span>
      </div>

      <div className="flex-grow flex items-center justify-center relative">
        {/* The Eye */}
        <div className="relative">
          {/* Outer eye shape */}
          <div
            className={`w-48 h-24 rounded-full border-4 border-purple-400 flex items-center justify-center transition-all duration-1000 ${
              eyeOpen ? 'bg-purple-900' : 'bg-purple-950'
            }`}
            style={{
              boxShadow: eyeOpen
                ? '0 0 60px 20px rgba(168, 85, 247, 0.4)'
                : '0 0 20px 5px rgba(168, 85, 247, 0.2)',
            }}
          >
            {/* Iris */}
            <div
              className={`rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center transition-all duration-1000 ${
                eyeOpen ? 'w-20 h-20' : 'w-2 h-2'
              }`}
            >
              {/* Pupil */}
              <div
                className={`rounded-full bg-black transition-all duration-500 ${
                  eyeOpen ? 'w-8 h-8' : 'w-1 h-1'
                }`}
              >
                {/* Light reflection */}
                {eyeOpen && (
                  <div className="w-2 h-2 bg-white rounded-full ml-1 mt-1 opacity-80" />
                )}
              </div>
            </div>
          </div>

          {/* Eyelids animation */}
          {!eyeOpen && (
            <>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-purple-950 rounded-t-full" />
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-purple-950 rounded-b-full" />
            </>
          )}
        </div>

        {/* Revealed text */}
        {revealed && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="font-mono text-purple-300 text-sm mb-4">
              THE EYE SEES ALL
            </p>
            {instanceId === '1' && (
              <button
                onClick={onOpenSecondEye}
                className="px-4 py-2 border-2 border-purple-500 text-purple-300 font-mono text-xs hover:bg-purple-900 transition-colors"
              >
                OPEN MIRROR EYE
              </button>
            )}
            {instanceId === '2' && (
              <p className="font-mono text-purple-500 text-xs">
                TWO EYES WATCHING
              </p>
            )}
          </div>
        )}
      </div>

      <div className="h-8 px-4 flex items-center border-t border-purple-800">
        <span className="font-mono text-[10px] text-purple-600">
          {!eyeOpen ? 'WAIT...' : revealed ? 'AWAKENED' : 'OPENING...'}
        </span>
      </div>
    </div>
  );
}
