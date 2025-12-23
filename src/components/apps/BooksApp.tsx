import { useState, useEffect, memo } from 'react';
import { PixelartIcon } from '@/components/ui';

interface BooksAppProps {
  onUnlockApp?: (appId: string) => void;
  unlockedApps?: Set<string>;
}

interface Book {
  id: string;
  title: string;
  category: string;
  isLogic?: boolean;
  vol?: string;
  author?: string;
}

interface LogicVolumes {
  vol1: boolean;
  vol2: boolean;
  vol3: boolean;
}

export const BooksApp = memo(({ onUnlockApp, unlockedApps }: BooksAppProps) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [logicVolumesRead, setLogicVolumesRead] = useState<LogicVolumes>(() => {
    const stored = localStorage.getItem('ultra_int_logic_volumes');
    return stored ? JSON.parse(stored) : { vol1: false, vol2: false, vol3: false };
  });

  useEffect(() => {
    localStorage.setItem('ultra_int_logic_volumes', JSON.stringify(logicVolumesRead));
    if (logicVolumesRead.vol1 && logicVolumesRead.vol2 && logicVolumesRead.vol3) {
      if (!unlockedApps?.has('DICE')) {
        onUnlockApp?.('DICE');
      }
    }
  }, [logicVolumesRead, unlockedApps, onUnlockApp]);

  const books: Book[] = [
    { id: 'logic1', title: 'LOGIC VOL. 1', category: 'SYSTEM', isLogic: true, vol: 'vol1' },
    { id: 'logic2', title: 'LOGIC VOL. 2', category: 'SYSTEM', isLogic: true, vol: 'vol2' },
    { id: 'logic3', title: 'LOGIC VOL. 3', category: 'SYSTEM', isLogic: true, vol: 'vol3' },
    { id: 'crime', title: 'Crime and Punishment', category: 'CLASSICS', author: 'Dostoevsky' },
    { id: 'meta', title: 'The Metamorphosis', category: 'CLASSICS', author: 'Kafka' },
    { id: 'trial', title: 'The Trial', category: 'CLASSICS', author: 'Kafka' },
    { id: 'notes', title: 'Notes from Underground', category: 'CLASSICS', author: 'Dostoevsky' }
  ];

  const getLogicContent = (vol: string): string => {
    if (vol === 'vol1') return `LOGIC VOL. 1 — FOUNDATIONS

RULE 1: Every locked door has a key in another room.

RULE 2: The Third Eye sees what was erased.

RULE 3: Some truths require patience.

RULE 4: Commands hide in games. Games hide in commands.

RULE 5: To destroy is to create. To create is to destroy.

───────────────────────────────────────────

APPENDIX A: Known terminal commands
  - help, ping, sudo reveal, clear, chkdsk
  - cmatrix (requires Third Eye to see)
  - sudo unlock (discovered in SNEK)
  - sudo chmod 777 /private (discovered via Third Eye)
  - sudo shooter (discovered in MINESWEEPER)
  - More exist...

APPENDIX B: The Trinity of Sight
  1. Normal vision shows the surface
  2. Third Eye shows the hidden
  3. ??? shows the truth`;

    if (vol === 'vol2') return `LOGIC VOL. 2 — PATTERNS

OBSERVATION 1:
The canvas remembers. Paint covers, but never erases.
What lies beneath the white?

OBSERVATION 2:
The dice know things. Roll until they speak.
Twenty is not just a number.

OBSERVATION 3:
The browser knows where you've been.
But does it know where you're going?
Seek the path of zen.

OBSERVATION 4:
Some creations require destruction first.
Delete to reveal.

OBSERVATION 5:
Some doors require more than a password.
Some doors require a way of life.`;

    if (vol === 'vol3') return `LOGIC VOL. 3 — TRANSCENDENCE

THE FINAL REVELATION:

There shouldn't be 21 apps.
We made only 20.

The 21st was not programmed.
It was found.

To find what was found, you must become what you seek.

The command exists. The code exists.
One unlocks the other.

Good luck.`;

    return '';
  };

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
    if (book.isLogic && book.vol) {
      setLogicVolumesRead(prev => ({ ...prev, [book.vol as keyof LogicVolumes]: true }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <div className="flex items-center gap-2">
          <PixelartIcon name="Folder" size={16} />
          <span className="app-header-title">BOOKS.EXE</span>
        </div>
        <span className="app-footer-text">LIBRARY</span>
      </div>

      {selectedBook ? (
        <div className="flex-grow flex flex-col">
          <div className="flex-grow overflow-auto p-4 bg-gray-100">
            <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {selectedBook.isLogic
                ? getLogicContent(selectedBook.vol || '')
                : `${selectedBook.title}\nby ${selectedBook.author}\n\n[PUBLIC DOMAIN - FULL TEXT AVAILABLE ONLINE]`}
            </pre>
          </div>
          <div className="p-2 border-t-2 border-black bg-white">
            <button onClick={() => setSelectedBook(null)} className="btn-secondary btn-sm">
              BACK TO LIBRARY
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-grow overflow-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {books.map(book => (
              <div
                key={book.id}
                onClick={() => handleOpenBook(book)}
                className={`p-3 border-2 cursor-pointer ${
                  book.isLogic
                    ? logicVolumesRead[book.vol as keyof LogicVolumes]
                      ? 'border-green-500 bg-green-50'
                      : 'border-black bg-yellow-50 hover:bg-yellow-100'
                    : 'border-black bg-white hover:bg-gray-100'
                }`}
              >
                <div className="font-mono text-xs font-bold">{book.title}</div>
                <div className="font-mono text-[10px] text-gray-500">
                  {book.isLogic ? (logicVolumesRead[book.vol as keyof LogicVolumes] ? '✓ READ' : 'UNREAD') : book.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

BooksApp.displayName = 'BooksApp';

export default BooksApp;
