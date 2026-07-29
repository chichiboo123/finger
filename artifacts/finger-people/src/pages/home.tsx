import { useState, useEffect } from 'react';
import { useCharacters } from '@/lib/useCharacters';
import { HandCanvas } from '@/components/HandCanvas';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/MaterialIcon';

export default function Home() {
  const { characters, isLoading } = useCharacters();
  const [showRightHand, setShowRightHand] = useState(false);

  // Initialize right hand visibility based on existing right hand characters
  useEffect(() => {
    if (!isLoading) {
      const hasRightHand = characters.some(c => c.hand === 'right');
      if (hasRightHand) setShowRightHand(true);
    }
  }, [characters, isLoading]);

  const maxSlots = showRightHand ? 10 : 5;
  const completedCount = characters.filter(c => c.isCompleted).length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <MaterialIcon name="sync" className="animate-spin text-4xl" />
          <p>불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 container mx-auto">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center py-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-3">
            어떤 인물을 상상해 볼까요?
          </h2>
          <p className="text-muted-foreground">
            손가락을 하나 골라서 인물의 특징을 적고 그림을 그려보세요!
          </p>
        </div>

        <HandCanvas characters={characters} showRightHand={showRightHand} />

        <div className="mt-16 flex flex-col items-center gap-6 w-full max-w-md">
          <div className="bg-white px-6 py-3 rounded-full shadow-sm border flex items-center gap-3 w-full justify-between">
            <span className="font-medium">완성된 핑거피플</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold text-primary">{completedCount}</span>
              <span className="text-muted-foreground">/ {maxSlots}명</span>
            </div>
          </div>

          {!showRightHand ? (
            <Button 
              onClick={() => setShowRightHand(true)} 
              variant="outline" 
              className="w-full rounded-full h-12 text-base border-primary/20 text-primary hover:bg-primary/5"
            >
              <MaterialIcon name="pan_tool" className="mr-2" />
              양손으로 확장하기 (10명)
            </Button>
          ) : (
            <Button 
              onClick={() => setShowRightHand(false)} 
              variant="outline" 
              className="w-full rounded-full h-12 text-base border-border text-muted-foreground hover:bg-muted"
            >
              <MaterialIcon name="front_hand" className="mr-2" />
              한 손으로 줄이기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}