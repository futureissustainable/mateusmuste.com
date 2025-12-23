import { useState, memo } from 'react';
import { PixelartIcon } from '@/components/ui';

interface Photo {
  id: number;
  title: string;
  category: string;
  desc: string;
}

export const GalleryApp = memo(() => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const photos: Photo[] = [
    { id: 1, title: 'ME_001.JPG', category: 'SELF', desc: 'Profile shot' },
    { id: 2, title: 'ME_002.JPG', category: 'SELF', desc: 'Another one' },
    { id: 3, title: 'DOG_001.JPG', category: 'DOGS', desc: 'Good boy' },
    { id: 4, title: 'DOG_002.JPG', category: 'DOGS', desc: 'Best friend' },
    { id: 5, title: 'DOG_003.JPG', category: 'DOGS', desc: 'Sleeping' },
    { id: 6, title: 'WORK_001.JPG', category: 'WORK', desc: 'Office vibes' },
    { id: 7, title: 'WORK_002.JPG', category: 'WORK', desc: 'Late night coding' },
    { id: 8, title: 'WORK_003.JPG', category: 'WORK', desc: 'Setup tour' },
    { id: 9, title: 'RANDOM_001.JPG', category: 'MISC', desc: 'Life moment' }
  ];

  const getPlaceholderPattern = (id: number): number[][] => {
    const patterns: number[][][] = [
      [[0, 0, 1, 1, 0, 0], [0, 1, 1, 1, 1, 0], [0, 0, 1, 1, 0, 0], [0, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1], [1, 0, 1, 1, 0, 1], [0, 0, 1, 1, 0, 0], [0, 1, 0, 0, 1, 0]],
      [[0, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1], [0, 1, 0, 0, 1, 0], [0, 0, 1, 1, 0, 0], [0, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1], [0, 1, 0, 0, 1, 0], [1, 1, 0, 0, 1, 1]],
      [[1, 1, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1], [0, 1, 0, 0, 1, 0], [0, 1, 1, 1, 1, 0], [0, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 1], [1, 1, 0, 0, 1, 1]],
      [[0, 0, 0, 0, 0, 0], [1, 1, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 0], [1, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0]],
      [[0, 1, 1, 0, 0, 0], [1, 1, 1, 1, 1, 0], [0, 1, 1, 1, 1, 1], [0, 0, 1, 1, 1, 0], [0, 1, 0, 0, 1, 0], [1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0]],
      [[0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1], [0, 0, 1, 1, 0, 0], [0, 1, 1, 1, 1, 0]],
      [[1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 1], [1, 0, 1, 0, 0, 1], [1, 0, 0, 1, 1, 1], [1, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1]],
      [[0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 1, 1], [1, 0, 1, 0, 1, 0], [1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 0], [0, 1, 0, 0, 1, 0], [0, 1, 1, 1, 1, 0]],
      [[1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1], [1, 1, 0, 0, 1, 1], [0, 0, 1, 1, 0, 0], [1, 0, 0, 0, 0, 1], [0, 1, 1, 1, 1, 0], [1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 1]]
    ];
    return patterns[(id - 1) % patterns.length];
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <div className="flex items-center gap-2">
          <PixelartIcon name="Folder" size={16} />
          <span className="app-header-title">GALLERY.EXE</span>
        </div>
        <span className="app-footer-text">{photos.length} PHOTOS</span>
      </div>

      {selectedPhoto ? (
        <div className="flex-grow flex flex-col bg-black">
          <div className="flex-grow flex items-center justify-center p-8">
            <div className="bg-gray-900 border-2 border-white p-4">
              <svg width="240" height="240" viewBox="0 0 6 8" style={{ imageRendering: 'pixelated' }}>
                <rect width="6" height="8" fill="#222" />
                {getPlaceholderPattern(selectedPhoto.id).map((row, y) =>
                  row.map((cell, x) =>
                    cell ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#fff" /> : null
                  )
                )}
              </svg>
            </div>
          </div>
          <div className="p-4 bg-gray-900 border-t-2 border-white">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-mono text-white text-sm font-bold">{selectedPhoto.title}</div>
                <div className="font-mono text-gray-400 text-[10px]">{selectedPhoto.category} / {selectedPhoto.desc}</div>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="btn-secondary btn-sm"
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow p-4 overflow-auto bg-gray-100">
          <div className="grid grid-cols-3 gap-3">
            {photos.map(photo => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group aspect-square bg-white border-2 border-black hover:bg-black transition-all flex flex-col items-center justify-center p-2"
              >
                <svg width="48" height="64" viewBox="0 0 6 8" style={{ imageRendering: 'pixelated' }} className="group-hover:invert">
                  <rect width="6" height="8" fill="#eee" />
                  {getPlaceholderPattern(photo.id).map((row, y) =>
                    row.map((cell, x) =>
                      cell ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" /> : null
                    )
                  )}
                </svg>
                <div className="font-mono text-[8px] mt-1 text-gray-600 group-hover:text-white truncate w-full text-center">{photo.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

GalleryApp.displayName = 'GalleryApp';

export default GalleryApp;
