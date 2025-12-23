'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useWindowStore, useSettingsStore } from '@/stores';
import { useSounds } from '@/hooks';

interface WindowProps {
  id: string;
  children: React.ReactNode;
}

export function Window({ id, children }: WindowProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });

  const window = useWindowStore((state) => state.windows[id]);
  const drag = useWindowStore((state) => state.drag);
  const animation = useWindowStore((state) => state.windowAnimations[id]);
  const physics = useWindowStore((state) => state.windowPhysics[id]);
  const isMobile = useSettingsStore((state) => state.isMobile);

  const {
    closeWindow,
    minimizeWindow,
    focusWindow,
    updateWindowPosition,
    startDrag,
    endDrag,
    setWindowVelocity,
    initWindowPhysics,
  } = useWindowStore();

  const sounds = useSounds();

  // Initialize physics for this window
  useEffect(() => {
    if (window?.isOpen) {
      initWindowPhysics(id);
    }
  }, [id, window?.isOpen, initWindowPhysics]);

  // Get scaled size based on viewport
  const getScaledSize = useCallback(() => {
    if (typeof globalThis.window === 'undefined') {
      return { w: window?.w || 400, h: window?.h || 300 };
    }

    const vw = globalThis.window.innerWidth;
    const vh = globalThis.window.innerHeight;
    const baseWidth = 1920;
    const baseHeight = 1080;

    const scaleX = vw / baseWidth;
    const scaleY = vh / baseHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    const scaledW = Math.max(280, Math.round((window?.w || 400) * scale));
    const scaledH = Math.max(200, Math.round((window?.h || 300) * scale));

    const maxW = vw - 40;
    const maxH = vh - 80;

    return {
      w: Math.min(scaledW, maxW),
      h: Math.min(scaledH, maxH),
    };
  }, [window?.w, window?.h]);

  const scaled = getScaledSize();

  // Mouse down on header - start drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!window) return;

      e.preventDefault();
      focusWindow(id);
      sounds.dragStart();

      const offsetX = e.clientX - window.x;
      const offsetY = e.clientY - window.y;

      lastMousePos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      startDrag(id, offsetX, offsetY);
    },
    [id, window, focusWindow, startDrag, sounds]
  );

  // Touch start on header
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!window || e.touches.length !== 1) return;

      focusWindow(id);
      sounds.dragStart();

      const touch = e.touches[0];
      const offsetX = touch.clientX - window.x;
      const offsetY = touch.clientY - window.y;

      lastMousePos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      startDrag(id, offsetX, offsetY);
    },
    [id, window, focusWindow, startDrag, sounds]
  );

  // Global mouse move for dragging
  useEffect(() => {
    if (drag.id !== id) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - drag.offsetX;
      const newY = e.clientY - drag.offsetY;

      // Calculate velocity for physics
      const now = Date.now();
      const dt = Math.max(1, now - lastMousePos.current.time);
      const velX = ((e.clientX - lastMousePos.current.x) / dt) * 16; // Scale to ~60fps
      const velY = ((e.clientY - lastMousePos.current.y) / dt) * 16;

      lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
      updateWindowPosition(id, newX, newY);
      setWindowVelocity(id, velX, velY);
    };

    const handleMouseUp = () => {
      sounds.dragStop();
      endDrag();
    };

    globalThis.window.addEventListener('mousemove', handleMouseMove);
    globalThis.window.addEventListener('mouseup', handleMouseUp);

    return () => {
      globalThis.window.removeEventListener('mousemove', handleMouseMove);
      globalThis.window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drag.id, drag.offsetX, drag.offsetY, id, updateWindowPosition, setWindowVelocity, endDrag, sounds]);

  // Global touch move for dragging
  useEffect(() => {
    if (drag.id !== id) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const newX = touch.clientX - drag.offsetX;
      const newY = touch.clientY - drag.offsetY;

      const now = Date.now();
      const dt = Math.max(1, now - lastMousePos.current.time);
      const velX = ((touch.clientX - lastMousePos.current.x) / dt) * 16;
      const velY = ((touch.clientY - lastMousePos.current.y) / dt) * 16;

      lastMousePos.current = { x: touch.clientX, y: touch.clientY, time: now };
      updateWindowPosition(id, newX, newY);
      setWindowVelocity(id, velX, velY);
    };

    const handleTouchEnd = () => {
      sounds.dragStop();
      endDrag();
    };

    globalThis.window.addEventListener('touchmove', handleTouchMove, { passive: false });
    globalThis.window.addEventListener('touchend', handleTouchEnd);

    return () => {
      globalThis.window.removeEventListener('touchmove', handleTouchMove);
      globalThis.window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [drag.id, drag.offsetX, drag.offsetY, id, updateWindowPosition, setWindowVelocity, endDrag, sounds]);

  const handleClose = useCallback(() => {
    sounds.windowClose();
    closeWindow(id);
  }, [id, closeWindow, sounds]);

  const handleMinimize = useCallback(() => {
    minimizeWindow(id);
  }, [id, minimizeWindow]);

  const handleFocus = useCallback(() => {
    focusWindow(id);
  }, [id, focusWindow]);

  if (!window || !window.isOpen || window.isMin) {
    return null;
  }

  // Animation classes
  let animationClass = '';
  if (animation === 'opening') {
    animationClass = 'animate-window-fold-in';
  } else if (animation === 'closing') {
    animationClass = 'animate-window-fold-out';
  }

  // Physics transform
  const scaleX = physics?.scaleX || 1;
  const scaleY = physics?.scaleY || 1;
  const physicsTransform = scaleX !== 1 || scaleY !== 1 ? `scale(${scaleX}, ${scaleY})` : undefined;

  return (
    <div
      className={`absolute bg-white border-4 border-black window-shadow flex flex-col ${animationClass}`}
      style={{
        left: window.x,
        top: window.y,
        width: scaled.w,
        height: scaled.h,
        zIndex: window.z,
        transform: physicsTransform,
        transformOrigin: 'top center',
      }}
      onMouseDown={handleFocus}
    >
      {/* Window Header */}
      <div
        ref={headerRef}
        className="flex items-center justify-between p-2 border-b-2 border-black bg-white cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-base truncate">{window.title}</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Minimize button */}
          <button
            className="w-6 h-6 border border-black bg-white hover:bg-gray-100 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleMinimize();
            }}
            aria-label="Minimize"
          >
            <span className="text-xs font-bold">_</span>
          </button>

          {/* Close button */}
          <button
            className="w-6 h-6 border border-black bg-white hover:bg-black hover:text-white flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close"
          >
            <span className="text-xs font-bold">X</span>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
