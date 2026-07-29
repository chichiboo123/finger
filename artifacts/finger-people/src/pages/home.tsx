import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useCharacters } from '@/lib/useCharacters';
import { HandCanvas } from '@/components/HandCanvas';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Progress } from '@/components/ui/progress';

const FINGER_NAMES = ['엄지', '검지', '중지', '약지', '소지'] as const;

export default function Home() {
  const { characters, isLoading } = useCharacters();
  const [, setLocation] = useLocation();
  // false = only right hand; true = both hands shown
  const [showLeftHand, setShowLeftHand] = useState(false);

  useEffect(() => {
    if (!isLoading && characters.some((c) => c.hand === 'left')) {
      setShowLeftHand(true);
    }
  }, [characters, isLoading]);

  const maxSlots = showLeftHand ? 10 : 5;
  const visibleHands: Array<'right' | 'left'> = showLeftHand ? ['left', 'right'] : ['right'];
  const visible = characters.filter((c) => visibleHands.includes(c.hand));
  const completedCount = visible.filter((c) => c.isCompleted).length;
  const inProgressCount = visible.filter((c) => !c.isCompleted && c.name.trim()).length;

  // Collapsing back to one hand would hide characters the child already made.
  const leftHandInUse = characters.some((c) => c.hand === 'left' && c.name.trim());

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <MaterialIcon name="sync" className="animate-spin text-4xl" />
          <p>불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-1 flex-col items-center p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center py-6">
        <div className="mb-6 text-center">
          <h2 className="mb-3 font-display text-3xl font-extrabold text-foreground md:text-4xl">
            어떤 인물을 상상해 볼까요?
          </h2>
          <p className="text-muted-foreground">
            손가락을 하나 골라서 인물의 특징을 적고 그림을 그려보세요!
          </p>
        </div>

        <HandCanvas characters={characters} showLeftHand={showLeftHand} />

        <div className="mt-8 flex w-full max-w-md flex-col items-center gap-4">
          <div className="w-full rounded-3xl border bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">완성된 핑거피플</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-primary">{completedCount}</span>
                <span className="text-muted-foreground">/ {maxSlots}명</span>
              </div>
            </div>
            <Progress value={(completedCount / maxSlots) * 100} className="mt-3 h-2" />
            {inProgressCount > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                만드는 중인 인물 {inProgressCount}명이 있어요.
              </p>
            )}
          </div>

          {!showLeftHand ? (
            <Button
              onClick={() => setShowLeftHand(true)}
              variant="outline"
              className="h-12 w-full rounded-full border-primary/20 text-base text-primary hover:bg-primary/5"
            >
              <MaterialIcon name="pan_tool" className="mr-2" />
              양손으로 확장하기 (10명)
            </Button>
          ) : (
            <Button
              onClick={() => setShowLeftHand(false)}
              variant="outline"
              disabled={leftHandInUse}
              title={leftHandInUse ? '왼손에 만든 인물이 있어서 접을 수 없어요.' : undefined}
              className="h-12 w-full rounded-full border-border text-base text-muted-foreground hover:bg-muted"
            >
              <MaterialIcon name="front_hand" className="mr-2" />
              {leftHandInUse ? '왼손에 만든 인물이 있어요' : '한 손으로 줄이기'}
            </Button>
          )}

          {completedCount > 0 && (
            <Button
              onClick={() => setLocation('/cards')}
              className="h-12 w-full rounded-full text-base font-bold shadow-sm"
            >
              <MaterialIcon name="badge" className="mr-2" />
              완성한 인물 카드 보기
            </Button>
          )}
        </div>

        {/* Text alternative to the hand illustration: works with a keyboard,
            a screen reader, and small touch targets alike. */}
        <div className="mt-10 grid w-full max-w-3xl gap-6 sm:grid-cols-2">
          {visibleHands.map((hand) => (
            <section key={hand}>
              <h3 className="mb-3 text-sm font-bold text-muted-foreground">
                {hand === 'left' ? '왼손' : '오른손'} 손가락
              </h3>
              <ul className="flex flex-col gap-2">
                {FINGER_NAMES.map((fingerName, i) => {
                  const id = `${hand}-${i + 1}`;
                  const char = characters.find((c) => c.id === id);
                  const named = char?.name.trim();
                  return (
                    <li key={id}>
                      <button
                        onClick={() => setLocation(`/character/${id}`)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-2xl border bg-white px-4 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <span
                          className="h-4 w-4 flex-shrink-0 rounded-full border"
                          style={{ backgroundColor: named ? char!.color : 'transparent' }}
                          aria-hidden="true"
                        />
                        <span className="w-8 flex-shrink-0 text-xs text-muted-foreground">
                          {fingerName}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium">
                          {named || <span className="text-muted-foreground">비어 있음</span>}
                        </span>
                        {char?.isCompleted ? (
                          <span className="flex flex-shrink-0 items-center gap-0.5 text-xs font-bold text-primary">
                            <MaterialIcon name="check_circle" className="text-[16px]" /> 완성
                          </span>
                        ) : (
                          <MaterialIcon name="chevron_right" className="flex-shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
