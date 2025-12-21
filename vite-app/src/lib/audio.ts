// Audio context singleton with proper lifecycle management
let audioCtx: AudioContext | null = null
let activeDragNodes: {
  noise: AudioBufferSourceNode
  hapticOsc: OscillatorNode
  lfo: OscillatorNode
  mainGain: GainNode
} | null = null

// Track all active audio nodes for cleanup
const activeNodes = new Set<AudioNode>()

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null

  const muted = localStorage.getItem('sound_muted') === 'true'
  if (muted) return null

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioCtx
}

export const isMuted = (): boolean => {
  return localStorage.getItem('sound_muted') === 'true'
}

export const toggleMute = (): boolean => {
  const current = isMuted()
  localStorage.setItem('sound_muted', (!current).toString())
  return !current
}

// Helper to create distortion curve
const makeDistortion = (ctx: AudioContext, amount: number): WaveShaperNode => {
  const dist = ctx.createWaveShaper()
  const curve = new Float32Array(256)
  for (let i = 0; i < 256; i++) {
    const x = (i - 128) / 128
    curve[i] = Math.tanh(x * amount)
  }
  dist.curve = curve
  return dist
}

// Track and auto-cleanup oscillator
const scheduleCleanup = (node: OscillatorNode | AudioBufferSourceNode, stopTime: number) => {
  activeNodes.add(node)
  const cleanup = () => {
    activeNodes.delete(node)
    try {
      node.disconnect()
    } catch {
      // Already disconnected
    }
  }
  node.onended = cleanup
  // Fallback cleanup in case onended doesn't fire
  setTimeout(cleanup, (stopTime - (audioCtx?.currentTime || 0) + 0.1) * 1000)
}

// Sound definitions with proper cleanup
export const sounds = {
  click: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
    scheduleCleanup(osc, now + 0.05)
  },

  windowOpen: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.3, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
    scheduleCleanup(osc, now + 0.1)
  },

  windowClose: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(250, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1)
    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.15)
    scheduleCleanup(osc, now + 0.15)
  },

  windowMinimize: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
    scheduleCleanup(osc, now + 0.1)
  },

  windowRestore: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.06)
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
    scheduleCleanup(osc, now + 0.1)
  },

  dragStart: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    if (activeDragNodes) return

    const bufferSize = ctx.sampleRate * 2.0
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800
    filter.Q.value = 0.5
    const hapticOsc = ctx.createOscillator()
    hapticOsc.type = 'sine'
    hapticOsc.frequency.value = 140
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 13
    const mainGain = ctx.createGain()
    const noiseGain = ctx.createGain()
    const hapticGain = ctx.createGain()
    const lfoGain = ctx.createGain()

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(mainGain)
    hapticOsc.connect(hapticGain)
    hapticGain.connect(mainGain)
    mainGain.connect(ctx.destination)
    lfo.connect(lfoGain)
    lfoGain.connect(mainGain.gain)

    noiseGain.gain.value = 1.0
    hapticGain.gain.value = 0.4
    const baseVol = 0.012
    mainGain.gain.setValueAtTime(0, now)
    mainGain.gain.linearRampToValueAtTime(baseVol, now + 0.15)
    lfoGain.gain.value = 0.008

    noise.start(now)
    hapticOsc.start(now)
    lfo.start(now)
    activeDragNodes = { noise, hapticOsc, lfo, mainGain }
  },

  dragStop: () => {
    if (!activeDragNodes) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const { noise, hapticOsc, lfo, mainGain } = activeDragNodes
    mainGain.gain.cancelScheduledValues(now)
    mainGain.gain.setValueAtTime(mainGain.gain.value, now)
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1)
    noise.stop(now + 0.1)
    hapticOsc.stop(now + 0.1)
    lfo.stop(now + 0.1)
    activeDragNodes = null
  },

  bounce: (vel = 1) => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const dist = makeDistortion(ctx, 12)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(dist)
    dist.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(220 + (vel * 100), now)
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15)
    gain.gain.setValueAtTime(0.4 * Math.min(vel, 1.2), now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc.start(now)
    osc.stop(now + 0.2)
    scheduleCleanup(osc, now + 0.2)
  },

  bounceIcon: (vel = 1) => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600 + (vel * 150), now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06)
    gain.gain.setValueAtTime(0.12 * Math.min(vel, 1), now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.start(now)
    osc.stop(now + 0.08)
    scheduleCleanup(osc, now + 0.08)
  },

  success: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 987.77]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.04
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.08, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.4)
      scheduleCleanup(osc, start + 0.4)
    })
  },

  error: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const freqs = [150, 154]
    freqs.forEach(freq => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.type = 'sawtooth'
      osc.frequency.value = freq
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, now)
      filter.frequency.linearRampToValueAtTime(100, now + 0.3)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.3)
      scheduleCleanup(osc, now + 0.3)
    })
  },

  bootSequence: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [174.61, 220.00, 261.63, 329.63, 392.00]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.4
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6)
      osc.start(start)
      osc.stop(start + 0.6)
      scheduleCleanup(osc, start + 0.6)
    })
  },

  achievementUnlock: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.08
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.5)
      scheduleCleanup(osc, start + 0.5)
    })
    // Shimmer
    for (let i = 0; i < 8; i++) {
      const shimmer = ctx.createOscillator()
      const shimmerGain = ctx.createGain()
      shimmer.type = 'sine'
      shimmer.frequency.value = 2000 + Math.random() * 2000
      const t = now + 0.2 + i * 0.05
      shimmerGain.gain.setValueAtTime(0.02, t)
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      shimmer.connect(shimmerGain)
      shimmerGain.connect(ctx.destination)
      shimmer.start(t)
      shimmer.stop(t + 0.15)
      scheduleCleanup(shimmer, t + 0.15)
    }
  },

  iconSelect: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 500
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.02)
    scheduleCleanup(osc, now + 0.02)
  },

  coin: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const freqs = [987.77, 1318.51]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = now + i * 0.08
      gain.gain.setValueAtTime(0.05, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.5)
      scheduleCleanup(osc, t + 0.5)
    })
  },

  gameOver: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [440, 311, 220, 155]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const start = now + i * 0.3
      gain.gain.setValueAtTime(0.1, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.4)
      scheduleCleanup(osc, start + 0.4)
    })
  },

  diceRoll: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    for (let i = 0; i < 12; i++) {
      const delay = i * 0.05 + (i * i * 0.008)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 800 + Math.random() * 400
      gain.gain.setValueAtTime(0.08 * (1 - i * 0.07), now + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + delay)
      osc.stop(now + delay + 0.03)
      scheduleCleanup(osc, now + delay + 0.03)
    }
  },

  explosion: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const dist = makeDistortion(ctx, 20)
    osc.connect(dist)
    dist.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(120, now)
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.5)
    gain.gain.setValueAtTime(0.6, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc.start(now)
    osc.stop(now + 0.6)
    scheduleCleanup(osc, now + 0.6)
  },

  laser: () => {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(2000, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.15)
    scheduleCleanup(osc, now + 0.15)
  },
}

// Cleanup function for unmounting
export const cleanupAudio = () => {
  if (activeDragNodes) {
    sounds.dragStop()
  }
  activeNodes.forEach(node => {
    try {
      node.disconnect()
    } catch {
      // Already disconnected
    }
  })
  activeNodes.clear()
}

export type SoundFunction = keyof typeof sounds
