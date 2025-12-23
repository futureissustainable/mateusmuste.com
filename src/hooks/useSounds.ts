'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/stores';

// Singleton AudioContext - shared across all hook instances
let globalAudioContext: AudioContext | null = null;
let activeDragNodes: {
  noise: AudioBufferSourceNode;
  hapticOsc: OscillatorNode;
  lfo: OscillatorNode;
  mainGain: GainNode;
} | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;

  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }

  return globalAudioContext;
};

const makeDistortion = (ctx: AudioContext, amount: number): WaveShaperNode => {
  const dist = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i - 128) / 128;
    curve[i] = Math.tanh(x * amount);
  }
  dist.curve = curve;
  return dist;
};

export function useSounds() {
  const isMuted = useSettingsStore((state) => state.isMuted);
  const isMutedRef = useRef(isMuted);

  // Keep ref in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const getCtx = useCallback((): AudioContext | null => {
    if (isMutedRef.current) return null;
    return getAudioContext();
  }, []);

  // === SOUND FUNCTIONS ===

  const dragStart = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || activeDragNodes) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;

    const hapticOsc = ctx.createOscillator();
    hapticOsc.type = 'sine';
    hapticOsc.frequency.value = 140;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 13;

    const mainGain = ctx.createGain();
    const noiseGain = ctx.createGain();
    const hapticGain = ctx.createGain();
    const lfoGain = ctx.createGain();

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(mainGain);
    hapticOsc.connect(hapticGain);
    hapticGain.connect(mainGain);
    mainGain.connect(ctx.destination);
    lfo.connect(lfoGain);
    lfoGain.connect(mainGain.gain);

    noiseGain.gain.value = 1.0;
    hapticGain.gain.value = 0.4;
    const baseVol = 0.012;
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(baseVol, now + 0.15);
    lfoGain.gain.value = 0.008;

    noise.start(now);
    hapticOsc.start(now);
    lfo.start(now);

    activeDragNodes = { noise, hapticOsc, lfo, mainGain };
  }, [getCtx]);

  const dragStop = useCallback(() => {
    if (!activeDragNodes) return;
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const { noise, hapticOsc, lfo, mainGain } = activeDragNodes;

    mainGain.gain.cancelScheduledValues(now);
    mainGain.gain.setValueAtTime(mainGain.gain.value, now);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    noise.stop(now + 0.1);
    hapticOsc.stop(now + 0.1);
    lfo.stop(now + 0.1);

    activeDragNodes = null;
  }, [getCtx]);

  const windowOpen = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }, [getCtx]);

  const windowClose = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }, [getCtx]);

  const success = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 987.77].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const start = now + i * 0.04;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }, [getCtx]);

  const error = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    [150, 154].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(100, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }, [getCtx]);

  const bounce = useCallback((vel = 1) => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dist = makeDistortion(ctx, 12);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(dist);
    dist.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220 + vel * 100, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.4 * Math.min(vel, 1.2), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }, [getCtx]);

  const bounceIcon = useCallback((vel = 1) => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + vel * 150, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

    gain.gain.setValueAtTime(0.12 * Math.min(vel, 1), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  }, [getCtx]);

  const click = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }, [getCtx]);

  const ping = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }, [getCtx]);

  const menuOpen = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.03);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }, [getCtx]);

  const achievementUnlock = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Triumphant chord
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const start = now + i * 0.05;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.8);
    });
  }, [getCtx]);

  const appUnlock = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Rising arpeggio
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const start = now + i * 0.06;
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }, [getCtx]);

  const bootWindup = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.6, now);
    master.connect(ctx.destination);

    // Industrial impact
    const impact = ctx.createOscillator();
    const impactGain = ctx.createGain();
    const impactFilter = ctx.createBiquadFilter();

    impact.type = 'sawtooth';
    impact.frequency.setValueAtTime(80, now);
    impact.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    impactFilter.type = 'bandpass';
    impactFilter.frequency.value = 120;
    impactFilter.Q.value = 8;

    impactGain.gain.setValueAtTime(0.7, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    impact.connect(impactFilter);
    impactFilter.connect(impactGain);
    impactGain.connect(master);
    impact.start(now);
    impact.stop(now + 0.3);

    // Rising notes
    const notes = [174.61, 220.00, 261.63, 329.63, 392.00];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const start = now + 0.3 + i * 0.35;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  }, [getCtx]);

  const godMode = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Epic power chord
    [130.81, 164.81, 196.00, 261.63, 329.63, 392.00].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2);
    });
  }, [getCtx]);

  const bark = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }, [getCtx]);

  return {
    // Drag sounds
    dragStart,
    dragStop,

    // Window sounds
    windowOpen,
    windowClose,

    // Feedback sounds
    success,
    error,
    bounce,
    bounceIcon,
    click,
    ping,
    menuOpen,

    // Achievement sounds
    achievementUnlock,
    appUnlock,

    // Special sounds
    bootWindup,
    godMode,
    bark,
  };
}
