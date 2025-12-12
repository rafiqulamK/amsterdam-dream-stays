import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import { cn } from '@/lib/utils';

interface GreetingTextProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const GreetingText = ({
  title,
  subtitle,
  className,
  align = 'center',
}: GreetingTextProps) => {
  const { ref, isVisible } = useScrollTrigger({ threshold: 0.3 });

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col',
        alignmentClasses[align],
        className
      )}
    >
      <h2
        className={cn(
          'text-3xl md:text-4xl lg:text-5xl font-bold text-foreground',
          'transition-all duration-700 ease-out',
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl',
            'transition-all duration-700 ease-out delay-200',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default GreetingText;
