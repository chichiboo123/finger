import { cn, getContrastColor } from "@/lib/utils";
import { MaterialIcon } from "./MaterialIcon";

const PALETTE_COLORS = [
  { name: "빨강", hex: "#F44336" }, { name: "주황", hex: "#FF7043" },
  { name: "노랑", hex: "#FDD835" }, { name: "연두", hex: "#8BC34A" },
  { name: "초록", hex: "#43A047" }, { name: "민트", hex: "#26C6DA" },
  { name: "하늘", hex: "#29B6F6" }, { name: "파랑", hex: "#1E88E5" },
  { name: "남색", hex: "#3949AB" }, { name: "보라", hex: "#7B1FA2" },
  { name: "분홍", hex: "#EC407A" }, { name: "갈색", hex: "#6D4C41" },
  { name: "회색", hex: "#78909C" }, { name: "흰색", hex: "#FFFFFF" },
  { name: "검정", hex: "#212121" },
];

interface ColorPaletteProps {
  value: string;
  nameValue: string;
  onChange: (hex: string, name: string) => void;
}

export function ColorPalette({ value, nameValue, onChange }: ColorPaletteProps) {
  
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PALETTE_COLORS.map((c) => {
          const isSelected = value === c.hex;
          const contrast = getContrastColor(c.hex);
          
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => onChange(c.hex, c.name)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm",
                isSelected ? "scale-110 ring-2 ring-primary ring-offset-2" : "hover:scale-105"
              )}
              style={{ backgroundColor: c.hex }}
              aria-label={`${c.name} 선택`}
            >
              {isSelected && (
                <MaterialIcon name="check" className="text-xl" style={{ color: contrast }} />
              )}
            </button>
          );
        })}
        
        {/* Custom color picker */}
        <div 
          className={cn(
            "relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border shadow-sm transition-all",
            !PALETTE_COLORS.find(c => c.hex === value) && value ? "scale-110 ring-2 ring-primary ring-offset-2" : "hover:scale-105"
          )}
          title="사용자 지정 색상"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 mix-blend-difference">
            <MaterialIcon name="palette" className="text-white text-lg" />
          </div>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value, "직접 만든 색")}
            className="absolute -inset-4 w-20 h-20 cursor-pointer"
            aria-label="사용자 지정 색상 선택"
          />
        </div>
      </div>
      
      {nameValue && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full w-fit">
          <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: value }} />
          <span className="text-sm font-medium text-foreground">선택한 색상: {nameValue}</span>
        </div>
      )}
    </div>
  );
}