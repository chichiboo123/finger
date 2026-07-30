import { useEffect, useState } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { Progress } from './ui/progress';
import { ExportProgress } from '@/lib/exportUtils';

const STARTING_PERCENT = 6;

interface ExportProgressOverlayProps {
  open: boolean;
  /** Headline, e.g. "다운로드 중입니다". */
  title: string;
  progress: ExportProgress | null;
}

/**
 * Saving a card takes a few seconds on tablets. Without this the app looks
 * frozen and children tap the button again, so the wait is always shown.
 */
export function ExportProgressOverlay({ open, title, progress }: ExportProgressOverlayProps) {
  const target = progress?.percent ?? STARTING_PERCENT;
  const [shown, setShown] = useState(STARTING_PERCENT);

  // The bar keeps creeping between stages: a bar that sits still reads as an
  // error just as much as no bar at all.
  useEffect(() => {
    if (!open) {
      setShown(STARTING_PERCENT);
      return;
    }

    const ceiling = target >= 100 ? 100 : Math.min(target + 12, 96);
    const timer = setInterval(() => {
      setShown(prev => {
        if (prev >= ceiling) return prev;
        return Math.min(ceiling, prev + Math.max(0.5, (ceiling - prev) * 0.15));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [open, target]);

  if (!open) return null;

  const percent = Math.max(shown, Math.min(target, 100));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/25 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-3xl border bg-white p-6 shadow-xl" role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MaterialIcon name="sync" className="animate-spin text-[26px]" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-display font-bold leading-tight">{title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {progress?.message ?? '준비하고 있어요'}
            </p>
          </div>
        </div>

        <Progress value={percent} className="mt-5 h-2.5" />

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>잠시만 기다려 주세요</span>
          <span className="font-medium tabular-nums">{Math.round(percent)}%</span>
        </div>
      </div>
    </div>
  );
}
