import { useEffect, useRef, useCallback } from 'react'

/**
 * useInterval - Safe interval hook with automatic cleanup
 *
 * @param callback - Function to call on each interval
 * @param delay - Interval delay in ms, or null to pause
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval with automatic cleanup
  useEffect(() => {
    if (delay === null) return

    const tick = () => savedCallback.current()
    const id = setInterval(tick, delay)

    return () => clearInterval(id)
  }, [delay])
}

/**
 * useTimeout - Safe timeout hook with automatic cleanup
 *
 * @param callback - Function to call after timeout
 * @param delay - Timeout delay in ms, or null to cancel
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setTimeout(() => savedCallback.current(), delay)

    return () => clearTimeout(id)
  }, [delay])
}

/**
 * useTimeoutFn - Returns a function to trigger a timeout, with cleanup
 */
export function useTimeoutFn() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const set = useCallback((callback: () => void, delay: number) => {
    clear()
    timeoutRef.current = setTimeout(callback, delay)
  }, [clear])

  // Cleanup on unmount
  useEffect(() => {
    return clear
  }, [clear])

  return { set, clear }
}

/**
 * useIntervalFn - Returns functions to start/stop an interval
 */
export function useIntervalFn() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback((callback: () => void, delay: number) => {
    stop()
    intervalRef.current = setInterval(callback, delay)
  }, [stop])

  // Cleanup on unmount
  useEffect(() => {
    return stop
  }, [stop])

  return { start, stop, isRunning: () => intervalRef.current !== null }
}

/**
 * useAnimationFrame - Safe requestAnimationFrame hook with cleanup
 */
export function useAnimationFrame(callback: (deltaTime: number) => void, running = true) {
  const requestRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!running) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = null
      }
      previousTimeRef.current = null
      return
    }

    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = time - previousTimeRef.current
        callbackRef.current(deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [running])
}
