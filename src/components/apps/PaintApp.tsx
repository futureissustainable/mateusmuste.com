import { useState, useEffect, useRef, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';

interface PaintAppProps {
  showHint?: boolean;
  onAchievement?: (id: string) => void;
}

export const PaintApp = memo(({ showHint, onAchievement }: PaintAppProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [status, setStatus] = useState("READY");
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return { x: 0, y: 0 };
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
    if (!data) return;
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(data);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      canvasRef.current?.getContext('2d')?.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
      setStatus("UNDO");
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      canvasRef.current?.getContext('2d')?.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
      setStatus("REDO");
    }
  };

  useEffect(() => {
    const initCanvas = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      canvas.width = container.clientWidth - 4;
      canvas.height = container.clientHeight - 4;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (showHint) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#000000";
        ctx.font = "24px 'PPNeueBit', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("draw your message :)", canvas.width / 2, canvas.height / 2);
        ctx.restore();
      }
      saveToHistory();
    };
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [showHint]);

  const floodFill = (x: number, y: number, fillColor: string) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);
    const startIdx = (y * w + x) * 4;
    const sr = data[startIdx], sg = data[startIdx + 1], sb = data[startIdx + 2];
    if (sr === r && sg === g && sb === b) return;
    const stack: [number, number][] = [[x, y]];
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      const idx = (cy * w + cx) * 4;
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      if (data[idx] === sr && data[idx + 1] === sg && data[idx + 2] === sb) {
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    saveToHistory();
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e);
    if (tool === 'bucket') {
      floodFill(Math.floor(pos.x), Math.floor(pos.y), color);
      setStatus("FILLED");
    } else if (['rect', 'circle', 'line'].includes(tool)) {
      setIsDrawing(true);
      setStartPos(pos);
      const canvas = canvasRef.current;
      if (canvas) {
        snapshotRef.current = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height) || null;
      }
    } else {
      setIsDrawing(true);
      setStartPos(pos);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = size;
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getMousePos(e);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (['rect', 'circle', 'line'].includes(tool) && snapshotRef.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size;

      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - startPos.x) / 2;
        const ry = Math.abs(pos.y - startPos.y) / 2;
        const cx = startPos.x + (pos.x - startPos.x) / 2;
        const cy = startPos.y + (pos.y - startPos.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const endDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (tool === 'brush' || tool === 'eraser') {
        canvasRef.current?.getContext('2d')?.closePath();
      }
      saveToHistory();
    }
  };

  const send = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setStatus("COPIED TO CLIPBOARD");
            onAchievement?.('MESSENGER');
          } catch {
            setStatus("COPY FAILED");
          }
        }
      }, 'image/png');
      setTimeout(() => {
        window.location.href = 'mailto:mateusmuste9@gmail.com';
      }, 500);
    } catch {
      setStatus("ERROR");
    }
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setStatus("CLEARED");
      saveToHistory();
    }
  };

  const tools = ['brush', 'eraser', 'bucket', 'line', 'rect', 'circle'];
  const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  return (
    <div className="h-full flex flex-col bg-gray-100 select-none">
      <div className="app-header flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <PixelartIcon name="Palette" size={16} />
          <span className="app-header-title truncate">PAINT.EXE</span>
        </div>
        <button onClick={() => { sounds.click(); send(); }} className="btn-primary btn-xs flex-shrink-0">
          SEND
        </button>
      </div>
      <div className="p-2 border-b-2 border-black bg-white flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          <button onClick={() => { sounds.click(); undo(); }} className="btn-icon" title="Undo">↩</button>
          <button onClick={() => { sounds.click(); redo(); }} className="btn-icon" title="Redo">↪</button>
          <button onClick={() => { sounds.click(); clear(); }} className="btn-icon" title="Clear">✕</button>
        </div>
        <div className="w-px h-4 bg-black"></div>
        <div className="flex gap-1 flex-wrap">
          {tools.map(t => (
            <button key={t} onClick={() => { sounds.click(); setTool(t); }} className={`btn-toolbar ${tool === t ? 'active' : ''}`}>{t}</button>
          ))}
        </div>
        <div className="w-px h-4 bg-black"></div>
        <div className="flex gap-1 flex-wrap">
          {colors.map(c => (
            <button key={c} onClick={() => { sounds.click(); setColor(c); }} className={`w-5 h-5 border border-black ${color === c ? 'ring-2 ring-offset-1 ring-black' : ''}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="w-px h-4 bg-black"></div>
        <div className="flex items-center gap-1">
          <input type="range" min="1" max="20" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-16 accent-black" aria-label="Brush size" />
          <span className="text-[10px] font-mono w-4">{size}</span>
        </div>
      </div>
      <div className="flex-grow relative cursor-crosshair bg-gray-300 p-[2px] overflow-hidden" ref={containerRef}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Drawing canvas"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={(e) => { e.preventDefault(); startDraw(e); }}
          onTouchMove={(e) => { e.preventDefault(); draw(e); }}
          onTouchEnd={(e) => { e.preventDefault(); endDraw(); }}
          className="block bg-white border border-gray-400 touch-none"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="app-footer">
        <span className="app-footer-text">{status}</span>
      </div>
    </div>
  );
});

PaintApp.displayName = 'PaintApp';

export default PaintApp;
