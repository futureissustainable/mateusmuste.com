'use client';

import { useEffect, useRef } from 'react';

interface TruthAppProps {
  onAchievement?: (id: string) => void;
}

export function TruthApp({ onAchievement }: TruthAppProps) {
  const achievementTriggered = useRef(false);

  useEffect(() => {
    if (!achievementTriggered.current) {
      achievementTriggered.current = true;
      onAchievement?.('TRUTH_SEEKER');
    }
  }, [onAchievement]);

  return (
    <div className="h-full flex flex-col bg-black text-white select-none">
      <div className="h-8 px-4 flex items-center border-b border-gray-800">
        <span className="font-mono text-[10px] text-gray-500">TRUTH.TXT</span>
      </div>

      <div className="flex-grow overflow-auto p-6">
        <pre className="font-mono text-[11px] leading-relaxed text-gray-300 whitespace-pre-wrap">
{`═══════════════════════════════════════
TRUTH.TXT
═══════════════════════════════════════

You found this file.

Most people never do.

They click around, play the games,
maybe read the about section,
and then they leave.

But you're different.

You kept looking.
You kept clicking.
You wanted to know what else was here.

And now you know the truth:

There is no grand secret.
There is no hidden treasure.
There is no final revelation
that will change everything.

There's just... this.

A person who built something.
A visitor who explored it.
A moment of connection
across time and space.

You are here.
I was here.
That's the truth.

═══════════════════════════════════════

But since you came all this way...

Here's something real:

The best things in life aren't hidden.
They're right in front of us.
We just forget to look.

Thanks for looking.

- M

═══════════════════════════════════════
EOF
`}
        </pre>
      </div>
    </div>
  );
}
