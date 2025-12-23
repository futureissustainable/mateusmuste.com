'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface RadioAppProps {
  onAchievement?: (id: string) => void;
}

interface Station {
  id: string;
  name: string;
  genre: string;
  url: string;
}

// Internet radio stations (public streams)
const STATIONS: Station[] = [
  {
    id: 'lofi',
    name: 'LOFI_BEATS',
    genre: 'CHILL',
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
  },
  {
    id: 'jazz',
    name: 'JAZZ_FM',
    genre: 'JAZZ',
    url: 'https://strm112.1.fm/ajazz_mobile_mp3',
  },
  {
    id: 'electronic',
    name: 'TECHNO_WAVE',
    genre: 'ELECTRONIC',
    url: 'https://strm112.1.fm/electronica_mobile_mp3',
  },
  {
    id: 'ambient',
    name: 'AMBIENT_SPACE',
    genre: 'AMBIENT',
    url: 'https://strm112.1.fm/ambient_mobile_mp3',
  },
  {
    id: 'classical',
    name: 'CLASSICAL_101',
    genre: 'CLASSICAL',
    url: 'https://strm112.1.fm/classical_mobile_mp3',
  },
];

export function RadioApp({ onAchievement }: RadioAppProps) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listenTime, setListenTime] = useState(0);
  const achievementTriggered = useRef(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Create audio element on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = 'anonymous';
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Listen time tracker
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setListenTime((t) => {
          const newTime = t + 1;
          if (newTime >= 60 && !achievementTriggered.current) {
            achievementTriggered.current = true;
            onAchievement?.('RADIO_HEAD');
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, onAchievement]);

  const playStation = useCallback(async (station: Station) => {
    if (!audioRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      audioRef.current.pause();
      audioRef.current.src = station.url;

      audioRef.current.oncanplay = () => {
        setIsLoading(false);
        audioRef.current?.play();
        setIsPlaying(true);
      };

      audioRef.current.onerror = () => {
        setIsLoading(false);
        setError('STREAM UNAVAILABLE');
        setIsPlaying(false);
      };

      await audioRef.current.load();
      setCurrentStation(station);
    } catch {
      setIsLoading(false);
      setError('CONNECTION FAILED');
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (currentStation) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentStation]);

  const stopPlayback = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = '';
    setIsPlaying(false);
    setCurrentStation(null);
    setError(null);
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">RADIO.WAV</span>
        <div className="flex gap-2 font-mono text-xs">
          <span className="text-gray-500">LISTENED: {formatTime(listenTime)}</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-gray-50">
        {/* Current station display */}
        <div className="p-4 bg-black text-white border-b-2 border-black">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-mono text-lg font-bold tracking-wider">
                {currentStation ? currentStation.name : 'NO SIGNAL'}
              </div>
              <div className="font-mono text-xs text-gray-400">
                {currentStation ? currentStation.genre : 'SELECT A STATION'}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isLoading && (
                <div className="font-mono text-xs text-yellow-400 animate-pulse">BUFFERING...</div>
              )}
              {error && <div className="font-mono text-xs text-red-400">{error}</div>}
              {isPlaying && !isLoading && (
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-green-400"
                      style={{
                        height: `${8 + Math.random() * 12}px`,
                        animation: 'pulse 0.3s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center gap-4 border-b-2 border-gray-200">
          <button
            onClick={togglePlayPause}
            disabled={!currentStation || isLoading}
            className={`w-12 h-12 border-2 border-black font-bold text-xl flex items-center justify-center ${
              !currentStation || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white hover:bg-black hover:text-white'
            }`}
          >
            {isPlaying ? '||' : '|>'}
          </button>
          <button
            onClick={stopPlayback}
            disabled={!currentStation}
            className={`w-12 h-12 border-2 border-black font-bold text-xl flex items-center justify-center ${
              !currentStation
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white hover:bg-black hover:text-white'
            }`}
          >
            []
          </button>

          <div className="flex-grow flex items-center gap-2">
            <span className="font-mono text-xs">VOL</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-grow"
            />
            <span className="font-mono text-xs w-8">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Station list */}
        <div className="flex-grow overflow-auto p-2">
          {STATIONS.map((station) => (
            <button
              key={station.id}
              onClick={() => playStation(station)}
              className={`w-full p-3 mb-2 border-2 text-left transition-colors ${
                currentStation?.id === station.id
                  ? 'border-black bg-black text-white'
                  : 'border-black bg-white hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-mono text-sm font-bold">{station.name}</div>
                  <div className="font-mono text-[10px] text-gray-500">{station.genre}</div>
                </div>
                {currentStation?.id === station.id && isPlaying && (
                  <div className="font-mono text-[10px]">NOW PLAYING</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="app-footer">
        <span className="text-gray-500 text-xs">SELECT STATION - ADJUST VOLUME - ENJOY</span>
      </div>
    </div>
  );
}
