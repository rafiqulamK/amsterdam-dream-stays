import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Bed, Maximize, MapPin, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

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
  'default': [4.8952, 52.3702],
};

const PropertyMap = ({ properties, className }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const getPropertyCoordinates = (property: Property): [number, number] => {
    const cityLower = property.city.toLowerCase();
    const coords = cityCoordinates[cityLower] || cityCoordinates['default'];
    const offset = () => (Math.random() - 0.5) * 0.02;
    return [coords[0] + offset(), coords[1] + offset()];
  };

  // Load Mapbox token from settings
  useEffect(() => {
    const loadMapboxToken = async () => {
      try {
        const response = await apiClient.getSettings('mapbox_token') as { setting_value?: string };
        if (response?.setting_value) {
          setMapboxToken(response.setting_value);
        }
      } catch (err) {
        console.log('No mapbox token configured');
      } finally {
        setIsLoading(false);
      }
    };
    loadMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
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
    } catch (err) {
      setError('Failed to load map. Please check the Mapbox configuration.');
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [mapboxToken, properties]);

  if (isLoading) {
    return (
      <div className={`bg-muted/50 rounded-xl p-8 text-center animate-pulse ${className}`}>
        <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full" />
        <div className="h-4 w-32 mx-auto bg-muted rounded" />
      </div>
    );
  }

  if (!mapboxToken || error) {
    return (
      <div className={`bg-muted/50 rounded-xl p-6 text-center ${className}`}>
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-base font-semibold mb-2 text-foreground">Map View Not Available</h3>
        <p className="text-sm text-muted-foreground">
          {error || 'Map view requires a Mapbox token. Please configure it in admin settings.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden" />
      
      {selectedProperty && (
        <Card className="absolute bottom-3 left-3 right-3 md:left-auto md:right-3 md:w-72 p-0 overflow-hidden shadow-lg animate-fade-in z-10">
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
