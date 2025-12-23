'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface MapAppProps {
  onAchievement?: (id: string) => void;
}

// Location marker for the globe
const LOCATIONS = [
  { name: 'NEW YORK', lat: 40.7128, lng: -74.006 },
  { name: 'LONDON', lat: 51.5074, lng: -0.1278 },
  { name: 'TOKYO', lat: 35.6762, lng: 139.6503 },
  { name: 'SYDNEY', lat: -33.8688, lng: 151.2093 },
  { name: 'SAO PAULO', lat: -23.5505, lng: -46.6333 },
];

// Dynamically import cobe to avoid SSR issues
const CobeGlobe = dynamic(
  () => import('./CobeGlobeInner').then((mod) => mod.CobeGlobeInner),
  { ssr: false, loading: () => <div className="w-full h-full bg-black flex items-center justify-center text-white font-mono text-xs">LOADING GLOBE...</div> }
);

export function MapApp({ onAchievement }: MapAppProps) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [rotationSpeed, setRotationSpeed] = useState(0.001);
  const achievementTriggered = useRef(false);

  const handleLocationSelect = (location: typeof LOCATIONS[0]) => {
    setSelectedLocation(location);
    if (!achievementTriggered.current) {
      achievementTriggered.current = true;
      onAchievement?.('EXPLORER');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black select-none">
      <div className="h-10 px-4 flex justify-between items-center border-b border-gray-800">
        <span className="font-mono text-[10px] font-bold tracking-widest text-white">MAP.EXE</span>
        <span className="font-mono text-[10px] text-gray-500">EARTH</span>
      </div>

      <div className="flex-grow relative overflow-hidden">
        <CobeGlobe
          location={selectedLocation}
          rotationSpeed={rotationSpeed}
        />

        {/* Location info overlay */}
        <div className="absolute top-4 left-4 bg-black/80 border border-gray-700 p-3">
          <div className="font-mono text-xs text-white font-bold">{selectedLocation.name}</div>
          <div className="font-mono text-[10px] text-gray-400 mt-1">
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </div>
        </div>

        {/* Speed control */}
        <div className="absolute bottom-4 left-4 bg-black/80 border border-gray-700 p-2">
          <div className="font-mono text-[10px] text-gray-400 mb-1">ROTATION</div>
          <input
            type="range"
            min="0"
            max="0.01"
            step="0.0005"
            value={rotationSpeed}
            onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

      {/* Location selector */}
      <div className="h-12 px-2 flex items-center gap-2 border-t border-gray-800 overflow-x-auto">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            onClick={() => handleLocationSelect(loc)}
            className={`px-3 py-1 font-mono text-[10px] border transition-colors whitespace-nowrap ${
              selectedLocation.name === loc.name
                ? 'border-white bg-white text-black'
                : 'border-gray-600 text-gray-400 hover:border-white hover:text-white'
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>
    </div>
  );
}
