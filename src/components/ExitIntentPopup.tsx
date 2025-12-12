import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Home, X, ArrowRight } from 'lucide-react';
import HomepageLeadForm from './HomepageLeadForm';

const ExitIntentPopup = () => {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves from the top
    if (e.clientY <= 0 && !hasTriggered) {
      // Check if user has seen this popup before
      const hasSeenExitPopup = localStorage.getItem('hasSeenExitPopup');
      if (!hasSeenExitPopup) {
        setShowExitIntent(true);
        setHasTriggered(true);
      }
    }
  }, [hasTriggered]);

  useEffect(() => {
    // Don't add listener on mobile
    if (window.innerWidth < 768) return;

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  const handleDismiss = () => {
    setShowExitIntent(false);
    localStorage.setItem('hasSeenExitPopup', 'true');
  };

  const handleFindHome = () => {
    setShowExitIntent(false);
    setShowLeadForm(true);
  };

  return (
    <>
      <Dialog open={showExitIntent} onOpenChange={setShowExitIntent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Wait! Don't leave yet</DialogTitle>
            <DialogDescription className="text-base">
              Let us help you find your perfect home. Get personalized property matches sent directly to your inbox.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Button 
              onClick={handleFindHome} 
              className="w-full gap-2"
              size="lg"
            >
              Find My Perfect Home
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={handleDismiss} 
              variant="ghost" 
              className="w-full text-muted-foreground"
            >
              No thanks, I'll keep browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <HomepageLeadForm 
        open={showLeadForm} 
        onOpenChange={setShowLeadForm}
        source="exit_intent"
      />
    </>
  );
};

export default ExitIntentPopup;
