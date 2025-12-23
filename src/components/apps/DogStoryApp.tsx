'use client';

import { useState, useRef } from 'react';

interface DogStoryAppProps {
  onAchievement?: (id: string) => void;
}

export function DogStoryApp({ onAchievement }: DogStoryAppProps) {
  const [page, setPage] = useState(0);

  const pages = [
    {
      title: 'THE DOG',
      content: `Once upon a time, there was a dog.

Not a special dog. Just a dog.

He lived in a small house with a person who loved him very much.

Every day was the same:
Wake up. Eat. Walk. Nap. Eat. Sleep.

The dog was happy.`,
    },
    {
      title: 'THE WALK',
      content: `One day, during the walk, the dog saw something.

A butterfly.

It was the most beautiful thing the dog had ever seen.

He wanted to catch it.
He wanted to understand it.
He wanted to be it.

So he ran.`,
    },
    {
      title: 'THE CHASE',
      content: `The dog ran and ran.

Past the park.
Past the houses.
Past the edge of town.

He didn't notice he was lost.

All he saw was the butterfly.

All he felt was the wind.

All he wanted was to fly.`,
    },
    {
      title: 'THE REALIZATION',
      content: `Eventually, the butterfly flew away.

Up, up, up.

Until it was just a speck.

Until it was nothing.

The dog stopped running.

He looked around.

He didn't know where he was.

He didn't know how to get home.`,
    },
    {
      title: 'THE RETURN',
      content: `But the dog wasn't scared.

Because he remembered something:

The person who loved him would never stop looking.

And sure enough, just as the sun was setting,
he heard a familiar voice calling his name.

He ran toward it.

He ran all the way home.`,
    },
    {
      title: 'THE END',
      content: `That night, the dog slept better than ever.

He dreamed of butterflies.

But in his dream, he didn't chase them.

He just watched them fly.

And that was enough.

THE END

---

Sometimes the chase isn't the point.
Sometimes just witnessing beauty is enough.`,
    },
  ];

  const currentPage = pages[page];

  return (
    <div className="h-full flex flex-col bg-amber-50 select-none">
      <div className="app-header bg-amber-100 border-amber-300">
        <span className="app-header-title text-amber-900">DOG.TXT</span>
        <span className="text-amber-700 text-xs">
          {page + 1} / {pages.length}
        </span>
      </div>

      <div className="flex-grow overflow-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-md">
          <h2 className="font-mono text-xl font-bold text-amber-900 mb-6 text-center">
            {currentPage.title}
          </h2>
          <pre className="font-mono text-sm leading-relaxed text-amber-800 whitespace-pre-wrap text-center">
            {currentPage.content}
          </pre>
        </div>
      </div>

      <div className="h-14 px-4 flex items-center justify-between border-t-2 border-amber-300 bg-amber-100">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className={`px-4 py-2 font-mono text-sm border-2 ${
            page === 0
              ? 'border-amber-200 text-amber-300 cursor-not-allowed'
              : 'border-amber-600 text-amber-800 hover:bg-amber-200'
          }`}
        >
          PREV
        </button>
        <div className="flex gap-1">
          {pages.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === page ? 'bg-amber-600' : 'bg-amber-300'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
          disabled={page === pages.length - 1}
          className={`px-4 py-2 font-mono text-sm border-2 ${
            page === pages.length - 1
              ? 'border-amber-200 text-amber-300 cursor-not-allowed'
              : 'border-amber-600 text-amber-800 hover:bg-amber-200'
          }`}
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
