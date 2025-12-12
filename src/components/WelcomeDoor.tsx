import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WelcomeDoorProps {
  onComplete?: () => void;
}

const WelcomeDoor = ({ onComplete }: WelcomeDoorProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Start opening animation after a brief delay
    const openTimer = setTimeout(() => {
      setIsOpening(true);
    }, 500);

    // Complete and hide after animation
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      onComplete?.();
    }, 2000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (isComplete) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 pointer-events-none',
        'transition-opacity duration-500',
        isComplete && 'opacity-0'
      )}
      style={{ perspective: '2000px' }}
    >
      {/* Left door */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-1/2',
          'bg-gradient-to-br from-primary via-primary to-primary/90',
          'origin-left transition-transform duration-[1.5s] ease-out',
          'shadow-[inset_-40px_0_100px_rgba(0,0,0,0.4)]'
        )}
        style={{
          transform: isOpening ? 'rotateY(-110deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Door frame detail */}
        <div className="absolute inset-6 border-2 border-primary-foreground/20 rounded-lg" />
        {/* Door handle */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <div className="w-4 h-24 bg-primary-foreground/40 rounded-full shadow-lg" />
        </div>
        {/* Decorative panel */}
        <div className="absolute inset-12 flex flex-col gap-4">
          <div className="flex-1 border border-primary-foreground/10 rounded" />
          <div className="flex-1 border border-primary-foreground/10 rounded" />
        </div>
      </div>

      {/* Right door */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 w-1/2',
          'bg-gradient-to-bl from-primary via-primary to-primary/90',
          'origin-right transition-transform duration-[1.5s] ease-out',
          'shadow-[inset_40px_0_100px_rgba(0,0,0,0.4)]'
        )}
        style={{
          transform: isOpening ? 'rotateY(110deg)' : 'rotateY(0deg)',
          transitionDelay: '100ms',
        }}
      >
        {/* Door frame detail */}
        <div className="absolute inset-6 border-2 border-primary-foreground/20 rounded-lg" />
        {/* Door handle */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2">
          <div className="w-4 h-24 bg-primary-foreground/40 rounded-full shadow-lg" />
        </div>
        {/* Decorative panel */}
        <div className="absolute inset-12 flex flex-col gap-4">
          <div className="flex-1 border border-primary-foreground/10 rounded" />
          <div className="flex-1 border border-primary-foreground/10 rounded" />
        </div>
      </div>

      {/* Welcome text in center */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          'transition-all duration-700',
          isOpening ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        )}
      >
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4 tracking-tight">
            Welcome
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80">
            to your new home
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDoor;
