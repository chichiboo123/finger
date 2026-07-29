import { MaterialIcon } from './MaterialIcon';
import { Button } from './ui/button';
import { Link, useLocation } from 'wouter';
import { ConfirmDialog } from './ConfirmDialog';
import { useState } from 'react';
import { useCharacters } from '@/lib/useCharacters';

interface AppHeaderProps {
  onHelpClick?: () => void;
}

export function AppHeader({ onHelpClick }: AppHeaderProps) {
  const [location] = useLocation();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { clearAll } = useCharacters();

  const handleReset = async () => {
    await clearAll();
    if (location !== '/') {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <MaterialIcon name="front_hand" className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-display font-bold leading-none tracking-tight">핑거피플</h1>
              <span className="text-[10px] text-muted-foreground mt-1 hidden sm:inline-block">손가락에서 시작하는 나만의 인물 상상</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={onHelpClick} aria-label="도움말">
              <MaterialIcon name="help" />
            </Button>
            <Link href="/cards">
              <Button variant="ghost" size="icon" aria-label="인물 카드" className={location === '/cards' ? 'bg-muted' : ''}>
                <MaterialIcon name="badge" />
              </Button>
            </Link>
            <Link href="/export">
              <Button variant="ghost" size="icon" aria-label="내보내기" className={location === '/export' ? 'bg-muted' : ''}>
                <MaterialIcon name="download" />
              </Button>
            </Link>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={() => setResetDialogOpen(true)} aria-label="새로 만들기" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <MaterialIcon name="refresh" />
            </Button>
          </nav>
        </div>
      </header>
      
      <ConfirmDialog 
        isOpen={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="새로 만들기"
        description="모든 인물 데이터가 삭제되고 처음부터 다시 시작합니다. 정말 삭제하실 건가요?"
        onConfirm={handleReset}
        confirmText="삭제하기"
        cancelText="취소"
        destructive
      />
    </>
  );
}