'use client';

import { useState, useRef } from 'react';

interface DestructionAppProps {
  onAchievement?: (id: string) => void;
}

interface Block {
  id: number;
  destroyed: boolean;
}

export function DestructionApp({ onAchievement }: DestructionAppProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    Array.from({ length: 25 }, (_, i) => ({ id: i, destroyed: false }))
  );
  const [destroyedCount, setDestroyedCount] = useState(0);
  const achievementTriggered = useRef(false);

  const destroyBlock = (id: number) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, destroyed: true } : b))
    );
    setDestroyedCount((c) => {
      const newCount = c + 1;
      if (newCount >= 25 && !achievementTriggered.current) {
        achievementTriggered.current = true;
        onAchievement?.('DESTROYER');
      }
      return newCount;
    });
  };

  const reset = () => {
    setBlocks(Array.from({ length: 25 }, (_, i) => ({ id: i, destroyed: false })));
    setDestroyedCount(0);
  };

  const allDestroyed = destroyedCount >= 25;

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">DESTRUCTION.EXE</span>
        <span className="text-gray-500 text-sm">{destroyedCount}/25</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 p-4">
        {allDestroyed ? (
          <div className="text-center">
            <div className="font-mono text-2xl font-bold mb-4">TOTAL DESTRUCTION</div>
            <pre className="font-mono text-[10px] text-gray-600 mb-4">
{`TO DESTROY IS TO CREATE.
TO CREATE IS TO DESTROY.

WHAT HAVE YOU CREATED
THROUGH DESTRUCTION?

NOTHING.

AND THAT'S THE POINT.`}
            </pre>
            <button
              onClick={reset}
              className="px-6 py-2 border-2 border-black font-mono text-sm hover:bg-black hover:text-white transition-colors"
            >
              REBUILD
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-2 mb-8">
              {blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => !block.destroyed && destroyBlock(block.id)}
                  disabled={block.destroyed}
                  className={`w-12 h-12 border-2 transition-all ${
                    block.destroyed
                      ? 'border-gray-200 bg-gray-100 cursor-default'
                      : 'border-black bg-white hover:bg-red-500 hover:border-red-500 hover:text-white cursor-crosshair'
                  }`}
                >
                  {!block.destroyed && 'X'}
                </button>
              ))}
            </div>

            <div className="font-mono text-xs text-gray-500 text-center">
              CLICK TO DESTROY<br />
              {25 - destroyedCount} BLOCKS REMAINING
            </div>
          </>
        )}
      </div>
    </div>
  );
}
