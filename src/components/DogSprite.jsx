import React, { useState, useEffect, useRef } from 'react';

// Shared dog sprite component with optimized animation
export const DogSprite = ({ animated = false, style = {}, gold = false }) => {
    const color = gold ? '#DAA520' : '#000';
    const eyeColor = gold ? '#000' : '#fff';
    const pupilColor = gold ? '#fff' : '#000';
    const [frame, setFrame] = useState(0);
    const animationRef = useRef(null);
    const isAnimatingRef = useRef(false);

    // OPTIMIZED: Use requestAnimationFrame with proper cleanup and animation state check
    useEffect(() => {
        if (!animated) {
            isAnimatingRef.current = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            return;
        }

        isAnimatingRef.current = true;

        const animate = () => {
            // Check if we should still be animating
            if (!isAnimatingRef.current) return;

            setFrame(f => f + 1);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            isAnimatingRef.current = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [animated]);

    // Calculate animation values from frame count
    const legPhase = Math.sin(frame * 0.1);
    const tailPhase = Math.sin(frame * 0.067);

    return (
        <svg width="64" height="48" viewBox="0 0 64 48" style={{ imageRendering: 'pixelated', ...style }}>
            <rect x="16" y="16" width="32" height="16" fill={color} />
            <rect x="4" y="12" width="16" height="16" fill={color} />
            <rect x="2" y="4" width="6" height="14" fill={color} />
            <rect x="14" y="4" width="6" height="14" fill={color} />
            <rect x="8" y="16" width="6" height="6" fill={eyeColor} />
            <rect x="10" y="18" width="3" height="3" fill={pupilColor} />
            <rect x="4" y="22" width="4" height="4" fill={color} />
            {animated && <rect x="2" y="26" width="4" height="2" fill={color} />}
            <rect x="16" y="32" width="6" height={animated ? (legPhase > 0 ? 10 : 14) : 12} fill={color} />
            <rect x="26" y="32" width="6" height={animated ? (legPhase > 0 ? 14 : 10) : 10} fill={color} />
            <rect x="34" y="32" width="6" height={animated ? (legPhase > 0 ? 10 : 14) : 12} fill={color} />
            <rect x="42" y="32" width="6" height={animated ? (legPhase > 0 ? 14 : 10) : 10} fill={color} />
            <rect x="48" y={animated ? 12 + tailPhase * 4 : 12} width="12" height="4" fill={color} />
            <rect x="58" y={animated ? 8 + tailPhase * 4 : 8} width="4" height="6" fill={color} />
        </svg>
    );
};

export default DogSprite;
