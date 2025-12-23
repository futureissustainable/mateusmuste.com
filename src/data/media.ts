// Media database for the File Explorer
export interface MediaItem {
  title: string;
  artist?: string;
}

export const MEDIA_DB: Record<string, MediaItem[]> = {
  CINEMA_TV: [
    { title: "Blade Runner 2049" },
    { title: "Mr. Robot" },
    { title: "True Detective" },
    { title: "Succession" },
    { title: "The Bear" },
    { title: "Ex Machina" },
    { title: "Fight Club" },
    { title: "Better Call Saul" },
    { title: "Whiplash" },
    { title: "Black Mirror" }
  ],
  LITERATURE: [
    { title: "Brothers Karamazov" },
    { title: "Looking for Alaska" },
    { title: "Atlas Shrugged" },
    { title: "Pale Blue Dot" },
    { title: "Lean Startup" },
    { title: "Fight Club" },
    { title: "Principles by Ray Dalio" },
    { title: "The Fountainhead" },
    { title: "Crime & Punishment" },
    { title: "1984" },
    { title: "Master & Margarita" },
    { title: "American Psycho" },
    { title: "Elon Musk Biography" },
    { title: "How to Get Filthy Rich in Rising Asia" },
    { title: "Fathers and Sons" },
    { title: "Geometry for Ocelots" }
  ],
  GAMES: [
    { title: "Dark Souls III" },
    { title: "The Last of Us Pt II" },
    { title: "Outer Wilds" },
    { title: "God of War Ragnarok" },
    { title: "Blue Prince" },
    { title: "Cyberpunk 2077" },
    { title: "Night in the Woods" }
  ],
  AUDIO: [
    { title: "Demos EP", artist: "Daughter" },
    { title: "Mr. Morale...", artist: "Kendrick Lamar" },
    { title: "The Life of Pablo", artist: "Kanye West" },
    { title: "Ison", artist: "Sevdaliza" },
    { title: "If You're Reading This It's Too Late", artist: "Drake" },
    { title: "LP!", artist: "JPEGMAFIA" },
    { title: "Miss Anthropocene", artist: "Grimes" },
    { title: "The Eminem Show", artist: "Eminem" },
    { title: "4 Your Eyez Only", artist: "J. Cole" },
    { title: "Yeezus", artist: "Kanye West" },
    { title: "This story is dedicated...", artist: "Grimes" }
  ]
};

export const MEDIA_FOLDERS = [
  { key: 'CINEMA_TV', name: 'TV', icon: 'Movies' },
  { key: 'LITERATURE', name: 'BOOKS', icon: 'Books' },
  { key: 'GAMES', name: 'GAMES', icon: 'Games' },
  { key: 'AUDIO', name: 'MUSIC', icon: 'Music' }
] as const;
