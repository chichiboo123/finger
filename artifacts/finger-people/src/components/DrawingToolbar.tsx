import { MaterialIcon } from './MaterialIcon';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';

export type DrawingTool = 'pen' | 'eraser' | 'fill';

interface DrawingToolbarProps {
  tool: DrawingTool;
  setTool: (tool: DrawingTool) => void;
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

const PALETTE_COLORS = [
  '#212121', '#757575', '#FFFFFF', '#F44336', '#FF7043', '#FDD835',
  '#8BC34A', '#43A047', '#26C6DA', '#29B6F6', '#1E88E5', '#3949AB',
  '#7B1FA2', '#EC407A', '#6D4C41', '#FFCCBC', '#FFE0B2', '#D7CCC8',
];

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
            onClick={() => setTool('fill')}
            className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
              tool === 'fill' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-white/50"
            )}
            aria-label="페인트통"
            title="막힌 영역을 한 번에 칠하기"
          >
            <MaterialIcon name="format_color_fill" />
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

      {/* Palette is shared by the pen and paint bucket. */}
      <div className={cn("flex flex-col gap-2 transition-opacity", tool === 'eraser' && "opacity-50 pointer-events-none")}>
        <span className="text-xs font-medium text-muted-foreground">색상 팔레트</span>
        <div className="grid grid-cols-10 gap-2">
          {PALETTE_COLORS.map(c => (
            <button
              key={c}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-transform",
                color === c ? "border-primary scale-110" : "border-transparent border-border"
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`${c} 색상 선택`}
            />
          ))}
          <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-border focus-within:border-primary">
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
      <div className={cn("flex flex-col gap-3", tool === 'fill' && "hidden")}>
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
