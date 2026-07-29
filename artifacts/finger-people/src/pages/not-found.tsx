import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border p-8">
        <h1 className="text-4xl font-display font-extrabold text-foreground mb-4">404</h1>
        <p className="text-muted-foreground mb-8">
          페이지를 찾을 수 없어요.<br />
          주소가 올바른지 확인해 주세요.
        </p>
        <Link href="/">
          <Button className="w-full rounded-full h-12 text-base">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}