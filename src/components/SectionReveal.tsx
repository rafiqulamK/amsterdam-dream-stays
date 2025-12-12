import { ReactNode } from 'react';
import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import { cn } from '@/lib/utils';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}

const SectionReveal = ({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 700,
}: SectionRevealProps) => {
  const { ref, isVisible } = useScrollTrigger({ threshold: 0.15 });

  const directionStyles = {
    up: { initial: 'translate-y-12', visible: 'translate-y-0' },
    down: { initial: '-translate-y-12', visible: 'translate-y-0' },
    left: { initial: 'translate-x-12', visible: 'translate-x-0' },
    right: { initial: '-translate-x-12', visible: 'translate-x-0' },
  };

  const { initial, visible } = directionStyles[direction];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        isVisible ? `opacity-100 ${visible}` : `opacity-0 ${initial}`,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default SectionReveal;
