import { Character } from "@/lib/db";
import { MaterialIcon } from "./MaterialIcon";
import { getContrastColor, cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  className?: string;
  hideActions?: boolean;
  onEdit?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  id?: string;
}

export function CharacterCard({
  character,
  className,
  hideActions = false,
  onEdit,
  onCopy,
  onDownload,
  onDelete,
  id
}: CharacterCardProps) {
  const contrastColor = getContrastColor(character.color || '#ffffff');
  
  return (
    <div 
      id={id}
      className={cn(
        "bg-white rounded-3xl overflow-hidden border shadow-md flex flex-col relative group transition-all",
        "w-full aspect-[2/3] max-w-[400px]", 
        className
      )}
    >
      {/* Top half: Visual (Color + Drawing) */}
      <div 
        className="h-[45%] w-full relative flex items-center justify-center p-4 border-b"
        style={{ backgroundColor: character.color || '#F5F5F5' }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        
        {character.drawingDataUrl ? (
          <img 
            src={character.drawingDataUrl} 
            alt={character.name} 
            className="h-[120%] w-auto max-w-full object-contain relative z-10 filter drop-shadow-lg scale-110 translate-y-4"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
            <MaterialIcon name="face" className="text-5xl text-white drop-shadow-md" />
          </div>
        )}

        {/* Hand/Finger badge */}
        <div 
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm z-20 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#333' }}
        >
          {character.hand === 'left' ? '왼손' : '오른손'} {character.fingerName}
        </div>
      </div>

      {/* Bottom half: Info */}
      <div className="h-[55%] w-full bg-white p-5 flex flex-col z-20">
        
        <div className="flex items-start justify-between mb-4 gap-2">
          <h3 className="text-2xl font-display font-extrabold truncate leading-tight">
            {character.name || '이름 없음'}
          </h3>
          <div className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap bg-muted/30">
            {character.colorName}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-hidden text-sm flex flex-col justify-center">
          
          {character.appearance && (
            <p className="text-muted-foreground leading-snug line-clamp-2">
              {character.appearance}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs mt-auto">
            {character.likes && (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 font-bold text-green-600">
                  <MaterialIcon name="thumb_up" className="text-[14px]" /> 좋아하는 것
                </span>
                <span className="truncate text-muted-foreground">{character.likes}</span>
              </div>
            )}
            
            {character.dislikes && (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 font-bold text-destructive">
                  <MaterialIcon name="thumb_down" className="text-[14px]" /> 싫어하는 것
                </span>
                <span className="truncate text-muted-foreground">{character.dislikes}</span>
              </div>
            )}
          </div>

          {(character.goal || character.catchphrase) && (
            <div className="pt-2 border-t mt-2 flex flex-col gap-2">
              {character.goal && (
                <div className="flex items-center gap-2">
                  <span className="text-accent-foreground text-xs"><MaterialIcon name="flag" className="text-[16px]" /></span>
                  <span className="font-medium truncate flex-1">{character.goal}</span>
                </div>
              )}
              {character.catchphrase && (
                <div className="bg-primary/5 rounded-2xl rounded-tl-none p-2.5 px-3 border border-primary/10">
                  <span className="font-bold text-primary font-display leading-tight block">"{character.catchphrase}"</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Menu */}
        {!hideActions && (
          <div className="absolute top-4 right-4 flex gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            {onEdit && (
              <button onClick={onEdit} className="w-8 h-8 rounded-full bg-white text-foreground shadow-md flex items-center justify-center hover:bg-muted" aria-label="편집">
                <MaterialIcon name="edit" className="text-[18px]" />
              </button>
            )}
            {onDownload && (
              <button onClick={onDownload} className="w-8 h-8 rounded-full bg-white text-foreground shadow-md flex items-center justify-center hover:bg-muted" aria-label="다운로드">
                <MaterialIcon name="download" className="text-[18px]" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}