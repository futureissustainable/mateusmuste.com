'use client';

import { useState, useRef } from 'react';

interface DiceAppProps {
  onAchievement?: (id: string) => void;
}

export function DiceApp({ onAchievement }: DiceAppProps) {
  const [diceType, setDiceType] = useState<number>(20);
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<{ type: number; value: number }[]>([]);
  const nat20CountRef = useRef(0);
  const achievementTriggered = useRef(false);

  const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

  const roll = () => {
    setIsRolling(true);

    // Animate through random values
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * diceType) + 1);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalResult = Math.floor(Math.random() * diceType) + 1;
        setResult(finalResult);
        setIsRolling(false);
        setRollHistory((prev) => [...prev.slice(-9), { type: diceType, value: finalResult }]);

        // Check for nat 20
        if (diceType === 20 && finalResult === 20) {
          nat20CountRef.current++;
          if (nat20CountRef.current >= 1 && !achievementTriggered.current) {
            achievementTriggered.current = true;
            onAchievement?.('CRITICAL_HIT');
          }
        }
      }
    }, 50);
  };

  const getDiceShape = (type: number): string => {
    switch (type) {
      case 4:
        return 'D4 (TETRAHEDRON)';
      case 6:
        return 'D6 (CUBE)';
      case 8:
        return 'D8 (OCTAHEDRON)';
      case 10:
        return 'D10 (DECAHEDRON)';
      case 12:
        return 'D12 (DODECAHEDRON)';
      case 20:
        return 'D20 (ICOSAHEDRON)';
      case 100:
        return 'D100 (PERCENTILE)';
      default:
        return `D${type}`;
    }
  };

  const isNat20 = diceType === 20 && result === 20;
  const isNat1 = result === 1;

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">DICE.EXE</span>
        <span className="text-gray-500 text-sm">{getDiceShape(diceType)}</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 p-4">
        {/* Dice display */}
        <div
          className={`w-32 h-32 border-4 border-black flex items-center justify-center text-5xl font-black transition-all ${
            isRolling ? 'animate-pulse' : ''
          } ${isNat20 ? 'bg-yellow-400' : isNat1 ? 'bg-red-500 text-white' : 'bg-white'}`}
          style={{
            transform: isRolling ? `rotate(${Math.random() * 20 - 10}deg)` : 'rotate(0deg)',
          }}
        >
          {result ?? '?'}
        </div>

        {isNat20 && !isRolling && (
          <div className="mt-4 font-mono text-xl font-bold text-yellow-600 animate-pulse">
            NATURAL 20!
          </div>
        )}

        {isNat1 && !isRolling && (
          <div className="mt-4 font-mono text-xl font-bold text-red-600">CRITICAL FAIL!</div>
        )}

        {/* Dice type selector */}
        <div className="mt-8 flex gap-2 flex-wrap justify-center">
          {DICE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setDiceType(type)}
              className={`w-12 h-12 font-mono text-sm font-bold border-2 transition-colors ${
                diceType === type
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-black'
              }`}
            >
              D{type}
            </button>
          ))}
        </div>

        {/* Roll button */}
        <button
          onClick={roll}
          disabled={isRolling}
          className={`mt-8 px-8 py-3 font-mono text-lg font-bold border-2 border-black transition-colors ${
            isRolling ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-black hover:text-white'
          }`}
        >
          {isRolling ? 'ROLLING...' : 'ROLL'}
        </button>
      </div>

      {/* Roll history */}
      <div className="h-12 px-4 flex items-center gap-2 border-t-2 border-black overflow-x-auto">
        <span className="font-mono text-xs text-gray-500 shrink-0">HISTORY:</span>
        {rollHistory.map((roll, i) => (
          <span
            key={i}
            className={`font-mono text-xs shrink-0 ${
              roll.type === 20 && roll.value === 20
                ? 'text-yellow-600 font-bold'
                : roll.value === 1
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            d{roll.type}:{roll.value}
          </span>
        ))}
      </div>
    </div>
  );
}
