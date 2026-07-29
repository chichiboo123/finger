import { useEffect, useRef, useState } from 'react';
import { useCharacters } from '@/lib/useCharacters';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CharacterCard } from '@/components/CharacterCard';
import { HandCanvas } from '@/components/HandCanvas';
import { copyToClipboard, exportToImage, exportToPdf, shareLink } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function ExportCenter() {
  const { characters, isLoading } = useCharacters();
  const { toast } = useToast();
  
  const [exportType, setExportType] = useState<'hand' | 'cards'>('cards');
  
  // Hand export options — the right hand is the default hand, the left is optional
  const [showLeftHand, setShowLeftHand] = useState(false);
  
  // Card export options
  const [cardFilter, setCardFilter] = useState<'completed' | 'all'>('completed');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'single'>('grid');

  const [busy, setBusy] = useState<'png' | 'pdf' | 'copy' | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const displayCards = characters.filter(c => cardFilter === 'all' || c.isCompleted);
  const hasLeftHand = characters.some(c => c.hand === 'left' && c.name.trim());

  // Don't silently drop the child's left-hand characters from the printout.
  useEffect(() => {
    if (hasLeftHand) setShowLeftHand(true);
  }, [hasLeftHand]);

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!previewRef.current || busy) return;

    setBusy(format);
    try {
      if (format === 'png') {
        await exportToImage(previewRef.current, `fingerpeople_${exportType}.png`);
        toast({ title: "이미지 저장 완료!" });
      } else {
        await exportToPdf(previewRef.current, `fingerpeople_${exportType}.pdf`);
        toast({ title: "PDF 저장 완료!" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "저장 실패", description: "저장 중 문제가 발생했습니다.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleCopyImage = async () => {
    if (!previewRef.current || busy) return;
    setBusy('copy');
    const copied = await copyToClipboard(previewRef.current);
    setBusy(null);
    toast(copied
      ? { title: '이미지를 클립보드에 복사했어요!' }
      : { title: '복사 실패', description: '이 브라우저에서는 이미지 복사를 지원하지 않아요.', variant: 'destructive' });
  };

  const handleShare = async () => {
    const res = await shareLink();
    if (res === 'copied') {
      toast({
        title: "앱 주소를 복사했어요",
        description: "만든 인물은 이 기기에만 저장되니, 친구에게 보낼 때는 이미지나 PDF로 저장해 주세요.",
      });
    } else if (res === 'unsupported') {
      toast({ title: "복사 실패", description: "주소를 복사할 수 없어요.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <MaterialIcon name="sync" className="animate-spin text-4xl text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8">
      
      <div className="mb-8">
        <h2 className="text-3xl font-display font-extrabold flex items-center gap-2">
          <MaterialIcon name="output" className="text-primary" /> 출력 및 내보내기
        </h2>
        <p className="text-muted-foreground mt-1">완성한 핑거피플을 이미지나 PDF로 저장해 친구들과 공유하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Options panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border shadow-sm flex flex-col gap-6">
            
            <div className="space-y-3">
              <Label className="text-base font-bold">출력 형태</Label>
              <ToggleGroup type="single" value={exportType} onValueChange={(v) => v && setExportType(v as any)} className="justify-start bg-muted/50 p-1 rounded-full border w-full">
                <ToggleGroupItem value="cards" className="flex-1 rounded-full data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-primary font-medium">
                  <MaterialIcon name="badge" className="mr-1.5 text-[18px]" /> 인물 카드
                </ToggleGroupItem>
                <ToggleGroupItem value="hand" className="flex-1 rounded-full data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-primary font-medium">
                  <MaterialIcon name="pan_tool" className="mr-1.5 text-[18px]" /> 손 모양
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="h-px bg-border" />

            {exportType === 'hand' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hand-view" className="font-bold">왼손도 함께 출력</Label>
                  <Switch
                    id="hand-view"
                    checked={showLeftHand}
                    onCheckedChange={setShowLeftHand}
                  />
                </div>
                {showLeftHand && !hasLeftHand && (
                  <p className="text-xs text-orange-600">왼손에는 아직 만든 인물이 없어요.</p>
                )}
              </div>
            )}

            {exportType === 'cards' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="font-bold">포함할 카드</Label>
                  <ToggleGroup type="single" value={cardFilter} onValueChange={(v) => v && setCardFilter(v as any)} className="justify-start bg-muted/50 p-1 rounded-full border w-full">
                    <ToggleGroupItem value="completed" className="flex-1 rounded-full data-[state=on]:bg-white data-[state=on]:shadow-sm text-sm">완성 카드만</ToggleGroupItem>
                    <ToggleGroupItem value="all" className="flex-1 rounded-full data-[state=on]:bg-white data-[state=on]:shadow-sm text-sm">전체 카드</ToggleGroupItem>
                  </ToggleGroup>
                  <p className="text-xs text-muted-foreground text-right">총 {displayCards.length}장</p>
                </div>

                <div className="space-y-3">
                  <Label className="font-bold">배치 방식</Label>
                  <ToggleGroup type="single" value={layoutMode} onValueChange={(v) => v && setLayoutMode(v as any)} className="justify-start bg-muted/50 p-1 rounded-full border w-full">
                    <ToggleGroupItem value="grid" className="flex-1 rounded-full data-[state=on]:bg-white data-[state=on]:shadow-sm text-sm">한 번에 모아보기</ToggleGroupItem>
                    <ToggleGroupItem value="single" className="flex-1 rounded-full data-[state=on]:bg-white data-[state=on]:shadow-sm text-sm">한 장씩 보기</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 flex flex-col gap-3">
            <Button onClick={() => handleExport('png')} disabled={!!busy} className="w-full rounded-full h-12 text-base font-bold shadow-sm">
              <MaterialIcon name={busy === 'png' ? 'sync' : 'image'} className={cn('mr-2', busy === 'png' && 'animate-spin')} />
              {busy === 'png' ? '저장하는 중...' : '이미지(PNG)로 저장'}
            </Button>
            <Button onClick={() => handleExport('pdf')} disabled={!!busy} variant="secondary" className="w-full rounded-full h-12 text-base font-bold shadow-sm border">
              <MaterialIcon name={busy === 'pdf' ? 'sync' : 'picture_as_pdf'} className={cn('mr-2', busy === 'pdf' && 'animate-spin')} />
              {busy === 'pdf' ? '저장하는 중...' : 'PDF 문서로 저장'}
            </Button>
            <Button onClick={handleCopyImage} disabled={!!busy} variant="outline" className="w-full rounded-full h-12 text-base bg-white">
              <MaterialIcon name={busy === 'copy' ? 'sync' : 'content_copy'} className={cn('mr-2', busy === 'copy' && 'animate-spin')} />
              {busy === 'copy' ? '복사하는 중...' : '이미지 클립보드 복사'}
            </Button>
            <Button onClick={handleShare} variant="outline" className="w-full rounded-full h-12 text-base bg-white">
              <MaterialIcon name="share" className="mr-2" /> 앱 주소 공유하기
            </Button>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              만든 인물은 이 기기에만 저장돼요. 다른 사람에게 보여주려면 이미지나 PDF로 저장하세요.
            </p>
          </div>
        </div>

        {/* Right: Preview area */}
        <div className="lg:col-span-8 bg-muted/30 rounded-3xl border shadow-inner p-4 md:p-8 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-muted-foreground flex items-center gap-1.5">
              <MaterialIcon name="visibility" className="text-lg" /> 미리보기
            </h3>
            <span className="text-xs bg-white px-2 py-1 rounded-md border shadow-sm">실제 저장되는 모습입니다</span>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border bg-border/20 p-2 md:p-6 custom-scrollbar flex items-center justify-center">
            
            {/* THIS IS THE EXPORT WRAPPER */}
            <div 
              ref={previewRef}
              className={cn(
                "bg-white origin-top shadow-md transition-all",
                exportType === 'hand' ? "p-12 w-full max-w-4xl rounded-3xl" : 
                layoutMode === 'grid' ? "p-8 w-full max-w-5xl rounded-3xl" : "p-0 rounded-3xl max-w-md w-full mx-auto border-none shadow-none bg-transparent"
              )}
            >
              {exportType === 'hand' && (
                <div className="flex flex-col items-center">
                  <h1 className="text-3xl font-display font-bold mb-12 text-center text-primary">나의 핑거피플</h1>
                  <HandCanvas characters={characters} showLeftHand={showLeftHand} interactive={false} />
                </div>
              )}

              {exportType === 'cards' && displayCards.length > 0 && layoutMode === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 place-items-center">
                  {displayCards.map(char => (
                    <div key={char.id} className="w-full max-w-[280px]">
                      <CharacterCard character={char} hideActions />
                    </div>
                  ))}
                </div>
              )}

              {exportType === 'cards' && displayCards.length > 0 && layoutMode === 'single' && (
                <div className="flex flex-col gap-8 w-full items-center">
                  {displayCards.map(char => (
                    <div key={char.id} className="w-full">
                      <CharacterCard character={char} hideActions className="w-full max-w-sm mx-auto shadow-lg" />
                    </div>
                  ))}
                </div>
              )}
              
              {exportType === 'cards' && displayCards.length === 0 && (
                <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
                  <MaterialIcon name="hourglass_empty" className="text-5xl mb-2 opacity-50" />
                  <p>조건에 맞는 카드가 없습니다.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
