import { useState, useEffect, useRef, memo } from 'react';
import { getAudioCtx } from '@/lib/audio';

interface MessagesAppProps {
  onIntroComplete?: () => void;
  isTruthSequence?: boolean;
  onTruthComplete?: () => void;
}

interface Message {
  text: string;
  highlight?: boolean;
  extraPauseBefore?: boolean;
  containsTruth?: boolean;
}

export const MessagesApp = memo(({
  onIntroComplete,
  isTruthSequence = false,
  onTruthComplete
}: MessagesAppProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [redactedCount, setRedactedCount] = useState(0);
  const [isRedacting, setIsRedacting] = useState(false);
  const introStartedRef = useRef(false);
  const onIntroCompleteRef = useRef(onIntroComplete);
  const onTruthCompleteRef = useRef(onTruthComplete);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep the callback refs updated
  onIntroCompleteRef.current = onIntroComplete;
  onTruthCompleteRef.current = onTruthComplete;

  // Typing sound effect
  const playTypingSound = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  };

  // Message sent sound
  const playMessageSound = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  };

  // Metallic hit sound for redaction
  const playMetallicHit = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(320, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(2, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.2);
  };

  // Start intro sequence when component mounts
  useEffect(() => {
    if (introStartedRef.current) return;
    introStartedRef.current = true;

    // TRUTH.EXE sequence
    if (isTruthSequence) {
      const truthMessages = [
        "Wow... you made it.",
        "most people bounce after 30 seconds.",
        "you stayed. you searched. you solved.",
        "this site exists because systems make more sense than people.",
        "To that point portfolios place more value on projects than actual people.",
        "if you got here, you probably think the same way.",
        "that's rare.",
        "if you want to talk about ideas, projects,",
        "or just because you enjoyed this",
        "mateusmuste9@gmail.com",
        "P.S. include \"CODE 9\" in your email ;)"
      ];
      let messageIndex = 0;
      let cancelled = false;

      const sendNextMessage = () => {
        if (cancelled || messageIndex >= truthMessages.length) {
          if (!cancelled) {
            setTimeout(() => onTruthCompleteRef.current?.(), 2000);
          }
          return;
        }
        const currentMessage = truthMessages[messageIndex];
        messageIndex++;
        setIsTyping(true);
        const typingDuration = 800 + Math.random() * 700;
        const typingSoundInterval = setInterval(() => {
          if (!cancelled) playTypingSound();
        }, 100);
        setTimeout(() => {
          if (cancelled) { clearInterval(typingSoundInterval); return; }
          clearInterval(typingSoundInterval);
          setIsTyping(false);
          playMessageSound();
          setMessages(prev => [...prev, { text: currentMessage, highlight: false }]);
          setTimeout(sendNextMessage, 1000 + Math.random() * 2000);
        }, typingDuration);
      };
      setTimeout(sendNextMessage, 1000);
      return () => { cancelled = true; };
    }

    // Main intro sequence
    const messagesToSend: Message[] = [
      { text: "Hey.", highlight: false },
      { text: "You found me.", highlight: false },
      { text: "Or maybe I found you. Hard to tell with these things.", highlight: false },
      { text: "I'm Mateus. This is my corner of the internet.", highlight: false },
      { text: "Before you go clicking around, you should know something.", highlight: true },
      { text: "This is not a portfolio.", highlight: false },
      { text: "This is a mind system.", highlight: false },
      { text: "Everything is intentional.", highlight: true },
      { text: "Every app is meticulously designed to serve a purpose.", highlight: false },
      { text: "Some purposes are obvious. Most aren't.", highlight: true },
      { text: "Have fun exploring!", highlight: true },
      { text: "And if you're the curious type...", highlight: false },
      { text: "There's more here than meets the eye.", highlight: true },
      { text: "Oh, one more thing.", highlight: true, extraPauseBefore: true },
      { text: "And for whatever reason, if you ever find yourself coming across this file, never open truth.exe.", highlight: false, containsTruth: true }
    ];
    let messageIndex = 0;
    let cancelled = false;

    const sendNextMessage = () => {
      if (cancelled) return;

      if (messageIndex >= messagesToSend.length) {
        setTimeout(() => {
          if (cancelled) return;
          setIsRedacting(true);

          const totalToRedact = messagesToSend.length - 1;
          let currentRedact = 0;

          const redactNext = () => {
            if (cancelled || currentRedact >= totalToRedact) {
              setTimeout(() => {
                if (!cancelled) onIntroCompleteRef.current?.();
              }, 2000);
              return;
            }

            playMetallicHit();
            currentRedact++;
            setRedactedCount(currentRedact);
            setTimeout(redactNext, 500);
          };

          redactNext();
        }, 2000);
        return;
      }

      const currentMsg = messagesToSend[messageIndex];
      messageIndex++;

      const extraPause = currentMsg.extraPauseBefore ? 2000 : 0;

      setTimeout(() => {
        if (cancelled) return;
        setIsTyping(true);

        const typingDuration = 1000 + Math.random() * 1000;
        const typingSoundInterval = setInterval(() => {
          if (!cancelled) playTypingSound();
        }, 100);

        setTimeout(() => {
          if (cancelled) {
            clearInterval(typingSoundInterval);
            return;
          }
          clearInterval(typingSoundInterval);
          setIsTyping(false);
          playMessageSound();
          setMessages(prev => [...prev, currentMsg]);

          const nextDelay = 1000 + Math.random() * 2000;
          setTimeout(sendNextMessage, nextDelay);
        }, typingDuration);
      }, extraPause);
    };

    setTimeout(sendNextMessage, 1000);

    return () => { cancelled = true; };
  }, [isTruthSequence]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, redactedCount]);

  // Convert text to redacted blocks
  const redactText = (text: string) => {
    return text.replace(/[^\s]/g, '█');
  };

  return (
    <div className="h-full flex flex-col bg-black select-none overflow-hidden">
      {/* Header */}
      <div className="bg-black border-b border-white/20 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-mono font-black text-xs">
          MM
        </div>
        <div>
          <div className="font-mono text-white text-sm font-bold">
            {isRedacting ? redactText('MATEUS MUSTE') : 'MATEUS MUSTE'}
          </div>
          <div className="font-mono text-[10px] text-white/50 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 ${isRedacting ? 'bg-red-500' : isTyping ? 'bg-white animate-pulse' : 'bg-green-400'}`}></span>
            {isRedacting ? 'ENCRYPTING' : isTyping ? 'COMPOSING' : 'ONLINE'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-auto p-6 space-y-4">
        {messages.filter(msg => msg && (msg.text || typeof msg === 'string')).map((msg, i) => {
          const text = typeof msg === 'string' ? msg : msg.text;
          const highlight = typeof msg === 'object' && msg.highlight;
          const containsTruth = typeof msg === 'object' && msg.containsTruth;

          const isRedacted = isRedacting && i < redactedCount;

          if (containsTruth) {
            if (isRedacting) {
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1 bg-red-500 flex-shrink-0 mt-1" style={{ minHeight: '16px' }}></div>
                  <p className="font-mono text-red-400 text-sm leading-relaxed font-bold">
                    open truth.exe.
                  </p>
                </div>
              );
            }
            const parts = text.split('never open truth.exe');
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-1 ${highlight ? 'bg-white' : 'bg-white/30'} flex-shrink-0 mt-1`} style={{ minHeight: '16px' }}></div>
                <p className="font-mono text-white text-sm leading-relaxed">
                  {parts[0]}
                  <span className="text-red-400 font-bold">never open truth.exe</span>
                  {parts[1] || '.'}
                </p>
              </div>
            );
          }

          if (isRedacted) {
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1 bg-white/10 flex-shrink-0 mt-1" style={{ minHeight: '16px' }}></div>
                <p className="font-mono text-white/30 text-sm leading-relaxed">
                  {redactText(text)}
                </p>
              </div>
            );
          }

          return (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-1 ${highlight ? 'bg-white' : 'bg-white/30'} flex-shrink-0 mt-1`} style={{ minHeight: '16px' }}></div>
              <p className={`font-mono text-sm leading-relaxed ${highlight ? 'text-white font-bold' : 'text-white'}`}>
                {text}
              </p>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-1 bg-white flex-shrink-0" style={{ minHeight: '16px' }}></div>
            <span className="w-2 h-4 bg-white animate-pulse"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

MessagesApp.displayName = 'MessagesApp';

export default MessagesApp;
