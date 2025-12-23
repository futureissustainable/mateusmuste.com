'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SynthAppProps {
  onAchievement?: (id: string) => void;
}

// Keyboard to note mapping
const KEY_NOTE_MAP: Record<string, number> = {
  a: 261.63, // C4
  w: 277.18, // C#4
  s: 293.66, // D4
  e: 311.13, // D#4
  d: 329.63, // E4
  f: 349.23, // F4
  t: 369.99, // F#4
  g: 392.0, // G4
  y: 415.3, // G#4
  h: 440.0, // A4
  u: 466.16, // A#4
  j: 493.88, // B4
  k: 523.25, // C5
};

const PIANO_KEYS = [
  { note: 'C', freq: 261.63, key: 'A', isBlack: false },
  { note: 'C#', freq: 277.18, key: 'W', isBlack: true },
  { note: 'D', freq: 293.66, key: 'S', isBlack: false },
  { note: 'D#', freq: 311.13, key: 'E', isBlack: true },
  { note: 'E', freq: 329.63, key: 'D', isBlack: false },
  { note: 'F', freq: 349.23, key: 'F', isBlack: false },
  { note: 'F#', freq: 369.99, key: 'T', isBlack: true },
  { note: 'G', freq: 392.0, key: 'G', isBlack: false },
  { note: 'G#', freq: 415.3, key: 'Y', isBlack: true },
  { note: 'A', freq: 440.0, key: 'H', isBlack: false },
  { note: 'A#', freq: 466.16, key: 'U', isBlack: true },
  { note: 'B', freq: 493.88, key: 'J', isBlack: false },
  { note: 'C5', freq: 523.25, key: 'K', isBlack: false },
];

type WaveType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export function SynthApp({ onAchievement }: SynthAppProps) {
  const [waveType, setWaveType] = useState<WaveType>('sine');
  const [volume, setVolume] = useState(0.3);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [notesPlayed, setNotesPlayed] = useState(0);
  const achievementTriggered = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<number, OscillatorNode>>(new Map());
  const gainNodesRef = useRef<Map<number, GainNode>>(new Map());

  // Initialize audio context on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playNote = useCallback(
    (freq: number) => {
      if (oscillatorsRef.current.has(freq)) return;

      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = waveType;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();

      oscillatorsRef.current.set(freq, oscillator);
      gainNodesRef.current.set(freq, gainNode);

      setActiveNotes((prev) => new Set([...prev, freq]));
      setNotesPlayed((p) => {
        const newCount = p + 1;
        if (newCount >= 20 && !achievementTriggered.current) {
          achievementTriggered.current = true;
          onAchievement?.('SYNTHESIST');
        }
        return newCount;
      });
    },
    [waveType, volume, getAudioContext, onAchievement]
  );

  const stopNote = useCallback((freq: number) => {
    const oscillator = oscillatorsRef.current.get(freq);
    const gainNode = gainNodesRef.current.get(freq);

    if (oscillator && gainNode && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
        oscillatorsRef.current.delete(freq);
        gainNodesRef.current.delete(freq);
      }, 60);
    }

    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(freq);
      return next;
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const freq = KEY_NOTE_MAP[e.key.toLowerCase()];
      if (freq) playNote(freq);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const freq = KEY_NOTE_MAP[e.key.toLowerCase()];
      if (freq) stopNote(freq);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playNote, stopNote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((osc) => {
        osc.stop();
        osc.disconnect();
      });
      oscillatorsRef.current.clear();
      gainNodesRef.current.clear();
    };
  }, []);

  const handleKeyPress = (freq: number, isDown: boolean) => {
    if (isDown) {
      playNote(freq);
    } else {
      stopNote(freq);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">SYNTH_001.WAV</span>
        <div className="flex gap-2 font-mono text-xs">
          <span className="text-gray-500">NOTES: {notesPlayed}</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-gray-50 p-4 gap-4">
        {/* Wave type selector */}
        <div className="flex gap-2 justify-center">
          {(['sine', 'square', 'sawtooth', 'triangle'] as WaveType[]).map((type) => (
            <button
              key={type}
              onClick={() => setWaveType(type)}
              className={`px-3 py-1 font-mono text-xs border-2 border-black transition-colors ${
                waveType === type ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-4 justify-center">
          <span className="font-mono text-xs">VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="font-mono text-xs w-8">{Math.round(volume * 100)}%</span>
        </div>

        {/* Piano keyboard */}
        <div className="flex-grow flex items-center justify-center">
          <div className="flex relative">
            {PIANO_KEYS.filter((k) => !k.isBlack).map((key, i) => (
              <button
                key={key.note}
                onMouseDown={() => handleKeyPress(key.freq, true)}
                onMouseUp={() => handleKeyPress(key.freq, false)}
                onMouseLeave={() => handleKeyPress(key.freq, false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleKeyPress(key.freq, true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleKeyPress(key.freq, false);
                }}
                className={`w-10 h-32 border-2 border-black flex flex-col items-center justify-end pb-2 relative transition-colors ${
                  activeNotes.has(key.freq) ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                }`}
                style={{ marginLeft: i > 0 ? '-2px' : '0' }}
              >
                <span className="font-mono text-[8px] font-bold">{key.key}</span>
                <span className="font-mono text-[10px]">{key.note}</span>
              </button>
            ))}

            {/* Black keys overlay */}
            <div className="absolute top-0 left-0 flex pointer-events-none" style={{ marginLeft: '26px' }}>
              {PIANO_KEYS.map((key, i) => {
                if (!key.isBlack) return null;
                // Position black keys between white keys
                const positions: Record<string, number> = {
                  'C#': 0,
                  'D#': 1,
                  'F#': 3,
                  'G#': 4,
                  'A#': 5,
                };
                const pos = positions[key.note];
                if (pos === undefined) return null;
                return (
                  <button
                    key={key.note}
                    onMouseDown={() => handleKeyPress(key.freq, true)}
                    onMouseUp={() => handleKeyPress(key.freq, false)}
                    onMouseLeave={() => handleKeyPress(key.freq, false)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleKeyPress(key.freq, true);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleKeyPress(key.freq, false);
                    }}
                    className={`absolute w-6 h-20 border-2 border-black flex flex-col items-center justify-end pb-1 pointer-events-auto ${
                      activeNotes.has(key.freq) ? 'bg-gray-600 text-white' : 'bg-black text-white'
                    }`}
                    style={{ left: `${pos * 40 + (pos > 1 ? 40 : 0)}px` }}
                  >
                    <span className="font-mono text-[8px]">{key.key}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="app-footer">
        <span className="text-gray-500 text-xs">KEYS: A-K TO PLAY</span>
      </div>
    </div>
  );
}
