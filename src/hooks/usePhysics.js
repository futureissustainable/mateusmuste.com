import { useRef, useCallback } from 'react';

// Physics constants
const FRICTION = 0.94;
const BOUNCE_DAMPING = 0.6;
const MIN_VELOCITY = 0.25;
const SQUASH_AMOUNT = 0.02;

export function useWindowPhysics() {
    const windowPhysics = useRef({});
    const windowBounces = useRef({});

    const initWindowPhysics = useCallback((id) => {
        if (!windowPhysics.current[id]) {
            windowPhysics.current[id] = { velX: 0, velY: 0, scaleX: 1, scaleY: 1 };
        }
        return windowPhysics.current[id];
    }, []);

    const setVelocity = useCallback((id, velX, velY) => {
        const physics = initWindowPhysics(id);
        physics.velX = velX;
        physics.velY = velY;
    }, [initWindowPhysics]);

    const hasActiveVelocity = useCallback(() => {
        return Object.values(windowPhysics.current).some(
            physics => Math.abs(physics.velX) >= MIN_VELOCITY || Math.abs(physics.velY) >= MIN_VELOCITY
        );
    }, []);

    const updatePhysics = useCallback((windows, updatePosition) => {
        // OPTIMIZATION: Only run if there's active velocity
        if (!hasActiveVelocity()) {
            return false;
        }

        let hasChanges = false;

        Object.keys(windows).forEach(id => {
            const win = windows[id];
            if (!win.isOpen || win.isMin) return;

            const physics = initWindowPhysics(id);

            // Skip if no significant velocity
            if (Math.abs(physics.velX) < MIN_VELOCITY && Math.abs(physics.velY) < MIN_VELOCITY) {
                physics.velX = 0;
                physics.velY = 0;
                // Decay squash/stretch back to normal
                physics.scaleX += (1 - physics.scaleX) * 0.2;
                physics.scaleY += (1 - physics.scaleY) * 0.2;
                return;
            }

            hasChanges = true;

            // Apply friction
            physics.velX *= FRICTION;
            physics.velY *= FRICTION;

            // Calculate new position
            let newX = win.x + physics.velX;
            let newY = win.y + physics.velY;

            // Boundary checks with bounce
            const maxX = window.innerWidth - win.w;
            const maxY = window.innerHeight - win.h;

            if (newX < 0) {
                newX = 0;
                physics.velX = -physics.velX * BOUNCE_DAMPING;
                physics.scaleX = 1 - SQUASH_AMOUNT;
            } else if (newX > maxX) {
                newX = maxX;
                physics.velX = -physics.velX * BOUNCE_DAMPING;
                physics.scaleX = 1 - SQUASH_AMOUNT;
            }

            if (newY < 0) {
                newY = 0;
                physics.velY = -physics.velY * BOUNCE_DAMPING;
                physics.scaleY = 1 - SQUASH_AMOUNT;
            } else if (newY > maxY) {
                newY = maxY;
                physics.velY = -physics.velY * BOUNCE_DAMPING;
                physics.scaleY = 1 - SQUASH_AMOUNT;
            }

            updatePosition(id, Math.round(newX), Math.round(newY));
        });

        return hasChanges;
    }, [initWindowPhysics, hasActiveVelocity]);

    const getPhysics = useCallback((id) => {
        return windowPhysics.current[id] || { velX: 0, velY: 0, scaleX: 1, scaleY: 1 };
    }, []);

    return {
        initWindowPhysics,
        setVelocity,
        hasActiveVelocity,
        updatePhysics,
        getPhysics,
        windowBounces,
    };
}

export default useWindowPhysics;
