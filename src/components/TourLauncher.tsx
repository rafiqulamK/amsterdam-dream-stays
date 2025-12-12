import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import GuidedTour from './GuidedTour';

const TourLauncher = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { trigger } = useHaptics();

  const handleLaunch = () => {
    trigger('doorOpen');
    setIsTourOpen(true);
  };

  return (
    <>
      {/* Floating launcher button */}
      <div className="fixed bottom-24 right-6 z-30">
        <Button
          onClick={handleLaunch}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'group relative rounded-full h-14 px-5 shadow-lg',
            'bg-primary hover:bg-primary/90',
            'transition-all duration-300',
            isHovered && 'pr-32'
          )}
        >
          <div className="relative">
            <Compass className={cn(
              'w-6 h-6 transition-transform duration-500',
              isHovered && 'rotate-[360deg]'
            )} />
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
              'absolute left-14 whitespace-nowrap font-medium',
              'transition-all duration-300',
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            )}
          >
            Take a Tour
          </span>
        </Button>

        {/* Pulsing ring effect */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-primary/20 animate-ping',
            'pointer-events-none'
          )}
          style={{ animationDuration: '2s' }}
        />
      </div>

      {/* Tour modal */}
      <GuidedTour 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
      />
    </>
  );
};

export default TourLauncher;
