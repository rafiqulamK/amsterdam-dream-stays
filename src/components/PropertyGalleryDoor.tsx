import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface PropertyGalleryDoorProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  propertyTitle: string;
}

const PropertyGalleryDoor = ({
  images,
  currentIndex,
  onIndexChange,
  propertyTitle,
}: PropertyGalleryDoorProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');
  const { trigger } = useHaptics();

  const navigate = (direction: 'prev' | 'next') => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTransitionDirection(direction === 'next' ? 'right' : 'left');
    trigger('swipe');

    setTimeout(() => {
      if (direction === 'next') {
        onIndexChange((currentIndex + 1) % images.length);
      } else {
        onIndexChange((currentIndex - 1 + images.length) % images.length);
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 400);
  };

  // Touch gesture handling
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      navigate(diff > 0 ? 'next' : 'prev');
    }
    
    setTouchStart(null);
  };

  return (
    <div 
      id="property-gallery"
      className="relative w-full aspect-[21/9] max-h-[500px] bg-muted overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current image */}
      <img
        src={images[currentIndex]}
        alt={`${propertyTitle} - Image ${currentIndex + 1}`}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          isTransitioning && "scale-105 blur-sm"
        )}
      />

      {/* Door transition overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 flex" style={{ perspective: '1500px' }}>
          {/* Left door panel */}
          <div
            className={cn(
              "w-1/2 h-full bg-card/95 backdrop-blur-md",
              transitionDirection === 'right' 
                ? "animate-tour-door-left" 
                : "origin-left"
            )}
            style={{
              transformOrigin: 'left center',
              animation: transitionDirection === 'left' 
                ? 'tour-door-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards'
                : undefined
            }}
          >
            <div className="h-full flex items-center justify-center">
              <ChevronLeft className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </div>

          {/* Right door panel */}
          <div
            className={cn(
              "w-1/2 h-full bg-card/95 backdrop-blur-md",
              transitionDirection === 'right'
                ? "animate-tour-door-right"
                : "origin-right"
            )}
            style={{
              transformOrigin: 'right center',
              animation: transitionDirection === 'left'
                ? 'tour-door-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards'
                : undefined
            }}
          >
            <div className="h-full flex items-center justify-center">
              <ChevronRight className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => navigate('prev')}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 hover:bg-background transition-colors disabled:opacity-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={() => navigate('next')}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 hover:bg-background transition-colors disabled:opacity-50"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        </>
      )}

      {/* Image counter with room-style badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm text-sm text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {currentIndex + 1}
          </span>
          <span className="text-muted-foreground">/</span>
          <span>{images.length}</span>
        </div>
      </div>

      {/* Thumbnail dots */}
      {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx !== currentIndex) {
                  setTransitionDirection(idx > currentIndex ? 'right' : 'left');
                  setIsTransitioning(true);
                  trigger('tap');
                  setTimeout(() => {
                    onIndexChange(idx);
                    setTimeout(() => setIsTransitioning(false), 400);
                  }, 400);
                }
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                idx === currentIndex 
                  ? "w-6 bg-primary" 
                  : "bg-background/60 hover:bg-background"
              )}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGalleryDoor;
