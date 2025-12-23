'use client';

import { useState } from 'react';

interface BrowserAppProps {
  onAchievement?: (id: string) => void;
}

export function BrowserApp({ onAchievement }: BrowserAppProps) {
  const [url, setUrl] = useState('ultraint://home');
  const [history, setHistory] = useState<string[]>(['ultraint://home']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pages: Record<string, { title: string; content: React.ReactNode }> = {
    'ultraint://home': {
      title: 'ULTRAINT HOME',
      content: (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">*</div>
          <h1 className="text-2xl font-bold mb-2">ULTRAINT BROWSER</h1>
          <p className="text-gray-500 text-sm mb-8">THE INTERNAL NETWORK</p>
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            <button
              onClick={() => navigate('ultraint://about')}
              className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors text-left"
            >
              → ABOUT THIS SYSTEM
            </button>
            <button
              onClick={() => navigate('ultraint://secrets')}
              className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors text-left"
            >
              → HIDDEN PAGES
            </button>
            <button
              onClick={() => navigate('ultraint://konami')}
              className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors text-left"
            >
              → KONAMI by zen
            </button>
          </div>
        </div>
      ),
    },
    'ultraint://about': {
      title: 'ABOUT',
      content: (
        <div className="p-6">
          <h1 className="text-xl font-bold mb-4">ABOUT ULTRAINT</h1>
          <p className="text-sm leading-relaxed mb-4">
            ULTRAINT is an experimental operating system built entirely in the browser.
          </p>
          <p className="text-sm leading-relaxed mb-4">
            It was created by Mateus Muste as a portfolio piece, but became something more:
            an exploration of what interfaces could be.
          </p>
          <p className="text-sm leading-relaxed">
            Every app, every interaction, every hidden secret was crafted with care.
          </p>
        </div>
      ),
    },
    'ultraint://secrets': {
      title: 'SECRETS',
      content: (
        <div className="p-6">
          <h1 className="text-xl font-bold mb-4">HIDDEN PAGES</h1>
          <p className="text-sm text-gray-500 mb-4">Some pages are not linked...</p>
          <ul className="text-sm space-y-2">
            <li>
              <button
                onClick={() => navigate('ultraint://void')}
                className="text-blue-600 hover:underline"
              >
                ultraint://void
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('ultraint://matrix')}
                className="text-blue-600 hover:underline"
              >
                ultraint://matrix
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('ultraint://end')}
                className="text-blue-600 hover:underline"
              >
                ultraint://end
              </button>
            </li>
          </ul>
        </div>
      ),
    },
    'ultraint://konami': {
      title: 'KONAMI',
      content: (
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">↑ ↑ ↓ ↓ ← → ← → B A</div>
          <h1 className="text-xl font-bold mb-2">KONAMI CODE</h1>
          <p className="text-sm text-gray-500">
            Some secrets require the right combination.
          </p>
        </div>
      ),
    },
    'ultraint://void': {
      title: 'VOID',
      content: (
        <div className="h-full bg-black flex items-center justify-center">
          <div className="text-gray-800 text-xs">THERE IS NOTHING HERE</div>
        </div>
      ),
    },
    'ultraint://matrix': {
      title: 'MATRIX',
      content: (
        <div className="p-6 bg-black text-green-400 font-mono">
          <p className="mb-2">WAKE UP...</p>
          <p className="mb-2">THE MATRIX HAS YOU...</p>
          <p className="mb-2">FOLLOW THE WHITE RABBIT.</p>
          <p className="text-green-600">KNOCK KNOCK.</p>
        </div>
      ),
    },
    'ultraint://end': {
      title: 'END',
      content: (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">FIN</div>
            <p className="text-gray-500 text-sm">You've reached the end of the internet.</p>
          </div>
        </div>
      ),
    },
  };

  const navigate = (newUrl: string) => {
    setUrl(newUrl);
    const newHistory = [...history.slice(0, historyIndex + 1), newUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setUrl(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setUrl(history[historyIndex + 1]);
    }
  };

  const currentPage = pages[url] || {
    title: '404',
    content: (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <p className="text-gray-500">PAGE NOT FOUND</p>
        </div>
      </div>
    ),
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      {/* Browser toolbar */}
      <div className="h-10 px-2 flex items-center gap-2 border-b-2 border-black bg-gray-100">
        <button
          onClick={goBack}
          disabled={historyIndex === 0}
          className={`w-8 h-8 flex items-center justify-center ${
            historyIndex === 0 ? 'text-gray-300' : 'hover:bg-gray-200'
          }`}
        >
          ←
        </button>
        <button
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
          className={`w-8 h-8 flex items-center justify-center ${
            historyIndex === history.length - 1 ? 'text-gray-300' : 'hover:bg-gray-200'
          }`}
        >
          →
        </button>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && navigate(url)}
          className="flex-grow px-2 py-1 border-2 border-black font-mono text-xs"
        />
      </div>

      {/* Page title */}
      <div className="h-8 px-4 flex items-center border-b border-gray-200 bg-gray-50">
        <span className="font-mono text-xs font-bold">{currentPage.title}</span>
      </div>

      {/* Page content */}
      <div className="flex-grow overflow-auto">{currentPage.content}</div>
    </div>
  );
}
