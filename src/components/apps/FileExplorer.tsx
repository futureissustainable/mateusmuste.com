import { useState, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';
import { MEDIA_DB, MEDIA_FOLDERS, type MediaItem } from '@/data/media';

interface FileExplorerProps {
  onAchievement?: (id: string) => void;
}

// Clean media list component
const MediaList = memo(({ items }: { items: MediaItem[] }) => {
  return (
    <div className="h-full overflow-auto bg-white">
      <div className="divide-y-2 divide-black">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="group flex items-baseline gap-4 px-4 py-3 hover:bg-black hover:text-white transition-colors cursor-default"
          >
            <span className="text-[10px] text-gray-400 group-hover:text-gray-500 w-6 tabular-nums">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-sm font-bold tracking-tight flex-grow">
              {item.title}
            </span>
            {item.artist && (
              <span className="font-mono text-xs text-gray-500 group-hover:text-gray-400">
                {item.artist}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

MediaList.displayName = 'MediaList';

export const FileExplorer = memo(({ onAchievement }: FileExplorerProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [visitedFolders, setVisitedFolders] = useState<string[]>(() => {
    const stored = localStorage.getItem('media_lib_visited');
    return stored ? JSON.parse(stored) : [];
  });

  const handleFolderSelect = (key: string) => {
    sounds.folderOpen();
    setSelectedFolder(key);
    if (!visitedFolders.includes(key)) {
      const newVisited = [...visitedFolders, key];
      setVisitedFolders(newVisited);
      localStorage.setItem('media_lib_visited', JSON.stringify(newVisited));
      // Check if all folders visited
      if (newVisited.length >= MEDIA_FOLDERS.length) {
        onAchievement?.('DEEP_LISTENER');
      }
    }
  };

  if (selectedFolder) {
    const folder = MEDIA_FOLDERS.find(f => f.key === selectedFolder);
    const iconName = folder?.icon || 'Folder';
    const items = MEDIA_DB[selectedFolder] || [];

    return (
      <div className="h-full flex flex-col bg-white select-none">
        <div className="p-2 border-b-2 border-black bg-white flex items-center gap-3">
          <button
            onClick={() => { sounds.folderClose(); setSelectedFolder(null); }}
            className="p-1 border-2 border-black hover:bg-black hover:text-white"
          >
            <PixelartIcon name="Back" size={16} />
          </button>
          <PixelartIcon name={iconName} size={24} />
          <span className="font-mono text-xs font-bold uppercase">{folder?.name}</span>
          <span className="app-footer-text">({items.length} ITEMS)</span>
        </div>
        <div className="flex-grow overflow-hidden">
          <MediaList items={items} />
        </div>
        <div className="app-footer">
          <span className="app-footer-text">{items.length} ITEMS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="p-2 border-b-2 border-black bg-white flex items-center gap-2">
        <PixelartIcon name="Folder" size={24} />
        <span className="app-header-title">MEDIA_LIB</span>
        <span className="app-footer-text">/ROOT/MEDIA</span>
      </div>
      <div className="flex-grow p-4 md:p-6 flex items-start justify-center bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {MEDIA_FOLDERS.map(folder => {
            const isVisited = visitedFolders.includes(folder.key);
            return (
              <button
                key={folder.key}
                onClick={() => handleFolderSelect(folder.key)}
                className="group flex flex-col items-center gap-2 p-4 hover:bg-white border-2 border-transparent hover:border-black transition-all"
              >
                <div className={`bg-white border-2 border-black p-3 icon-shadow group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all ${isVisited ? 'opacity-100' : 'opacity-70'}`}>
                  <PixelartIcon name={folder.icon} size={48} />
                </div>
                <span className="font-mono text-xs font-bold uppercase">{folder.name}</span>
                <span className="app-footer-text">{MEDIA_DB[folder.key].length} ITEMS</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="app-footer">
        <span className="app-footer-text">MOVIES - BOOKS - GAMES - MUSIC</span>
      </div>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';

export default FileExplorer;
