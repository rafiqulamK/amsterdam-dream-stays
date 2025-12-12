import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';

interface PropertySpotlightProps {
  isVisible: boolean;
  onClose?: () => void;
}

const PropertySpotlight = ({ isVisible, onClose }: PropertySpotlightProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { data: properties } = useProperties('Amsterdam');

  // Auto-rotate through properties
  useEffect(() => {
    if (!isVisible || !properties?.length) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % (properties?.length || 1));
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, properties?.length]);

  if (!isVisible || !properties?.length) return null;

  const property = properties[currentIndex];
  const imageUrl = property.images?.[0] || '/placeholder.svg';

  return (
    <div
      className={cn(
        'fixed bottom-24 right-8 z-50 w-80',
        'transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      <div 
        className={cn(
          'relative rounded-2xl overflow-hidden glass border border-primary/20',
          'shadow-2xl',
          'transform transition-all duration-300',
          isAnimating && 'scale-95 opacity-50'
        )}
      >
        {/* Featured badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
          <Star className="w-3 h-3" aria-hidden="true" />
          <span>Featured</span>
        </div>

        {/* Property image */}
        <div 
          className="h-40 bg-muted bg-cover bg-center relative"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Property details */}
        <div className="p-4">
          <h4 className="font-semibold text-foreground line-clamp-1 mb-1">
            {property.title}
          </h4>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{property.location}, {property.city}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" aria-hidden="true" />
              <span>{property.bedrooms} beds</span>
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" aria-hidden="true" />
              <span>{property.bathrooms} baths</span>
            </span>
            <span className="flex items-center gap-1">
              <Maximize className="w-4 h-4" aria-hidden="true" />
              <span>{property.area}m²</span>
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              €{property.price.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </span>
            
            {/* Property counter */}
            <div className="flex items-center gap-1">
              {properties.slice(0, 4).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-300',
                    idx === currentIndex ? 'w-4 bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySpotlight;