import { ReactNode, useEffect, useState } from 'react';
import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import { cn } from '@/lib/utils';

interface RoomWalkthroughProps {
  children: ReactNode;
  roomName: string;
  roomNumber?: number;
  icon?: ReactNode;
  className?: string;
}

const RoomWalkthrough = ({
  children,
  roomName,
  roomNumber = 1,
  icon,
  className,
}: RoomWalkthroughProps) => {
  const { ref, isVisible, progress } = useScrollTrigger({ threshold: 0.15, triggerOnce: false });
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (isVisible && !hasEntered) {
      setHasEntered(true);
    }
  }, [isVisible, hasEntered]);

  // Calculate parallax and 3D effects based on scroll progress
  const perspectiveProgress = Math.min(progress * 1.5, 1);
  const corridorDepth = (1 - perspectiveProgress) * 100;

  return (
    <div
      ref={ref}
      className={cn(
        'relative min-h-screen overflow-hidden',
        className
      )}
      style={{ perspective: '2000px' }}
    >
      {/* Corridor walls effect */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none transition-all duration-700',
          hasEntered ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          background: `
            linear-gradient(90deg, 
              hsl(var(--primary) / 0.3) 0%, 
              transparent 15%, 
              transparent 85%, 
              hsl(var(--primary) / 0.3) 100%
            )
          `,
        }}
      />

      {/* Floor perspective lines */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 h-32 pointer-events-none transition-all duration-1000',
          hasEntered ? 'opacity-0 translate-y-20' : 'opacity-40'
        )}
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 48px,
              hsl(var(--border)) 48px,
              hsl(var(--border)) 50px
            )
          `,
          transform: `perspective(500px) rotateX(60deg) translateZ(${corridorDepth}px)`,
          transformOrigin: 'bottom center',
        }}
      />

      {/* Room entrance frame */}
      <div
        className={cn(
          'absolute inset-0 z-10 pointer-events-none transition-all duration-1000',
          hasEntered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
        )}
      >
        {/* Top arch */}
        <div
          className="absolute top-0 inset-x-0 h-20"
          style={{
            background: `linear-gradient(180deg, hsl(var(--primary)) 0%, transparent 100%)`,
            clipPath: 'ellipse(60% 100% at 50% 0%)',
          }}
        />

        {/* Side pillars */}
        <div
          className="absolute left-0 inset-y-0 w-16"
          style={{
            background: `linear-gradient(90deg, hsl(var(--primary) / 0.8) 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute right-0 inset-y-0 w-16"
          style={{
            background: `linear-gradient(-90deg, hsl(var(--primary) / 0.8) 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* Room number indicator */}
      <div
        className={cn(
          'absolute top-8 left-1/2 -translate-x-1/2 z-30',
          'flex items-center gap-3 px-6 py-3 rounded-full',
          'bg-background/80 backdrop-blur-xl border border-border/50',
          'transition-all duration-700',
          hasEntered 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-10'
        )}
        style={{ transitionDelay: '500ms' }}
      >
        {icon && (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Room {roomNumber}
          </span>
          <span className="text-sm font-bold text-foreground">{roomName}</span>
        </div>
      </div>

      {/* Content with walking entrance effect */}
      <div
        className={cn(
          'relative z-20 transition-all duration-1000 ease-out',
          hasEntered 
            ? 'opacity-100 translate-z-0 scale-100' 
            : 'opacity-0 scale-90'
        )}
        style={{
          transform: hasEntered 
            ? 'translateZ(0) scale(1)' 
            : `translateZ(-200px) scale(0.9)`,
          transitionDelay: '300ms',
        }}
      >
        {children}
      </div>

      {/* Light beam effect when entering */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none transition-opacity duration-1000',
          hasEntered ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          background: `
            radial-gradient(
              ellipse 80% 50% at 50% 0%,
              hsl(var(--primary) / 0.2) 0%,
              transparent 70%
            )
          `,
        }}
      />
    </div>
  );
};

export default RoomWalkthrough;
