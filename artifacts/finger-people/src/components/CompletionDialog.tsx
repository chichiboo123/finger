import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from './MaterialIcon';
import { FingerSilhouette, FINGER_BOX } from './FingerSilhouette';
import { Character } from '@/lib/db';

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  /** Completed count / total slots, for the progress line. */
  completed: number;
  total: number;
  /** Undefined when every visible finger already has a character. */
  nextFingerLabel?: string;
  onNextFinger?: () => void;
  onGoHome: () => void;
  onGoCards: () => void;
}

/**
 * Shown after 완성하기. The old flow jumped straight to the gallery after a
 * toast, which stranded a child who just wanted to make the next finger.
 * Now the next step is theirs to choose.
 */
export function CompletionDialog({
  open,
  onOpenChange,
  character,
  completed,
  total,
  nextFingerLabel,
  onNextFinger,
  onGoHome,
  onGoCards,
}: CompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="font-display text-2xl">
            {character.name} 완성!
          </DialogTitle>
          <DialogDescription>
            {completed >= total
              ? '손가락을 모두 채웠어요. 정말 대단해요!'
              : `${total}명 중 ${completed}명을 만들었어요.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <div
            className="relative h-40 drop-shadow-md"
            style={{ aspectRatio: `${FINGER_BOX.w} / ${FINGER_BOX.h}` }}
          >
            <FingerSilhouette baseColor={character.color} className="absolute inset-0 h-full w-full" />
            {character.drawingDataUrl && (
              <img
                src={character.drawingDataUrl}
                alt={`${character.name} 그림`}
                className="absolute inset-0 h-full w-full object-contain"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {nextFingerLabel && onNextFinger && (
            <Button onClick={onNextFinger} className="h-12 w-full rounded-full text-base font-bold">
              <MaterialIcon name="add" className="mr-2" />
              다음 손가락 만들기 ({nextFingerLabel})
            </Button>
          )}
          <Button onClick={onGoCards} variant="outline" className="h-12 w-full rounded-full text-base">
            <MaterialIcon name="badge" className="mr-2" />
            인물 카드 보기
          </Button>
          <Button onClick={onGoHome} variant="ghost" className="h-11 w-full rounded-full text-muted-foreground">
            <MaterialIcon name="front_hand" className="mr-2" />
            손 화면으로 돌아가기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
