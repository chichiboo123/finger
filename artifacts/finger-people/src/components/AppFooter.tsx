export function AppFooter() {
  return (
    <footer className="w-full py-4 border-t bg-muted/30">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <a 
          href="https://litt.ly/chichiboo" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <span>Created by. 교육뮤지컬 꿈꾸는 치수쌤</span>
        </a>
      </div>
    </footer>
  );
}