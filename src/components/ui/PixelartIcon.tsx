import type { IconName } from '@/types';

// Map icon names to pixelarticons SVG names
const iconMap: Record<IconName, string> = {
  Terminal: 'monitor',
  Folder: 'folder',
  Palette: 'fill',
  Snek: 'gamepad',
  TrashCan: 'trash',
  Undo: 'undo',
  Redo: 'redo',
  FileDoc: 'file',
  X: 'close',
  Minus: 'minus',
  Square: 'checkbox',
  Trash: 'trash',
  Send: 'send',
  Movies: 'movie',
  Books: 'book',
  Games: 'gamepad',
  Music: 'music',
  Back: 'arrow-left',
  Void: 'code',
  Radio: 'radio-on',
  Dice: 'dice',
  Labyrinth: 'layout-rows',
  Minesweeper: 'table',
  Starship: 'arrow-up',
  Synth: 'keyboard',
  Destruction: 'power',
  Tarot: 'card',
  Dog: 'paw',
  Email: 'mail',
  Apps: 'add-grid',
  Gallery: 'image',
  Globe: 'map',
  Pomodoro: 'clock',
  Charging: 'heart',
  Speaker: 'speaker',
  SpeakerOff: 'speaker',
  HealthScanner: 'heart',
  Lock: 'lock',
  FolderClosed: 'folder',
  GamesFolder: 'gamepad',
  ProductivityFolder: 'sliders',
  AboutFolder: 'user',
  ThirdEye: 'book-open',
  Browser: 'monitor',
  Trophy: 'trophy',
  Message: 'mail',
  RainAlt: 'rain-alt',
  Alert: 'alert',
  Repeat: 'repeat',
  Sword: 'sword',
  Expand: 'expand',
  Controller: 'gamepad',
  Clock: 'clock',
  Cursor: 'cursor',
  Skull: 'skull',
  Fire: 'fire',
  Bomb: 'bomb',
  Badge: 'badge',
  Star: 'star',
  Eye: 'eye',
  Heart: 'heart',
  ArrowLeft: 'arrow-left',
};

interface PixelartIconProps {
  name: IconName;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const PixelartIcon = ({
  name,
  size = 64,
  style = {},
  className = '',
  ...props
}: PixelartIconProps & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const svgName = iconMap[name] || 'file';

  return (
    <img
      src={`https://unpkg.com/pixelarticons@1.8.1/svg/${svgName}.svg`}
      alt={name}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', ...style }}
      className={className}
      draggable={false}
      {...props}
    />
  );
};

// Icon mapping for APPS folder and desktop
export const APP_ICONS: Record<string, IconName> = {
  TERMINAL: 'Terminal',
  ABOUT: 'Folder',
  SYSTEM: 'Terminal',
  FILES: 'Folder',
  APPS: 'Apps',
  CONTACT: 'Email',
  PAINT: 'Palette',
  SNAKE: 'Snek',
  TRASH: 'TrashCan',
  VOID: 'Void',
  RADIO: 'Radio',
  DICE: 'Dice',
  LABYRINTH: 'Labyrinth',
  MINESWEEPER: 'Minesweeper',
  STARSHIP: 'Starship',
  SYNTH: 'Synth',
  DESTRUCTION: 'Destruction',
  TAROT: 'Tarot',
  GALLERY: 'Gallery',
  MAP: 'Globe',
  POMODORO: 'Pomodoro',
  SCANNER: 'HealthScanner',
  PERSONAL: 'Lock',
  TRUTH: 'FileDoc',
  DOG_STORY: 'FileDoc',
  THIRD_EYE: 'ThirdEye',
  BROWSER: 'Browser',
  END: 'Trophy',
  BOOKS: 'Books',
  BACKUP: 'Terminal',
  MESSAGES: 'Email',
};

export default PixelartIcon;
