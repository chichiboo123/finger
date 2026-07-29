import { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingToolbar } from './DrawingToolbar';
import { ConfirmDialog } from './ConfirmDialog';
import { FingerSilhouette } from './FingerSilhouette';
import { MaterialIcon } from './MaterialIcon';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface FingerDrawingCanvasProps {
  initialDataUrl: string | null;
  baseColor: string;
  /** null when the child has erased everything, so the card falls back to its placeholder */
  onSave: (dataUrl: string | null) => void;
}

/** True when no pixel has been painted on the transparent drawing layer. */
function isBlank(data: ImageData) {
  for (let i = 3; i < data.data.length; i += 4) {
    if (data.data[i] !== 0) return false;
  }
  return true;
}

export function FingerDrawingCanvas({ initialDataUrl, baseColor, onSave }: FingerDrawingCanvasProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#212121');
  const [lineWidth, setLineWidth] = useState(5);
  
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  
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
    
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Seed the undo history without writing back — nothing changed yet.
        pushHistory(false);
      };
      img.src = initialDataUrl;
    } else {
      pushHistory(false);
    }
  }, []);

  /**
   * `notify: false` records an undo step only. Persisting on mount would write
   * a blank PNG for every finger the child merely opens, which then hides the
   * card's placeholder artwork.
   */
  const pushHistory = useCallback((notify = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      // Cap the stack: 10 fingers × full-canvas ImageData adds up fast.
      return [...newHistory, imgData].slice(-25);
    });
    setHistoryStep(prev => Math.min(prev + 1, 24));

    if (notify) onSave(isBlank(imgData) ? null : canvas.toDataURL('image/png'));
  }, [historyStep, onSave]);

  const saveState = useCallback(() => pushHistory(true), [pushHistory]);

  const undo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const newStep = historyStep - 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
    onSave(isBlank(history[newStep]) ? null : canvas.toDataURL('image/png'));
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const newStep = historyStep + 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
    onSave(isBlank(history[newStep]) ? null : canvas.toDataURL('image/png'));
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

  const canUndo = historyStep > 0;
  const canRedo = historyStep < history.length - 1;

  const toolbar = (
    <DrawingToolbar
      tool={tool} setTool={setTool}
      color={color} setColor={setColor}
      lineWidth={lineWidth} setLineWidth={setLineWidth}
      onUndo={undo} onRedo={redo} onClear={() => setClearDialogOpen(true)}
      canUndo={canUndo}
      canRedo={canRedo}
    />
  );

  return (
    <div className="flex h-full w-full max-w-sm min-h-0 flex-col items-center gap-4">
      {/* With the toolbar floating on narrow screens, the canvas takes the whole
          remaining height instead of being pinned to 480px. */}
      <div
        ref={containerRef}
        className="relative aspect-[2/3] max-h-[560px] w-auto max-w-full flex-1 min-h-0 overflow-hidden rounded-3xl border border-border bg-[#F8F4EE] shadow-sm md:h-auto md:w-full md:max-w-[320px] md:flex-none"
        style={{ touchAction: 'none' }}
      >
        {/* Background finger silhouette — shared with the card and hand canvas */}
        <FingerSilhouette
          baseColor={baseColor}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

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

      {/* Exactly one copy of the toolbar exists at a time — a hidden duplicate
          would put a second set of colour and width controls in the DOM. */}
      {!isMobile ? (
        <div className="w-full">{toolbar}</div>
      ) : (
        <>
          {/* Narrow screens give the whole height to the canvas and reach the
              tools through a floating button, with undo always one tap away. */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-end p-4">
            <div className="pointer-events-auto flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                aria-label="실행 취소"
                className="h-12 w-12 rounded-full border bg-white shadow-lg"
              >
                <MaterialIcon name="undo" />
              </Button>
              <Button
                type="button"
                onClick={() => setToolsOpen(true)}
                className="h-14 rounded-full pl-5 pr-6 text-base font-bold shadow-xl"
                aria-label="그림 도구 열기"
              >
                <MaterialIcon name="brush" className="mr-2" />
                그림 도구
              </Button>
            </div>
          </div>

          <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
            <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6 pt-2">
              <SheetHeader className="py-2">
                <SheetTitle className="text-base">그림 도구</SheetTitle>
              </SheetHeader>
              {toolbar}
            </SheetContent>
          </Sheet>
        </>
      )}


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