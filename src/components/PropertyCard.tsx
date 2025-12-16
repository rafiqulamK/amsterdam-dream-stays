import { Property } from "@/types/property";
import { Card, CardContent } from "@/components/ui/card";
import { Bed, Maximize, MapPin, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { trackEvent } = useFacebookPixel();

  // Get images array - use property.images if available, otherwise fallback to single image
  const images = property.images && property.images.length > 0 
    ? property.images 
    : [property.image];

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !isFavorited;
    setIsFavorited(newState);
    if (newState) {
      trackEvent('AddToWishlist', {
        content_name: property.title,
        content_ids: [property.id],
        content_type: 'property',
        value: property.price,
        currency: 'EUR'
      });
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:shadow-[var(--shadow-hover)] transition-all duration-300">
      <Link to={`/property/${property.id}`}>
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={images[currentImageIndex]}
            alt={`${property.title} - ${property.propertyType} in ${property.city}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Price Badge - Top Left */}
          <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
            <span className="text-lg font-bold text-primary">€{property.price.toLocaleString()}</span>
          </div>

          {/* Favorite Button - Top Right */}
          <button 
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={`w-4 h-4 ${isFavorited ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`}
              aria-hidden="true"
            />
          </button>

          {/* Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" aria-hidden="true" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-foreground" aria-hidden="true" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentImageIndex ? 'bg-background' : 'bg-background/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <Link to={`/property/${property.id}`}>
          <h3 className="text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />
          <span className="truncate">{property.location}, {property.city}</span>
        </div>

        {/* Property Info Bar */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2 border-t border-border">
          <span className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Area:</span>
            {property.area}m²
          </span>
          <span className="text-muted-foreground/50" aria-hidden="true">|</span>
          <span className="capitalize">{property.propertyType}</span>
          <span className="text-muted-foreground/50" aria-hidden="true">|</span>
          <span className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Bedrooms:</span>
            {property.bedrooms} {property.bedrooms === 1 ? 'room' : 'rooms'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
