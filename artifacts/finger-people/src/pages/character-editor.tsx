import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { useCharacters } from '@/lib/useCharacters';
import { Character } from '@/lib/db';
import { FingerDrawingCanvas } from '@/components/FingerDrawingCanvas';
import { CharacterForm } from '@/components/CharacterForm';
import { AutoSaveStatus, SaveState } from '@/components/AutoSaveStatus';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompletionDialog } from '@/components/CompletionDialog';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const FINGER_NAMES = {
  1: '엄지', 2: '검지', 3: '중지', 4: '약지', 5: '소지'
};

export default function CharacterEditor() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { characters, saveCharacter, isLoading } = useCharacters();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [charData, setCharData] = useState<Character | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveState>('saved');
  // Controlled so validation can pull the child back to the tab that needs input.
  const [mobileTab, setMobileTab] = useState<'drawing' | 'info'>('info');
  const [completionOpen, setCompletionOpen] = useState(false);

  const lastSavedData = useRef<Character | null>(null);
  const initializedId = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    if (isLoading || !id) return;
    
    if (initializedId.current !== id) {
      initializedId.current = id;
      
      const existing = characters.find(c => c.id === id);
      if (existing) {
        setCharData({ ...existing });
        lastSavedData.current = { ...existing };
        // Already named? Then the child is most likely here to draw.
        setMobileTab(existing.name.trim() ? 'drawing' : 'info');
      } else {
        setMobileTab('info');
        // Create new empty template
        const parts = id.split('-');
        if (parts.length !== 2 || !['left', 'right'].includes(parts[0])) {
          setLocation('/'); // Invalid ID
          return;
        }
        
        const hand = parts[0] as 'left' | 'right';
        const fingerIndex = parseInt(parts[1]) as 1|2|3|4|5;
        
        if (!FINGER_NAMES[fingerIndex]) {
          setLocation('/'); return;
        }
        
        const newChar: Character = {
          id,
          hand,
          fingerIndex,
          fingerName: FINGER_NAMES[fingerIndex],
          name: '',
          appearance: '',
          likes: '',
          dislikes: '',
          goal: '',
          catchphrase: '',
          color: '#ffffff',
          colorName: '흰색',
          drawingDataUrl: null,
          isCompleted: false,
          updatedAt: Date.now()
        };
        
        setCharData(newChar);
        lastSavedData.current = newChar;
        // initial save
        saveCharacter(newChar);
      }
    }
  }, [id, characters, isLoading, setLocation, saveCharacter]);

  // Debounced auto-save
  const triggerSave = useCallback((data: Character) => {
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const toSave = { ...data, updatedAt: Date.now() };
        await saveCharacter(toSave);
        lastSavedData.current = { ...toSave };
        setSaveStatus('saved');
      } catch (err) {
        console.error(err);
        setSaveStatus('error');
      }
    }, 1000);
  }, [saveCharacter]);

  const handleFormChange = (updates: Partial<Character>) => {
    if (!charData) return;
    const updated = { ...charData, ...updates };
    setCharData(updated);
    triggerSave(updated);
  };

  const handleComplete = async () => {
    if (!charData) return;
    if (!charData.name.trim()) {
      setMobileTab('info');
      toast({
        title: "이름을 입력해주세요!",
        description: "'정보' 칸에서 인물의 이름을 먼저 적어주세요.",
        variant: "destructive"
      });
      document.getElementById('char-name')?.focus();
      return;
    }
    
    try {
      // A queued auto-save still contains isCompleted=false. If it runs after
      // this save it silently turns the completed card back into a draft.
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      setSaveStatus('saving');
      const finalData = { ...charData, isCompleted: true, updatedAt: Date.now() };
      await saveCharacter(finalData);
      setCharData(finalData);
      setSaveStatus('saved');
      
      // Let the child pick what happens next instead of yanking them away.
      setCompletionOpen(true);
    } catch (e) {
      setSaveStatus('error');
      toast({
        title: "오류 발생",
        description: "저장하는 중 문제가 발생했어요.",
        variant: "destructive"
      });
    }
  };

  // Anatomical order across both hands. The right hand is always available;
  // the left hand only joins the rotation once it holds a character.
  const ALL_IDS = [
    'left-5', 'left-4', 'left-3', 'left-2', 'left-1',
    'right-1', 'right-2', 'right-3', 'right-4', 'right-5',
  ];
  const leftInUse = characters.some(c => c.hand === 'left');
  const activeIds = ALL_IDS.filter(
    id => leftInUse || id.startsWith('right-') || id === charData?.id,
  );

  const navigateFinger = (dir: 1 | -1) => {
    if (!charData) return;
    const currentIndex = activeIds.indexOf(charData.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + dir + activeIds.length) % activeIds.length;
    setLocation(`/character/${activeIds[nextIndex]}`);
  };

  const describeFinger = (id: string) => {
    const [hand, index] = id.split('-');
    const finger = FINGER_NAMES[Number(index) as keyof typeof FINGER_NAMES];
    return `${hand === 'left' ? '왼손' : '오른손'} ${finger}`;
  };

  // Starting from the finger just completed, the next slot with nothing in it.
  const nextEmptyId = (() => {
    if (!charData) return undefined;
    const start = activeIds.indexOf(charData.id);
    for (let i = 1; i <= activeIds.length; i++) {
      const id = activeIds[(start + i) % activeIds.length];
      if (!characters.find(c => c.id === id)?.name.trim()) return id;
    }
    return undefined;
  })();

  const completedCount = characters.filter(
    c => c.isCompleted && activeIds.includes(c.id),
  ).length;

  if (isLoading || !charData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MaterialIcon name="sync" className="animate-spin text-4xl text-muted-foreground" />
      </div>
    );
  }

  const handLabel = charData.hand === 'left' ? '왼손' : '오른손';

  return (
    <div className="flex min-h-[540px] flex-1 flex-col overflow-hidden">
      
      {/* Editor Header */}
      <div className="flex-none h-14 border-b bg-white flex items-center justify-between px-4 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <MaterialIcon name="arrow_back" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 whitespace-nowrap text-sm font-bold">
              <span className="text-xs font-medium text-muted-foreground">{handLabel}</span>
              {charData.fingerName}
            </span>
          </div>
        </div>

        <AutoSaveStatus status={saveStatus} />

        <div className="flex items-center gap-2">
          <div className="mr-1 flex items-center rounded-full bg-muted/50 p-1 sm:mr-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigateFinger(-1)} aria-label="이전 손가락">
              <MaterialIcon name="chevron_left" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigateFinger(1)} aria-label="다음 손가락">
              <MaterialIcon name="chevron_right" />
            </Button>
          </div>
          <Button onClick={handleComplete} className="rounded-full shadow-sm">
            {charData.isCompleted ? '수정 완료' : '완성하기'}
          </Button>
        </div>
      </div>

      {/* Editor Content - Responsive Layout */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-muted/10">
        
        {/* One layout at a time. Rendering both and hiding one with CSS mounted
            two drawing canvases, so the floating tool button appeared twice and
            two undo stacks fought over the same character. */}
        {isMobile ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <Tabs
            value={mobileTab}
            onValueChange={(v) => setMobileTab(v as 'drawing' | 'info')}
            className="w-full flex-1 flex flex-col"
          >
            <div className="px-4 pt-4 pb-2 bg-white border-b">
              <TabsList className="w-full grid grid-cols-2 h-12 rounded-full">
                <TabsTrigger value="drawing" className="rounded-full text-base font-bold">그림</TabsTrigger>
                <TabsTrigger value="info" className="rounded-full text-base font-bold">정보</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {/* pb leaves room for the floating tool button */}
              <TabsContent value="drawing" className="absolute inset-0 m-0 flex-col items-center overflow-hidden p-4 pb-24 data-[state=active]:flex sm:pb-4">
                <FingerDrawingCanvas
                  key={charData.id}
                  initialDataUrl={charData.drawingDataUrl}
                  baseColor={charData.color}
                  onSave={(dataUrl) => handleFormChange({ drawingDataUrl: dataUrl })}
                />
              </TabsContent>
              <TabsContent value="info" className="absolute inset-0 m-0 p-4 overflow-y-auto data-[state=active]:block">
                <CharacterForm data={charData} onChange={handleFormChange} />
                {/* Makes the order explicit: describe the character, then draw it. */}
                <Button
                  onClick={() => setMobileTab('drawing')}
                  variant="outline"
                  className="mx-auto mt-4 flex h-12 w-full max-w-lg rounded-full border-primary/30 text-base font-bold text-primary"
                >
                  <MaterialIcon name="draw" className="mr-2" />
                  다음: 모습 그리기
                </Button>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        ) : (
        /* Desktop Split View */
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 lg:w-[45%] h-full border-r p-6 overflow-y-auto bg-muted/20 flex flex-col items-center">
            <h3 className="font-display font-bold text-xl mb-6 text-foreground/80 self-start">모습 그리기</h3>
            <FingerDrawingCanvas
              key={charData.id}
              initialDataUrl={charData.drawingDataUrl}
              baseColor={charData.color}
              onSave={(dataUrl) => handleFormChange({ drawingDataUrl: dataUrl })}
            />
          </div>
          
          <div className="w-1/2 lg:w-[55%] h-full p-6 lg:p-10 overflow-y-auto bg-white">
            <h3 className="font-display font-bold text-xl mb-6 text-foreground/80">정보 입력하기</h3>
            <CharacterForm data={charData} onChange={handleFormChange} />
          </div>
        </div>
        )}

      </div>

      <CompletionDialog
        open={completionOpen}
        onOpenChange={setCompletionOpen}
        character={charData}
        completed={completedCount}
        total={activeIds.length}
        nextFingerLabel={nextEmptyId ? describeFinger(nextEmptyId) : undefined}
        onNextFinger={nextEmptyId ? () => {
          setCompletionOpen(false);
          setLocation(`/character/${nextEmptyId}`);
        } : undefined}
        onGoHome={() => { setCompletionOpen(false); setLocation('/'); }}
        onGoCards={() => { setCompletionOpen(false); setLocation('/cards'); }}
      />
    </div>
  );
}
