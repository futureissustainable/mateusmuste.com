import { useState, useEffect, useRef, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';

interface TarotAppProps {
  onAchievement?: (id: string) => void;
  onUnlockApp?: (appId: string) => void;
}

interface TarotCard {
  name: string;
  num: string;
  meaning: string;
}

export const TarotApp = memo(({ onAchievement }: TarotAppProps) => {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [uniqueDays, setUniqueDays] = useState<string[]>(() => {
    const stored = localStorage.getItem('tarot_unique_days');
    return stored ? JSON.parse(stored) : [];
  });
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    };
  }, []);

  const tarotCards: TarotCard[] = [
    { name: 'THE FOOL', num: '0', meaning: 'New beginnings, innocence, spontaneity' },
    { name: 'THE MAGICIAN', num: 'I', meaning: 'Manifestation, resourcefulness, power' },
    { name: 'THE HIGH PRIESTESS', num: 'II', meaning: 'Intuition, mystery, inner knowledge' },
    { name: 'THE EMPRESS', num: 'III', meaning: 'Abundance, nurturing, fertility' },
    { name: 'THE EMPEROR', num: 'IV', meaning: 'Authority, structure, control' },
    { name: 'THE HIEROPHANT', num: 'V', meaning: 'Tradition, conformity, morality' },
    { name: 'THE LOVERS', num: 'VI', meaning: 'Love, harmony, relationships' },
    { name: 'THE CHARIOT', num: 'VII', meaning: 'Willpower, success, determination' },
    { name: 'STRENGTH', num: 'VIII', meaning: 'Courage, patience, compassion' },
    { name: 'THE HERMIT', num: 'IX', meaning: 'Soul-searching, introspection, solitude' },
    { name: 'WHEEL OF FORTUNE', num: 'X', meaning: 'Change, cycles, fate' },
    { name: 'JUSTICE', num: 'XI', meaning: 'Fairness, truth, law' },
    { name: 'THE HANGED MAN', num: 'XII', meaning: 'Pause, surrender, new perspectives' },
    { name: 'DEATH', num: 'XIII', meaning: 'Endings, change, transformation' },
    { name: 'TEMPERANCE', num: 'XIV', meaning: 'Balance, moderation, patience' },
    { name: 'THE DEVIL', num: 'XV', meaning: 'Bondage, materialism, ignorance' },
    { name: 'THE TOWER', num: 'XVI', meaning: 'Disaster, upheaval, revelation' },
    { name: 'THE STAR', num: 'XVII', meaning: 'Hope, faith, rejuvenation' },
    { name: 'THE MOON', num: 'XVIII', meaning: 'Illusion, fear, subconscious' },
    { name: 'THE SUN', num: 'XIX', meaning: 'Positivity, success, vitality' },
    { name: 'JUDGEMENT', num: 'XX', meaning: 'Rebirth, inner calling, absolution' },
    { name: 'THE WORLD', num: 'XXI', meaning: 'Completion, accomplishment, travel' }
  ];

  const pullCards = () => {
    setIsShuffling(true);
    sounds.cardShuffle();

    setTimeout(() => {
      const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
      setCards(shuffled.slice(0, 3));
      setIsShuffling(false);
      setRevealed(false);

      // Track unique days
      const today = new Date().toDateString();
      if (!uniqueDays.includes(today)) {
        const newDays = [...uniqueDays, today];
        setUniqueDays(newDays);
        localStorage.setItem('tarot_unique_days', JSON.stringify(newDays));
        if (newDays.length >= 7) {
          onAchievement?.('FORTUNE_SEEKER');
        }
      }
    }, 1500);
  };

  const revealCards = () => {
    sounds.cardFlip();
    setRevealed(true);
  };

  return (
    <div className="h-full flex flex-col bg-black select-none">
      <div className="app-header bg-black border-gray-800">
        <div className="flex items-center gap-2">
          <PixelartIcon name="Star" size={16} />
          <span className="app-header-title text-white">TAROT.DAT</span>
        </div>
        <span className="app-footer-text text-gray-500">{uniqueDays.length} DAYS</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black to-gray-900">
        {cards.length === 0 ? (
          <div className="text-center">
            <div className="text-white font-mono text-lg mb-4">CONSULT THE CARDS</div>
            <button
              onClick={pullCards}
              disabled={isShuffling}
              className="px-8 py-3 bg-white text-black font-mono text-sm hover:bg-gray-200 disabled:bg-gray-500"
            >
              {isShuffling ? 'SHUFFLING...' : 'DRAW THREE'}
            </button>
          </div>
        ) : (
          <div className="text-center w-full">
            <div className="flex justify-center gap-4 mb-6">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className={`w-24 h-36 border-2 border-white bg-gray-900 flex items-center justify-center transition-all duration-500 ${
                    revealed ? 'rotate-0' : 'rotate-y-180'
                  }`}
                >
                  {revealed ? (
                    <div className="text-center p-2">
                      <div className="text-white font-mono text-[10px] font-bold">{card.num}</div>
                      <div className="text-white font-mono text-[8px] mt-1">{card.name}</div>
                    </div>
                  ) : (
                    <div className="text-white font-mono text-2xl">?</div>
                  )}
                </div>
              ))}
            </div>

            {revealed ? (
              <div className="space-y-2 max-w-md mx-auto">
                {cards.map((card, i) => (
                  <div key={i} className="text-left p-2 border border-gray-800">
                    <div className="text-white font-mono text-xs font-bold">{card.name}</div>
                    <div className="text-gray-400 font-mono text-[10px]">{card.meaning}</div>
                  </div>
                ))}
                <button
                  onClick={() => setCards([])}
                  className="mt-4 px-6 py-2 bg-white text-black font-mono text-sm hover:bg-gray-200"
                >
                  DRAW AGAIN
                </button>
              </div>
            ) : (
              <button
                onClick={revealCards}
                className="px-6 py-2 bg-white text-black font-mono text-sm hover:bg-gray-200"
              >
                REVEAL
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-800 bg-black">
        <div className="font-mono text-[10px] text-gray-600 text-center">
          PAST · PRESENT · FUTURE
        </div>
      </div>
    </div>
  );
});

TarotApp.displayName = 'TarotApp';

export default TarotApp;
