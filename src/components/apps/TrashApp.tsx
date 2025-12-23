import { useState, memo } from 'react';
import { PixelartIcon } from '@/components/ui';

export const TrashApp = memo(() => {
  const [shakingFile, setShakingFile] = useState<string | null>(null);

  const trashFiles = [
    { name: 'BITCOIN_WALLET.txt', icon: 'FileDoc' },
    { name: 'ACCEPTANCE_LETTER.pdf', icon: 'FileDoc' },
    { name: 'SCHEDULE.ics', icon: 'FileDoc' }
  ];

  const handleFileClick = (fileName: string) => {
    setShakingFile(fileName);
    setTimeout(() => setShakingFile(null), 500);
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">RECYCLE_BIN</span>
        <span className="app-header-subtitle">{trashFiles.length} ITEMS</span>
      </div>
      <div className="flex-grow p-4">
        <div className="grid grid-cols-3 gap-4">
          {trashFiles.map(file => (
            <button
              key={file.name}
              onClick={() => handleFileClick(file.name)}
              className="group flex flex-col items-center gap-2 p-3 cursor-not-allowed hover:bg-gray-100"
              style={{
                animation: shakingFile === file.name ? 'shake 0.5s ease-in-out' : 'none'
              }}
            >
              <div className="bg-white border-2 border-black p-2 icon-shadow opacity-50 group-hover:opacity-70">
                <PixelartIcon name="FileDoc" size={24} />
              </div>
              <span className="font-mono text-[8px] font-bold text-center break-all opacity-50 group-hover:opacity-70">
                {file.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-2 border-t-2 border-black text-center">
        <span className="font-mono text-[10px] text-gray-500">PERMANENTLY DELETED</span>
      </div>
    </div>
  );
});

TrashApp.displayName = 'TrashApp';

export default TrashApp;
