import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { PixelartIcon } from '@/components/ui';

interface BackupBatAppProps {
  onUnlockApp?: (appId: string) => void;
}

const BACKUP_LOG = [
  '[0001] init system',
  '[0002] create /apps',
  '[0003] create /private',
  '[0004] hide truth.exe',
  '[0005] set password truth.exe "patience"',
  '[0006] clear history',
  '[ERROR] HISTORY CLEAR FAILED',
  '[0007] sudo forget',
  '[0008] ...'
];

export const BackupBatApp = memo(({ onUnlockApp }: BackupBatAppProps) => {
  const [logLines, setLogLines] = useState<string[]>([]);
  const [loopComplete, setLoopComplete] = useState(false);
  const mountedRef = useRef(true);
  const loopCompleteRef = useRef(false);
  const onUnlockAppRef = useRef(onUnlockApp);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onUnlockAppRef.current = onUnlockApp;
  }, [onUnlockApp]);

  useEffect(() => {
    mountedRef.current = true;
    let lineIndex = 0;

    const addLine = () => {
      if (!mountedRef.current) return;

      if (lineIndex < BACKUP_LOG.length) {
        const currentLine = BACKUP_LOG[lineIndex];
        if (currentLine !== undefined) {
          setLogLines(prev => {
            if (!mountedRef.current) return prev;
            return [...prev, currentLine];
          });
        }
        lineIndex++;
        timerRef.current = setTimeout(addLine, 500 + Math.random() * 500);
      } else if (!loopCompleteRef.current) {
        loopCompleteRef.current = true;
        requestAnimationFrame(() => {
          if (!mountedRef.current) return;
          setLoopComplete(true);
          unlockTimerRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            if (onUnlockAppRef.current && typeof onUnlockAppRef.current === 'function') {
              onUnlockAppRef.current('TAROT');
            }
          }, 1000);
        });
      }
    };

    timerRef.current = setTimeout(addLine, 500);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    };
  }, []);

  const renderedLines = useMemo(() => {
    return logLines.map((line, i) => {
      const lineText = String(line || '');
      const isError = lineText.includes('ERROR');
      return (
        <div key={i} className={isError ? 'text-red-400' : 'text-green-400'}>
          {lineText}
        </div>
      );
    });
  }, [logLines]);

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm select-none">
      <div className="p-2 border-b border-green-900 flex items-center gap-2">
        <PixelartIcon name="Terminal" size={16} />
        <span className="text-xs font-bold">BACKUP.BAT</span>
        {loopComplete && <span className="text-white text-xs ml-auto">LOOP COMPLETE</span>}
      </div>
      <div className="flex-grow overflow-auto p-3 space-y-1">
        <div className="text-green-600 mb-2">ACCESSING DEEP ARCHIVES...</div>
        {renderedLines}
        <span className="inline-block w-2 h-3 bg-green-400 animate-pulse" />
      </div>
    </div>
  );
});

BackupBatApp.displayName = 'BackupBatApp';

export default BackupBatApp;
