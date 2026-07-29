import { useState, useMemo } from 'react';
import { useCharacters } from '@/lib/useCharacters';
import { CharacterCard } from '@/components/CharacterCard';
import { MaterialIcon } from '@/components/MaterialIcon';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { exportToImage, copyToClipboard } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Character } from '@/lib/db';

export default function Cards() {
  const { characters, deleteCharacter, isLoading } = useCharacters();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [filter, setFilter] = useState<'all' | 'completed'>('completed');
  
  const [singleIndex, setSingleIndex] = useState(0);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const displayCharacters = useMemo(() => {
    let list = characters;
    if (filter === 'completed') {
      list = list.filter(c => c.isCompleted);
    }
    // Sort by updated At, newest first
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [characters, filter]);

  const handleDownload = async (char: Character) => {
    const el = document.getElementById(`card-${char.id}`);
    if (el) {
      await exportToImage(el, `fingerpeople_${char.name}.png`);
      toast({ title: "다운로드 완료!", description: "카드가 이미지로 저장되었습니다." });
    }
  };

  const handleCopy = async (char: Character) => {
    const el = document.getElementById(`card-${char.id}`);
    if (el) {
      const success = await copyToClipboard(el);
      if (success) {
        toast({ title: "복사 완료!", description: "이미지를 클립보드에 복사했습니다." });
      } else {
        toast({ 
          title: "복사 실패", 
          description: "이 브라우저에서는 이미지 복사를 사용할 수 없어요. 대신 이미지 파일로 저장해 주세요.",
          variant: "destructive"
        });
      }
    }
  };

  const executeDelete = async () => {
    if (deleteId) {
      await deleteCharacter(deleteId);
      setDeleteId(null);
      toast({ title: "삭제 완료", description: "인물이 삭제되었습니다." });
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><MaterialIcon name="sync" className="animate-spin text-4xl text-muted-foreground" /></div>;
  }

  if (characters.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <MaterialIcon name="badge" className="text-4xl text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">아직 만든 인물이 없어요</h2>
        <p className="text-muted-foreground mb-8">첫 번째 핑거피플을 만들어 볼까요?</p>
        <Link href="/">
          <Button className="rounded-full h-12 px-8 text-base">만들러 가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-extrabold flex items-center gap-2">
            <MaterialIcon name="style" className="text-primary" /> 인물 카드 갤러리
          </h2>
          <p className="text-muted-foreground mt-1">완성된 핑거피플 카드들을 모아보세요.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-muted/50 p-1 rounded-full border">
            <Button 
              variant="ghost" 
              className={cn("rounded-full h-9 px-4 text-sm", filter === 'all' && "bg-white shadow-sm font-bold text-primary")}
              onClick={() => setFilter('all')}
            >
              전체
            </Button>
            <Button 
              variant="ghost" 
              className={cn("rounded-full h-9 px-4 text-sm", filter === 'completed' && "bg-white shadow-sm font-bold text-primary")}
              onClick={() => { setFilter('completed'); setSingleIndex(0); }}
            >
              완성된 것만
            </Button>
          </div>

          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)} className="bg-muted/50 p-1 rounded-full border">
            <ToggleGroupItem value="grid" aria-label="격자 보기" className="h-9 w-10 rounded-full data-[state=on]:bg-white data-[state=on]:shadow-sm">
              <MaterialIcon name="grid_view" />
            </ToggleGroupItem>
            <ToggleGroupItem value="single" aria-label="한 장씩 보기" className="h-9 w-10 rounded-full data-[state=on]:bg-white data-[state=on]:shadow-sm">
              <MaterialIcon name="view_carousel" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <Link href="/export">
            <Button variant="outline" className="rounded-full h-11 border-primary/20 text-primary">
              <MaterialIcon name="print" className="mr-1.5" /> 전체 출력
            </Button>
          </Link>
        </div>
      </div>

      {displayCharacters.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-border/60 text-center">
          <MaterialIcon name="inbox" className="text-5xl text-border mb-4" />
          <p className="text-lg font-medium text-muted-foreground">표시할 인물이 없습니다.</p>
          {filter === 'completed' && (
            <p className="text-sm text-muted-foreground mt-2">인물 편집 화면에서 '완성하기' 버튼을 눌러주세요.</p>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
              {displayCharacters.map(char => (
                <div key={char.id} className="relative group w-full max-w-[320px]">
                  <CharacterCard 
                    id={`card-${char.id}`}
                    character={char} 
                    onEdit={() => setLocation(`/character/${char.id}`)}
                    onDownload={() => handleDownload(char)}
                  />
                  <div className="absolute -top-3 -right-3 z-30 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="rounded-full shadow-md w-8 h-8"
                      onClick={() => setDeleteId(char.id)}
                    >
                      <MaterialIcon name="delete" className="text-[18px]" />
                    </Button>
                  </div>
                  <div className="absolute -top-3 -left-3 z-30 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full shadow-md w-8 h-8"
                      onClick={() => handleCopy(char)}
                    >
                      <MaterialIcon name="content_copy" className="text-[18px]" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
              <div className="flex items-center justify-center gap-4 w-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-full hidden sm:flex"
                  onClick={() => setSingleIndex(Math.max(0, singleIndex - 1))}
                  disabled={singleIndex === 0}
                >
                  <MaterialIcon name="chevron_left" className="text-3xl" />
                </Button>
                
                <div className="relative group mx-4 w-full max-w-[400px]">
                   <CharacterCard 
                    id={`card-${displayCharacters[singleIndex].id}`}
                    character={displayCharacters[singleIndex]} 
                    className="max-w-[400px] w-full mx-auto transform scale-100 sm:scale-105 transition-transform"
                    onEdit={() => setLocation(`/character/${displayCharacters[singleIndex].id}`)}
                    onDownload={() => handleDownload(displayCharacters[singleIndex])}
                  />
                  <div className="flex justify-center gap-3 mt-8">
                    <Button variant="outline" className="rounded-full" onClick={() => handleCopy(displayCharacters[singleIndex])}>
                      <MaterialIcon name="content_copy" className="mr-2" /> 복사
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => setDeleteId(displayCharacters[singleIndex].id)}>
                      <MaterialIcon name="delete" className="mr-2 text-destructive" /> 삭제
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-full hidden sm:flex"
                  onClick={() => setSingleIndex(Math.min(displayCharacters.length - 1, singleIndex + 1))}
                  disabled={singleIndex === displayCharacters.length - 1}
                >
                  <MaterialIcon name="chevron_right" className="text-3xl" />
                </Button>
              </div>
              
              <div className="flex gap-2 mt-8 sm:hidden">
                <Button variant="outline" onClick={() => setSingleIndex(Math.max(0, singleIndex - 1))} disabled={singleIndex === 0}>이전</Button>
                <Button variant="outline" onClick={() => setSingleIndex(Math.min(displayCharacters.length - 1, singleIndex + 1))} disabled={singleIndex === displayCharacters.length - 1}>다음</Button>
              </div>
              
              <div className="text-sm text-muted-foreground mt-4 font-medium">
                {singleIndex + 1} / {displayCharacters.length}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog 
        isOpen={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="인물 삭제"
        description="이 인물을 정말 삭제할까요? 지운 그림과 정보는 되돌릴 수 없어요."
        onConfirm={executeDelete}
        confirmText="삭제하기"
        destructive
      />
    </div>
  );
}