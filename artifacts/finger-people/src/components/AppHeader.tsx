import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { MaterialIcon } from './MaterialIcon';
import { Button } from './ui/button';
import { ConfirmDialog } from './ConfirmDialog';
import { useCharacters } from '@/lib/useCharacters';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onHelpClick?: () => void;
}

const NAV_ITEMS = [
  { href: '/cards', icon: 'badge', label: '인물 카드' },
  { href: '/export', icon: 'download', label: '내보내기' },
] as const;

export function AppHeader({ onHelpClick }: AppHeaderProps) {
  const [location, setLocation] = useLocation();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { clearAll, characters } = useCharacters();

  const handleReset = async () => {
    await clearAll();
    setResetDialogOpen(false);
    setLocation('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <MaterialIcon name="front_hand" className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-xl font-bold leading-none tracking-tight">핑거피플</h1>
              <span className="mt-1 hidden text-[10px] text-muted-foreground sm:inline-block">
                손가락에서 시작하는 나만의 인물 상상
              </span>
            </div>
          </Link>

          <nav aria-label="주요 메뉴" className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isCurrent = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    aria-current={isCurrent ? 'page' : undefined}
                    className={cn('h-10 gap-1.5 rounded-full px-3', isCurrent && 'bg-muted font-bold text-primary')}
                  >
                    <MaterialIcon name={item.icon} />
                    <span className="hidden text-sm sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <Button variant="ghost" className="h-10 gap-1.5 rounded-full px-3" onClick={onHelpClick}>
              <MaterialIcon name="help" />
              <span className="hidden text-sm sm:inline">도움말</span>
            </Button>

            <div className="mx-1 h-6 w-px bg-border" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setResetDialogOpen(true)}
              disabled={characters.length === 0}
              aria-label="모두 지우고 처음부터"
              title="모두 지우고 처음부터"
              className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <MaterialIcon name="delete_forever" />
            </Button>
          </nav>
        </div>
      </header>

      <ConfirmDialog
        isOpen={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="모두 지우고 처음부터"
        description={`지금까지 만든 인물 ${characters.length}명이 모두 사라지고 되돌릴 수 없어요. 정말 지울까요?`}
        onConfirm={handleReset}
        confirmText="모두 지우기"
        cancelText="취소"
        destructive
      />
    </>
  );
}
