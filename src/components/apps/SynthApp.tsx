import { useState, useEffect, useRef, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';

interface SynthAppProps {
  onAchievement?: (id: string) => void;
}

type OscillatorType = 'sine' | 'square' | 'saw' | 'noise';

interface Grid {
  sine: boolean[];
  square: boolean[];
  saw: boolean[];
  noise: boolean[];
}

export const SynthApp = memo(({ onAchievement }: SynthAppProps) => {
  const [tempo, setTempo] = useState(120);
  const [filter, setFilter] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [grid, setGrid] = useState<Grid>(() => ({
    sine: Array(16).fill(false),
    square: Array(16).fill(false),
    saw: Array(16).fill(false),
    noise: Array(16).fill(false)
  }));
  const symphonyTriggered = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gridRef = useRef(grid);
  const filterRef = useRef(filter);
  gridRef.current = grid;
  filterRef.current = filter;

  const oscillators: OscillatorType[] = ['sine', 'square', 'saw', 'noise'];

  const toggleNote = (osc: OscillatorType, step: number) => {
    sounds.noteToggle(440, true);
    setGrid(prev => ({
      ...prev,
      [osc]: prev[osc].map((v, i) => i === step ? !v : v)
    }));
  };

  const playSound = (type: OscillatorType, filterFreq: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    let osc: OscillatorNode | AudioBufferSourceNode;
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = filterFreq;

    if (type === 'noise') {
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      osc = ctx.createBufferSource();
      osc.buffer = buffer;
    } else {
      osc = ctx.createOscillator();
      osc.type = type === 'saw' ? 'sawtooth' : type;
      osc.frequency.value = 220 + Math.random() * 110;
    }

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      setIsPlaying(true);
      const allFilled = oscillators.every(osc => grid[osc].every(note => note));
      if (allFilled && !symphonyTriggered.current) {
        symphonyTriggered.current = true;
        onAchievement?.('SYMPHONY');
      }
    }
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      let step = currentStep;
      intervalRef.current = setInterval(() => {
        setCurrentStep(step);
        oscillators.forEach(osc => {
          if (gridRef.current[osc][step]) {
            playSound(osc, filterRef.current);
          }
        });
        step = (step + 1) % 16;
      }, (60 / tempo) * 250);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tempo, isPlaying]);

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <div className="flex items-center gap-2">
          <PixelartIcon name="Music" size={16} />
          <span className="app-header-title">SYNTH_001.WAV</span>
        </div>
        <button
          onClick={() => { sounds.click(); togglePlay(); }}
          className={isPlaying ? 'btn-primary btn-xs' : 'btn-secondary btn-xs'}
        >
          {isPlaying ? '■ STOP' : '► PLAY'}
        </button>
      </div>
      <div className="flex-grow p-4 overflow-auto bg-gray-50">
        <div className="space-y-2">
          {oscillators.map(osc => (
            <div key={osc} className="flex items-center gap-2">
              <span className="font-mono text-[10px] w-12 text-gray-500 uppercase">{osc}</span>
              <div className="flex gap-1">
                {grid[osc].map((active, i) => (
                  <button
                    key={i}
                    onClick={() => toggleNote(osc, i)}
                    className={`w-6 h-8 border-2 transition-all ${active
                      ? 'bg-black border-black'
                      : 'bg-white border-gray-300 hover:border-black'
                      } ${currentStep === i && isPlaying ? 'ring-2 ring-black ring-offset-1' : ''}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t-2 border-black bg-white flex gap-8">
        <div className="flex items-center gap-2">
          <span className="app-footer-text">TEMPO</span>
          <input
            type="range"
            aria-label="Tempo control"
            min="60"
            max="200"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-24 accent-black"
          />
          <span className="font-mono text-xs w-8 text-black">{tempo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="app-footer-text">FILTER</span>
          <input
            type="range"
            aria-label="Filter frequency control"
            min="100"
            max="5000"
            value={filter}
            onChange={(e) => setFilter(Number(e.target.value))}
            className="w-24 accent-black"
          />
          <span className="font-mono text-xs w-12 text-black">{filter}Hz</span>
        </div>
      </div>
    </div>
  );
});

SynthApp.displayName = 'SynthApp';

export default SynthApp;
