'use client';

import { useState, useEffect, useRef } from 'react';

interface ScannerAppProps {
  onAchievement?: (id: string) => void;
}

interface ScanResult {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'error';
}

export function ScannerApp({ onAchievement }: ScannerAppProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const achievementTriggered = useRef(false);

  const runScan = () => {
    setScanning(true);
    setProgress(0);
    setResults([]);

    const scanItems: ScanResult[] = [
      { label: 'MEMORY ALLOCATION', value: `${Math.floor(Math.random() * 500 + 100)}MB / 2048MB`, status: 'ok' },
      { label: 'CPU TEMPERATURE', value: `${Math.floor(Math.random() * 30 + 50)}°C`, status: Math.random() > 0.3 ? 'ok' : 'warning' },
      { label: 'DISK HEALTH', value: `${Math.floor(Math.random() * 20 + 80)}%`, status: 'ok' },
      { label: 'NETWORK LATENCY', value: `${Math.floor(Math.random() * 100 + 10)}ms`, status: 'ok' },
      { label: 'SECURITY STATUS', value: 'PROTECTED', status: 'ok' },
      { label: 'HIDDEN FILES', value: `${Math.floor(Math.random() * 10)} FOUND`, status: Math.random() > 0.5 ? 'warning' : 'ok' },
      { label: 'SYSTEM INTEGRITY', value: 'VERIFIED', status: 'ok' },
      { label: 'BACKGROUND PROCESSES', value: `${Math.floor(Math.random() * 50 + 10)} ACTIVE`, status: 'ok' },
      { label: 'REGISTRY ERRORS', value: `${Math.floor(Math.random() * 5)}`, status: Math.random() > 0.7 ? 'error' : 'ok' },
      { label: 'THREAT DETECTION', value: 'CLEAR', status: 'ok' },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < scanItems.length) {
        setResults((prev) => [...prev, scanItems[idx]]);
        setProgress(((idx + 1) / scanItems.length) * 100);
        idx++;
      } else {
        clearInterval(interval);
        setScanning(false);
        if (!achievementTriggered.current) {
          achievementTriggered.current = true;
          onAchievement?.('DIAGNOSTICIAN');
        }
      }
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono select-none">
      <div className="h-10 px-4 flex justify-between items-center border-b border-green-900">
        <span className="text-[10px] tracking-widest">SCANNER.EXE</span>
        <span className="text-[10px]">SYSTEM DIAGNOSTICS</span>
      </div>

      <div className="flex-grow overflow-auto p-4">
        {results.length === 0 && !scanning && (
          <div className="flex flex-col items-center justify-center h-full">
            <pre className="text-center text-[10px] mb-8 text-green-600">
{`
 ____   ____    _    _   _
/ ___| / ___|  / \\  | \\ | |
\\___ \\| |     / _ \\ |  \\| |
 ___) | |___ / ___ \\| |\\  |
|____/ \\____/_/   \\_\\_| \\_|

SYSTEM HEALTH SCANNER v1.0
`}
            </pre>
            <button
              onClick={runScan}
              className="px-8 py-3 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors"
            >
              START SCAN
            </button>
          </div>
        )}

        {(scanning || results.length > 0) && (
          <div className="space-y-2">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="text-[10px] mb-1">
                {scanning ? 'SCANNING...' : 'SCAN COMPLETE'}
              </div>
              <div className="h-2 bg-green-900 border border-green-700">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Results */}
            {results.map((result, i) => (
              <div key={i} className="flex justify-between text-[10px] border-b border-green-900 pb-1">
                <span className="text-green-600">{result.label}</span>
                <span className={getStatusColor(result.status)}>{result.value}</span>
              </div>
            ))}

            {/* Summary */}
            {!scanning && results.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-700">
                <div className="text-[10px] text-center">
                  SCAN COMPLETE<br />
                  {results.filter((r) => r.status === 'ok').length} OK / {' '}
                  {results.filter((r) => r.status === 'warning').length} WARNINGS / {' '}
                  {results.filter((r) => r.status === 'error').length} ERRORS
                </div>
                <button
                  onClick={runScan}
                  className="mt-4 w-full py-2 border border-green-700 hover:bg-green-900 transition-colors text-[10px]"
                >
                  RUN AGAIN
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
