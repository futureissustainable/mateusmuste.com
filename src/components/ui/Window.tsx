import { memo } from 'react';
import { PixelartIcon } from './PixelartIcon';
import type { IconName } from '@/types';
import { getScaledSize } from '@/lib/utils';

interface WindowProps {
  id: string;
  title: string;
  icon: IconName;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  isMin: boolean;
  animation?: 'opening' | 'closing';
  isMobile: boolean;
  scaleX?: number;
  scaleY?: number;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  children: React.ReactNode;
}

export const Window = memo(({
  id,
  title,
  icon,
  x,
  y,
  w,
  h,
  z,
  isMin,
  animation,
  isMobile,
  scaleX = 1,
  scaleY = 1,
  onClose,
  onMinimize,
  onFocus,
  onDragStart,
  children,
}: WindowProps) => {
  // Get scaled dimensions
  const scaled = getScaledSize(w, h);

  // Mobile: fullscreen windows
  if (isMobile) {
    return (
      <div
        className={`
          fixed inset-0 top-14 bottom-0
          bg-white border-2 border-black flex flex-col
          ${isMin ? 'hidden' : ''}
          ${animation === 'opening' ? 'window-opening' : ''}
          ${animation === 'closing' ? 'window-closing' : ''}
        `}
        style={{ zIndex: z }}
        onClick={() => onFocus(id)}
      >
        {/* Window Header */}
        <div
          className="flex items-center justify-between bg-black text-white px-2 py-1 select-none flex-shrink-0"
          onTouchStart={(e) => onDragStart(e, id)}
        >
          <div className="flex items-center gap-2">
            <PixelartIcon name={icon} size={20} style={{ filter: 'invert(1)' }} />
            <span className="font-bold text-sm truncate max-w-[200px]">{title}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
              className="w-6 h-6 bg-white text-black hover:bg-gray-200 flex items-center justify-center"
              aria-label="Minimize"
            >
              <PixelartIcon name="Minus" size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
              className="w-6 h-6 bg-white text-black hover:bg-red-500 hover:text-white flex items-center justify-center"
              aria-label="Close"
            >
              <PixelartIcon name="X" size={16} />
            </button>
          </div>
        </div>
        {/* Window Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  // Desktop: draggable windows with physics
  return (
    <div
      className={`
        absolute bg-white border-4 border-black window-shadow flex flex-col
        ${isMin ? 'hidden' : ''}
        ${animation === 'opening' ? 'window-opening' : ''}
        ${animation === 'closing' ? 'window-closing' : ''}
      `}
      style={{
        left: x,
        top: y,
        width: scaled.w,
        height: scaled.h,
        zIndex: z,
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: 'center center',
      }}
      onClick={() => onFocus(id)}
    >
      {/* Window Header */}
      <div
        className="flex items-center justify-between bg-black text-white px-3 py-2 cursor-move select-none flex-shrink-0"
        onMouseDown={(e) => onDragStart(e, id)}
        onTouchStart={(e) => onDragStart(e, id)}
      >
        <div className="flex items-center gap-2">
          <PixelartIcon name={icon} size={24} style={{ filter: 'invert(1)' }} />
          <span className="font-bold text-base truncate max-w-[300px]">{title}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
            className="w-8 h-8 bg-white text-black hover:bg-gray-200 flex items-center justify-center"
            aria-label="Minimize"
          >
            <PixelartIcon name="Minus" size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(id); }}
            className="w-8 h-8 bg-white text-black hover:bg-red-500 hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <PixelartIcon name="X" size={20} />
          </button>
        </div>
      </div>
      {/* Window Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
});

Window.displayName = 'Window';

export default Window;
