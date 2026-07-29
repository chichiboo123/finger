import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  {
    title: "손가락을 선택해요",
    description: "다섯 개의 손가락 중 하나를 골라 나만의 인물을 상상해 보세요.",
    icon: "pan_tool",
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "인물의 특징을 상상해요",
    description: "이름은 무엇인지, 무엇을 좋아하고 싫어하는지 적어주세요.",
    icon: "edit_document",
    color: "bg-green-100 text-green-600"
  },
  {
    title: "손가락 위에 인물을 그려요",
    description: "상상한 모습을 빈 손가락 위에 마음껏 그려주세요.",
    icon: "draw",
    color: "bg-orange-100 text-orange-600"
  },
  {
    title: "인물 카드로 완성해요",
    description: "다 그린 인물은 멋진 디지털 카드로 만들어져요.",
    icon: "badge",
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "이미지나 PDF로 저장해요",
    description: "완성한 카드를 이미지나 PDF로 친구들과 공유해요.",
    icon: "download",
    color: "bg-pink-100 text-pink-600"
  }
];

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onOpenChange(false);
  };
  
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // Reset step when opened
  if (open && step > 0 && !document.getElementById('help-dialog-content')) {
    // using a timeout to let render cycle finish before reset if needed
    setTimeout(() => setStep(0), 100);
  }

  const current = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="help-dialog-content" className="sm:max-w-md rounded-3xl overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>사용 방법</DialogTitle>
          <DialogDescription>핑거피플 사용 방법을 안내합니다.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-6 px-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner ${current.color}`}>
            <MaterialIcon name={current.icon} className="text-5xl" />
          </div>
          
          <h3 className="text-2xl font-bold mb-3">{current.title}</h3>
          <p className="text-muted-foreground min-h-[3rem]">{current.description}</p>
          
          <div className="flex gap-1.5 mt-8 mb-8">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-border'}`} 
              />
            ))}
          </div>

          <div className="flex w-full gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={prevStep} className="flex-1 rounded-full">
                이전
              </Button>
            )}
            <Button onClick={nextStep} className="flex-1 rounded-full">
              {step === STEPS.length - 1 ? "시작하기" : "다음"}
            </Button>
          </div>
          
          {step < STEPS.length - 1 && (
            <Button 
              variant="ghost" 
              className="mt-3 text-muted-foreground w-full rounded-full"
              onClick={() => onOpenChange(false)}
            >
              건너뛰기
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}