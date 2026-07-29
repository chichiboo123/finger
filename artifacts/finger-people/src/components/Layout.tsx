import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { HelpDialog } from './HelpDialog';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenHelp = localStorage.getItem('fingerpeople_help_seen');
    if (!hasSeenHelp) {
      setHelpOpen(true);
    }
  }, []);

  const handleHelpClose = () => {
    setHelpOpen(false);
    localStorage.setItem('fingerpeople_help_seen', 'true');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <AppHeader onHelpClick={() => setHelpOpen(true)} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <AppFooter />
      
      <HelpDialog open={helpOpen} onOpenChange={handleHelpClose} />
    </div>
  );
}