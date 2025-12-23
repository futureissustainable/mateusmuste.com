'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface TerminalAppProps {
  onAchievement?: (id: string) => void;
  onOpenWindow?: (id: string) => void;
  onUnlockApp?: (id: string) => void;
}

interface HistoryEntry {
  command: string;
  output: string;
  isError?: boolean;
}

export function TerminalApp({ onAchievement, onOpenWindow, onUnlockApp }: TerminalAppProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { command: '', output: 'ULTRAINT TERMINAL v1.0.0\nType "help" for available commands.\n' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const args = trimmed.split(' ');
    const command = args[0];

    let output = '';
    let isError = false;

    switch (command) {
      case '':
        return;

      case 'help':
        output = `AVAILABLE COMMANDS:
  help          - Show this help message
  clear         - Clear terminal screen
  date          - Show current date/time
  whoami        - Display user info
  ls            - List files
  cat [file]    - Read file contents
  ping [host]   - Ping a host
  echo [text]   - Print text
  matrix        - Enter the matrix
  sudo [cmd]    - Run as admin
  neofetch      - System information
  fortune       - Get your fortune`;
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'date':
        output = new Date().toString();
        break;

      case 'whoami':
        output = 'guest@ultraint.os';
        break;

      case 'ls':
        output = `ABOUT.EXE    CONTACT.EXE    TRASH.BIN
PAINT.EXE    SNAKE.EXE      SYNTH.EXE
RADIO.WAV    MAP.EXE        TERMINAL.EXE
.secrets     .hidden        .truth`;
        break;

      case 'cat':
        if (args[1] === '.secrets') {
          output = 'ACCESS DENIED: File encrypted';
          isError = true;
        } else if (args[1] === '.hidden') {
          output = 'THE TRUTH IS IN THE DICE';
          onAchievement?.('HACKER');
        } else if (args[1] === '.truth') {
          output = 'SUDO UNLOCK REVEALS ALL';
        } else {
          output = `cat: ${args[1] || 'no file specified'}: No such file`;
          isError = true;
        }
        break;

      case 'ping':
        if (args[1]) {
          output = `PING ${args[1]}... 64 bytes: time=42ms\nPING ${args[1]}... 64 bytes: time=38ms\nPING ${args[1]}... 64 bytes: time=41ms`;
        } else {
          output = 'Usage: ping [host]';
          isError = true;
        }
        break;

      case 'echo':
        output = args.slice(1).join(' ') || '';
        break;

      case 'matrix':
      case 'cmatrix':
        output = 'ENTERING THE MATRIX...';
        onAchievement?.('NEO');
        break;

      case 'neofetch':
        output = `
  ██╗   ██╗██╗     ████████╗
  ██║   ██║██║     ╚══██╔══╝
  ██║   ██║██║        ██║
  ██║   ██║██║        ██║
  ╚██████╔╝███████╗   ██║
   ╚═════╝ ╚══════╝   ╚═╝

  OS: ULTRAINT v1.0.0
  Host: Browser
  Kernel: JavaScript
  Shell: TERMINAL.EXE
  Resolution: ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown'}
  CPU: Web Worker (${navigator.hardwareConcurrency || '?'} cores)
  Memory: ${(navigator as Navigator & { deviceMemory?: number }).deviceMemory || '?'}GB`;
        break;

      case 'fortune':
        const fortunes = [
          'You will discover something hidden today.',
          'The dice know more than they show.',
          'Twenty is the magic number.',
          'Some paths require sudo.',
          'The third eye sees all.',
        ];
        output = fortunes[Math.floor(Math.random() * fortunes.length)];
        break;

      case 'sudo':
        if (args[1] === 'unlock') {
          output = 'UNLOCKING HIDDEN CONTENT...';
          onUnlockApp?.('VOID');
          onAchievement?.('SUDO_MASTER');
        } else if (args[1] === 'reveal') {
          output = 'REVEALING SECRETS...';
          onAchievement?.('REVEALER');
        } else if (args[1] === 'shooter') {
          output = 'STARSHIP UNLOCKED';
          onUnlockApp?.('STARSHIP');
        } else if (args.slice(1).join(' ') === 'chmod 777 /private') {
          output = 'PRIVATE ACCESS GRANTED';
          onUnlockApp?.('PERSONAL');
        } else {
          output = `sudo: ${args[1] || 'no command'}: command not found`;
          isError = true;
        }
        break;

      default:
        output = `Command not found: ${command}. Type "help" for available commands.`;
        isError = true;
    }

    setHistory((prev) => [...prev, { command: cmd, output, isError }]);
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
  }, [onAchievement, onUnlockApp]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-black font-mono text-green-400 select-none"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="h-8 px-4 flex items-center border-b border-green-900">
        <span className="text-[10px] tracking-widest">TERMINAL.EXE</span>
      </div>

      <div ref={outputRef} className="flex-grow overflow-auto p-2 text-xs">
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            {entry.command && (
              <div className="flex gap-2">
                <span className="text-green-600">guest@ultraint:~$</span>
                <span>{entry.command}</span>
              </div>
            )}
            <pre className={`whitespace-pre-wrap ${entry.isError ? 'text-red-400' : ''}`}>
              {entry.output}
            </pre>
          </div>
        ))}

        <div className="flex gap-2">
          <span className="text-green-600">guest@ultraint:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent outline-none text-green-400 caret-green-400"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
