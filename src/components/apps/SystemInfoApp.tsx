'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface SystemInfoAppProps {
  onAchievement?: (id: string) => void;
}

// Dynamically import Three.js background
const ThreeBackground = dynamic(
  () => import('./ThreeBackgroundInner').then((mod) => mod.ThreeBackgroundInner),
  { ssr: false }
);

interface SystemInfo {
  browser: string;
  platform: string;
  language: string;
  screenRes: string;
  colorDepth: number;
  touchPoints: number;
  memory: string;
  cores: number;
  timezone: string;
  online: boolean;
  cookiesEnabled: boolean;
}

export function SystemInfoApp({ onAchievement }: SystemInfoAppProps) {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    // Gather system info
    const nav = navigator as Navigator & { deviceMemory?: number };
    const systemInfo: SystemInfo = {
      browser: navigator.userAgent.includes('Chrome')
        ? 'CHROME'
        : navigator.userAgent.includes('Firefox')
          ? 'FIREFOX'
          : navigator.userAgent.includes('Safari')
            ? 'SAFARI'
            : 'UNKNOWN',
      platform: navigator.platform.toUpperCase(),
      language: navigator.language.toUpperCase(),
      screenRes: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      touchPoints: navigator.maxTouchPoints,
      memory: nav.deviceMemory ? `${nav.deviceMemory}GB` : 'UNKNOWN',
      cores: navigator.hardwareConcurrency || 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone.toUpperCase(),
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
    };
    setInfo(systemInfo);

    // Trigger achievement
    onAchievement?.('SYSTEM_SCAN');
  }, [onAchievement]);

  // Uptime counter
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime((u) => u + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-black select-none relative overflow-hidden">
      {/* Three.js background */}
      <div className="absolute inset-0 opacity-20">
        <ThreeBackground />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="h-10 px-4 flex justify-between items-center border-b border-gray-800">
          <span className="font-mono text-[10px] font-bold tracking-widest text-green-400">
            SYSTEM_INFO
          </span>
          <span className="font-mono text-[10px] text-green-400">UPTIME: {formatUptime(uptime)}</span>
        </div>

        <div className="flex-grow p-4 overflow-auto">
          {info ? (
            <div className="grid gap-3">
              {Object.entries(info).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="font-mono text-[10px] text-gray-500">
                    {key.replace(/([A-Z])/g, '_$1').toUpperCase()}
                  </span>
                  <span className="font-mono text-[10px] text-green-400 font-bold">
                    {typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="font-mono text-[10px] text-green-400 animate-pulse">
              SCANNING SYSTEM...
            </div>
          )}
        </div>

        <div className="h-8 px-4 flex items-center border-t border-gray-800">
          <span className="font-mono text-[10px] text-gray-600">
            v1.0.0 // ALL SYSTEMS NOMINAL
          </span>
        </div>
      </div>
    </div>
  );
}
