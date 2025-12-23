import { useState, memo } from 'react';
import { PixelartIcon } from '@/components/ui';

interface BrowserAppProps {
  onOpenApp?: (appId: string) => void;
  onAchievement?: (id: string) => void;
  isMobile?: boolean;
}

interface SearchItem {
  id: string;
  title: string;
  icon: string;
}

export const BrowserApp = memo(({ onOpenApp, onAchievement, isMobile }: BrowserAppProps) => {
  const [url, setUrl] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allItems: SearchItem[] = [
    { id: 'SYSTEM', title: 'SYSTEM_INFO', icon: 'Terminal' },
    { id: 'FILES', title: 'MEDIA_LIB', icon: 'Folder' },
    { id: 'APPS', title: 'APPS', icon: 'Apps' },
    { id: 'CONTACT', title: 'CONTACT', icon: 'Email' },
    { id: 'SNAKE', title: 'SNEK.EXE', icon: 'Snek' },
    { id: 'LABYRINTH', title: 'LABYRINTH.EXE', icon: 'Labyrinth' },
    { id: 'MINESWEEPER', title: 'MINESWEEPER.EXE', icon: 'Minesweeper' },
    { id: 'STARSHIP', title: 'STARSHIP.EXE', icon: 'Starship' },
    { id: 'DICE', title: 'DICE.EXE', icon: 'Dice' },
    { id: 'PAINT', title: 'PAINT.EXE', icon: 'Palette' },
    { id: 'TERMINAL', title: 'TERMINAL.EXE', icon: 'Terminal' },
    { id: 'POMODORO', title: 'POMODORO.EXE', icon: 'Clock' },
    { id: 'RADIO', title: 'RADIO.WAV', icon: 'Music' },
    { id: 'SCANNER', title: 'SCANNER.EXE', icon: 'Heart' },
    { id: 'VOID', title: 'VOID.TXT', icon: 'Star' },
    { id: 'BROWSER', title: 'BROWSER.EXE', icon: 'Globe' },
    { id: 'GALLERY', title: 'GALLERY.EXE', icon: 'Folder' },
    { id: 'MAP', title: 'MAP.EXE', icon: 'Globe' },
    { id: 'PERSONAL', title: 'PRIVATE.EXE', icon: 'Lock' },
    { id: 'DESTRUCTION', title: 'DESTRUCTION.EXE', icon: 'Skull' },
    { id: 'TRASH', title: 'TRASH.BIN', icon: 'Trash' },
    { id: 'END', title: 'END.EXE', icon: 'Trophy' },
    ...(!isMobile ? [
      { id: 'THIRD_EYE', title: 'THIRD_EYE.EXE', icon: 'Eye' },
      { id: 'SYNTH', title: 'SYNTH_001.WAV', icon: 'Music' },
      { id: 'TAROT', title: 'TAROT.DAT', icon: 'Star' }
    ] : [])
  ];

  const filteredItems = url.trim()
    ? allItems.filter(item =>
        item.title.toLowerCase().includes(url.toLowerCase()) ||
        item.id.toLowerCase().includes(url.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (normalized === 'mateusmuste.com' || normalized === 'www.mateusmuste.com') {
      onAchievement?.('INCEPTION');
      window.location.reload();
    }
  };

  const handleSelect = (item: SearchItem) => {
    if (onOpenApp) onOpenApp(item.id);
    setUrl('');
    setShowSuggestions(false);
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="p-2 border-b-2 border-black bg-gray-100 flex items-center gap-2">
        <button className="p-1 border-2 border-black bg-white hover:bg-black hover:text-white" disabled>
          <PixelartIcon name="ArrowLeft" size={16} />
        </button>
        <form onSubmit={handleSubmit} className="flex-grow relative">
          <input
            type="text"
            aria-label="Browser address bar - search apps or enter URL"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search apps, be zen."
            className="w-full px-3 py-1 border-2 border-black font-mono text-sm focus:outline-none"
          />
          {showSuggestions && filteredItems.length > 0 && (
            <div className="absolute top-full left-0 right-0 border-2 border-t-0 border-black bg-white z-50 max-h-64 overflow-y-auto">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-black hover:text-white border-b border-gray-200 last:border-b-0"
                >
                  <PixelartIcon name={item.icon as any} size={16} />
                  <span className="font-mono text-xs">{item.title}</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 p-6">
        <PixelartIcon name="Globe" size={64} />
        <div className="font-mono text-lg font-bold mt-4 mb-2">ZEN</div>
        <div className="font-mono text-xs text-gray-500 text-center max-w-xs">
          Search for apps
        </div>
        <div className="mt-8 font-mono text-[8px] text-gray-200 tracking-widest select-none">
          ↑↑↓↓←→←→BA
        </div>
      </div>
      <div className="app-footer">
        <span className="app-footer-text">SEARCH - NAVIGATE - DISCOVER</span>
      </div>
    </div>
  );
});

BrowserApp.displayName = 'BrowserApp';

export default BrowserApp;
