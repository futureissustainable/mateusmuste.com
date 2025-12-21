import { useCallback, useEffect } from 'react'
import { sounds, cleanupAudio, isMuted, toggleMute } from '@/lib/audio'

export type SoundName = keyof typeof sounds

export function useSound() {
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [])

  const play = useCallback((sound: SoundName, ...args: unknown[]) => {
    const soundFn = sounds[sound]
    if (soundFn) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (soundFn as (...args: unknown[]) => void)(...args)
    }
  }, [])

  const getMuted = useCallback(() => isMuted(), [])
  const toggle = useCallback(() => toggleMute(), [])

  return {
    play,
    isMuted: getMuted,
    toggleMute: toggle,
  }
}

// Pre-bound sound functions for convenience
export const playSound = (sound: SoundName, ...args: unknown[]) => {
  const soundFn = sounds[sound]
  if (soundFn) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (soundFn as (...args: unknown[]) => void)(...args)
  }
}
