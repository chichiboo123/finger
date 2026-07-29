import { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingToolbar } from './DrawingToolbar';
import { ConfirmDialog } from './ConfirmDialog';

interface FingerDrawingCanvasProps {
  initialDataUrl: string | null;
  baseColor: string;
  onSave: (dataUrl: string) => void;
}

export function FingerDrawingCanvas({ initialDataUrl, baseColor, onSave }: FingerDrawingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#212121');
  const [lineWidth, setLineWidth] = useState(5);
  
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  
  const lastPos = useRef<{x: number, y: number} | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set logical size matches CSS size
    canvas.width = 320;
    canvas.height = 480;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (initialDataUrl && history.length === 0) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState(); // Save initial state to history
      };
      img.src = initialDataUrl;
    } else if (history.length === 0) {
      // blank canvas
      saveState();
    }
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      return [...newHistory, imgData];
    });
    setHistoryStep(prev => prev + 1);
    
    // Notify parent to save to DB (we just trigger onChange)
    onSave(canvas.toDataURL('image/png'));
  }, [historyStep, onSave]);

  const undo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const newStep = historyStep - 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
    onSave(canvas.toDataURL('image/png'));
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const newStep = historyStep + 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
    onSave(canvas.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
    setClearDialogOpen(false);
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Support all pointers
    (e.target as Element).setPointerCapture(e.pointerId);
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    lastPos.current = coords;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
    ctx.lineWidth = lineWidth;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    // Smooth drawing with quadratic curve
    const midX = (lastPos.current.x + coords.x) / 2;
    const midY = (lastPos.current.y + coords.y) / 2;
    ctx.quadraticCurveTo(lastPos.current.x, lastPos.current.y, midX, midY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    lastPos.current = coords;
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    setIsDrawing(false);
    lastPos.current = null;
    saveState();
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-sm mx-auto h-full">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[2/3] max-w-[320px] max-h-[480px] bg-[#F8F4EE] rounded-3xl shadow-sm border border-border overflow-hidden flex-shrink-0"
        style={{ touchAction: 'none' }}
      >
        {/* Background Finger Silhouette SVG — canvas coords 320×480 */}
        <svg
          viewBox="0 0 320 480"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Finger body */}
          <path
            d="M 160 446 C 108 442 86 412 86 366 C 86 290 87 198 100 118 C 110 57 132 36 160 34 C 188 36 210 57 220 118 C 233 198 234 290 234 366 C 234 412 212 442 160 446 Z"
            fill={baseColor || '#FDDDB8'}
            stroke="#D4A070"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          />
          {/* Upper knuckle */}
          <path
            d="M 90 228 Q 160 220 230 228"
            fill="none"
            stroke="#C49060"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Lower knuckle */}
          <path
            d="M 88 338 Q 160 330 232 338"
            fill="none"
            stroke="#C49060"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Base hint */}
          <path
            d="M 88 410 Q 160 418 232 410"
            fill="none"
            stroke="#C49060"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.25"
          />
        </svg>
        
        {/* Drawing Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-10 touch-none cursor-crosshair"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          onPointerCancel={stopDrawing}
        />
      </div>

      <DrawingToolbar
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        lineWidth={lineWidth} setLineWidth={setLineWidth}
        onUndo={undo} onRedo={redo} onClear={() => setClearDialogOpen(true)}
        canUndo={historyStep > 0}
        canRedo={historyStep < history.length - 1}
      />
      
      <ConfirmDialog
        isOpen={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title="그림 전체 지우기"
        description="그려둔 그림이 모두 사라집니다. 정말 지우실 건가요?"
        onConfirm={clearCanvas}
        destructive
      />
    </div>
  );
}