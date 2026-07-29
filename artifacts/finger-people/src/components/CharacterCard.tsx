import { Character } from "@/lib/db";
import { MaterialIcon } from "./MaterialIcon";
import { FingerSilhouette, FINGER_BOX } from "./FingerSilhouette";
import { getContrastColor, cn } from "@/lib/utils";

function CardIcon({ name, className }: { name: 'like' | 'dislike' | 'goal'; className?: string }) {
  const path = name === 'like'
    ? 'M7 10v10H3V10h4Zm4 10a2 2 0 0 1-2-2v-8l4-7 2 1v5h5a2 2 0 0 1 2 2l-2 7a3 3 0 0 1-3 2h-6Z'
    : name === 'dislike'
      ? 'M7 14V4H3v10h4Zm4-10a2 2 0 0 0-2 2v8l4 7 2-1v-5h5a2 2 0 0 0 2-2l-2-7a3 3 0 0 0-3-2h-6Z'
      : 'M5 22V3h11l1 3h4v10h-7l-1-3H7v9H5Z';

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('h-4 w-4 shrink-0 fill-current', className)}>
      <path d={path} />
    </svg>
  );
}

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
        "w-full max-w-[400px]",
        className
      )}
    >
      {/* Top: Visual (Color + Drawing) — scales with the card width */}
      <div
        className="aspect-square w-full relative flex items-center justify-center overflow-hidden p-4 border-b"
        style={{ backgroundColor: character.color || '#F5F5F5' }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />

        {/* The finger travels with the drawing: the card shows exactly what the
            child saw on the drawing screen, silhouette included. */}
        {character.drawingDataUrl ? (
          <div className="relative z-10 h-[92%] drop-shadow-lg" style={{ aspectRatio: `${FINGER_BOX.w} / ${FINGER_BOX.h}` }}>
            <FingerSilhouette
              baseColor={character.color}
              className="absolute inset-0 h-full w-full"
            />
            <img
              src={character.drawingDataUrl}
              alt={`${character.name} 그림`}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="relative z-10 h-[92%] opacity-70" style={{ aspectRatio: `${FINGER_BOX.w} / ${FINGER_BOX.h}` }}>
            <FingerSilhouette
              baseColor={character.color}
              className="absolute inset-0 h-full w-full"
            />
          </div>
        )}

      </div>

      {/* Bottom: Info — grows with its content so nothing is ever half-cut */}
      <div className="w-full flex-1 bg-white p-5 flex flex-col z-20">

        <div className="flex items-start justify-between mb-4 gap-2">
          <h3 className="text-2xl font-display font-extrabold truncate leading-tight">
            {character.name || '이름 없음'}
          </h3>
          <div className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap bg-muted/30">
            {character.colorName}
          </div>
        </div>

        <div className="flex-1 space-y-3 text-sm flex flex-col">

          {character.appearance && (
            <p className="text-muted-foreground leading-snug line-clamp-3">
              {character.appearance}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            {character.likes && (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 font-bold text-green-600">
                  <CardIcon name="like" /> 좋아하는 것
                </span>
                <span className="text-muted-foreground line-clamp-2">{character.likes}</span>
              </div>
            )}
            
            {character.dislikes && (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 font-bold text-destructive">
                  <CardIcon name="dislike" /> 싫어하는 것
                </span>
                <span className="text-muted-foreground line-clamp-2">{character.dislikes}</span>
              </div>
            )}
          </div>

          {(character.goal || character.catchphrase) && (
            <div className="pt-2 border-t mt-auto flex flex-col gap-2">
              {character.goal && (
                <div className="flex items-start gap-2">
                  <span className="text-accent-foreground"><CardIcon name="goal" /></span>
                  <span className="font-medium flex-1 line-clamp-2">{character.goal}</span>
                </div>
              )}
              {character.catchphrase && (
                <div className="bg-primary/5 rounded-2xl rounded-tl-none p-2.5 px-3 border border-primary/10">
                  <span className="font-bold text-primary font-display leading-tight block line-clamp-2">"{character.catchphrase}"</span>
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
