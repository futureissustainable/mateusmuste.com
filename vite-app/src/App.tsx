import { useState, useCallback, useEffect, useRef } from 'react'
import { Window, type WindowState } from '@/components/desktop/Window'
import { Icon, type IconPosition } from '@/components/desktop/Icon'
import { Icons } from '@/components/common/PixelIcon'
import { SnakeApp } from '@/components/apps/SnakeApp'
import { useSound } from '@/hooks/useSound'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAnimationFrame } from '@/hooks/useInterval'

// Window configurations
const INITIAL_WINDOWS: Record<string, WindowState> = {
  SNAKE: { x: 100, y: 100, w: 400, h: 450, isOpen: false, isMin: false, zIndex: 1 },
}

// Icon configurations
const DESKTOP_ICONS = [
  { id: 'SNAKE', label: 'SNEK.EXE', icon: 'Gamepad' },
]

function App() {
  const { play } = useSound()
  const [isMobile, setIsMobile] = useState(false)
  const [windows, setWindows] = useState(INITIAL_WINDOWS)
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null)
  const [maxZIndex, setMaxZIndex] = useState(1)

  // Icon state
  const [iconPositions, setIconPositions] = useLocalStorage<Record<string, IconPosition>>(
    'desktop_icon_positions',
    { SNAKE: { x: 16, y: 16 } }
  )
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [iconDrag, setIconDrag] = useState<{
    id: string | null
    offsetX: number
    offsetY: number
    active: boolean
  }>({ id: null, offsetX: 0, offsetY: 0, active: false })

  // Physics refs
  const iconPhysics = useRef<Record<string, { velX: number; velY: number }>>({})
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() })
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Window management
  const openWindow = useCallback((id: string) => {
    play('windowOpen')
    setMaxZIndex(z => z + 1)
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMin: false, zIndex: maxZIndex + 1 },
    }))
    setFocusedWindow(id)
  }, [maxZIndex, play])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }))
    if (focusedWindow === id) setFocusedWindow(null)
  }, [focusedWindow])

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMin: true },
    }))
    if (focusedWindow === id) setFocusedWindow(null)
  }, [focusedWindow])

  const focusWindow = useCallback((id: string) => {
    setMaxZIndex(z => z + 1)
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: maxZIndex + 1 },
    }))
    setFocusedWindow(id)
  }, [maxZIndex])

  // Icon drag handlers
  const handleIconMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    play('iconSelect')

    const pos = iconPositions[id] || { x: 0, y: 0 }
    if (!iconPhysics.current[id]) {
      iconPhysics.current[id] = { velX: 0, velY: 0 }
    }
    iconPhysics.current[id].velX = 0
    iconPhysics.current[id].velY = 0

    lastMousePos.current = { x: e.clientX, y: e.clientY, time: Date.now() }
    setSelectedIcon(id)

    // Start drag after hold
    holdTimerRef.current = setTimeout(() => {
      play('dragStart')
      setIconDrag({
        id,
        offsetX: e.clientX - pos.x,
        offsetY: e.clientY - pos.y,
        active: true,
      })
    }, 100)
  }, [iconPositions, play])

  const handleIconMouseMove = useCallback((e: React.MouseEvent) => {
    if (!iconDrag.active || !iconDrag.id) return

    const now = Date.now()
    const dt = Math.max(1, now - lastMousePos.current.time)
    const physics = iconPhysics.current[iconDrag.id]
    if (physics) {
      physics.velX = physics.velX * 0.3 + ((e.clientX - lastMousePos.current.x) / dt * 8) * 0.7
      physics.velY = physics.velY * 0.3 + ((e.clientY - lastMousePos.current.y) / dt * 8) * 0.7
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY, time: now }

    const newX = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - iconDrag.offsetX))
    const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - iconDrag.offsetY))

    setIconPositions(prev => ({ ...prev, [iconDrag.id!]: { x: newX, y: newY } }))
  }, [iconDrag, setIconPositions])

  const handleIconMouseUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    if (iconDrag.active && iconDrag.id) {
      play('dragStop')
    } else if (selectedIcon) {
      openWindow(selectedIcon)
    }

    setIconDrag({ id: null, offsetX: 0, offsetY: 0, active: false })
    setSelectedIcon(null)
  }, [iconDrag, selectedIcon, openWindow, play])

  // Icon physics loop with proper cleanup
  useAnimationFrame(() => {
    if (iconDrag.active) return

    let hasChanges = false
    const newPositions = { ...iconPositions }

    Object.keys(iconPositions).forEach(id => {
      const physics = iconPhysics.current[id]
      if (!physics) return
      if (Math.abs(physics.velX) < 0.1 && Math.abs(physics.velY) < 0.1) {
        physics.velX = 0
        physics.velY = 0
        return
      }

      hasChanges = true
      physics.velX *= 0.96
      physics.velY *= 0.96

      let newX = iconPositions[id].x + physics.velX
      let newY = iconPositions[id].y + physics.velY

      // Bounce off edges
      if (newX <= 0) {
        newX = 0
        physics.velX = -physics.velX * 0.5
        play('bounceIcon')
      } else if (newX >= window.innerWidth - 80) {
        newX = window.innerWidth - 80
        physics.velX = -physics.velX * 0.5
        play('bounceIcon')
      }
      if (newY <= 0) {
        newY = 0
        physics.velY = -physics.velY * 0.5
        play('bounceIcon')
      } else if (newY >= window.innerHeight - 80) {
        newY = window.innerHeight - 80
        physics.velY = -physics.velY * 0.5
        play('bounceIcon')
      }

      newPositions[id] = { x: newX, y: newY }
    })

    if (hasChanges) {
      setIconPositions(newPositions)
    }
  }, !iconDrag.active)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
      }
    }
  }, [])

  // Placeholder handlers for drag
  const handleDragStart = useCallback(() => {
    // Window drag - simplified for demo
  }, [])

  return (
    <div
      className="mobile-safe-height w-full desktop-bg-grid relative overflow-hidden"
      onMouseMove={handleIconMouseMove}
      onMouseUp={handleIconMouseUp}
      onMouseLeave={handleIconMouseUp}
    >
      {/* Desktop Icons */}
      {DESKTOP_ICONS.map(iconDef => {
        const IconComponent = Icons[iconDef.icon as keyof typeof Icons]
        return (
          <Icon
            key={iconDef.id}
            id={iconDef.id}
            label={iconDef.label}
            icon={<IconComponent size={48} />}
            position={iconPositions[iconDef.id] || { x: 16, y: 16 }}
            isSelected={selectedIcon === iconDef.id}
            isDragging={iconDrag.id === iconDef.id && iconDrag.active}
            onMouseDown={handleIconMouseDown}
            onMouseUp={() => handleIconMouseUp()}
            onTouchStart={() => {}}
            onTouchEnd={() => {}}
            onOpen={openWindow}
          />
        )
      })}

      {/* Windows */}
      <Window
        id="SNAKE"
        title="SNEK.EXE"
        state={windows.SNAKE}
        isMobile={isMobile}
        isFocused={focusedWindow === 'SNAKE'}
        onClose={() => closeWindow('SNAKE')}
        onMinimize={() => minimizeWindow('SNAKE')}
        onFocus={() => focusWindow('SNAKE')}
        onDragStart={handleDragStart}
      >
        <SnakeApp />
      </Window>

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-white border-t-2 border-black flex items-center px-2 gap-2">
        <div className="font-heading text-xl tracking-tight">MATEUSMUSTE//OS</div>
        <div className="flex-1" />
        {/* Minimized windows */}
        {Object.entries(windows)
          .filter(([, state]) => state.isOpen && state.isMin)
          .map(([id]) => (
            <button
              key={id}
              onClick={() => {
                play('windowRestore')
                setWindows(prev => ({
                  ...prev,
                  [id]: { ...prev[id], isMin: false },
                }))
                focusWindow(id)
              }}
              className="px-3 py-1 border-2 border-black bg-gray-100 hover:bg-gray-200 font-bold text-sm"
            >
              {id}
            </button>
          ))}
      </div>
    </div>
  )
}

export default App
