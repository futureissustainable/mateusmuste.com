import { useEffect, useRef, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';

interface TruthAppProps {
  onAchievement?: (id: string) => void;
  onOpenTruthMessages?: () => void;
  godModeCompleted?: boolean;
}

export const TruthApp = memo(({ onOpenTruthMessages, godModeCompleted }: TruthAppProps) => {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (godModeCompleted && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      for (let i = 0; i < 10; i++) {
        setTimeout(() => sounds.truthReveal(), i * 15);
      }
      setTimeout(() => onOpenTruthMessages?.(), 500);
    }
  }, [godModeCompleted, onOpenTruthMessages]);

  if (godModeCompleted) {
    return (
      <div className="h-full flex flex-col bg-black select-none">
        <div className="p-2 border-b border-green-900 bg-black flex items-center gap-2">
          <PixelartIcon name="Folder" size={16} />
          <span className="font-mono text-xs font-bold text-green-500">TRUTH.EXE</span>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="mb-4 text-green-500 animate-pulse">
            <PixelartIcon name="Folder" size={48} />
          </div>
          <div className="font-mono text-green-500 text-sm font-bold mb-2">ACCESSING TRUTH...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black select-none">
      <div className="p-2 border-b border-red-900 bg-black flex items-center gap-2">
        <PixelartIcon name="Folder" size={16} />
        <span className="font-mono text-xs font-bold text-red-500">TRUTH.EXE</span>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="mb-4 text-red-500">
          <PixelartIcon name="Folder" size={48} />
        </div>
        <div className="font-mono text-red-500 text-lg font-bold mb-2">FILE MISSING</div>
      </div>
    </div>
  );
});

TruthApp.displayName = 'TruthApp';

export default TruthApp;
