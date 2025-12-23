import { useState, useEffect, useRef, memo } from 'react';
import { DogSprite } from '@/components/ui';

interface DestructionAppProps {
  onDogSteal?: () => void;
  onAchievement?: (id: string) => void;
}

export const DestructionApp = memo(({ onDogSteal, onAchievement }: DestructionAppProps) => {
  const [confirmStep, setConfirmStep] = useState(0);
  // Button position tracking (used for potential animation)
  const [dogStealing, setDogStealing] = useState(false);
  const [dogPos, setDogPos] = useState({ x: -100, y: 200 });
  const [buttonGone, setButtonGone] = useState(false);
  const dogRunRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dogEscapeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (dogRunRef.current) clearInterval(dogRunRef.current);
      if (dogEscapeRef.current) clearInterval(dogEscapeRef.current);
    };
  }, []);

  const confirmMessages = [
    { prompt: "EXECUTE", response: "You want to do it?" },
    { prompt: "YES", response: "Are you sure?" },
    { prompt: "I'M SURE", response: "Really though?" },
    { prompt: "REALLY", response: "Really, really though?" },
    { prompt: "YES REALLY", response: "Like... REALLY really?" },
    { prompt: "DO IT", response: "You know this destroys EVERYTHING?" },
    { prompt: "I KNOW", response: "There's no going back..." },
    { prompt: "I DON'T CARE", response: "Final warning..." },
    { prompt: "JUST DO IT", response: "Okay... last chance to back out..." },
    { prompt: "DESTROY IT ALL", response: "..." }
  ];

  const handleClick = () => {
    if (confirmStep < 9) {
      setConfirmStep(prev => prev + 1);
    } else {
      setDogStealing(true);

      let dogX = -100;
      dogRunRef.current = setInterval(() => {
        dogX += 15;
        setDogPos({ x: dogX, y: 150 + Math.sin(dogX / 20) * 10 });

        if (dogX >= 120) {
          if (dogRunRef.current) clearInterval(dogRunRef.current);
          setButtonGone(true);

          dogEscapeRef.current = setInterval(() => {
            dogX += 20;
            setDogPos({ x: dogX, y: 150 + Math.sin(dogX / 15) * 15 });

            if (dogX > window.innerWidth + 100) {
              if (dogEscapeRef.current) clearInterval(dogEscapeRef.current);
              onAchievement?.('DESTROYER_OF_WORLDS');
              if (onDogSteal) onDogSteal();
            }
          }, 30);
        }
      }, 30);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white select-none relative overflow-hidden">
      <div className="app-header">
        <span className="app-header-title">DESTRUCTION.EXE</span>
        <span className="app-footer-text">DANGER ZONE</span>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 relative z-10">
        <div className="text-center">
          <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto mb-4" style={{ imageRendering: 'pixelated' }}>
            <rect x="16" y="4" width="32" height="8" fill="#000" />
            <rect x="12" y="12" width="40" height="8" fill="#000" />
            <rect x="8" y="20" width="48" height="16" fill="#000" />
            <rect x="14" y="22" width="12" height="10" fill="#fff" />
            <rect x="38" y="22" width="12" height="10" fill="#fff" />
            <rect x="28" y="34" width="8" height="6" fill="#fff" />
            <rect x="12" y="40" width="40" height="8" fill="#000" />
            <rect x="16" y="42" width="4" height="6" fill="#fff" />
            <rect x="24" y="42" width="4" height="6" fill="#fff" />
            <rect x="36" y="42" width="4" height="6" fill="#fff" />
            <rect x="44" y="42" width="4" height="6" fill="#fff" />
            <rect x="16" y="48" width="32" height="8" fill="#000" />
          </svg>
          <div className="font-mono text-sm mb-2 text-black">DESTRUCTION.EXE</div>
          <div className="font-mono text-xs text-gray-500 mb-6">
            {confirmStep === 0 ? "WARNING: WILL DESTROY EVERYTHING" : confirmMessages[confirmStep - 1]?.response || "..."}
          </div>
          {!buttonGone && (
            <button
              onClick={handleClick}
              className={`btn-primary btn-lg ${confirmStep > 5 ? 'animate-pulse' : ''}`}
            >
              {confirmMessages[confirmStep].prompt}
            </button>
          )}
          {buttonGone && !dogStealing && (
            <div className="font-mono text-sm text-gray-500">
              The button is gone...
            </div>
          )}
        </div>
      </div>

      {dogStealing && (
        <div
          className="absolute z-20"
          style={{ left: dogPos.x, top: dogPos.y }}
        >
          <DogSprite />
          {buttonGone && (
            <div className="absolute -top-4 left-10 px-2 py-1 bg-black text-white font-mono text-[8px] border-2 border-black">
              DESTROY
            </div>
          )}
        </div>
      )}

      {dogStealing && buttonGone && (
        <div className="absolute bottom-4 w-full text-center">
          <div className="font-mono text-xs text-gray-600">
            *dog runs away with the button*
          </div>
        </div>
      )}
    </div>
  );
});

DestructionApp.displayName = 'DestructionApp';

export default DestructionApp;
