'use client';

import { useWindowStore, useSettingsStore } from '@/stores';
import { useSounds } from '@/hooks';

export function Taskbar() {
  const windows = useWindowStore((state) => state.windows);
  const { openWindow, focusWindow } = useWindowStore();
  const isMobile = useSettingsStore((state) => state.isMobile);
  const isMuted = useSettingsStore((state) => state.isMuted);
  const toggleMute = useSettingsStore((state) => state.toggleMute);

  const sounds = useSounds();

  // Get open windows for taskbar
  const openWindows = Object.values(windows).filter((w) => w.isOpen);

  const handleWindowClick = (id: string, isMin: boolean) => {
    if (isMin) {
      sounds.windowOpen();
      openWindow(id);
    } else {
      focusWindow(id);
    }
  };

  const handleMuteToggle = () => {
    sounds.click();
    toggleMute();
  };

  // Mobile: top taskbar
  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9000] bg-white border-b-2 border-black flex items-center justify-between px-2 py-1 mobile-taskbar-top">
        <div className="font-heading text-sm font-bold">MATEUS MUSTE</div>

        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={handleMuteToggle}
            className="px-2 py-1 border border-black text-xs font-bold"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    );
  }

  // Desktop: bottom taskbar
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9000] bg-white border-t-2 border-black flex items-center justify-between px-4 py-2">
      {/* Left: OS Name */}
      <div className="flex items-center gap-4">
        <div className="font-heading text-base font-bold tracking-tight">MATEUS MUSTE</div>
        <div className="w-px h-6 bg-black" />
      </div>

      {/* Center: Open windows */}
      <div className="flex-1 flex items-center gap-2 px-4 overflow-x-auto">
        {openWindows.map((win) => (
          <button
            key={win.id}
            onClick={() => handleWindowClick(win.id, win.isMin)}
            className={`px-3 py-1 border border-black text-xs font-bold truncate max-w-[120px] ${
              win.isMin ? 'bg-gray-200 text-gray-500' : 'bg-white hover:bg-gray-100'
            }`}
          >
            {win.title}
          </button>
        ))}
      </div>

      {/* Right: System controls */}
      <div className="flex items-center gap-2">
        {/* Mute toggle */}
        <button
          onClick={handleMuteToggle}
          className="px-2 py-1 border border-black text-xs font-bold hover:bg-gray-100"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
