import { useCallback, type MouseEvent, type TouchEvent, type ReactNode } from 'react'

export interface IconPosition {
  x: number
  y: number
}

export interface IconProps {
  id: string
  label: string
  icon: ReactNode
  position: IconPosition
  isSelected: boolean
  isDragging: boolean
  isLocked?: boolean
  isHidden?: boolean
  onMouseDown: (e: MouseEvent, id: string) => void
  onMouseUp: (openCallback?: (id: string) => void) => void
  onTouchStart: (e: TouchEvent, id: string) => void
  onTouchEnd: (openCallback?: (id: string) => void) => void
  onOpen: (id: string) => void
}

export function Icon({
  id,
  label,
  icon,
  position,
  isSelected,
  isDragging,
  isLocked = false,
  isHidden = false,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  onOpen,
}: IconProps) {
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (isLocked) return
    onMouseDown(e, id)
  }, [id, isLocked, onMouseDown])

  const handleMouseUp = useCallback(() => {
    if (isLocked) return
    onMouseUp((appId) => onOpen(appId))
  }, [isLocked, onMouseUp, onOpen])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isLocked) return
    onTouchStart(e, id)
  }, [id, isLocked, onTouchStart])

  const handleTouchEnd = useCallback(() => {
    if (isLocked) return
    onTouchEnd((appId) => onOpen(appId))
  }, [isLocked, onTouchEnd, onOpen])

  const handleDoubleClick = useCallback(() => {
    if (isLocked) return
    onOpen(id)
  }, [id, isLocked, onOpen])

  if (isHidden) {
    return null
  }

  return (
    <div
      className={`
        absolute flex flex-col items-center justify-center
        w-20 h-20 p-2 cursor-pointer select-none
        transition-transform duration-75
        ${isDragging ? 'icon-dragging' : ''}
        ${isSelected ? 'bg-black/10' : 'hover:bg-black/5'}
        ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 99999 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-12 h-12 flex items-center justify-center">
        {icon}
      </div>
      <span
        className={`
          mt-1 text-center text-sm font-bold leading-tight
          max-w-full truncate px-1
          ${isSelected ? 'bg-black text-white' : ''}
        `}
      >
        {label}
      </span>
    </div>
  )
}
