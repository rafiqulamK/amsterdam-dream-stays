import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import RoomSign from '@/components/RoomSign';

interface PropertySectionProps {
  id: string;
  title: string;
  roomNumber: number;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  showSign?: boolean;
}

const PropertySection = ({
  id,
  title,
  roomNumber,
  icon,
  children,
  className,
  showSign = true,
}: PropertySectionProps) => {
  const { ref, isVisible } = useScrollTrigger({ threshold: 0.1 });

  return (
    <section
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      className={cn(
        "relative transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {/* Room entrance effect */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-all duration-1000",
          isVisible ? "opacity-0" : "opacity-100"
        )}
      >
        {/* Entrance frame */}
        <div className="absolute inset-0 border-2 border-primary/10 rounded-xl" />
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
      </div>

      {/* Room sign */}
      {showSign && (
        <div 
          className={cn(
            "mb-4 transition-all duration-500 delay-200",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}
        >
          <RoomSign 
            roomNumber={roomNumber} 
            title={title} 
            icon={icon}
          />
        </div>
      )}

      {/* Content */}
      <div 
        className={cn(
          "transition-all duration-700 delay-300",
          isVisible ? "opacity-100 scale-100" : "opacity-95 scale-[0.98]"
        )}
      >
        {children}
      </div>
    </section>
  );
};

export default PropertySection;
