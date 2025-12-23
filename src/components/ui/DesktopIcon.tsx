'use client';

import { useRef, useCallback } from 'react';
import { useWindowStore, useSettingsStore } from '@/stores';
import { useSounds } from '@/hooks';

interface DesktopIconProps {
  id: string;
  title: string;
  icon: string;
  revealing?: boolean;
}

// Simple SVG icons (we'll add more later)
const IconSvgs: Record<string, React.ReactNode> = {
  Terminal: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 3l3 3-3 3 1.5 1.5L14 12l-4.5-4.5L8 9z" />
    </svg>
  ),
  Folder: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M4 4h6l2 2h8v12H4V4zm2 2v10h12V8h-7l-2-2H6z" />
    </svg>
  ),
  Email: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M4 4h16v16H4V4zm2 2v2l6 4 6-4V6H6zm0 4v6h12v-6l-6 4-6-4z" />
    </svg>
  ),
  Apps: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M4 4h6v6H4V4zm2 2v2h2V6H6zm8-2h6v6h-6V4zm2 2v2h2V6h-2zM4 14h6v6H4v-6zm2 2v2h2v-2H6zm8-2h6v6h-6v-6zm2 2v2h2v-2h-2z" />
    </svg>
  ),
  TrashCan: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M8 4h8v2H8V4zM6 6h12v2H6V6zm1 2h10v12H7V8zm2 2v8h2v-8H9zm4 0v8h2v-8h-2z" />
    </svg>
  ),
  FileDoc: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M6 2h8l4 4v14H6V2zm2 2v14h8V7h-3V4H8zm2 6h6v2h-6v-2zm0 4h6v2h-6v-2z" />
    </svg>
  ),
};

export function DesktopIcon({ id, title, icon, revealing }: DesktopIconProps) {
  const lastClickRef = useRef<{ time: number }>({ time: 0 });

  const position = useWindowStore((state) => state.iconPositions[id]);
  const selectedIcon = useWindowStore((state) => state.selectedIcon);
  const iconDrag = useWindowStore((state) => state.iconDrag);
  const isMobile = useSettingsStore((state) => state.isMobile);

  const { openWindow, setSelectedIcon, setIconPosition, startIconDrag, endIconDrag } = useWindowStore();

  const sounds = useSounds();

  const pos = position || { x: 16, y: 16 };
  const isDragging = iconDrag.active && iconDrag.id === id;
  const isSelected = selectedIcon === id;

  const IconSvg = IconSvgs[icon] || IconSvgs.FileDoc;

  // Handle click/double-click
  const handleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setSelectedIcon(id);

      const now = Date.now();
      const timeSinceLastClick = now - lastClickRef.current.time;

      if (timeSinceLastClick < 300) {
        // Double click - open window
        sounds.windowOpen();
        openWindow(id);
      }

      lastClickRef.current.time = now;
    },
    [id, setSelectedIcon, openWindow, sounds]
  );

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const offsetX = e.clientX - pos.x;
      const offsetY = e.clientY - pos.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newX = moveEvent.clientX - offsetX;
        const newY = moveEvent.clientY - offsetY;
        setIconPosition(id, { x: newX, y: newY });

        if (!iconDrag.active) {
          sounds.dragStart();
          startIconDrag(id, offsetX, offsetY);
        }
      };

      const handleMouseUp = () => {
        if (iconDrag.active) {
          sounds.dragStop();
        }
        endIconDrag();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [id, pos, setIconPosition, startIconDrag, endIconDrag, iconDrag.active, sounds]
  );

  // Handle touch drag
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const offsetX = touch.clientX - pos.x;
      const offsetY = touch.clientY - pos.y;

      let hasMoved = false;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        if (moveEvent.touches.length !== 1) return;
        moveEvent.preventDefault();

        const moveTouch = moveEvent.touches[0];
        const newX = moveTouch.clientX - offsetX;
        const newY = moveTouch.clientY - offsetY;
        setIconPosition(id, { x: newX, y: newY });

        if (!hasMoved) {
          hasMoved = true;
          sounds.dragStart();
          startIconDrag(id, offsetX, offsetY);
        }
      };

      const handleTouchEnd = () => {
        if (hasMoved) {
          sounds.dragStop();
        }
        endIconDrag();
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    },
    [id, pos, setIconPosition, startIconDrag, endIconDrag, sounds]
  );

  return (
    <div
      className={`absolute z-10 group flex flex-col items-center gap-1 cursor-pointer select-none ${
        isMobile ? 'w-16' : 'w-24'
      } ${isDragging ? 'icon-dragging' : ''} ${revealing ? 'animate-fade-in' : ''}`}
      style={{
        left: pos.x,
        top: pos.y,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Icon box */}
      <div
        className={`border-2 border-black icon-shadow group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all ${
          isMobile ? 'p-2' : 'p-3'
        } ${isDragging ? 'translate-x-0 translate-y-0' : ''} ${
          isSelected ? 'bg-black text-white' : 'bg-white'
        }`}
      >
        <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} ${isSelected ? 'invert' : ''}`}>
          {IconSvg}
        </div>
      </div>

      {/* Label */}
      <span
        className={`border border-black px-1 font-mono font-bold shadow-sm ${
          isMobile ? 'text-[8px]' : 'text-[10px]'
        } ${isSelected ? 'bg-black text-white' : 'bg-white'}`}
      >
        {title}
      </span>
    </div>
  );
}
