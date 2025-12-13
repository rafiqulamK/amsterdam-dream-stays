import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Compass, Sparkles, Map, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { zIndex } from '@/styles/z-index';
import GuidedTour from './GuidedTour';

const TourLauncher = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const { trigger, sequence } = useHaptics();

  const handleLaunch = useCallback(() => {
    // Sequence of haptics for dramatic effect
    sequence(['light', 'doorOpen', 'roomEnter'], [0, 100, 300]);
    setIsTourOpen(true);
    setShowPulse(false);
  }, [sequence]);

  const handleClose = useCallback(() => {
    setIsTourOpen(false);
    // Show pulse again after closing
    setTimeout(() => setShowPulse(true), 1000);
  }, []);

  return (
    <>
      {/* Floating launcher button - positioned above FloatingCTA on mobile */}
      <div 
        className="fixed bottom-24 right-6 md:bottom-24"
        style={{ zIndex: zIndex.tourLauncher }}
      >
        <Button
          onClick={handleLaunch}
          onMouseEnter={() => {
            setIsHovered(true);
            trigger('selection');
          }}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'group relative rounded-full h-14 px-5 shadow-lg',
            'bg-primary hover:bg-primary/90',
            'transition-all duration-300',
            isHovered && 'pr-36'
          )}
        >
          <div className="relative flex items-center gap-2">
            <Compass className={cn(
              'w-6 h-6 transition-transform duration-500',
              isHovered && 'rotate-[360deg]'
            )} />
            
            {/* Walking footsteps indicator */}
            <div className={cn(
              'flex items-center gap-0.5 transition-all duration-300',
              isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
            )}>
              {[0, 1, 2].map((i) => (
                <Footprints 
                  key={i}
                  className={cn(
                    'w-3 h-3 text-primary-foreground/60',
                    isHovered && 'animate-footstep'
                  )}
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    transform: i % 2 === 0 ? 'scaleX(-1)' : 'scaleX(1)'
                  }}
                />
              ))}
            </div>
            
            <Sparkles 
              className={cn(
                'absolute -top-1 -right-1 w-3 h-3 text-primary-foreground',
                'animate-pulse-soft'
              )} 
            />
          </div>
          
          {/* Expanded text */}
          <span 
            className={cn(
              'absolute left-16 whitespace-nowrap font-medium flex items-center gap-2',
              'transition-all duration-300',
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            )}
          >
            <Map className="w-4 h-4" />
            Explore Rooms
          </span>
        </Button>

        {/* Pulsing ring effect */}
        {showPulse && (
          <>
            <div 
              className={cn(
                'absolute inset-0 rounded-full',
                'bg-primary/20 animate-ping',
                'pointer-events-none'
              )}
              style={{ animationDuration: '2s' }}
            />
            <div 
              className={cn(
                'absolute inset-0 rounded-full',
                'border-2 border-primary/30 animate-ping',
                'pointer-events-none'
              )}
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            />
          </>
        )}
      </div>

      {/* Tour hint tooltip */}
      {showPulse && !isTourOpen && (
        <div 
          className={cn(
            'fixed bottom-40 right-6 md:bottom-40',
            'px-3 py-2 rounded-lg bg-popover border border-border shadow-lg',
            'text-sm text-muted-foreground',
            'animate-bounce-subtle',
            'hidden md:block'
          )}
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <span>Take a guided tour!</span>
          </div>
          {/* Arrow pointing to button */}
          <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-popover" />
        </div>
      )}

      {/* Tour modal */}
      <GuidedTour 
        isOpen={isTourOpen} 
        onClose={handleClose} 
      />
    </>
  );
};

export default TourLauncher;