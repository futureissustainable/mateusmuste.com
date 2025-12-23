import { memo } from 'react';

interface DogSpriteProps {
  animated?: boolean;
  style?: React.CSSProperties;
  gold?: boolean;
}

// 16x16 pixel dog sprite data
const DOG_PIXELS = [
  "0000011111000000",
  "0000111111100000",
  "0001111111110000",
  "0011011111110000",
  "0011111111110000",
  "0111111111110000",
  "0111111111110000",
  "1111111111100000",
  "1111111111000000",
  "0111111111111100",
  "0011111111111110",
  "0001110111011110",
  "0001110111011100",
  "0001100110011000",
  "0001100110011000",
  "0000000000000000",
];

export const DogSprite = memo(({ animated = false, style = {}, gold = false }: DogSpriteProps) => {
  const pixelSize = 4;
  const width = 16 * pixelSize;
  const height = 16 * pixelSize;
  const color = gold ? '#FFD700' : '#000000';
  const eyeColor = gold ? '#000000' : '#FFFFFF';

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        imageRendering: 'pixelated',
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 16 16"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {DOG_PIXELS.map((row, y) =>
          row.split('').map((pixel, x) =>
            pixel === '1' ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={color}
              />
            ) : null
          )
        )}
        {/* Eyes */}
        <rect x={3} y={3} width={1} height={1} fill={eyeColor} />
        <rect x={6} y={3} width={1} height={1} fill={eyeColor} />
        {/* Nose */}
        <rect x={4} y={5} width={2} height={1} fill={gold ? '#444' : '#666'} />
        {/* Tongue (animated) */}
        {animated && (
          <rect x={5} y={6} width={1} height={2} fill="#FF6B6B">
            <animate
              attributeName="height"
              values="0;2;0"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </rect>
        )}
        {/* Tail */}
        {animated ? (
          <g>
            <rect x={14} y={7} width={1} height={1} fill={color}>
              <animate
                attributeName="y"
                values="7;5;7"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </rect>
            <rect x={15} y={6} width={1} height={1} fill={color}>
              <animate
                attributeName="y"
                values="6;4;6"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </rect>
          </g>
        ) : (
          <g>
            <rect x={14} y={7} width={1} height={1} fill={color} />
            <rect x={15} y={6} width={1} height={1} fill={color} />
          </g>
        )}
      </svg>
      {/* Sparkle effect for gold dog */}
      {gold && animated && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 8,
            height: 8,
            background: '#FFD700',
            borderRadius: '50%',
            animation: 'pulse 0.5s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
});

DogSprite.displayName = 'DogSprite';

export default DogSprite;
