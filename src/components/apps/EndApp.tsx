import { memo } from 'react';
import { PixelartIcon } from '@/components/ui';

interface EndAppProps {
  achievements: Record<string, { unlockedAt: number }>;
}

const ACHIEVEMENTS: Record<string, { name: string; icon: string; hint: string }> = {
  SOCIAL_NETWORK: { name: 'SOCIAL NETWORK', icon: 'Message', hint: 'Say hi to the maker' },
  NEO: { name: 'NEO', icon: 'Star', hint: 'Take the red pill' },
  LOCKSMITH: { name: 'LOCKSMITH', icon: 'Lock', hint: 'Hackers gonna hack' },
  FORBIDDEN: { name: 'FORBIDDEN', icon: 'Alert', hint: 'Curiosity kills' },
  MESSENGER: { name: 'MESSENGER', icon: 'Palette', hint: 'A picture is worth a thousand words' },
  WORK_IN_PROGRESS: { name: 'WORK IN PROGRESS', icon: 'Terminal', hint: 'The art behind the artist' },
  OUROBOROS: { name: 'OUROBOROS', icon: 'Repeat', hint: 'A tail as old as time' },
  FIRST_BLOOD: { name: 'FIRST BLOOD', icon: 'Sword', hint: 'Everyone starts somewhere' },
  DAEDALUS: { name: 'DAEDALUS', icon: 'Labyrinth', hint: 'Lost yet?' },
  UNTOUCHABLE: { name: 'UNTOUCHABLE', icon: 'Minesweeper', hint: 'Big brain energy' },
  ACE: { name: 'ACE', icon: 'Starship', hint: 'Pew pew pew' },
  IMPOSSIBLE: { name: 'IMPOSSIBLE', icon: 'Dice', hint: 'RNGesus take the wheel' },
  DEEP_LISTENER: { name: 'DEEP LISTENER', icon: 'Music', hint: 'Good taste is earned' },
  COLLECTOR: { name: 'COLLECTOR', icon: 'Star', hint: 'Patience, young one' },
  VOIDBORN: { name: 'VOIDBORN', icon: 'Star', hint: 'Scream into the abyss' },
  TUNED_IN: { name: 'TUNED IN', icon: 'Music', hint: 'Broadcasting from the void' },
  FOURTH_DIMENSION: { name: '4TH DIMENSION', icon: 'Eye', hint: 'Twice the vision' },
  PHYSICS: { name: 'PHYSICS', icon: 'Expand', hint: 'Bouncy bouncy' },
  KONAMI: { name: 'KONAMI', icon: 'Controller', hint: 'Old school cool' },
  INCEPTION: { name: 'INCEPTION', icon: 'Globe', hint: 'We need to go deeper' },
  SYMPHONY: { name: 'SYMPHONY', icon: 'Music', hint: 'Go all out' },
  TIMEKEEPER: { name: 'TIMEKEEPER', icon: 'Clock', hint: 'Time flies' },
  CLICKER: { name: 'CLICKER', icon: 'Cursor', hint: 'Click. Click. Click.' },
  MASTER: { name: 'MASTER', icon: 'Clock', hint: 'Grow your garden' },
  TYCOON: { name: 'TYCOON', icon: 'Globe', hint: 'Money printer go brrr' },
  ASCENDED: { name: 'ASCENDED', icon: 'Dog', hint: 'Who let the dog out?' },
  YOU_MONSTER: { name: 'YOU MONSTER', icon: 'Skull', hint: 'How could you' },
  JOHN_WICK: { name: 'JOHN WICK', icon: 'Fire', hint: 'Baba Yaga approves' },
  OVERKILL: { name: 'OVERKILL', icon: 'Bomb', hint: 'Therapy recommended' },
  CENTURY: { name: 'CENTURY', icon: 'Trophy', hint: 'Commitment issues' },
  HUNDRED_PERCENT: { name: '100%', icon: 'Trophy', hint: 'You did it!' }
};

export const EndApp = memo(({ achievements }: EndAppProps) => {
  const unlockedCount = Object.keys(achievements).length;
  const totalCount = Object.keys(ACHIEVEMENTS).length;
  const has100Percent = achievements.HUNDRED_PERCENT;

  return (
    <div className="h-full flex flex-col bg-black text-white select-none font-mono overflow-auto">
      <div className="p-4 border-b border-white/20 text-center">
        <div className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          {has100Percent && <PixelartIcon name="Trophy" size={24} className="invert" />}
          {has100Percent ? '100% COMPLETE' : 'ACHIEVEMENT LOG'}
          {has100Percent && <PixelartIcon name="Trophy" size={24} className="invert" />}
        </div>
        <div className="text-sm text-gray-400">
          {unlockedCount} / {totalCount} ACHIEVEMENTS
        </div>
      </div>

      <div className="flex-grow p-4 space-y-2 overflow-auto">
        {Object.entries(ACHIEVEMENTS).map(([id, ach]) => {
          const unlocked = achievements[id];
          return (
            <div
              key={id}
              className={`p-2 border ${unlocked ? 'border-white bg-white/10' : 'border-gray-700 opacity-50'}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center ${unlocked ? '' : 'opacity-30'}`}>
                  <PixelartIcon name={ach.icon as any} size={20} className="invert" />
                </div>
                <span className={`font-bold ${unlocked ? '' : 'text-gray-500'}`}>
                  {ach.name}
                </span>
              </div>
              <div className={`text-xs ml-8 ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                {ach.hint}
              </div>
            </div>
          );
        })}
      </div>

      {has100Percent && (
        <div className="p-4 border-t border-white/20 text-center">
          <div className="text-sm text-gray-400">THANK YOU FOR PLAYING</div>
          <div className="font-heading text-xs text-gray-600 mt-1">— MATEUS MUSTE —</div>
        </div>
      )}
    </div>
  );
});

EndApp.displayName = 'EndApp';

export default EndApp;
