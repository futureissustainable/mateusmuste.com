'use client';

import { useEffect, useRef } from 'react';

interface EndAppProps {
  onAchievement?: (id: string) => void;
  achievementCount?: number;
  totalAchievements?: number;
}

export function EndApp({ onAchievement, achievementCount = 0, totalAchievements = 31 }: EndAppProps) {
  const completionPercent = Math.round((achievementCount / totalAchievements) * 100);

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">END.EXE</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-6">🏆</div>
        <h1 className="text-3xl font-black mb-2">CONGRATULATIONS</h1>
        <p className="text-gray-500 mb-8">You've explored ULTRAINT</p>

        {/* Progress circle */}
        <div className="relative w-32 h-32 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e5e5"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#000"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 * (1 - completionPercent / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{completionPercent}%</span>
            <span className="text-xs text-gray-500">COMPLETE</span>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {achievementCount} / {totalAchievements} achievements unlocked
        </div>

        {completionPercent >= 100 ? (
          <div className="bg-yellow-100 border-2 border-yellow-400 px-6 py-4 max-w-sm">
            <div className="font-bold text-yellow-700 mb-2">PERFECT SCORE</div>
            <p className="text-sm text-yellow-600">
              You found everything. Every secret. Every achievement.
              You are a true explorer.
            </p>
          </div>
        ) : completionPercent >= 75 ? (
          <div className="bg-green-100 border-2 border-green-400 px-6 py-4 max-w-sm">
            <div className="font-bold text-green-700 mb-2">ALMOST THERE</div>
            <p className="text-sm text-green-600">
              You've discovered most of what ULTRAINT has to offer.
              A few secrets remain...
            </p>
          </div>
        ) : completionPercent >= 50 ? (
          <div className="bg-blue-100 border-2 border-blue-400 px-6 py-4 max-w-sm">
            <div className="font-bold text-blue-700 mb-2">HALFWAY THERE</div>
            <p className="text-sm text-blue-600">
              You're making good progress. Keep exploring.
              There's more to find.
            </p>
          </div>
        ) : (
          <div className="bg-gray-100 border-2 border-gray-400 px-6 py-4 max-w-sm">
            <div className="font-bold text-gray-700 mb-2">JUST GETTING STARTED</div>
            <p className="text-sm text-gray-600">
              There's so much more to discover.
              Try the games. Read the files. Use the terminal.
            </p>
          </div>
        )}
      </div>

      <div className="app-footer">
        <span className="text-gray-500 text-xs">THANKS FOR VISITING</span>
      </div>
    </div>
  );
}
