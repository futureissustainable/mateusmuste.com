'use client';

import { useState, useEffect, useRef } from 'react';

interface BackupAppProps {
  onAchievement?: (id: string) => void;
}

export function BackupApp({ onAchievement }: BackupAppProps) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const backupMessages = [
    'Initializing backup sequence...',
    'Scanning memory sectors...',
    'Found 47,382 memories',
    'Compressing emotional data...',
    'Encrypting personal thoughts...',
    'Backing up dreams (23 found)...',
    'Archiving regrets...',
    'Cataloging hopes...',
    'Storing unfinished projects...',
    'Saving creative sparks...',
    'Preserving sense of wonder...',
    'Backing up favorite moments...',
    'Archiving lessons learned...',
    'Storing growth patterns...',
    'Finalizing consciousness snapshot...',
    'Backup complete.',
  ];

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const startBackup = () => {
    setRunning(true);
    setProgress(0);
    setLogs([]);
    setComplete(false);

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < backupMessages.length) {
        setLogs((prev) => [...prev, backupMessages[messageIndex]]);
        setProgress(((messageIndex + 1) / backupMessages.length) * 100);
        messageIndex++;
      } else {
        clearInterval(interval);
        setRunning(false);
        setComplete(true);
        onAchievement?.('BACKUP_COMPLETE');
      }
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono select-none">
      <div className="h-8 px-4 flex items-center border-b border-green-900">
        <span className="text-[10px] tracking-widest">BACKUP.BAT</span>
      </div>

      <div className="flex-grow overflow-auto p-4">
        {!running && !complete && logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center">
            <pre className="text-center text-xs mb-8 text-green-600">
{`
 ____    _    ____ _  ___   _ ____
| __ )  / \\  / ___| |/ / | | |  _ \\
|  _ \\ / _ \\| |   | ' /| | | | |_) |
| |_) / ___ \\ |___| . \\| |_| |  __/
|____/_/   \\_\\____|_|\\_\\\\___/|_|

CONSCIOUSNESS BACKUP UTILITY v1.0
`}
            </pre>
            <p className="text-xs text-green-600 mb-8 text-center max-w-sm">
              This utility will create a complete backup of your current mental state,
              including memories, dreams, and unfinished thoughts.
            </p>
            <button
              onClick={startBackup}
              className="px-8 py-3 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors"
            >
              START BACKUP
            </button>
          </div>
        )}

        {(running || complete || logs.length > 0) && (
          <div className="space-y-1 text-xs">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-green-600">[{String(i + 1).padStart(2, '0')}]</span>
                <span>{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}

        {complete && (
          <div className="mt-8 text-center">
            <div className="text-2xl mb-4">✓</div>
            <p className="text-sm">BACKUP SAVED TO: /dev/null</p>
            <p className="text-xs text-green-600 mt-2">
              (Your consciousness has been preserved... somewhere)
            </p>
            <button
              onClick={() => {
                setLogs([]);
                setComplete(false);
                setProgress(0);
              }}
              className="mt-6 px-4 py-2 border border-green-700 hover:bg-green-900 text-xs"
            >
              RUN AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {running && (
        <div className="h-8 px-4 flex items-center gap-4 border-t border-green-900">
          <span className="text-xs">PROGRESS:</span>
          <div className="flex-grow h-2 bg-green-900 border border-green-700">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs w-12">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
