'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

interface CobeGlobeInnerProps {
  location: { name: string; lat: number; lng: number };
  rotationSpeed: number;
}

export function CobeGlobeInner({ location, rotationSpeed }: CobeGlobeInnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = phiRef.current;
    const canvas = canvasRef.current;

    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth;
      }
    };

    onResize();
    window.addEventListener('resize', onResize);

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 3,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [0.1, 0.1, 0.1],
      markerColor: [1, 1, 1],
      glowColor: [0.1, 0.1, 0.1],
      markers: [{ location: [location.lat, location.lng], size: 0.1 }],
      onRender: (state) => {
        // Auto rotate
        state.phi = phi;
        phi += rotationSpeed;
        phiRef.current = phi;

        // Responsive sizing
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    return () => {
      globeRef.current?.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (globeRef.current) {
      // Re-create with new marker
      globeRef.current.destroy();

      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      let phi = phiRef.current;

      globeRef.current = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
        phi: phiRef.current,
        theta: 0.3,
        dark: 1,
        diffuse: 3,
        mapSamples: 16000,
        mapBrightness: 1.2,
        baseColor: [0.1, 0.1, 0.1],
        markerColor: [1, 1, 1],
        glowColor: [0.1, 0.1, 0.1],
        markers: [{ location: [location.lat, location.lng], size: 0.1 }],
        onRender: (state) => {
          state.phi = phi;
          phi += rotationSpeed;
          phiRef.current = phi;
          state.width = widthRef.current * 2;
          state.height = widthRef.current * 2;
        },
      });
    }
  }, [location, rotationSpeed]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '1',
        }}
      />
    </div>
  );
}
