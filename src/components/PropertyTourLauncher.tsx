import { useState, useEffect } from 'react';
import { Compass, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyTourLauncherProps {
  onStartTour: () => void;
}

const PropertyTourLauncher = ({ onStartTour }: PropertyTourLauncherProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Auto-hide hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Tooltip hint */}
      {showHint && (
        <div 
          className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg animate-fade-in"
          style={{ animationDelay: '1s' }}
        >
          <p className="text-xs text-muted-foreground">
            Take a guided tour of this property
          </p>
          <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-card border-r border-b border-border" />
        </div>
      )}

      {/* Launch button */}
      <Button
        onClick={onStartTour}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        size="lg"
        className={cn(
          "rounded-full h-14 shadow-lg transition-all duration-300",
          "bg-primary hover:bg-primary/90",
          isHovered ? "pl-5 pr-6" : "w-14 p-0"
        )}
      >
        {/* Icon with walking animation */}
        <div className="relative">
          <Compass 
            className={cn(
              "w-6 h-6 transition-all duration-300",
              isHovered && "opacity-0 scale-75"
            )} 
          />
          <Footprints 
            className={cn(
              "w-6 h-6 absolute inset-0 transition-all duration-300",
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
          />
        </div>

        {/* Expanded text */}
        <span 
          className={cn(
            "overflow-hidden transition-all duration-300 whitespace-nowrap font-medium",
            isHovered ? "w-24 ml-2 opacity-100" : "w-0 opacity-0"
          )}
        >
          Tour Property
        </span>
      </Button>

      {/* Footstep trail animation when hovered */}
      {isHovered && (
        <div className="absolute -bottom-2 right-1/2 flex gap-1.5 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-footstep"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyTourLauncher;
