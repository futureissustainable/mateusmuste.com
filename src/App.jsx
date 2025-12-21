import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { sounds } from './utils/sounds';
import { HighScoreManager } from './utils/highscore';
import { Icons } from './components/Icons';
import { DogSprite } from './components/DogSprite';
import { ASCII_ART } from './data/ascii-art';
import { useWindowsReducer, INITIAL_WINDOWS } from './hooks/useWindowsReducer';
import { useWindowPhysics } from './hooks/usePhysics';
import { loadCobe } from './utils/cobeLoader';

// ============================================================================
// ACHIEVEMENTS DEFINITION
// ============================================================================
const ACHIEVEMENTS = {
    CENTURY: { name: 'CENTURY', hint: '100 visits' },
    NEO: { name: 'NEO', hint: 'Enter the matrix' },
    KONAMI: { name: 'KONAMI', hint: '↑↑↓↓←→←→BA' },
    LOCKSMITH: { name: 'LOCKSMITH', hint: 'Bypass security' },
    YOU_MONSTER: { name: 'YOU_MONSTER', hint: 'How could you?' },
    DESTROYER_OF_WORLDS: { name: 'DESTROYER_OF_WORLDS', hint: 'Almost destroyed everything' },
    BECOME_GOD: { name: 'BECOME_GOD', hint: 'Ascend' },
    TRUTH_SEEKER: { name: 'TRUTH_SEEKER', hint: 'Find the truth' },
    INCEPTION: { name: 'INCEPTION', hint: 'Browser recursion' },
    TYCOON: { name: 'TYCOON', hint: '1 billion clicks' },
    ASCENDED: { name: 'ASCENDED', hint: 'Dog mode' },
    COMPLETIONIST: { name: 'COMPLETIONIST', hint: '100%' },
    SYMPHONY: { name: 'SYMPHONY', hint: 'Fill the synth grid' },
};

