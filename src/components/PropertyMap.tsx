import { useState } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Bed, Maximize, MapPin, ExternalLink } from 'lucide-react';

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
      // Default Netherlands bounding box
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

    const padding = 0.5; // Add padding around markers
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
    <div className={`relative ${className}`}>
      <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-border">
        <iframe
          width="100%"
          height="100%"
          src={osmEmbedUrl}
          style={{ border: 0 }}
          loading="lazy"
          title="Property locations map"
        />
      </div>
      
      {/* Property list overlay */}
      <div className="absolute top-3 left-3 max-h-[350px] overflow-y-auto">
        <div className="flex flex-col gap-2">
          {properties.slice(0, 5).map((property) => (
            <button
              key={property.id}
              onClick={() => setSelectedProperty(selectedProperty?.id === property.id ? null : property)}
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold shadow-lg hover:scale-105 transition-transform text-left"
            >
              €{property.price.toLocaleString()} - {property.city}
            </button>
          ))}
        </div>
      </div>

      {/* View larger map link */}
      <a
        href={osmViewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 bg-background/95 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 hover:bg-background transition-colors shadow-md"
      >
        <ExternalLink className="w-3 h-3" />
        View Larger Map
      </a>
      
      {selectedProperty && (
        <Card className="absolute bottom-3 left-3 right-3 md:left-auto md:right-16 md:w-72 p-0 overflow-hidden shadow-lg animate-fade-in z-10">
          <Link to={`/property/${selectedProperty.id}`} className="block">
            <div className="relative h-28">
              <img
                src={selectedProperty.images?.[0] || selectedProperty.image}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedProperty(null);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/90 hover:bg-background text-sm"
              >
                ×
              </button>
              <div className="absolute bottom-2 left-2 bg-background/95 px-2 py-0.5 rounded-md">
                <span className="font-bold text-primary text-sm">€{selectedProperty.price.toLocaleString()}</span>
                <span className="text-muted-foreground text-xs">/mo</span>
              </div>
            </div>
            <div className="p-2.5">
              <h4 className="font-semibold text-foreground text-sm line-clamp-1">{selectedProperty.title}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {selectedProperty.location}, {selectedProperty.city}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
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
