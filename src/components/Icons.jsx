import React from 'react';

// Pixelart Icon component using unpkg CDN
export const PixelartIcon = ({ name, size = 64, style = {}, className = '', ...props }) => (
    <img
        src={`https://unpkg.com/pixelarticons@1.8.1/svg/${name}.svg`}
        width={size}
        height={size}
        alt={name}
        style={{ imageRendering: 'pixelated', ...style }}
        className={className}
        {...props}
    />
);

// Icon collection - all icons used in the app
export const Icons = {
    // System
    Terminal: (p) => <PixelartIcon name="monitor" {...p} />,
    Folder: (p) => <PixelartIcon name="folder" {...p} />,
    Palette: (p) => <PixelartIcon name="fill" {...p} />,
    Snek: (p) => <PixelartIcon name="gamepad" {...p} />,
    TrashCan: (p) => <PixelartIcon name="trash" {...p} />,
    Undo: (p) => <PixelartIcon name="undo" {...p} />,
    Redo: (p) => <PixelartIcon name="redo" {...p} />,
    FileDoc: (p) => <PixelartIcon name="file" {...p} />,

    // Window controls
    X: ({ size = 24, ...p }) => <PixelartIcon name="close" size={size} {...p} />,
    Minus: ({ size = 24, ...p }) => <PixelartIcon name="minus" size={size} {...p} />,
    Square: ({ size = 24, ...p }) => <PixelartIcon name="checkbox" size={size} {...p} />,
    Trash: (p) => <PixelartIcon name="trash" {...p} />,
    Send: (p) => <PixelartIcon name="send" {...p} />,

    // Media folder
    Movies: (p) => <PixelartIcon name="movie" {...p} />,
    Books: (p) => <PixelartIcon name="book" {...p} />,
    Games: (p) => <PixelartIcon name="gamepad" {...p} />,
    Music: (p) => <PixelartIcon name="music" {...p} />,
    Back: (p) => <PixelartIcon name="arrow-left" {...p} />,

    // App icons
    Void: (p) => <PixelartIcon name="code" {...p} />,
    Radio: (p) => <PixelartIcon name="radio-on" {...p} />,
    Dice: (p) => <PixelartIcon name="dice" {...p} />,
    Labyrinth: (p) => <PixelartIcon name="layout-rows" {...p} />,
    Minesweeper: (p) => <PixelartIcon name="table" {...p} />,
    Starship: (p) => <PixelartIcon name="arrow-up" {...p} />,
    Synth: (p) => <PixelartIcon name="keyboard" {...p} />,
    Destruction: (p) => <PixelartIcon name="power" {...p} />,
    Tarot: (p) => <PixelartIcon name="card" {...p} />,
    Dog: (p) => <PixelartIcon name="paw" {...p} />,
    Email: (p) => <PixelartIcon name="mail" {...p} />,
    Apps: (p) => <PixelartIcon name="add-grid" {...p} />,
    Gallery: (p) => <PixelartIcon name="image" {...p} />,
    Globe: (p) => <PixelartIcon name="map" {...p} />,
    Pomodoro: (p) => <PixelartIcon name="clock" {...p} />,
    Charging: (p) => <PixelartIcon name="power" {...p} />,
    Speaker: (p) => <PixelartIcon name="volume-3" {...p} />,
    SpeakerOff: (p) => <PixelartIcon name="volume-x" {...p} />,
    HealthScanner: (p) => <PixelartIcon name="heart" {...p} />,
    Lock: (p) => <PixelartIcon name="lock" {...p} />,
    FolderClosed: (p) => <PixelartIcon name="folder" {...p} />,
    GamesFolder: (p) => <PixelartIcon name="gamepad" {...p} />,
    ProductivityFolder: (p) => <PixelartIcon name="sliders" {...p} />,
    AboutFolder: (p) => <PixelartIcon name="user" {...p} />,
    ThirdEye: (p) => <PixelartIcon name="bullseye" {...p} />,
    Browser: (p) => <PixelartIcon name="layout-sidebar-left" {...p} />,
    Trophy: (p) => <PixelartIcon name="trophy" {...p} />,

    // Achievement icons
    Message: (p) => <PixelartIcon name="message" {...p} />,
    RainAlt: (p) => <PixelartIcon name="drop-half" {...p} />,
    Alert: (p) => <PixelartIcon name="alert" {...p} />,
    Repeat: (p) => <PixelartIcon name="reload" {...p} />,
    Sword: (p) => <PixelartIcon name="sliders" {...p} />,
    Expand: (p) => <PixelartIcon name="open" {...p} />,
    Controller: (p) => <PixelartIcon name="gamepad" {...p} />,
    Clock: (p) => <PixelartIcon name="clock" {...p} />,
    Cursor: (p) => <PixelartIcon name="cursor" {...p} />,
    Skull: (p) => <PixelartIcon name="mood-sad" {...p} />,
    Fire: (p) => <PixelartIcon name="zap" {...p} />,
    Bomb: (p) => <PixelartIcon name="close-box" {...p} />,
    Badge: (p) => <PixelartIcon name="calendar" {...p} />,
};

export default Icons;
