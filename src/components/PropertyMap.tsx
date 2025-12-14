import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Bed, Maximize, MapPin } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  className?: string;
}

// Default coordinates for Netherlands cities
const cityCoordinates: Record<string, [number, number]> = {
  'amsterdam': [4.9041, 52.3676],
  'rotterdam': [4.4777, 51.9244],
  'the hague': [4.3007, 52.0705],
  'utrecht': [5.1214, 52.0907],
  'eindhoven': [5.4697, 51.4416],
  'groningen': [6.5665, 53.2194],
  'default': [4.8952, 52.3702], // Center of Netherlands
};

const PropertyMap = ({ properties, className }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const getPropertyCoordinates = (property: Property): [number, number] => {
    const cityLower = property.city.toLowerCase();
    const coords = cityCoordinates[cityLower] || cityCoordinates['default'];
    // Add small random offset to prevent overlapping markers
    const offset = () => (Math.random() - 0.5) * 0.02;
    return [coords[0] + offset(), coords[1] + offset()];
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: cityCoordinates['default'],
      zoom: 7,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    // Add markers for each property
    properties.forEach((property) => {
      const coords = getPropertyCoordinates(property);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.innerHTML = `
        <div class="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:scale-105 transition-transform">
          €${property.price.toLocaleString()}
        </div>
      `;
      
      el.addEventListener('click', () => {
        setSelectedProperty(property);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [mapboxToken, properties]);

  if (showTokenInput && !mapboxToken) {
    return (
      <div className={`bg-muted/50 rounded-xl p-6 text-center ${className}`}>
        <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2 text-foreground">Enable Map View</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your Mapbox public token to view properties on the map.
          Get one free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
        </p>
        <input
          type="text"
          placeholder="pk.eyJ1Ijo..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-3"
          onChange={(e) => {
            if (e.target.value.startsWith('pk.')) {
              setMapboxToken(e.target.value);
              setShowTokenInput(false);
            }
          }}
        />
        <p className="text-xs text-muted-foreground">Token will be saved for this session</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden" />
      
      {/* Property popup */}
      {selectedProperty && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-0 overflow-hidden shadow-lg animate-fade-in z-10">
          <Link to={`/property/${selectedProperty.id}`} className="block">
            <div className="relative h-32">
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
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-background"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
              <div className="absolute bottom-2 left-2 bg-background/95 px-2 py-1 rounded-md">
                <span className="font-bold text-primary">€{selectedProperty.price.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-foreground line-clamp-1">{selectedProperty.title}</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {selectedProperty.location}, {selectedProperty.city}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
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
