import { useReducer, useCallback } from 'react';

// Initial window configurations
export const INITIAL_WINDOWS = {
    "MESSAGES": { id: "MESSAGES", title: "MESSAGES.EXE", icon: "Email", x: 200, y: 80, w: 380, h: 500, isOpen: false, isMin: false, z: 8, isDesktop: true },
    "ABOUT": { id: "ABOUT", title: "ABOUT.EXE", icon: "Terminal", x: 150, y: 50, w: 820, h: 700, isOpen: false, isMin: false, z: 9, isDesktop: true },
    "SYSTEM": { id: "SYSTEM", title: "SYSTEM_INFO", icon: "Terminal", x: 400, y: 50, w: 1000, h: 800, isOpen: true, isMin: false, z: 10, isDesktop: true },
    "FILES": { id: "FILES", title: "MEDIA_LIB", icon: "Folder", x: 100, y: 80, w: 800, h: 500, isOpen: false, isMin: false, z: 11, isDesktop: true },
    "APPS": { id: "APPS", title: "APPS", icon: "Apps", x: 150, y: 110, w: 700, h: 500, isOpen: false, isMin: false, z: 12, isDesktop: true },
    "CONTACT": { id: "CONTACT", title: "CONTACT", icon: "Email", x: 200, y: 140, w: 320, h: 380, isOpen: false, isMin: false, z: 13, isDesktop: true },
    "PAINT": { id: "PAINT", title: "PAINT.EXE", icon: "Palette", x: 150, y: 110, w: 700, h: 600, isOpen: false, isMin: false, z: 14 },
    "SNAKE": { id: "SNAKE", title: "SNEK.EXE", icon: "Snek", x: 200, y: 140, w: 640, h: 520, isOpen: false, isMin: false, z: 15 },
    "TRASH": { id: "TRASH", title: "TRASH.BIN", icon: "TrashCan", x: 250, y: 170, w: 500, h: 400, isOpen: false, isMin: false, z: 16 },
    "VOID": { id: "VOID", title: "VOID.TXT", icon: "Void", x: 300, y: 50, w: 500, h: 400, isOpen: false, isMin: false, z: 17 },
    "RADIO": { id: "RADIO", title: "RADIO.WAV", icon: "Radio", x: 400, y: 110, w: 400, h: 400, isOpen: false, isMin: false, z: 19 },
    "DICE": { id: "DICE", title: "DICE.EXE", icon: "Dice", x: 450, y: 140, w: 350, h: 420, isOpen: false, isMin: false, z: 20 },
    "LABYRINTH": { id: "LABYRINTH", title: "LABYRINTH.EXE", icon: "Labyrinth", x: 100, y: 50, w: 600, h: 500, isOpen: false, isMin: false, z: 21 },
    "MINESWEEPER": { id: "MINESWEEPER", title: "MINESWEEPER.EXE", icon: "Minesweeper", x: 120, y: 40, w: 500, h: 560, isOpen: false, isMin: false, z: 26 },
    "STARSHIP": { id: "STARSHIP", title: "STARSHIP.EXE", icon: "Starship", x: 80, y: 40, w: 540, h: 480, isOpen: false, isMin: false, z: 27 },
    "SYNTH": { id: "SYNTH", title: "SYNTH_001.WAV", icon: "Synth", x: 150, y: 80, w: 500, h: 350, isOpen: false, isMin: false, z: 22 },
    "DESTRUCTION": { id: "DESTRUCTION", title: "DESTRUCTION.EXE", icon: "Destruction", x: 200, y: 110, w: 400, h: 400, isOpen: false, isMin: false, z: 23 },
    "TAROT": { id: "TAROT", title: "TAROT.DAT", icon: "Tarot", x: 100, y: 60, w: 520, h: 550, isOpen: false, isMin: false, z: 24 },
    "GALLERY": { id: "GALLERY", title: "GALLERY.EXE", icon: "Gallery", x: 100, y: 80, w: 500, h: 500, isOpen: false, isMin: false, z: 28 },
    "MAP": { id: "MAP", title: "MAP.EXE", icon: "Globe", x: 150, y: 100, w: 360, h: 400, isOpen: false, isMin: false, z: 29 },
    "POMODORO": { id: "POMODORO", title: "POMODORO.EXE", icon: "Pomodoro", x: 200, y: 60, w: 350, h: 620, isOpen: false, isMin: false, z: 30 },
    "SCANNER": { id: "SCANNER", title: "SCANNER.EXE", icon: "HealthScanner", x: 150, y: 50, w: 600, h: 700, isOpen: false, isMin: false, z: 31 },
    "PERSONAL": { id: "PERSONAL", title: "PRIVATE.EXE", icon: "Lock", x: 200, y: 80, w: 320, h: 340, isOpen: false, isMin: false, z: 32 },
    "TERMINAL": { id: "TERMINAL", title: "TERMINAL.EXE", icon: "Terminal", x: 120, y: 100, w: 650, h: 450, isOpen: false, isMin: false, z: 33 },
    "TRUTH": { id: "TRUTH", title: "TRUTH.TXT", icon: "FileDoc", x: 180, y: 120, w: 320, h: 380, isOpen: false, isMin: false, z: 34, isDesktop: true },
    "DOG_STORY": { id: "DOG_STORY", title: "DOG.TXT", icon: "FileDoc", x: 100, y: 80, w: 600, h: 500, isOpen: false, isMin: false, z: 35 },
    "THIRD_EYE": { id: "THIRD_EYE", title: "THIRD_EYE.EXE", icon: "ThirdEye", x: 140, y: 90, w: 450, h: 400, isOpen: false, isMin: false, z: 36 },
    "THIRD_EYE_2": { id: "THIRD_EYE_2", title: "THIRD_EYE.EXE", icon: "ThirdEye", x: 200, y: 150, w: 450, h: 400, isOpen: false, isMin: false, z: 37 },
    "BROWSER": { id: "BROWSER", title: "KONAMI by zen", icon: "Browser", x: 160, y: 70, w: 500, h: 400, isOpen: false, isMin: false, z: 38 },
    "END": { id: "END", title: "END.EXE", icon: "Trophy", x: 200, y: 100, w: 400, h: 350, isOpen: false, isMin: false, z: 39 },
    "BOOKS": { id: "BOOKS", title: "BOOKS.EXE", icon: "FileDoc", x: 150, y: 80, w: 600, h: 500, isOpen: false, isMin: false, z: 40 },
    "BACKUP": { id: "BACKUP", title: "BACKUP.BAT", icon: "Terminal", x: 180, y: 100, w: 500, h: 400, isOpen: false, isMin: false, z: 41 },
    "TRUTH_MESSAGES": { id: "TRUTH_MESSAGES", title: "MESSAGES.EXE", icon: "Email", x: 200, y: 80, w: 380, h: 500, isOpen: false, isMin: false, z: 42 }
};

