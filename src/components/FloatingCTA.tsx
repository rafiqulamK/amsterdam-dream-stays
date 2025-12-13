import { useState, useEffect } from 'react';
import { Home, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { zIndex } from '@/styles/z-index';
import HomepageLeadForm from './HomepageLeadForm';

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the CTA
    const dismissed = sessionStorage.getItem('floatingCTADismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show CTA after scrolling 300px
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('floatingCTADismissed', 'true');
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  if (isDismissed || !isVisible) return null;

  return (
    <>
      <div 
        className={cn(
          'fixed bottom-6 left-6 transition-all duration-500',
          'animate-fade-in'
        )}
        style={{ zIndex: zIndex.floatingCTA }}
      >
        <div className="relative">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center z-10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Main CTA button */}
          <Button
            onClick={handleOpenForm}
            size="lg"
            className={cn(
              'relative overflow-hidden group',
              'bg-primary hover:bg-primary/90 text-primary-foreground',
              'shadow-lg hover:shadow-xl transition-all duration-300',
              'px-6 py-6 rounded-2xl'
            )}
          >
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-2xl animate-ping bg-primary/30" />
            
            <span className="relative flex items-center gap-2">
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Find Your Home</span>
            </span>
          </Button>

          {/* Hint text */}
          <p className="text-xs text-muted-foreground text-center mt-2 max-w-[140px]">
            Get personalized matches
          </p>
        </div>
      </div>

      <HomepageLeadForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        source="floating_cta"
      />
    </>
  );
};

export default FloatingCTA;
