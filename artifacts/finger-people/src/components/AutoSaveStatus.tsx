import { MaterialIcon } from "./MaterialIcon";
import { cn } from "@/lib/utils";

export type SaveState = "saved" | "saving" | "error";

interface AutoSaveStatusProps {
  status: SaveState;
  className?: string;
}

export function AutoSaveStatus({ status, className }: AutoSaveStatusProps) {
  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", className)}>
      {status === 'saving' && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <MaterialIcon name="sync" className="text-base animate-spin" />
          저장 중...
        </span>
      )}
      {status === 'saved' && (
        <span className="flex items-center gap-1 text-green-600">
          <MaterialIcon name="check_circle" className="text-base" />
          저장됨
        </span>
      )}
      {status === 'error' && (
        <span className="flex items-center gap-1 text-destructive">
          <MaterialIcon name="error" className="text-base" />
          저장 오류
        </span>
      )}
    </div>
  );
}