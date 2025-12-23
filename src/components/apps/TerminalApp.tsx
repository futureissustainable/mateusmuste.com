import { useState, useEffect, useRef, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';

interface TerminalAppProps {
  onClose?: () => void;
  onOpenApp?: (appId: string) => void;
  onReleaseDog?: () => void;
  onMatrixMode?: () => void;
  onUnlockPrivate?: () => void;
  onAchievement?: (id: string) => void;
  onGodMode?: () => void;
  onUnlockApp?: (appId: string) => void;
  unlockedApps?: Set<string>;
  thirdEyeActive?: boolean;
}

interface HistoryItem {
  type: 'archive' | 'input' | 'output' | 'loading';
  text: string;
}

export const TerminalApp = memo(({
  onReleaseDog,
  onMatrixMode,
  onUnlockPrivate,
  onAchievement,
  onGodMode,
  onUnlockApp,
  unlockedApps,
  thirdEyeActive
}: TerminalAppProps) => {
  // Initial archived history
  const archivedHistory: HistoryItem[] = [
    { type: 'archive', text: '[ARCHIVE] user@system:~$ ping mateus' },
    { type: 'archive', text: '[ARCHIVE] CONNECTION REFUSED' },
    { type: 'archive', text: '[ARCHIVE] user@system:~$ sudo access /personal' },
    { type: 'archive', text: '[ARCHIVE] ACCESS DENIED - CLEARANCE REQUIRED' },
    { type: 'archive', text: '[ARCHIVE] user@system:~$ help' },
    { type: 'archive', text: '[ARCHIVE] SESSION TERMINATED UNEXPECTEDLY' },
    { type: 'output', text: '───────────────────────────────────────────' },
    { type: 'output', text: 'SYSTEM RECOVERY COMPLETE' },
    { type: 'output', text: 'DIAGNOSTICS RECOMMENDED.' },
    { type: 'output', text: 'PLEASE RUN chkdsk' },
    { type: 'output', text: '───────────────────────────────────────────' }
  ];

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const stored = localStorage.getItem('terminal_history');
    return stored ? JSON.parse(stored) : archivedHistory;
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('terminal_history', JSON.stringify(history));
  }, [history]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [awaitingKonami, setAwaitingKonami] = useState(false);
  const [, setKonamiSequence] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const dotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (dotIntervalRef.current) clearInterval(dotIntervalRef.current);
    };
  }, []);

  // Konami code: up up down down left right left right b a
  const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

  // Public commands shown in help and autocomplete
  const commands = [
    'help', 'chkdsk', 'ping', 'sudo reveal', 'clear', 'exit', 'whoami', 'pwd', 'ls'
  ];

  // Check if app is unlocked
  const isAppUnlocked = (appId: string) => unlockedApps?.has(appId);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  // Autocomplete
  useEffect(() => {
    if (input.length > 0) {
      const match = commands.find(cmd => cmd.startsWith(input.toLowerCase()) && cmd !== input.toLowerCase());
      setSuggestion(match || '');
    } else {
      setSuggestion('');
    }
  }, [input]);

  // Handle konami code input when awaiting - 10 second timer
  const konamiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiSucceededRef = useRef(false);

  useEffect(() => {
    if (!awaitingKonami) {
      // Clear timer when not awaiting
      if (konamiTimerRef.current) {
        clearTimeout(konamiTimerRef.current);
        konamiTimerRef.current = null;
      }
      return;
    }

    // Reset success flag
    konamiSucceededRef.current = false;

    // Start 10 second timer
    konamiTimerRef.current = setTimeout(() => {
      if (!konamiSucceededRef.current) {
        addOutput('\nTIME EXPIRED.');
        addOutput('ELEVATION FAILED.');
        addOutput('RETURNING TO VOID...\n');
        setAwaitingKonami(false);
        setTimeout(() => {
          window.location.href = 'https://mateusmuste.com';
        }, 1500);
      }
    }, 10000);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code;
      setKonamiSequence(prev => {
        const newSeq = [...prev, key];
        // Check if sequence matches so far
        const expectedKey = KONAMI_CODE[prev.length];
        if (key !== expectedKey) {
          // Wrong key - reset
          addOutput('INVALID CODE SEQUENCE. TRY AGAIN.');
          addOutput('Listening for code...');
          return [];
        }
        // Check if complete
        if (newSeq.length === KONAMI_CODE.length) {
          // Success! Mark as succeeded and clear timer
          konamiSucceededRef.current = true;
          sounds.konamiActivate();
          if (konamiTimerRef.current) {
            clearTimeout(konamiTimerRef.current);
            konamiTimerRef.current = null;
          }
          setTimeout(() => {
            addOutput('\nCODE ACCEPTED.\n');
            addOutput('ELEVATION COMPLETE.\n');
            addOutput('YOU HAVE BECOME.\n');
            addOutput('───────────────────────────────────────────\n');
            addOutput('TRUTH.EXE RELOCATED\n');
            addOutput('BONUS CONTENT UNLOCKED:');
            addOutput('├── RADIO.WAV');
            addOutput('├── SYNTH.WAV');
            addOutput('├── POMODORO.EXE');
            addOutput('├── SCANNER.EXE');
            addOutput('└── GALLERY.EXE\n');
            addOutput('───────────────────────────────────────────');
            setAwaitingKonami(false);
            onAchievement?.('BECOME_GOD');
            onGodMode?.();
          }, 500);
          return [];
        }
        return newSeq;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (konamiTimerRef.current) {
        clearTimeout(konamiTimerRef.current);
      }
    };
  }, [awaitingKonami, onAchievement, onGodMode]);

  const addOutput = (text: string) => {
    setHistory(prev => [...prev, { type: 'output', text }]);
  };

  const executeCommand = async (cmd: string) => {
    if (awaitingKonami) return; // Don't process commands while waiting for konami
    sounds.terminalSubmit();

    const trimmed = cmd.trim().toLowerCase();
    setHistory(prev => [...prev, { type: 'input', text: `user@system:~$ ${cmd}` }]);
    setInput('');
    setIsLoading(true);

    // Random loading time 0.5-1.5 seconds
    const loadTime = 500 + Math.random() * 1000;

    // Show loading dots
    let dots = '';
    dotIntervalRef.current = setInterval(() => {
      dots = dots.length >= 3 ? '.' : dots + '.';
      setHistory(prev => {
        const newHist = [...prev];
        if (newHist[newHist.length - 1]?.type === 'loading') {
          newHist[newHist.length - 1].text = dots;
        } else {
          newHist.push({ type: 'loading', text: dots });
        }
        return newHist;
      });
    }, 300);

    await new Promise(resolve => setTimeout(resolve, loadTime));
    if (dotIntervalRef.current) clearInterval(dotIntervalRef.current);

    // Remove loading entry
    setHistory(prev => prev.filter(h => h.type !== 'loading'));
    setIsLoading(false);

    // Process commands
    if (trimmed === 'help') {
      // Base help - shown normally
      let helpText = `AVAILABLE COMMANDS:
  help ............. show this menu
  list user ........ show registered users
  ping [user] ...... attempt connection
  sudo reveal ...... unlock hidden layer
  clear ............ clear terminal
  chkdsk ........... run system diagnostics`;

      // If Third Eye is active, show hidden command with redaction
      if (thirdEyeActive) {
        helpText += `
  cmatrix .......... ████████████████`;
      }

      addOutput(helpText);

    } else if (trimmed === 'list user') {
      addOutput(`REGISTERED USERS:
  MATEUS ........... ADMIN
  ████████ ......... ████████
  UNKNOWN .......... CURRENT`);

    } else if (trimmed === 'chkdsk') {
      addOutput('SCANNING SYSTEM...\n');
      await new Promise(r => setTimeout(r, 1000));

      const apps = [
        { name: 'ABOUT.EXE', id: 'ABOUT', alwaysOk: true },
        { name: 'VOID.EXE', id: 'VOID' },
        { name: 'PAINT.EXE', id: 'PAINT' },
        { name: 'SNEK.EXE', id: 'SNAKE' },
        { name: 'LABYRINTH.EXE', id: 'LABYRINTH' },
        { name: 'MINESWEEPER.EXE', id: 'MINESWEEPER' },
        { name: 'STARSHIP.EXE', id: 'STARSHIP' },
        { name: 'DICE.EXE', id: 'DICE' },
        { name: 'TAROT.DAT', id: 'TAROT' },
        { name: 'SYNTH.WAV', id: 'SYNTH' },
        { name: 'RADIO.WAV', id: 'RADIO' },
        { name: 'POMODORO.EXE', id: 'POMODORO' },
        { name: 'GALLERY.EXE', id: 'GALLERY' },
        { name: 'MAP.EXE', id: 'MAP' },
        { name: 'BOOKS.EXE', id: 'BOOKS' },
        { name: 'PRIVATE.EXE', id: 'PERSONAL' },
        { name: 'SCANNER.EXE', id: 'SCANNER' },
        { name: 'BROWSER.EXE', id: 'BROWSER' },
        { name: 'THIRD_EYE.EXE', id: 'THIRD_EYE' },
        { name: 'BACKUP.BAT', id: 'BACKUP' },
        { name: 'TRUTH.EXE', id: 'TRUTH', special: true }
      ];

      let output = 'RECOVERED APPLICATIONS:\n';
      let locked = 0;
      apps.forEach(app => {
        const status = app.special ? 'FILE MISSING' :
                      (app.alwaysOk || isAppUnlocked(app.id)) ? 'OK' : 'LOCKED';
        if (status === 'LOCKED') locked++;
        const padding = '.'.repeat(Math.max(1, 22 - app.name.length));
        output += `├── ${app.name} ${padding} ${status}\n`;
      });
      output += `\nTOTAL: 21 APPLICATIONS\nSTATUS: ${locked} LOCKED, ${apps.filter(a => a.special).length} MISSING\n`;
      output += "\n> TYPE 'help' FOR AVAILABLE COMMANDS";
      addOutput(output);

    } else if (trimmed === 'sudo reveal') {
      addOutput('REVEALING HIDDEN LAYER...\n');
      await new Promise(r => setTimeout(r, 500));
      addOutput('████████████████████████ 100%\n');
      addOutput('THIRD_EYE.EXE UNLOCKED');
      onUnlockApp?.('THIRD_EYE');

    } else if (trimmed === 'ping mateus') {
      addOutput('PINGING MATEUS...\n');
      await new Promise(r => setTimeout(r, 1500));
      addOutput('...\n...\n...\n');
      addOutput('CONNECTION REFUSED\n');
      await new Promise(r => setTimeout(r, 500));
      addOutput('...\n');
      addOutput('BUT SOMETHING RESPONDED.\n');
      addOutput('PAINT.EXE UNLOCKED');
      onUnlockApp?.('PAINT');

    } else if (trimmed === 'cmatrix') {
      addOutput('MATRIX PROTOCOL INITIATED...\n');
      // Turn on matrix mode
      setTimeout(() => onMatrixMode?.(), 300);
      // Turn off after 2 seconds and show completion
      setTimeout(() => {
        onMatrixMode?.(); // Toggle off
        addOutput('MATRIX PROTOCOL COMPLETE\n');
        addOutput('VOID.EXE UNLOCKED');
        onUnlockApp?.('VOID');
      }, 2300);

    } else if (trimmed === 'sudo unlock') {
      addOutput('UNLOCKING RESTRICTED ACCESS...\n');
      await new Promise(r => setTimeout(r, 500));
      addOutput('████████████████████████ 100%\n');
      addOutput('PRIVATE.EXE REVEALED');
      addOutput('WARNING: PASSWORD PROTECTED');
      onUnlockApp?.('PERSONAL');

    } else if (trimmed === 'sudo chmod 777 /private') {
      addOutput('CHANGING PERMISSIONS...\n');
      addOutput('/private');
      addOutput('  ├── read ........ ✓');
      addOutput('  ├── write ....... ✓');
      addOutput('  └── execute ..... ✓\n');
      addOutput('PRIVATE.EXE UNLOCKED');
      onUnlockPrivate?.();
      onAchievement?.('LOCKSMITH');

    } else if (trimmed === 'sudo shooter') {
      addOutput('TARGETING SYSTEMS ONLINE...\n');
      await new Promise(r => setTimeout(r, 500));
      addOutput('████████████████████████ 100%\n');
      addOutput('STARSHIP.EXE UNLOCKED');
      onUnlockApp?.('STARSHIP');

    } else if (trimmed === 'sudo unlock zen') {
      addOutput('ZEN PATHWAY ACTIVATED\n');
      addOutput('BROWSER.EXE UNLOCKED');
      onUnlockApp?.('BROWSER');

    } else if (trimmed === 'sudo become god') {
      addOutput('ELEVATION SEQUENCE INITIATED...\n');
      await new Promise(r => setTimeout(r, 1000));
      addOutput('Listening for code...');
      setAwaitingKonami(true);
      setKonamiSequence([]);

    } else if (trimmed === 'exit') {
      addOutput('There is no escape.');
    } else if (trimmed === 'clear') {
      setHistory([]);
    } else if (trimmed === 'whoami') {
      addOutput('guest');
    } else if (trimmed === 'pwd') {
      addOutput('/home/guest');
    } else if (trimmed === 'ls') {
      addOutput('Desktop  Documents  Downloads  .secrets  /apps  /private');
    } else if (trimmed === 'reset') {
      addOutput('Wiping consciousness...\nReturning to void...');
      setTimeout(() => {
        localStorage.clear();
        window.location.reload();
      }, 1500);
    } else if (trimmed === 'systemctl start dog.exe') {
      addOutput('Starting dog.exe...\n[  OK  ] Started dog.exe');
      setTimeout(() => onReleaseDog?.(), 500);
    } else if (trimmed) {
      sounds.error();
      addOutput(`bash: ${trimmed.split(' ')[0]}: command not found`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (awaitingKonami) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' && !isLoading) {
      executeCommand(input);
    } else if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setInput(suggestion);
      setSuggestion('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm select-none">
      <div className="p-2 border-b border-green-900 flex items-center gap-2">
        <PixelartIcon name="Terminal" size={16} />
        <span className="text-xs font-bold">TERMINAL.EXE</span>
        {awaitingKonami && <span className="text-white text-xs animate-pulse ml-auto">AWAITING INPUT...</span>}
      </div>
      <div ref={historyRef} className="flex-grow overflow-auto p-3 space-y-1">
        {history.map((item, i) => (
          <div key={i} className={
            item.type === 'archive' ? 'text-green-700' :
            item.type === 'input' ? 'text-green-300' :
            item.type === 'loading' ? 'text-green-600 animate-pulse' :
            'text-green-400 whitespace-pre-wrap'
          }>
            {item.text}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-green-900 relative">
        {suggestion && !isLoading && !awaitingKonami && (
          <div className="absolute -top-6 left-3 bg-green-900/80 text-green-300 px-2 py-0.5 text-xs rounded">
            {suggestion} <span className="text-green-600">[TAB]</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-green-500">user@system:~$</span>
          <input
            ref={inputRef}
            type="text"
            aria-label="Terminal command input"
            value={input}
            onChange={(e) => !awaitingKonami && setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || awaitingKonami}
            className="flex-grow bg-transparent border-none outline-none text-green-300 placeholder-green-800"
            placeholder={awaitingKonami ? 'Enter code sequence...' : isLoading ? '' : 'Enter command...'}
            autoFocus
          />
          {(isLoading || awaitingKonami) && <span className="animate-pulse">_</span>}
        </div>
      </div>
    </div>
  );
});

TerminalApp.displayName = 'TerminalApp';

export default TerminalApp;
