import { ReactNode, useEffect, useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { HelpDialog } from './HelpDialog';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  // Show the walkthrough once per browser, after the first paint so the app
  // never renders as a blank screen while localStorage is read.
  useEffect(() => {
    if (!localStorage.getItem('fingerpeople_help_seen')) {
      setHelpOpen(true);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setHelpOpen(open);
    if (!open) localStorage.setItem('fingerpeople_help_seen', 'true');
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        본문 바로가기
      </a>

      <AppHeader onHelpClick={() => setHelpOpen(true)} />

      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>

      <AppFooter />

      <HelpDialog open={helpOpen} onOpenChange={handleOpenChange} />
    </div>
  );
}
