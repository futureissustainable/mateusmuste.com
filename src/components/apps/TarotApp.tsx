'use client';

import { useState, useRef } from 'react';

interface TarotAppProps {
  onAchievement?: (id: string) => void;
}

interface TarotCard {
  name: string;
  meaning: string;
  reversed: string;
}

const MAJOR_ARCANA: TarotCard[] = [
  { name: 'THE FOOL', meaning: 'New beginnings, innocence, spontaneity', reversed: 'Recklessness, risk-taking' },
  { name: 'THE MAGICIAN', meaning: 'Manifestation, resourcefulness, power', reversed: 'Manipulation, trickery' },
  { name: 'THE HIGH PRIESTESS', meaning: 'Intuition, mystery, inner knowledge', reversed: 'Secrets, withdrawal' },
  { name: 'THE EMPRESS', meaning: 'Abundance, fertility, nature', reversed: 'Dependence, smothering' },
  { name: 'THE EMPEROR', meaning: 'Authority, structure, control', reversed: 'Tyranny, rigidity' },
  { name: 'THE HIEROPHANT', meaning: 'Tradition, conformity, morality', reversed: 'Rebellion, subversiveness' },
  { name: 'THE LOVERS', meaning: 'Love, harmony, relationships', reversed: 'Disharmony, imbalance' },
  { name: 'THE CHARIOT', meaning: 'Determination, willpower, control', reversed: 'Lack of direction' },
  { name: 'STRENGTH', meaning: 'Courage, patience, inner strength', reversed: 'Self-doubt, weakness' },
  { name: 'THE HERMIT', meaning: 'Soul-searching, introspection', reversed: 'Isolation, loneliness' },
  { name: 'WHEEL OF FORTUNE', meaning: 'Change, cycles, fate', reversed: 'Bad luck, resistance' },
  { name: 'JUSTICE', meaning: 'Justice, fairness, truth', reversed: 'Unfairness, dishonesty' },
  { name: 'THE HANGED MAN', meaning: 'Sacrifice, release, martyrdom', reversed: 'Stalling, needless sacrifice' },
  { name: 'DEATH', meaning: 'Endings, change, transformation', reversed: 'Fear of change, stagnation' },
  { name: 'TEMPERANCE', meaning: 'Balance, moderation, patience', reversed: 'Imbalance, excess' },
  { name: 'THE DEVIL', meaning: 'Shadow self, attachment, addiction', reversed: 'Releasing limiting beliefs' },
  { name: 'THE TOWER', meaning: 'Sudden change, upheaval, revelation', reversed: 'Fear of change, averting disaster' },
  { name: 'THE STAR', meaning: 'Hope, faith, purpose, renewal', reversed: 'Lack of faith, despair' },
  { name: 'THE MOON', meaning: 'Illusion, fear, anxiety, subconscious', reversed: 'Release of fear, repressed emotions' },
  { name: 'THE SUN', meaning: 'Joy, success, vitality, positivity', reversed: 'Inner child, sadness' },
  { name: 'JUDGEMENT', meaning: 'Reflection, reckoning, awakening', reversed: 'Self-doubt, refusal' },
  { name: 'THE WORLD', meaning: 'Completion, integration, accomplishment', reversed: 'Incompletion, stagnation' },
];

export function TarotApp({ onAchievement }: TarotAppProps) {
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCard; reversed: boolean }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [readingType, setReadingType] = useState<'single' | 'three'>('single');
  const readingCountRef = useRef(0);
  const achievementTriggered = useRef(false);

  const drawCards = () => {
    setIsDrawing(true);
    setDrawnCards([]);

    const count = readingType === 'single' ? 1 : 3;
    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count).map((card) => ({
      card,
      reversed: Math.random() > 0.7,
    }));

    // Animate card reveal
    setTimeout(() => {
      setDrawnCards(selected);
      setIsDrawing(false);

      readingCountRef.current++;
      if (readingCountRef.current >= 3 && !achievementTriggered.current) {
        achievementTriggered.current = true;
        onAchievement?.('FORTUNE_TELLER');
      }
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-black text-white select-none">
      <div className="h-10 px-4 flex justify-between items-center border-b border-gray-800">
        <span className="font-mono text-[10px] font-bold tracking-widest">TAROT.DAT</span>
        <span className="font-mono text-[10px] text-gray-500">MAJOR ARCANA</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-auto">
        {drawnCards.length === 0 ? (
          <>
            {/* Card back / deck */}
            <div className="w-32 h-48 bg-gradient-to-br from-purple-900 to-black border-2 border-purple-500 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">*</div>
                <div className="font-mono text-[8px] tracking-widest">TAROT</div>
              </div>
            </div>

            {/* Reading type selector */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setReadingType('single')}
                className={`px-4 py-2 font-mono text-xs border transition-colors ${
                  readingType === 'single'
                    ? 'border-purple-500 bg-purple-900'
                    : 'border-gray-700 hover:border-purple-500'
                }`}
              >
                SINGLE CARD
              </button>
              <button
                onClick={() => setReadingType('three')}
                className={`px-4 py-2 font-mono text-xs border transition-colors ${
                  readingType === 'three'
                    ? 'border-purple-500 bg-purple-900'
                    : 'border-gray-700 hover:border-purple-500'
                }`}
              >
                THREE CARD
              </button>
            </div>
          </>
        ) : (
          <div className={`flex gap-4 ${readingType === 'three' ? 'flex-wrap justify-center' : ''}`}>
            {drawnCards.map((drawn, i) => (
              <div
                key={i}
                className={`flex flex-col items-center ${drawn.reversed ? 'rotate-180' : ''}`}
              >
                <div className="w-28 h-40 bg-white text-black border-2 border-purple-500 p-2 flex flex-col items-center justify-center">
                  <div className="text-2xl mb-1">
                    {['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'][
                      MAJOR_ARCANA.indexOf(drawn.card)
                    ]}
                  </div>
                  <div className="font-mono text-[8px] text-center font-bold leading-tight">
                    {drawn.card.name}
                  </div>
                </div>
                <div className={`mt-2 text-center max-w-28 ${drawn.reversed ? 'rotate-180' : ''}`}>
                  <div className="font-mono text-[8px] text-purple-400">
                    {drawn.reversed ? 'REVERSED' : 'UPRIGHT'}
                  </div>
                  <div className="font-mono text-[10px] mt-1">
                    {drawn.reversed ? drawn.card.reversed : drawn.card.meaning}
                  </div>
                  {readingType === 'three' && (
                    <div className="font-mono text-[8px] text-gray-500 mt-1">
                      {i === 0 ? 'PAST' : i === 1 ? 'PRESENT' : 'FUTURE'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Draw button */}
        <button
          onClick={drawCards}
          disabled={isDrawing}
          className={`mt-8 px-6 py-2 font-mono text-sm border-2 border-purple-500 transition-colors ${
            isDrawing ? 'bg-purple-900/50 cursor-not-allowed' : 'hover:bg-purple-900'
          }`}
        >
          {isDrawing ? 'DRAWING...' : drawnCards.length > 0 ? 'DRAW AGAIN' : 'DRAW CARD'}
        </button>
      </div>
    </div>
  );
}
