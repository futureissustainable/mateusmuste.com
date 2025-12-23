import { useState, useEffect, useRef, memo } from 'react';

interface VoidAppProps {
  onAchievement?: (id: string) => void;
}

interface VoidChar {
  id: number;
  char: string;
  displayChar: string;
  timestamp: number;
  phase: 'visible' | 'encrypting' | 'fading';
  opacity: number;
}

export const VoidApp = memo(({ onAchievement }: VoidAppProps) => {
  const [chars, setChars] = useState<VoidChar[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const charIdRef = useRef(0);
  const [totalChars, setTotalChars] = useState(() => {
    const stored = localStorage.getItem('void_total_chars');
    return stored ? parseInt(stored, 10) : 0;
  });

  const encryptChar = () => {
    const symbols = '▓▒░█▄▀■□●○◆◇★☆@#$%&*';
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setChars(prev => {
        let updated = false;
        const newChars = prev.map(c => {
          if (c.phase === 'visible' && now - c.timestamp >= 1500) {
            updated = true;
            return { ...c, phase: 'encrypting' as const, displayChar: encryptChar() };
          }
          if (c.phase === 'encrypting' && now - c.timestamp >= 1800) {
            updated = true;
            return { ...c, phase: 'fading' as const, opacity: 0.8 };
          }
          if (c.phase === 'fading') {
            const newOpacity = c.opacity - 0.15;
            if (newOpacity <= 0) {
              updated = true;
              return null;
            }
            updated = true;
            return { ...c, opacity: newOpacity, displayChar: encryptChar() };
          }
          return c;
        }).filter((c): c is VoidChar => c !== null);
        return updated ? newChars : prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      setChars(prev => {
        const visibleChars = prev.filter(c => c.phase === 'visible');
        if (visibleChars.length === 0) return prev;
        const lastVisible = visibleChars[visibleChars.length - 1];
        return prev.filter(c => c.id !== lastVisible.id);
      });
      e.preventDefault();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      const newChar: VoidChar = {
        id: charIdRef.current++,
        char: e.key,
        displayChar: e.key,
        timestamp: Date.now(),
        phase: 'visible',
        opacity: 1
      };
      setChars(prev => [...prev, newChar]);
      const newTotal = totalChars + 1;
      setTotalChars(newTotal);
      localStorage.setItem('void_total_chars', newTotal.toString());
      if (newTotal >= 1000) onAchievement?.('VOIDBORN');
      e.preventDefault();
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-black select-none cursor-text"
      onClick={() => inputRef.current?.focus()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      <div className="p-2 border-b border-gray-800 bg-black">
        <span className="font-mono text-xs font-bold text-white">VOID.TXT</span>
      </div>
      <div className="flex-grow p-4 overflow-auto font-mono text-sm">
        <div className="flex flex-wrap items-start">
          <span className="mr-2 text-gray-600">{'>'}</span>
          <div className="flex-grow">
            {chars.map(c => (
              <span
                key={c.id}
                style={{
                  color: c.phase === 'encrypting' ? '#0f0' :
                    c.phase === 'fading' ? `rgba(0,255,0,${c.opacity})` : 'white',
                  textShadow: c.phase !== 'visible' ? '0 0 5px #0f0' : 'none'
                }}
              >
                {c.displayChar}
              </span>
            ))}
            <span className="animate-pulse text-white">_</span>
          </div>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="absolute opacity-0 pointer-events-none"
          onKeyDown={handleKeyDown}
          onPaste={(e) => e.preventDefault()}
          autoFocus
          aria-label="Void text input"
        />
      </div>
    </div>
  );
});

VoidApp.displayName = 'VoidApp';

export default VoidApp;
