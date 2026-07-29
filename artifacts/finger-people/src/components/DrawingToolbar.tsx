import { MaterialIcon } from './MaterialIcon';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DrawingToolbarProps {
  tool: 'pen' | 'eraser';
  setTool: (tool: 'pen' | 'eraser') => void;
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const QUICK_COLORS = ["#212121", "#F44336", "#1E88E5", "#FDD835", "#43A047", "#FFFFFF"];

export function DrawingToolbar({
  tool, setTool, color, setColor, lineWidth, setLineWidth,
  onUndo, onRedo, onClear, canUndo, canRedo
}: DrawingToolbarProps) {
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border flex flex-col gap-4 w-full">
      {/* Tools & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => setTool('pen')}
            className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
              tool === 'pen' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-white/50"
            )}
            aria-label="펜"
          >
            <MaterialIcon name="edit" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
              tool === 'eraser' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-white/50"
            )}
            aria-label="지우개"
          >
            <MaterialIcon name="ink_eraser" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="실행 취소">
            <MaterialIcon name="undo" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="다시 실행">
            <MaterialIcon name="redo" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={onClear} className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="전체 지우기">
            <MaterialIcon name="delete" />
          </Button>
        </div>
      </div>

      {/* Colors (only relevant for pen) */}
      <div className={cn("flex flex-col gap-2 transition-opacity", tool === 'eraser' && "opacity-50 pointer-events-none")}>
        <span className="text-xs font-medium text-muted-foreground">색상</span>
        <div className="flex items-center gap-2">
          {QUICK_COLORS.map(c => (
            <button
              key={c}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform",
                color === c ? "border-primary scale-110" : "border-transparent border-border"
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`${c} 색상 선택`}
            />
          ))}
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-border focus-within:border-primary">
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="absolute -inset-2 w-12 h-12 cursor-pointer"
              aria-label="사용자 지정 색상 선택"
            />
          </div>
        </div>
      </div>

      {/* Line Width */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">
            {tool === 'eraser' ? '지우개 굵기' : '펜 굵기'}
          </span>
          <span className="text-xs font-mono">{lineWidth}px</span>
        </div>
        <Slider 
          value={[lineWidth]} 
          min={2} 
          max={40} 
          step={1} 
          onValueChange={(vals) => setLineWidth(vals[0])} 
        />
      </div>
    </div>
  );
}