// Action types
const WINDOW_ACTIONS = {
    OPEN: 'OPEN',
    CLOSE: 'CLOSE',
    MINIMIZE: 'MINIMIZE',
    RESTORE: 'RESTORE',
    BRING_TO_FRONT: 'BRING_TO_FRONT',
    UPDATE_POSITION: 'UPDATE_POSITION',
    UPDATE_SIZE: 'UPDATE_SIZE',
    SET_ALL: 'SET_ALL',
};

// Reducer function for window state
function windowsReducer(state, action) {
    switch (action.type) {
        case WINDOW_ACTIONS.OPEN:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    isOpen: true,
                    isMin: false,
                    z: action.z
                }
            };

        case WINDOW_ACTIONS.CLOSE:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    isOpen: false
                }
            };

        case WINDOW_ACTIONS.MINIMIZE:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    isMin: true
                }
            };

        case WINDOW_ACTIONS.RESTORE:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    isMin: false,
                    z: action.z
                }
            };

        case WINDOW_ACTIONS.BRING_TO_FRONT:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    z: action.z
                }
            };

        case WINDOW_ACTIONS.UPDATE_POSITION:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    x: action.x,
                    y: action.y
                }
            };

        case WINDOW_ACTIONS.UPDATE_SIZE:
            return {
                ...state,
                [action.id]: {
                    ...state[action.id],
                    w: action.w,
                    h: action.h
                }
            };

        case WINDOW_ACTIONS.SET_ALL:
            return action.windows;

        default:
            return state;
    }
}

// Custom hook for windows management
export function useWindowsReducer() {
    const [windows, dispatch] = useReducer(windowsReducer, INITIAL_WINDOWS);

    const openWindow = useCallback((id, z) => {
        dispatch({ type: WINDOW_ACTIONS.OPEN, id, z });
    }, []);

    const closeWindow = useCallback((id) => {
        dispatch({ type: WINDOW_ACTIONS.CLOSE, id });
    }, []);

    const minimizeWindow = useCallback((id) => {
        dispatch({ type: WINDOW_ACTIONS.MINIMIZE, id });
    }, []);

    const restoreWindow = useCallback((id, z) => {
        dispatch({ type: WINDOW_ACTIONS.RESTORE, id, z });
    }, []);

    const bringToFront = useCallback((id, z) => {
        dispatch({ type: WINDOW_ACTIONS.BRING_TO_FRONT, id, z });
    }, []);

    const updatePosition = useCallback((id, x, y) => {
        dispatch({ type: WINDOW_ACTIONS.UPDATE_POSITION, id, x, y });
    }, []);

    const updateSize = useCallback((id, w, h) => {
        dispatch({ type: WINDOW_ACTIONS.UPDATE_SIZE, id, w, h });
    }, []);

    const setAllWindows = useCallback((windows) => {
        dispatch({ type: WINDOW_ACTIONS.SET_ALL, windows });
    }, []);

    return {
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        bringToFront,
        updatePosition,
        updateSize,
        setAllWindows,
    };
}

export default useWindowsReducer;
