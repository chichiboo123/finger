import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ColorPalette } from "./ColorPalette";

interface CharacterData {
  name: string;
  appearance: string;
  likes: string;
  dislikes: string;
  goal: string;
  catchphrase: string;
  color: string;
  colorName: string;
}

interface CharacterFormProps {
  data: CharacterData;
  onChange: (data: Partial<CharacterData>) => void;
}

export function CharacterForm({ data, onChange }: CharacterFormProps) {
  
  const handleChange = (field: keyof CharacterData, value: string) => {
    onChange({ [field]: value });
  };

  const handleColorChange = (hex: string, name: string) => {
    onChange({ color: hex, colorName: name });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto bg-white p-6 md:p-8 rounded-3xl border shadow-sm">
      
      <div className="space-y-2">
        <Label htmlFor="char-name" className="text-base font-bold flex items-center gap-1">
          이름 <span className="text-destructive">*</span>
        </Label>
        <Input 
          id="char-name"
          value={data.name} 
          onChange={(e) => handleChange('name', e.target.value)} 
          maxLength={20}
          placeholder="예: 반짝이"
          className="text-lg py-6 bg-muted/30 border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all"
        />
        <div className="text-right text-xs text-muted-foreground">{data.name.length} / 20</div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-bold">대표 색깔</Label>
        <ColorPalette 
          value={data.color} 
          nameValue={data.colorName} 
          onChange={handleColorChange} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="char-appearance" className="text-base font-bold">외모 특징</Label>
        <Textarea 
          id="char-appearance"
          value={data.appearance} 
          onChange={(e) => handleChange('appearance', e.target.value)} 
          maxLength={100}
          placeholder="예: 동그란 안경을 쓰고 머리가 구름처럼 생겼어요."
          className="resize-none h-24 bg-muted/30"
        />
        <div className="text-right text-xs text-muted-foreground">{data.appearance.length} / 100</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="char-likes" className="text-base font-bold text-green-600 flex items-center gap-1">
            좋아하는 것
          </Label>
          <Textarea 
            id="char-likes"
            value={data.likes} 
            onChange={(e) => handleChange('likes', e.target.value)} 
            maxLength={80}
            placeholder="예: 비 오는 날, 딸기우유"
            className="resize-none h-20 bg-muted/30"
          />
          <div className="text-right text-xs text-muted-foreground">{data.likes.length} / 80</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="char-dislikes" className="text-base font-bold text-destructive flex items-center gap-1">
            싫어하는 것
          </Label>
          <Textarea 
            id="char-dislikes"
            value={data.dislikes} 
            onChange={(e) => handleChange('dislikes', e.target.value)} 
            maxLength={80}
            placeholder="예: 혼자 기다리는 것"
            className="resize-none h-20 bg-muted/30"
          />
          <div className="text-right text-xs text-muted-foreground">{data.dislikes.length} / 80</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="char-goal" className="text-base font-bold text-accent-foreground flex items-center gap-1">
          삶의 목표
        </Label>
        <Textarea 
          id="char-goal"
          value={data.goal} 
          onChange={(e) => handleChange('goal', e.target.value)} 
          maxLength={100}
          placeholder="예: 세상에서 가장 재미있는 놀이터 만들기"
          className="resize-none h-20 bg-muted/30"
        />
        <div className="text-right text-xs text-muted-foreground">{data.goal.length} / 100</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="char-catchphrase" className="text-base font-bold text-primary flex items-center gap-1">
          많이 하는 말
        </Label>
        <Input 
          id="char-catchphrase"
          value={data.catchphrase} 
          onChange={(e) => handleChange('catchphrase', e.target.value)} 
          maxLength={60}
          placeholder="예: 한번 해보자!"
          className="bg-muted/30"
        />
        <div className="text-right text-xs text-muted-foreground">{data.catchphrase.length} / 60</div>
      </div>
      
    </div>
  );
}