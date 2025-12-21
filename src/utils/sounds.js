// Sound System - Procedural audio using Web Audio API

let audioCtx = null;
let activeDragNodes = null;
let soundMuted = typeof localStorage !== 'undefined'
    ? localStorage.getItem('sound_muted') === 'true'
    : false;

export const getAudioCtx = () => {
    if (soundMuted) return null;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
};

export const toggleMute = () => {
    soundMuted = !soundMuted;
    localStorage.setItem('sound_muted', soundMuted.toString());
    return soundMuted;
};

export const isMuted = () => soundMuted;

const makeDistortion = (ctx, amount) => {
    const dist = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        const x = (i - 128) / 128;
        curve[i] = Math.tanh(x * amount);
    }
    dist.curve = curve;
    return dist;
};

// Helper to create sound with common pattern
const createSound = (fn) => {
    return () => {
        const ctx = getAudioCtx();
        if (!ctx) return;
        fn(ctx, ctx.currentTime);
    };
};

export const sounds = {
    dragStart: () => {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        if (activeDragNodes) return;

        const bufferSize = ctx.sampleRate * 2.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
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
    },

    dragStop: () => {
        if (!activeDragNodes) return;
        const ctx = getAudioCtx();
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
    },

    windowOpen: createSound((ctx, now) => {
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
    }),

    windowClose: createSound((ctx, now) => {
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
    }),

    success: createSound((ctx, now) => {
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
    }),

    error: createSound((ctx, now) => {
        [150, 154].forEach(freq => {
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
    }),

    bounce: (vel = 1) => {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const dist = makeDistortion(ctx, 12);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(dist);
        dist.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220 + (vel * 100), now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.4 * Math.min(vel, 1.2), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    },

    click: createSound((ctx, now) => {
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
    }),

    ping: createSound((ctx, now) => {
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
    }),

    bark: createSound((ctx, now) => {
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
    }),

    achievementUnlock: createSound((ctx, now) => {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.08;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.5);
        });
    }),

    bootWindup: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.8);
        osc.frequency.exponentialRampToValueAtTime(600, now + 1.2);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 1.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gain.gain.setValueAtTime(0.15, now + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.5);

        for (let i = 0; i < 15; i++) {
            const clickTime = now + (i * 0.12) - (i * i * 0.004);
            if (clickTime < now + 1.2) {
                const click = ctx.createOscillator();
                const clickGain = ctx.createGain();
                click.type = 'square';
                click.frequency.value = 100 + i * 30;
                clickGain.gain.setValueAtTime(0.06, clickTime);
                clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);
                click.connect(clickGain);
                clickGain.connect(ctx.destination);
                click.start(clickTime);
                click.stop(clickTime + 0.02);
            }
        }

        setTimeout(() => {
            const chime = ctx.createOscillator();
            const chimeGain = ctx.createGain();
            chime.type = 'sine';
            chime.frequency.value = 880;
            chimeGain.gain.setValueAtTime(0.12, ctx.currentTime);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            chime.connect(chimeGain);
            chimeGain.connect(ctx.destination);
            chime.start();
            chime.stop(ctx.currentTime + 0.3);
        }, 1200);
    }),

    visitMilestone: createSound((ctx, now) => {
        [392, 523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = now + i * 0.12;
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.4);
        });
    }),

    menuOpen: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }),

    godMode: createSound((ctx, now) => {
        [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.1;
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.8);
        });
    }),

    truthReveal: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
    }),

    passwordWrong: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 100;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }),

    passwordCorrect: createSound((ctx, now) => {
        [440, 554.37, 659.25].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.1;
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.3);
        });
    }),

    upgradePurchase: createSound((ctx, now) => {
        [600, 800, 1000].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.05;
            gain.gain.setValueAtTime(0.08, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.15);
        });
    }),

    konamiActivate: createSound((ctx, now) => {
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.08;
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.4);
        });
    }),

    windowMinimize: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }),

    windowRestore: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }),

    // Game sounds
    laser: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }),

    explosion: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const dist = makeDistortion(ctx, 20);
        osc.connect(dist);
        dist.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
    }),

    coin: createSound((ctx, now) => {
        [987.77, 1318.51].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = now + i * 0.08;
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.5);
        });
    }),

    gameOver: createSound((ctx, now) => {
        [440, 311, 220, 155].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const start = now + i * 0.3;
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.4);
        });
    }),

    diceRoll: createSound((ctx, now) => {
        for (let i = 0; i < 12; i++) {
            const delay = i * 0.05 + (i * i * 0.008);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 800 + Math.random() * 400;
            gain.gain.setValueAtTime(0.08 * (1 - i * 0.07), now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.03);
        }
    }),

    tarotShuffle: createSound((ctx, now) => {
        for (let i = 0; i < 5; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 200 + Math.random() * 100;
            const start = now + i * 0.1;
            gain.gain.setValueAtTime(0.04, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.05);
        }
    }),

    tarotFlip: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }),

    mineDing: createSound((ctx, now) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }),

    terminalSubmit: createSound((ctx, now) => {
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = 'square';
        click.frequency.value = 200;
        clickGain.gain.setValueAtTime(0.08, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(now);
        click.stop(now + 0.03);

        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.value = 1500;
        bellGain.gain.setValueAtTime(0.1, now + 0.02);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        bell.connect(bellGain);
        bellGain.connect(ctx.destination);
        bell.start(now + 0.02);
        bell.stop(now + 0.4);
    }),

    diceCrit20: createSound((ctx, now) => {
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.06;
            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.5);
        });
    }),

    diceCrit1: createSound((ctx, now) => {
        [200, 150, 100, 75].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            const start = now + i * 0.15;
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.3);
        });
    }),

    bounceIcon: (vel = 1) => {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + (vel * 150), now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gain.gain.setValueAtTime(0.12 * Math.min(vel, 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    },

    copy: createSound((ctx, now) => {
        [1000, 1200].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.05;
            gain.gain.setValueAtTime(0.06, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.08);
        });
    }),
};

export default sounds;
