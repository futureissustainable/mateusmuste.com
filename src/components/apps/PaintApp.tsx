'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface PaintAppProps {
  onAchievement?: (id: string) => void;
}

export function PaintApp({ onAchievement }: PaintAppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const lastPosRef = useRef({ x: 0, y: 0 });
  const strokeCountRef = useRef(0);
  const achievementTriggered = useRef(false);

  const COLORS = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    lastPosRef.current = pos;
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPosRef.current = pos;
  }, [isDrawing, color, brushSize, tool, getPos]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      strokeCountRef.current++;
      if (strokeCountRef.current >= 10 && !achievementTriggered.current) {
        achievementTriggered.current = true;
        onAchievement?.('ARTIST');
      }
    }
    setIsDrawing(false);
  }, [isDrawing, onAchievement]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const saveImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'painting.png';
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">PAINT.EXE</span>
        <div className="flex gap-2">
          <button onClick={clearCanvas} className="btn-secondary btn-sm">
            CLEAR
          </button>
          <button onClick={saveImage} className="btn-secondary btn-sm">
            SAVE
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-2 border-b-2 border-black flex flex-wrap gap-2 items-center">
        {/* Colors */}
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 border-2 ${color === c ? 'border-black' : 'border-gray-300'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Tools */}
        <button
          onClick={() => setTool('brush')}
          className={`px-2 py-1 font-mono text-xs border-2 ${
            tool === 'brush' ? 'border-black bg-black text-white' : 'border-gray-300'
          }`}
        >
          BRUSH
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`px-2 py-1 font-mono text-xs border-2 ${
            tool === 'eraser' ? 'border-black bg-black text-white' : 'border-gray-300'
          }`}
        >
          ERASER
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Brush size */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">SIZE</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="font-mono text-xs w-4">{brushSize}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-grow bg-gray-100 p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-full bg-white border-2 border-black cursor-crosshair"
          style={{ touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
}
