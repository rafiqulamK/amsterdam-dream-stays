import { ReactNode } from 'react';
import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import { cn } from '@/lib/utils';

interface DoorRevealProps {
  children: ReactNode;
  greeting?: string;
  subGreeting?: string;
  variant?: 'single' | 'double' | 'slide';
  className?: string;
  delay?: number;
}

const DoorReveal = ({
  children,
  greeting,
  subGreeting,
  variant = 'double',
  className,
  delay = 0,
}: DoorRevealProps) => {
  const { ref, isVisible } = useScrollTrigger({ threshold: 0.2 });

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {/* Content behind the doors */}
      <div
        className={cn(
          'transition-all duration-1200 ease-out',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        style={{ transitionDelay: `${delay + 900}ms` }}
      >
        {children}
      </div>

      {/* Door overlay */}
      <div
        className={cn(
          'absolute inset-0 z-20 pointer-events-none',
          isVisible && 'animate-doors-open'
        )}
        style={{ perspective: '1500px', transitionDelay: `${delay}ms` }}
      >
        {variant === 'double' && (
          <>
            {/* Left door */}
            <div
              className={cn(
                'absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-primary to-primary/80',
                'origin-left transition-transform duration-[1800ms] ease-out',
                'shadow-[inset_-20px_0_60px_rgba(0,0,0,0.3)]',
                isVisible && 'door-open-left'
              )}
              style={{
                transform: isVisible ? 'rotateY(-105deg)' : 'rotateY(0deg)',
                transitionDelay: `${delay}ms`,
              }}
            >
              {/* Door handle */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-16 bg-primary-foreground/30 rounded-full" />
              {/* Door texture lines */}
              <div className="absolute inset-4 border border-primary-foreground/10 rounded" />
              {/* Light spill effect */}
              <div 
                className={cn(
                  'absolute inset-0 transition-opacity duration-700',
                  isVisible ? 'opacity-100' : 'opacity-0'
                )}
                style={{
                  background: 'linear-gradient(to right, transparent, hsl(var(--background) / 0.3))',
                }}
              />
            </div>

            {/* Right door */}
            <div
              className={cn(
                'absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-primary to-primary/80',
                'origin-right transition-transform duration-[1800ms] ease-out',
                'shadow-[inset_20px_0_60px_rgba(0,0,0,0.3)]'
              )}
              style={{
                transform: isVisible ? 'rotateY(105deg)' : 'rotateY(0deg)',
                transitionDelay: `${delay + 200}ms`,
              }}
            >
              {/* Door handle */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-16 bg-primary-foreground/30 rounded-full" />
              {/* Door texture lines */}
              <div className="absolute inset-4 border border-primary-foreground/10 rounded" />
              {/* Light spill effect */}
              <div 
                className={cn(
                  'absolute inset-0 transition-opacity duration-700',
                  isVisible ? 'opacity-100' : 'opacity-0'
                )}
                style={{
                  background: 'linear-gradient(to left, transparent, hsl(var(--background) / 0.3))',
                }}
              />
            </div>
          </>
        )}

        {variant === 'single' && (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-primary to-primary/90',
              'origin-left transition-transform duration-[1800ms] ease-out',
              'shadow-[inset_-30px_0_80px_rgba(0,0,0,0.4)]'
            )}
            style={{
              transform: isVisible ? 'rotateY(-100deg)' : 'rotateY(0deg)',
              transitionDelay: `${delay}ms`,
            }}
          >
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-20 bg-primary-foreground/30 rounded-full" />
          </div>
        )}

        {variant === 'slide' && (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-b from-primary/95 to-primary',
              'transition-transform duration-[1800ms] ease-out'
            )}
            style={{
              transform: isVisible ? 'translateX(-100%)' : 'translateX(0)',
              transitionDelay: `${delay}ms`,
            }}
          >
            {/* Japanese-style sliding door pattern */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-px p-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="border border-primary-foreground/20 bg-primary-foreground/5"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Greeting text */}
      {greeting && (
        <div
          className={cn(
            'absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none',
            'transition-all duration-1000 ease-out'
          )}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: `${delay + 1200}ms`,
          }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-primary drop-shadow-lg mb-2">
            {greeting}
          </h2>
          {subGreeting && (
            <p className="text-lg md:text-xl text-muted-foreground">
              {subGreeting}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DoorReveal;