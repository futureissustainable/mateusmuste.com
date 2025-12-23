'use client';

import { useState } from 'react';

interface FilesAppProps {
  onOpenWindow?: (id: string) => void;
}

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'app' | 'file';
  windowId?: string;
}

const FILES: FileItem[] = [
  { id: '1', name: 'GAMES', type: 'folder' },
  { id: '2', name: 'TOOLS', type: 'folder' },
  { id: '3', name: 'MEDIA', type: 'folder' },
  { id: '4', name: 'DOCUMENTS', type: 'folder' },
];

const FOLDER_CONTENTS: Record<string, FileItem[]> = {
  GAMES: [
    { id: 'snake', name: 'SNEK.EXE', type: 'app', windowId: 'SNAKE' },
    { id: 'minesweeper', name: 'MINESWEEPER.EXE', type: 'app', windowId: 'MINESWEEPER' },
    { id: 'labyrinth', name: 'LABYRINTH.EXE', type: 'app', windowId: 'LABYRINTH' },
  ],
  TOOLS: [
    { id: 'paint', name: 'PAINT.EXE', type: 'app', windowId: 'PAINT' },
    { id: 'terminal', name: 'TERMINAL.EXE', type: 'app', windowId: 'TERMINAL' },
    { id: 'pomodoro', name: 'POMODORO.EXE', type: 'app', windowId: 'POMODORO' },
  ],
  MEDIA: [
    { id: 'synth', name: 'SYNTH_001.WAV', type: 'app', windowId: 'SYNTH' },
    { id: 'radio', name: 'RADIO.WAV', type: 'app', windowId: 'RADIO' },
    { id: 'gallery', name: 'GALLERY.EXE', type: 'app', windowId: 'GALLERY' },
  ],
  DOCUMENTS: [
    { id: 'books', name: 'BOOKS.EXE', type: 'app', windowId: 'BOOKS' },
    { id: 'about', name: 'ABOUT.TXT', type: 'app', windowId: 'ABOUT' },
    { id: 'contact', name: 'CONTACT.VCF', type: 'app', windowId: 'CONTACT' },
  ],
};

export function FilesApp({ onOpenWindow }: FilesAppProps) {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const getCurrentFiles = (): FileItem[] => {
    if (currentPath.length === 0) return FILES;
    return FOLDER_CONTENTS[currentPath[currentPath.length - 1]] || [];
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file.id);
  };

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath([...currentPath, file.name]);
    } else if (file.type === 'app' && file.windowId) {
      onOpenWindow?.(file.windowId);
    }
  };

  const goBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
    setSelectedFile(null);
  };

  const getIcon = (type: string): string => {
    switch (type) {
      case 'folder':
        return '[D]';
      case 'app':
        return '[X]';
      default:
        return '[ ]';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">MEDIA_LIB</span>
        <span className="text-gray-500 text-sm">{getCurrentFiles().length} ITEMS</span>
      </div>

      {/* Path bar */}
      <div className="px-4 py-2 border-b-2 border-black flex items-center gap-2">
        <button
          onClick={goBack}
          disabled={currentPath.length === 0}
          className={`font-mono text-xs ${
            currentPath.length === 0 ? 'text-gray-300' : 'text-black hover:underline'
          }`}
        >
          ../
        </button>
        <span className="font-mono text-xs text-gray-500">
          /{currentPath.join('/')}
        </span>
      </div>

      {/* File list */}
      <div className="flex-grow overflow-auto p-2">
        <div className="grid grid-cols-3 gap-2">
          {getCurrentFiles().map((file) => (
            <button
              key={file.id}
              onClick={() => handleFileClick(file)}
              onDoubleClick={() => handleFileDoubleClick(file)}
              className={`p-3 flex flex-col items-center gap-2 border-2 transition-colors ${
                selectedFile === file.id
                  ? 'border-black bg-gray-100'
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 border-2 border-black flex items-center justify-center font-mono text-xs">
                {getIcon(file.type)}
              </div>
              <span className="font-mono text-[10px] text-center break-all">{file.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="h-8 px-4 flex items-center border-t-2 border-black">
        <span className="font-mono text-[10px] text-gray-500">
          {selectedFile ? 'DOUBLE-CLICK TO OPEN' : 'SELECT A FILE'}
        </span>
      </div>
    </div>
  );
}
