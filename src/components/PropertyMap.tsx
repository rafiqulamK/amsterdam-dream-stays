import { useState } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Bed, Maximize, MapPin, ExternalLink, X } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  className?: string;
}

// Default coordinates for Netherlands cities
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'amsterdam': { lat: 52.3676, lng: 4.9041 },
  'rotterdam': { lat: 51.9244, lng: 4.4777 },
  'the hague': { lat: 52.0705, lng: 4.3007 },
  'utrecht': { lat: 52.0907, lng: 5.1214 },
  'eindhoven': { lat: 51.4416, lng: 5.4697 },
  'groningen': { lat: 53.2194, lng: 6.5665 },
  'default': { lat: 52.3702, lng: 4.8952 },
};

const PropertyMap = ({ properties, className }: PropertyMapProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Calculate bounding box from properties or use default Netherlands view
  const getBoundingBox = () => {
    if (properties.length === 0) {
      return { minLng: 3.3, minLat: 50.7, maxLng: 7.2, maxLat: 53.6 };
    }

    const coords = properties.map(p => {
      if (p.latitude && p.longitude) {
        return { lat: p.latitude, lng: p.longitude };
      }
      const cityLower = p.city.toLowerCase();
      return cityCoordinates[cityLower] || cityCoordinates['default'];
    });

    const lats = coords.map(c => c.lat);
    const lngs = coords.map(c => c.lng);

    const padding = 0.5;
    return {
      minLng: Math.min(...lngs) - padding,
      minLat: Math.min(...lats) - padding,
      maxLng: Math.max(...lngs) + padding,
      maxLat: Math.max(...lats) + padding,
    };
  };

  const bbox = getBoundingBox();
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng}%2C${bbox.minLat}%2C${bbox.maxLng}%2C${bbox.maxLat}&layer=mapnik`;
  const osmViewUrl = `https://www.openstreetmap.org/?#map=8/${(bbox.minLat + bbox.maxLat) / 2}/${(bbox.minLng + bbox.maxLng) / 2}`;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Map Container */}
      <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden border border-border">
        <iframe
          width="100%"
          height="100%"
          src={osmEmbedUrl}
          style={{ border: 0 }}
          loading="lazy"
          title="Property locations map"
        />
        
        {/* View larger map link */}
        <a
          href={osmViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 bg-background px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 hover:bg-accent transition-colors shadow-md border border-border z-10"
        >
          <ExternalLink className="w-3 h-3" />
          View Larger Map
        </a>
      </div>
      
      {/* Property Cards - Separate section below map */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {properties.slice(0, 5).map((property) => (
          <button
            key={property.id}
            onClick={() => setSelectedProperty(selectedProperty?.id === property.id ? null : property)}
            className={`p-3 rounded-lg text-left transition-all border ${
              selectedProperty?.id === property.id 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card hover:bg-accent border-border'
            }`}
          >
            <div className={`font-semibold text-sm ${selectedProperty?.id === property.id ? '' : 'text-primary'}`}>
              €{property.price.toLocaleString()}
            </div>
            <div className={`text-xs mt-0.5 ${selectedProperty?.id === property.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {property.city}
            </div>
          </button>
        ))}
      </div>
      
      {/* Selected Property Detail */}
      {selectedProperty && (
        <Card className="p-0 overflow-hidden shadow-lg animate-fade-in">
          <Link to={`/property/${selectedProperty.id}`} className="flex flex-col sm:flex-row">
            <div className="relative h-32 sm:h-auto sm:w-40 shrink-0">
              <img
                src={selectedProperty.images?.[0] || selectedProperty.image}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-background/95 px-2 py-0.5 rounded-md">
                <span className="font-bold text-primary text-sm">€{selectedProperty.price.toLocaleString()}</span>
                <span className="text-muted-foreground text-xs">/mo</span>
              </div>
            </div>
            <div className="p-3 flex-1 relative">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedProperty(null);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-muted hover:bg-accent"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-semibold text-foreground text-sm line-clamp-1 pr-6">{selectedProperty.title}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {selectedProperty.location}, {selectedProperty.city}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Maximize className="w-3 h-3" />
                  {selectedProperty.area}m²
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  {selectedProperty.bedrooms} bed
                </span>
              </div>
            </div>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default PropertyMap;
