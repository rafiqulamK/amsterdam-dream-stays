import { ReactNode } from 'react';
import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import { cn } from '@/lib/utils';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
}

const SectionReveal = ({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 600,
}: SectionRevealProps) => {
  const { ref, isVisible } = useScrollTrigger({ threshold: 0.1 });

  const directionStyles = {
    up: { initial: 'translate-y-8 opacity-0', visible: 'translate-y-0 opacity-100' },
    down: { initial: '-translate-y-8 opacity-0', visible: 'translate-y-0 opacity-100' },
    left: { initial: 'translate-x-8 opacity-0', visible: 'translate-x-0 opacity-100' },
    right: { initial: '-translate-x-8 opacity-0', visible: 'translate-x-0 opacity-100' },
    scale: { initial: 'scale-95 opacity-0', visible: 'scale-100 opacity-100' },
    fade: { initial: 'opacity-0', visible: 'opacity-100' },
  };

  const { initial, visible } = directionStyles[direction];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out will-change-transform',
        isVisible ? visible : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};

export default SectionReveal;
