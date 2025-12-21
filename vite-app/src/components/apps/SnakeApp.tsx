import { useState, useCallback, useRef, useEffect } from 'react'
import { useInterval, useAnimationFrame } from '@/hooks/useInterval'
import { useSound } from '@/hooks/useSound'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface Point {
  x: number
  y: number
}

interface SnakeAppProps {
  onAchievement?: (id: string) => void
}

const GRID_SIZE = 20
const CELL_SIZE = 15
const INITIAL_SPEED = 150

export function SnakeApp({ onAchievement }: SnakeAppProps) {
  const { play } = useSound()
  const [highScore, setHighScore] = useLocalStorage('snake_high_score', 0)

  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Point>({ x: 15, y: 10 })
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(true)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  const directionRef = useRef(direction)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  const spawnFood = useCallback((): Point => {
    let newFood: Point
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y))
    return newFood
  }, [snake])

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }])
    setFood({ x: 15, y: 10 })
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setGameOver(false)
    setPaused(true)
    setSpeed(INITIAL_SPEED)
  }, [])

  const gameLoop = useCallback(() => {
    if (paused || gameOver) return

    setSnake(prevSnake => {
      const head = prevSnake[0]
      const newHead = {
        x: (head.x + directionRef.current.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + directionRef.current.y + GRID_SIZE) % GRID_SIZE,
      }

      // Check self collision
      if (prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setGameOver(true)
        play('gameOver')
        if (score > highScore) {
          setHighScore(score)
          if (onAchievement && score >= 100) {
            onAchievement('SNAKE_MASTER')
          }
        }
        return prevSnake
      }

      const newSnake = [newHead, ...prevSnake]

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        play('coin')
        setScore(s => s + 10)
        setFood(spawnFood())
        // Speed up slightly
        setSpeed(s => Math.max(50, s - 2))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [paused, gameOver, food, spawnFood, play, score, highScore, setHighScore, onAchievement])

  // Game loop with proper cleanup
  useInterval(gameLoop, paused || gameOver ? null : speed)

  // Render loop
  useAnimationFrame(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#111'
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw food
    ctx.fillStyle = '#f00'
    ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)

    // Draw snake
    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#0f0' : '#0a0'
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      )
    })
  }, true)

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          resetGame()
        }
        return
      }

      if (e.key === ' ') {
        setPaused(p => !p)
        return
      }

      const keyMap: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      }

      const newDir = keyMap[e.key]
      if (newDir) {
        // Prevent 180-degree turns
        if (
          directionRef.current.x + newDir.x !== 0 ||
          directionRef.current.y + newDir.y !== 0
        ) {
          setDirection(newDir)
          if (paused) setPaused(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, paused, resetGame])

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black p-4">
      <div className="flex justify-between w-full max-w-xs mb-2 text-white font-bold">
        <span>SCORE: {score}</span>
        <span>HIGH: {highScore}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border-2 border-white"
      />

      {gameOver && (
        <div className="mt-4 text-center">
          <div className="text-red-500 font-bold text-xl mb-2">GAME OVER</div>
          <button
            onClick={resetGame}
            className="btn-primary"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {paused && !gameOver && (
        <div className="mt-4 text-white text-center">
          <div className="mb-2">PAUSED</div>
          <div className="text-sm opacity-70">
            Arrow keys or WASD to move<br />
            Space to pause
          </div>
        </div>
      )}
    </div>
  )
}
