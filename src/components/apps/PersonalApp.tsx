'use client';

import { useState } from 'react';

interface PersonalAppProps {
  onAchievement?: (id: string) => void;
}

export function PersonalApp({ onAchievement }: PersonalAppProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const SECRET_PASSWORD = 'ultraint';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === SECRET_PASSWORD) {
      setUnlocked(true);
      onAchievement?.('INNER_CIRCLE');
    } else {
      setError('ACCESS DENIED');
      setTimeout(() => setError(''), 2000);
    }
  };

  if (!unlocked) {
    return (
      <div className="h-full flex flex-col bg-black text-white select-none">
        <div className="h-10 px-4 flex items-center border-b border-gray-800">
          <span className="font-mono text-[10px] tracking-widest text-red-500">
            PRIVATE.EXE - LOCKED
          </span>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-4">[]</div>
          <div className="font-mono text-sm mb-8">ENTER PASSWORD</div>

          <form onSubmit={handleSubmit} className="w-full max-w-xs">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-2 border-white px-4 py-2 font-mono text-center focus:outline-none focus:border-green-500"
              placeholder="********"
            />
            <button
              type="submit"
              className="w-full mt-4 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors font-mono text-sm"
            >
              UNLOCK
            </button>
          </form>

          {error && (
            <div className="mt-4 font-mono text-sm text-red-500">{error}</div>
          )}

          <div className="mt-8 font-mono text-[10px] text-gray-600 text-center">
            HINT: THE NAME OF THIS SYSTEM<br />
            (ALL LOWERCASE)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black text-white select-none">
      <div className="h-10 px-4 flex items-center border-b border-gray-800">
        <span className="font-mono text-[10px] tracking-widest text-green-500">
          PRIVATE.EXE - UNLOCKED
        </span>
      </div>

      <div className="flex-grow overflow-auto p-4">
        <pre className="font-mono text-[10px] leading-relaxed text-gray-300">
{`PERSONAL FILE // EYES ONLY
═══════════════════════════════════════

ABOUT MATEUS:

I'm a software developer who believes that
the best interfaces are the ones that feel
like they have a soul.

This entire OS was built as an experiment:
Can a portfolio be more than just a list
of projects and skills?

Can it tell a story?
Can it be an experience?
Can it feel like something?

I think so.

═══════════════════════════════════════

THINGS I BELIEVE IN:

1. Technology should feel human
2. Details matter more than features
3. The best code is invisible
4. Every interaction is an opportunity
5. Sometimes breaking the rules
   is the only way to make something new

═══════════════════════════════════════

WHAT I'M LOOKING FOR:

People who want to build things that
matter. Teams that care about craft.
Problems that are worth solving.

If that sounds like you, let's talk.

═══════════════════════════════════════

END OF FILE
`}
        </pre>
      </div>
    </div>
  );
}
