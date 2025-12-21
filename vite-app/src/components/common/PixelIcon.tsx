interface PixelIconProps {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function PixelIcon({ name, size = 64, className = '', style = {} }: PixelIconProps) {
  return (
    <img
      src={`https://unpkg.com/pixelarticons@1.8.1/svg/${name}.svg`}
      width={size}
      height={size}
      alt={name}
      style={{ imageRendering: 'pixelated', ...style }}
      className={className}
    />
  )
}

// Pre-configured icon components for common use
export const Icons = {
  Terminal: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="monitor" {...props} />,
  Folder: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="folder" {...props} />,
  Palette: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="fill" {...props} />,
  Gamepad: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="gamepad" {...props} />,
  Trash: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="trash" {...props} />,
  File: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="file" {...props} />,
  Close: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="close" {...props} />,
  Movie: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="movie" {...props} />,
  Book: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="book" {...props} />,
  Music: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="music" {...props} />,
  Code: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="code" {...props} />,
  Dice: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="dice" {...props} />,
  Clock: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="clock" {...props} />,
  Heart: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="heart" {...props} />,
  Lock: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="lock" {...props} />,
  Trophy: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="trophy" {...props} />,
  Mail: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="mail" {...props} />,
  Image: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="image" {...props} />,
  Map: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="map" {...props} />,
  User: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="user" {...props} />,
  Power: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="power" {...props} />,
  Card: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="card" {...props} />,
  Paw: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="paw" {...props} />,
  Volume: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="volume-3" {...props} />,
  VolumeOff: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="volume-x" {...props} />,
  ArrowUp: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="arrow-up" {...props} />,
  Grid: (props: Omit<PixelIconProps, 'name'>) => <PixelIcon name="add-grid" {...props} />,
}
