import { useState, useEffect, memo } from 'react';

interface RadioAppProps {
  onAchievement?: (id: string) => void;
}

export const RadioApp = memo(({ onAchievement }: RadioAppProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizer, setVisualizer] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setVisualizer(Array(16).fill(0).map(() => Math.random() * 100));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const openPlaylist = () => {
    window.open('https://music.youtube.com/playlist?list=PLeIQRsOWZUhKaD53FTvwZCxsNWzjq0lfO&si=92O5A6kAPjk8Vzmg', '_blank', 'noopener,noreferrer');
    setIsPlaying(true);
    onAchievement?.('TUNED_IN');
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">RADIO.WAV</span>
        <span className="app-footer-text">MATEUS_PLAYLIST</span>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="flex items-end justify-center gap-1 h-32 mb-8 p-4 border-2 border-black bg-white">
          {(isPlaying ? visualizer : Array(16).fill(10)).map((h, i) => (
            <div
              key={i}
              className="w-3 bg-black transition-all duration-100"
              style={{ height: `${h}%`, minHeight: '4px' }}
            />
          ))}
        </div>
        <button
          onClick={openPlaylist}
          className="btn-primary btn-lg"
        >
          {isPlaying ? '► NOW PLAYING' : '► TUNE IN'}
        </button>
        <div className="mt-4 font-mono text-xs text-gray-500">
          OPENS YOUTUBE MUSIC
        </div>
      </div>
      <div className="p-2 border-t-2 border-black bg-white">
        <div className="font-mono text-[10px] text-gray-500 text-center">
          BROADCASTING FROM THE VOID
        </div>
      </div>
    </div>
  );
});

RadioApp.displayName = 'RadioApp';

export default RadioApp;