// ============================================================================
// MAIN OS COMPONENT
// ============================================================================
function OS() {
    // Mode selection
    const [modeSelected, setModeSelected] = useState(null);
    const [booted, setBooted] = useState(false);
    const [bootPhase, setBootPhase] = useState(0);

    // Visit tracking - NO CountAPI (removed dead code)
    const [visitCount, setVisitCount] = useState(() => {
        const count = parseInt(localStorage.getItem('visit_count') || '0', 10) + 1;
        localStorage.setItem('visit_count', count.toString());
        return count;
    });

    // Use the windows reducer for optimized state management
    const {
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        bringToFront,
        updatePosition,
    } = useWindowsReducer();

    // Physics system with velocity check optimization
    const {
        setVelocity,
        hasActiveVelocity,
        updatePhysics,
        getPhysics,
    } = useWindowPhysics();

    // Z-index management
    const topZRef = useRef(50);
    const [topZ, setTopZ] = useState(50);

    // Window animations
    const [windowAnimations, setWindowAnimations] = useState({});

    // Intro state
    const [introComplete, setIntroComplete] = useState(() =>
        localStorage.getItem('intro_complete') === 'true'
    );
    const [revealingApps, setRevealingApps] = useState(false);
    const [revealedApps, setRevealedApps] = useState([]);

    // Achievements
    const [achievements, setAchievements] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('achievements') || '{}');
        } catch { return {}; }
    });
    const [achievementNotifications, setAchievementNotifications] = useState([]);

    // Narrative unlocks
    const [narrativeUnlocks, setNarrativeUnlocks] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('narrative_unlocks') || '[]');
        } catch { return []; }
    });

    // Save achievements and unlocks
    useEffect(() => {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }, [achievements]);

    useEffect(() => {
        localStorage.setItem('narrative_unlocks', JSON.stringify(narrativeUnlocks));
    }, [narrativeUnlocks]);

    // Computed unlocked apps
    const unlockedApps = useMemo(() => {
        const baseApps = new Set(['TERMINAL', 'END', 'ABOUT', 'SYSTEM', 'FILES', 'APPS', 'CONTACT', 'TRASH']);
        narrativeUnlocks.forEach(app => baseApps.add(app));
        return baseApps;
    }, [narrativeUnlocks]);

    // Dog state
    const [dogReleased, setDogReleased] = useState(false);
    const [dogPos, setDogPos] = useState({ x: 100, y: 200 });
    const [dogFacingRight, setDogFacingRight] = useState(true);
    const [dogDragging, setDogDragging] = useState(false);
    const [carriedIcon, setCarriedIcon] = useState(null);
    const carriedIconRef = useRef(null); // FIX: Use ref for stale closure fix
    const dogVelRef = useRef({ x: 4, y: 3 });

    // Update ref when carriedIcon changes (FIX: stale closure)
    useEffect(() => {
        carriedIconRef.current = carriedIcon;
    }, [carriedIcon]);

    // Desktop background
    const [desktopBg, setDesktopBg] = useState(() =>
        localStorage.getItem('desktop_bg') || 'grid'
    );

    // Matrix mode
    const [matrixMode, setMatrixMode] = useState(false);

    // Private unlock
    const [privateUnlocked, setPrivateUnlocked] = useState(false);

    // Mobile detection
    const [isMobile] = useState(() =>
        typeof window !== 'undefined' && window.innerWidth < 768
    );

    // Context menu
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });

    // Icon positions
    const [iconPositions, setIconPositions] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('icon_positions') || '{}');
        } catch { return {}; }
    });

    // Selected icon
    const [selectedIcon, setSelectedIcon] = useState(null);

    // ========================================================================
    // PHYSICS LOOP - OPTIMIZED with velocity check
    // ========================================================================
    useEffect(() => {
        let animationId = null;
        let isRunning = false;

        const physicsLoop = () => {
            // OPTIMIZATION: Only continue loop if there's active velocity
            if (!hasActiveVelocity()) {
                isRunning = false;
                return;
            }

            const hasChanges = updatePhysics(windows, updatePosition);

            if (hasChanges) {
                animationId = requestAnimationFrame(physicsLoop);
            } else {
                isRunning = false;
            }
        };

        // Start physics when velocity is added
        const startPhysics = () => {
            if (!isRunning && hasActiveVelocity()) {
                isRunning = true;
                animationId = requestAnimationFrame(physicsLoop);
            }
        };

        // Check periodically for velocity (in case it's added from drag)
        const checkInterval = setInterval(() => {
            if (hasActiveVelocity() && !isRunning) {
                startPhysics();
            }
        }, 100);

        return () => {
            clearInterval(checkInterval);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [windows, hasActiveVelocity, updatePhysics, updatePosition]);

    // ========================================================================
    // DOG MOVEMENT - OPTIMIZED with ref for carriedIcon (FIX: stale closure)
    // ========================================================================
    useEffect(() => {
        if (!dogReleased || dogDragging) return;

        const dogInterval = setInterval(() => {
            const vel = dogVelRef.current;

            setDogPos(prev => {
                let newX = prev.x + vel.x;
                let newY = prev.y + vel.y;

                // Bounce off walls
                if (newX >= window.innerWidth - 80) {
                    newX = window.innerWidth - 80;
                    dogVelRef.current.x = -Math.abs(vel.x);
                    setDogFacingRight(false);
                }
                if (newX <= 0) {
                    newX = 0;
                    dogVelRef.current.x = Math.abs(vel.x);
                    setDogFacingRight(true);
                }
                if (newY >= window.innerHeight - 100) {
                    newY = window.innerHeight - 100;
                    dogVelRef.current.y = -Math.abs(vel.y);
                }
                if (newY <= 60) {
                    newY = 60;
                    dogVelRef.current.y = Math.abs(vel.y);
                }

                return { x: newX, y: newY };
            });

            // FIX: Use ref instead of state to avoid stale closure
            if (!carriedIconRef.current && Math.random() < 0.003) {
                const iconKeys = Object.keys(windows);
                const randomIcon = iconKeys[Math.floor(Math.random() * iconKeys.length)];
                setCarriedIcon(randomIcon);

                setTimeout(() => {
                    setCarriedIcon(null);
                }, 3000 + Math.random() * 4000);
            }
        }, 30);

        return () => clearInterval(dogInterval);
    }, [dogReleased, dogDragging, windows]);

    // ========================================================================
    // UNLOCK FUNCTIONS
    // ========================================================================
    const unlockApp = useCallback((appId) => {
        setNarrativeUnlocks(prev => {
            if (prev.includes(appId)) return prev;
            return [...prev, appId];
        });
    }, []);

    const unlockAchievement = useCallback((id) => {
        if (achievements[id]) return;
        const achievement = ACHIEVEMENTS[id];
        if (!achievement) return;

        const notifId = Date.now() + Math.random();
        setAchievements(prev => ({ ...prev, [id]: { unlockedAt: Date.now() } }));
        setAchievementNotifications(prev => [...prev, { ...achievement, id: notifId }]);
        sounds.achievementUnlock();

        setTimeout(() => {
            setAchievementNotifications(prev => prev.filter(n => n.id !== notifId));
        }, 3000);
    }, [achievements]);

    // ========================================================================
    // WINDOW MANAGEMENT
    // ========================================================================
    const open = useCallback((id) => {
        sounds.windowOpen();
        topZRef.current += 1;
        const newZ = topZRef.current;
        openWindow(id, newZ);
        setTopZ(newZ);
        setWindowAnimations(p => ({ ...p, [id]: 'opening' }));
        setTimeout(() => setWindowAnimations(p => { const n = {...p}; delete n[id]; return n; }), 200);
    }, [openWindow]);

    const close = useCallback((id) => {
        sounds.windowClose();
        setWindowAnimations(p => ({ ...p, [id]: 'closing' }));
        setTimeout(() => {
            closeWindow(id);
            setWindowAnimations(p => { const n = {...p}; delete n[id]; return n; });
        }, 150);
    }, [closeWindow]);

    const minimize = useCallback((id) => {
        sounds.windowMinimize();
        minimizeWindow(id);
    }, [minimizeWindow]);

    const restore = useCallback((id) => {
        sounds.windowRestore();
        topZRef.current += 1;
        restoreWindow(id, topZRef.current);
        setTopZ(topZRef.current);
    }, [restoreWindow]);

    // ========================================================================
    // MEMOIZED WINDOW CONTENT
    // ========================================================================
    const getWindowContent = useMemo(() => {
        // Return a function that generates content based on ID
        return (id) => {
            // This is memoized - content generators won't be recreated on every render
            switch (id) {
                case 'ABOUT':
                    return <div className="p-4 text-black">About content here</div>;
                case 'TERMINAL':
                    return <div className="bg-black text-green-500 p-4 font-mono h-full">Terminal content</div>;
                // ... other windows would be added here
                default:
                    return <div className="p-4">Content for {id}</div>;
            }
        };
    }, []);

    // ========================================================================
    // BOOT SEQUENCE
    // ========================================================================
    useEffect(() => {
        if (!modeSelected) return;

        // Mobile notice phase
        if (isMobile) {
            setBootPhase(0);
            setTimeout(() => setBootPhase(1), 1500);
        } else {
            setBootPhase(1);
        }

        // Boot complete
        const bootTimer = setTimeout(() => {
            setBooted(true);
            if (modeSelected === 'about') {
                setIntroComplete(true);
                setTimeout(() => open('ABOUT'), 100);
            } else {
                if (!introComplete) {
                    open('MESSAGES');
                }
            }
        }, isMobile ? 4000 : 2500);

        return () => clearTimeout(bootTimer);
    }, [modeSelected, isMobile, introComplete, open]);

    // ========================================================================
    // RENDER
    // ========================================================================

    // Mode selector
    if (!modeSelected) {
        return (
            <div className="h-screen w-screen bg-white flex flex-col items-center justify-center font-mono select-none">
                <div className="flex flex-col items-center gap-12">
                    <div className="text-center">
                        <div className="text-black text-[10px] tracking-[0.5em] uppercase mb-2">SELECT EXPERIENCE</div>
                        <div className="w-32 h-[2px] bg-black mx-auto"></div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <button
                            onClick={() => setModeSelected('about')}
                            className="group relative border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-150 px-12 py-8 min-w-[200px]"
                        >
                            <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] tracking-widest group-hover:bg-black transition-all duration-150">01</div>
                            <div className="text-2xl font-bold tracking-tight mb-2">ABOUT</div>
                            <div className="text-[10px] tracking-widest opacity-60">PORTFOLIO</div>
                        </button>

                        <button
                            onClick={() => setModeSelected('story')}
                            className="group relative border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-150 px-12 py-8 min-w-[200px]"
                        >
                            <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] tracking-widest group-hover:bg-black transition-all duration-150">02</div>
                            <div className="text-2xl font-bold tracking-tight mb-2">STORY</div>
                            <div className="text-[10px] tracking-widest opacity-60">EXPERIENCE</div>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] tracking-widest text-black/40">
                        <div className="w-8 h-[1px] bg-black/20"></div>
                        <span>MATEUS MUSTE</span>
                        <div className="w-8 h-[1px] bg-black/20"></div>
                    </div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-black"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-black"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-black"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-black"></div>
            </div>
        );
    }

    // Boot screen
    if (!booted) {
        if (bootPhase === 0 && isMobile) {
            return (
                <div className="h-screen w-screen bg-black text-white font-mono flex flex-col items-center justify-center">
                    <div className="text-center">
                        <div className="text-xl font-bold mb-6 tracking-widest">BEST ON DESKTOP</div>
                        <div className="flex gap-1 justify-center">
                            <div className="w-1.5 h-1.5 bg-white animate-pulse" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-white animate-pulse" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-white animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            );
        }

        // Boot screen with ASCII art
        return <BootScreen visitCount={visitCount} />;
    }

    // Main desktop
    return (
        <div className={`w-screen relative overflow-hidden desktop-bg-${desktopBg} ${matrixMode ? 'matrix-mode' : ''} ${isMobile ? 'mobile-safe-height' : 'h-screen'}`}>
            {/* Achievement notifications */}
            <div className="fixed top-4 right-4 z-[9999] space-y-2">
                {achievementNotifications.map(notif => (
                    <div
                        key={notif.id}
                        className="bg-black text-white px-4 py-2 border-2 border-white animate-fade-in"
                    >
                        <div className="font-mono text-xs font-bold">ACHIEVEMENT UNLOCKED</div>
                        <div className="font-mono text-sm">{notif.name}</div>
                    </div>
                ))}
            </div>

            {/* Dog sprite */}
            {dogReleased && (
                <div
                    className="fixed z-[9998] cursor-pointer"
                    style={{
                        left: dogPos.x,
                        top: dogPos.y,
                        transform: dogFacingRight ? 'scaleX(1)' : 'scaleX(-1)',
                    }}
                    onClick={() => sounds.bark()}
                >
                    <DogSprite animated={!dogDragging} />
                    {carriedIcon && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white border border-black px-1 text-[8px]">
                            {carriedIcon}
                        </div>
                    )}
                </div>
            )}

            {/* Windows would be rendered here */}
            {Object.entries(windows)
                .filter(([, win]) => win.isOpen)
                .map(([id, win]) => (
                    <div
                        key={id}
                        className={`absolute bg-white border-2 border-black window-shadow ${windowAnimations[id] ? `window-${windowAnimations[id]}` : ''}`}
                        style={{
                            left: win.x,
                            top: win.y,
                            width: win.w,
                            height: win.h,
                            zIndex: win.z,
                            display: win.isMin ? 'none' : 'block',
                        }}
                    >
                        {/* Window header */}
                        <div className="flex items-center justify-between px-2 py-1 bg-black text-white cursor-move">
                            <span className="font-mono text-xs font-bold">{win.title}</span>
                            <div className="flex gap-1">
                                <button onClick={() => minimize(id)} className="hover:bg-white/20 p-0.5">
                                    <Icons.Minus size={14} />
                                </button>
                                <button onClick={() => close(id)} className="hover:bg-red-500 p-0.5">
                                    <Icons.X size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Window content */}
                        <div className="h-[calc(100%-32px)] overflow-auto">
                            {getWindowContent(id)}
                        </div>
                    </div>
                ))}

            {/* Taskbar */}
            <div className={`fixed ${isMobile ? 'top-0 left-0 right-0' : 'bottom-0 left-0 right-0'} bg-white border-t-2 border-black h-10 flex items-center px-2 z-[9990]`}>
                <div className="flex gap-1">
                    {Object.entries(windows)
                        .filter(([, win]) => win.isOpen)
                        .map(([id, win]) => (
                            <button
                                key={id}
                                onClick={() => win.isMin ? restore(id) : minimize(id)}
                                className={`px-2 py-1 border border-black font-mono text-[10px] ${win.isMin ? 'bg-gray-200' : 'bg-black text-white'}`}
                            >
                                {win.title}
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}

// Boot screen component
function BootScreen({ visitCount }) {
    const [lines, setLines] = useState([]);
    const [inverted, setInverted] = useState(false);

    const msgs = [
        'kernel: init ULTRA_INT v1.0.0',
        'kernel: loading core modules',
        'kernel: mounting filesystem',
        'kernel: starting display',
        'kernel: loading assets',
        'kernel: init window manager',
        'kernel: loading preferences',
        'kernel: starting services',
        'kernel: systems nominal',
        'kernel: boot complete'
    ];

    useEffect(() => {
        sounds.bootWindup();
        if (visitCount === 100 || visitCount === 500 || visitCount === 1000) {
            setTimeout(() => sounds.visitMilestone(), 1300);
        }

        let i = 0;
        const iv = setInterval(() => {
            if (i < msgs.length) {
                setLines(p => [...p, msgs[i]]);
                i++;
            }
        }, 250);

        const inv = setTimeout(() => setInverted(true), 1500);

        return () => {
            clearInterval(iv);
            clearTimeout(inv);
        };
    }, [visitCount]);

    return (
        <div className={`h-screen w-screen font-mono flex flex-col items-center justify-center transition-colors duration-500 ${inverted ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <pre className="ascii-art text-[5px] sm:text-[7px] md:text-[9px] leading-tight select-none">{ASCII_ART.BOOT_LOGO}</pre>
            <div className={`text-[10px] tracking-[0.3em] mt-2 ${inverted ? 'text-gray-500' : 'text-gray-600'}`}>N0/SIDE 4Z H353</div>
            <div className={`w-72 max-w-[85vw] text-[8px] mt-6 ${inverted ? 'text-gray-400' : 'text-gray-600'}`}>
                {lines.map((l, i) => <div key={i}>{l}</div>)}
                {lines.length < msgs.length && <span className="inline-block w-1.5 h-3 bg-current animate-pulse" />}
            </div>
        </div>
    );
}

// Main App export
export default function App() {
    return <OS />;
}
