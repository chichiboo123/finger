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

  const safeIndex = Math.min(singleIndex, Math.max(0, displayCharacters.length - 1));
  const current = displayCharacters[safeIndex];

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
                <div key={char.id} className="w-full max-w-[320px]">
                  <CharacterCard
                    id={`card-${char.id}`}
                    character={char}
                    hideActions
                  />
                  {/* Always-visible controls: hover-only buttons are unreachable
                      on the tablets this app is used on. */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      className="h-10 flex-1 rounded-full"
                      onClick={() => setLocation(`/character/${char.id}`)}
                    >
                      <MaterialIcon name="edit" className="mr-1 text-[18px]" /> 수정
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      aria-label={`${char.name} 카드 이미지로 저장`}
                      onClick={() => handleDownload(char)}
                    >
                      <MaterialIcon name="download" className="text-[18px]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      aria-label={`${char.name} 카드 복사`}
                      onClick={() => handleCopy(char)}
                    >
                      <MaterialIcon name="content_copy" className="text-[18px]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`${char.name} 삭제`}
                      onClick={() => setDeleteId(char.id)}
                    >
                      <MaterialIcon name="delete" className="text-[18px]" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
              <div className="flex items-center justify-center gap-4 w-full">
                {/* index is clamped: deleting the last card must not blank the view */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-full hidden sm:flex"
                  onClick={() => setSingleIndex(Math.max(0, safeIndex - 1))}
                  disabled={safeIndex === 0}
                >
                  <MaterialIcon name="chevron_left" className="text-3xl" />
                </Button>
                
                <div className="mx-4 w-full max-w-[400px]">
                  <CharacterCard
                    id={`card-${current.id}`}
                    character={current}
                    hideActions
                    className="mx-auto w-full max-w-[400px] transform transition-transform sm:scale-105"
                  />
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button variant="outline" className="rounded-full" onClick={() => setLocation(`/character/${current.id}`)}>
                      <MaterialIcon name="edit" className="mr-2" /> 수정
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => handleDownload(current)}>
                      <MaterialIcon name="download" className="mr-2" /> 저장
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => handleCopy(current)}>
                      <MaterialIcon name="content_copy" className="mr-2" /> 복사
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => setDeleteId(current.id)}>
                      <MaterialIcon name="delete" className="mr-2 text-destructive" /> 삭제
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-full hidden sm:flex"
                  onClick={() => setSingleIndex(Math.min(displayCharacters.length - 1, safeIndex + 1))}
                  disabled={safeIndex === displayCharacters.length - 1}
                >
                  <MaterialIcon name="chevron_right" className="text-3xl" />
                </Button>
              </div>
              
              <div className="flex gap-2 mt-8 sm:hidden">
                <Button variant="outline" onClick={() => setSingleIndex(Math.max(0, safeIndex - 1))} disabled={safeIndex === 0}>이전</Button>
                <Button variant="outline" onClick={() => setSingleIndex(Math.min(displayCharacters.length - 1, safeIndex + 1))} disabled={safeIndex === displayCharacters.length - 1}>다음</Button>
              </div>
              
              <div className="text-sm text-muted-foreground mt-4 font-medium">
                {safeIndex + 1} / {displayCharacters.length}
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