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
import { useToast } from '@/hooks/use-toast';

const FINGER_NAMES = {
  1: '엄지', 2: '검지', 3: '중지', 4: '약지', 5: '새끼'
};

export default function CharacterEditor() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { characters, saveCharacter, isLoading } = useCharacters();
  const { toast } = useToast();
  
  const [charData, setCharData] = useState<Character | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveState>('saved');
  
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
      } else {
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
      toast({
        title: "이름을 입력해주세요!",
        description: "인물의 이름은 꼭 필요해요.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaveStatus('saving');
      const finalData = { ...charData, isCompleted: true, updatedAt: Date.now() };
      await saveCharacter(finalData);
      setCharData(finalData);
      setSaveStatus('saved');
      
      toast({
        title: "완성!",
        description: "멋진 핑거피플이 탄생했어요.",
      });
      
      setTimeout(() => setLocation('/cards'), 1500);
    } catch (e) {
      setSaveStatus('error');
      toast({
        title: "오류 발생",
        description: "저장하는 중 문제가 발생했어요.",
        variant: "destructive"
      });
    }
  };

  const navigateFinger = (dir: 1 | -1) => {
    if (!charData) return;
    const allIds = [
      'left-5', 'left-4', 'left-3', 'left-2', 'left-1',
      'right-1', 'right-2', 'right-3', 'right-4', 'right-5'
    ];
    
    const currentIndex = allIds.indexOf(charData.id);
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex + dir;
    if (nextIndex < 0) nextIndex = allIds.length - 1;
    if (nextIndex >= allIds.length) nextIndex = 0;
    
    // Check if the other hand is visible based on existing right-hand characters
    const hasRightHand = characters.some(c => c.hand === 'right');
    const nextId = allIds[nextIndex];
    
    if (nextId.startsWith('right-') && !hasRightHand) {
      // Skip right hand if not enabled
      if (dir === 1) nextIndex = 0; // go back to left-5
      else nextIndex = 4; // go back to left-1
    }
    
    setLocation(`/character/${allIds[nextIndex]}`);
  };

  if (isLoading || !charData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MaterialIcon name="sync" className="animate-spin text-4xl text-muted-foreground" />
      </div>
    );
  }

  const handLabel = charData.hand === 'left' ? '왼손' : '오른손';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-h-[calc(100dvh-64px)] overflow-hidden">
      
      {/* Editor Header */}
      <div className="flex-none h-14 border-b bg-white flex items-center justify-between px-4 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <MaterialIcon name="arrow_back" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-bold flex items-center gap-1">
              <span className="text-muted-foreground font-medium text-xs">{handLabel}</span>
              {charData.fingerName}
            </span>
          </div>
        </div>

        <AutoSaveStatus status={saveStatus} className="hidden sm:flex" />

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/50 rounded-full p-1 mr-2 hidden sm:flex">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigateFinger(-1)}>
              <MaterialIcon name="chevron_left" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigateFinger(1)}>
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
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="drawing" className="w-full flex-1 flex flex-col">
            <div className="px-4 pt-4 pb-2 bg-white border-b">
              <TabsList className="w-full grid grid-cols-2 h-12 rounded-full">
                <TabsTrigger value="drawing" className="rounded-full text-base font-bold">그림</TabsTrigger>
                <TabsTrigger value="info" className="rounded-full text-base font-bold">정보</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="drawing" className="absolute inset-0 m-0 p-4 overflow-y-auto overflow-x-hidden data-[state=active]:flex flex-col items-center">
                <FingerDrawingCanvas 
                  initialDataUrl={charData.drawingDataUrl} 
                  baseColor={charData.color}
                  onSave={(dataUrl) => handleFormChange({ drawingDataUrl: dataUrl })}
                />
              </TabsContent>
              <TabsContent value="info" className="absolute inset-0 m-0 p-4 overflow-y-auto data-[state=active]:block">
                <CharacterForm data={charData} onChange={handleFormChange} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Desktop Split View */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <div className="w-1/2 lg:w-[45%] h-full border-r p-6 overflow-y-auto bg-muted/20 flex flex-col items-center">
            <h3 className="font-display font-bold text-xl mb-6 text-foreground/80 self-start">모습 그리기</h3>
            <FingerDrawingCanvas 
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

      </div>
    </div>
  );
}