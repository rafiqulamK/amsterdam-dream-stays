import { useState, useEffect } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { Home, MapPin } from 'lucide-react';

interface PropertyDoorEntranceProps {
  propertyTitle: string;
  propertyImage: string;
  propertyLocation: string;
  propertyPrice: number;
  onComplete: () => void;
}

const PropertyDoorEntrance = ({
  propertyTitle,
  propertyImage,
  propertyLocation,
  propertyPrice,
  onComplete,
}: PropertyDoorEntranceProps) => {
  const [phase, setPhase] = useState<'initial' | 'reveal' | 'opening' | 'entering' | 'complete'>('initial');
  const { trigger, sequence } = useHaptics();

  useEffect(() => {
    // Phase timings: total ~5s
    const timings = {
      reveal: 800,      // Show property preview
      opening: 2000,    // Doors swing open
      entering: 3500,   // Walk through
      complete: 5000,   // Animation done
    };

    const timers = [
      setTimeout(() => {
        setPhase('reveal');
        trigger('contentReveal');
      }, timings.reveal),
      setTimeout(() => {
        setPhase('opening');
        sequence(['doorOpen', 'footstep'], [0, 400]);
      }, timings.opening),
      setTimeout(() => {
        setPhase('entering');
        sequence(['footstep', 'footstep', 'roomEnter'], [0, 300, 600]);
      }, timings.entering),
      setTimeout(() => {
        setPhase('complete');
        onComplete();
      }, timings.complete),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete, trigger, sequence]);

  if (phase === 'complete') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Property preview background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          backgroundImage: `url(${propertyImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: phase === 'initial' ? 'blur(20px) brightness(0.3)' : 'blur(0px) brightness(1)',
          transform: phase === 'entering' ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      {/* Overlay gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 transition-opacity duration-1000"
        style={{ opacity: phase === 'entering' ? 0 : 1 }}
      />

      {/* Double doors */}
      <div className="absolute inset-0 flex" style={{ perspective: '2000px' }}>
        {/* Left door */}
        <div
          className="w-1/2 h-full bg-gradient-to-br from-card via-card to-muted border-r border-border/50 relative overflow-hidden"
          style={{
            transformOrigin: 'left center',
            transform: phase === 'opening' || phase === 'entering' 
              ? 'rotateY(-105deg)' 
              : 'rotateY(0deg)',
            transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Door panel details */}
          <div className="absolute inset-4 border border-border/30 rounded-lg" />
          <div className="absolute inset-8 border border-border/20 rounded-lg" />
          
          {/* Door handle */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-16 bg-primary/60 rounded-full" />
          
          {/* Light beam from gap */}
          {phase === 'opening' && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-primary/30 to-transparent animate-pulse"
            />
          )}
        </div>

        {/* Right door */}
        <div
          className="w-1/2 h-full bg-gradient-to-bl from-card via-card to-muted border-l border-border/50 relative overflow-hidden"
          style={{
            transformOrigin: 'right center',
            transform: phase === 'opening' || phase === 'entering' 
              ? 'rotateY(105deg)' 
              : 'rotateY(0deg)',
            transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Door panel details */}
          <div className="absolute inset-4 border border-border/30 rounded-lg" />
          <div className="absolute inset-8 border border-border/20 rounded-lg" />
          
          {/* Door handle */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-16 bg-primary/60 rounded-full" />
        </div>
      </div>

      {/* Property info overlay */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-700"
        style={{
          opacity: phase === 'initial' || phase === 'reveal' ? 1 : 0,
          transform: phase === 'initial' ? 'translateY(20px)' : 'translateY(0)',
        }}
      >
        {/* Property icon */}
        <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-6 border border-primary/30">
          <Home className="w-8 h-8 text-primary" aria-label="Property" />
        </div>

        {/* Property title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-3 px-4 max-w-2xl">
          {propertyTitle}
        </h1>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" aria-label="Location" />
          <span>{propertyLocation}</span>
        </div>

        {/* Price badge */}
        <div className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xl">
          €{propertyPrice.toLocaleString()}/mo
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center gap-2 text-muted-foreground text-sm">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span>Opening doors...</span>
        </div>
      </div>

      {/* Footsteps during entering */}
      {phase === 'entering' && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-8 pb-20">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary/60 animate-footstep"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyDoorEntrance;
