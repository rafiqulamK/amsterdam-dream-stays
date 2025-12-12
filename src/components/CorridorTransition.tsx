import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { useScrollTrigger } from '@/hooks/useScrollTrigger';

interface CorridorTransitionProps {
  children: ReactNode;
  className?: string;
}

const CorridorTransition = ({ children, className }: CorridorTransitionProps) => {
  const { ref, isVisible } = useScrollTrigger({ threshold: 0.1 });

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Corridor perspective wrapper */}
      <div
        className={cn(
          'relative transition-all duration-1000',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          perspective: '1500px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Left wall */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-16 pointer-events-none',
            'bg-gradient-to-r from-primary/5 to-transparent',
            'transition-all duration-700',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          )}
        >
          {/* Wall texture */}
          <div className="absolute inset-0 flex flex-col justify-evenly">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="h-px bg-gradient-to-r from-primary/10 to-transparent"
              />
            ))}
          </div>
        </div>

        {/* Right wall */}
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-16 pointer-events-none',
            'bg-gradient-to-l from-primary/5 to-transparent',
            'transition-all duration-700',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          )}
        >
          {/* Wall texture */}
          <div className="absolute inset-0 flex flex-col justify-evenly">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="h-px bg-gradient-to-l from-primary/10 to-transparent"
              />
            ))}
          </div>
        </div>

        {/* Floor perspective lines */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-4 pointer-events-none overflow-hidden',
            'transition-all duration-700',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(90deg, hsl(var(--primary) / 0.05) 0px, hsl(var(--primary) / 0.05) 2px, transparent 2px, transparent 40px)',
            }}
          />
        </div>

        {/* Content */}
        <div
          className={cn(
            'transition-all duration-700 ease-out',
            isVisible ? 'translate-z-0 opacity-100' : 'opacity-0'
          )}
          style={{
            transform: isVisible ? 'translateZ(0)' : 'translateZ(-100px)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default CorridorTransition;