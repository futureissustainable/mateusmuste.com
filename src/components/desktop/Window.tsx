import { useRef, useState, useCallback, type ReactNode, type MouseEvent, type TouchEvent } from 'react'
import { useSound } from '@/hooks/useSound'

export interface WindowState {
  x: number
  y: number
  w: number
  h: number
  isOpen: boolean
  isMin: boolean
  zIndex: number
}

export interface WindowProps {
  id: string
  title: string
  state: WindowState
  isMobile: boolean
  isFocused: boolean
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  onDragStart: (e: MouseEvent | TouchEvent, id: string) => void
  children: ReactNode
  className?: string
  headerExtra?: ReactNode
}

export function Window({
  id,
  title,
  state,
  isMobile,
  isFocused,
  onClose,
  onMinimize,
  onFocus,
  onDragStart,
  children,
  className = '',
  headerExtra,
}: WindowProps) {
  const { play } = useSound()
  const [isClosing, setIsClosing] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  // Scale window for mobile/tablet
  const getScaledSize = useCallback((w: number, h: number) => {
    if (isMobile) {
      return { w: window.innerWidth, h: window.innerHeight - 60 }
    }
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (vw < 1024) {
      const scale = Math.min(vw / 1200, vh / 900)
      return { w: Math.round(w * scale), h: Math.round(h * scale) }
    }
    return { w, h }
  }, [isMobile])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    play('windowClose')
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 150)
  }, [onClose, play])

  const handleMinimize = useCallback(() => {
    play('windowMinimize')
    onMinimize()
  }, [onMinimize, play])

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    onFocus()
    onDragStart(e, id)
  }, [onFocus, onDragStart, id])

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    onFocus()
    onDragStart(e, id)
  }, [onFocus, onDragStart, id])

  // Don't render if not open or minimized
  if (!state.isOpen || state.isMin) {
    return null
  }

  const scaled = getScaledSize(state.w, state.h)

  // Mobile: fullscreen windows
  const style = isMobile
    ? {
        position: 'fixed' as const,
        top: 60,
        left: 0,
        width: '100%',
        height: 'calc(100% - 60px)',
        zIndex: state.zIndex,
      }
    : {
        position: 'absolute' as const,
        left: state.x,
        top: state.y,
        width: scaled.w,
        height: scaled.h,
        zIndex: state.zIndex,
      }

  return (
    <div
      ref={windowRef}
      className={`
        bg-white border-2 border-black flex flex-col
        ${isMobile ? '' : 'window-shadow'}
        ${isClosing ? 'window-closing' : 'window-opening'}
        ${className}
      `}
      style={style}
      onMouseDown={() => onFocus()}
    >
      {/* Title bar */}
      <div
        className={`
          flex items-center justify-between px-2 py-1 border-b-2 border-black
          ${isFocused ? 'bg-black text-white' : 'bg-gray-200 text-black'}
          cursor-move select-none shrink-0
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <span className="font-bold text-base truncate">{title}</span>
        <div className="flex gap-1">
          {headerExtra}
          <button
            onClick={handleMinimize}
            className="w-6 h-6 flex items-center justify-center border border-current hover:bg-gray-300 hover:text-black"
            aria-label="Minimize"
          >
            <span className="text-lg leading-none">−</span>
          </button>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center border border-current hover:bg-red-500 hover:text-white"
            aria-label="Close"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
