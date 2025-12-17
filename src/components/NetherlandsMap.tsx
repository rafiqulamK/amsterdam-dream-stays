import { useState, useMemo } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetherlandsMapProps {
  properties: Property[];
  onCitySelect?: (city: string) => void;
  className?: string;
}

// Netherlands cities with coordinates (relative to SVG viewBox)
const NETHERLANDS_CITIES = [
  { name: 'Amsterdam', x: 52, y: 28, region: 'Noord-Holland' },
  { name: 'Rotterdam', x: 45, y: 48, region: 'Zuid-Holland' },
  { name: 'The Hague', x: 38, y: 42, region: 'Zuid-Holland' },
  { name: 'Utrecht', x: 55, y: 38, region: 'Utrecht' },
  { name: 'Eindhoven', x: 55, y: 62, region: 'Noord-Brabant' },
  { name: 'Groningen', x: 72, y: 8, region: 'Groningen' },
  { name: 'Tilburg', x: 48, y: 60, region: 'Noord-Brabant' },
  { name: 'Almere', x: 58, y: 28, region: 'Flevoland' },
  { name: 'Breda', x: 42, y: 62, region: 'Noord-Brabant' },
  { name: 'Nijmegen', x: 68, y: 52, region: 'Gelderland' },
  { name: 'Arnhem', x: 70, y: 46, region: 'Gelderland' },
  { name: 'Haarlem', x: 46, y: 28, region: 'Noord-Holland' },
  { name: 'Enschede', x: 85, y: 38, region: 'Overijssel' },
  { name: 'Maastricht', x: 68, y: 82, region: 'Limburg' },
  { name: 'Dordrecht', x: 44, y: 52, region: 'Zuid-Holland' },
  { name: 'Leiden', x: 42, y: 36, region: 'Zuid-Holland' },
  { name: 'Zwolle', x: 72, y: 28, region: 'Overijssel' },
  { name: 'Amersfoort', x: 60, y: 34, region: 'Utrecht' },
];

const NetherlandsMap = ({ properties, onCitySelect, className }: NetherlandsMapProps) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Count properties per city
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach(p => {
      const cityLower = p.city.toLowerCase();
      const matchedCity = NETHERLANDS_CITIES.find(c => c.name.toLowerCase() === cityLower);
      if (matchedCity) {
        counts[matchedCity.name] = (counts[matchedCity.name] || 0) + 1;
      }
    });
    return counts;
  }, [properties]);

  // Get properties for selected city
  const cityProperties = useMemo(() => {
    if (!selectedCity) return [];
    return properties.filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
  }, [properties, selectedCity]);

  const handleCityClick = (cityName: string) => {
    setSelectedCity(selectedCity === cityName ? null : cityName);
    onCitySelect?.(cityName);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Explore Properties by City</h3>
          
          <div className="relative w-full aspect-[4/5] max-h-[500px]">
            {/* Netherlands SVG outline */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            >
              {/* Simplified Netherlands outline */}
              <path
                d="M25,20 L35,15 L50,10 L70,5 L85,15 L90,25 L88,40 L85,50 L75,55 L80,70 L70,85 L55,80 L45,85 L35,75 L30,60 L25,50 L20,40 L22,30 Z"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                className="transition-colors duration-300"
              />
              
              {/* City markers */}
              {NETHERLANDS_CITIES.map((city) => {
                const count = cityCounts[city.name] || 0;
                const isSelected = selectedCity === city.name;
                const isHovered = hoveredCity === city.name;
                const hasProperties = count > 0;

                return (
                  <g key={city.name}>
                    {/* Pulse animation for cities with properties */}
                    {hasProperties && (
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={isSelected ? 5 : 3}
                        className="fill-primary/30 animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                    )}
                    
                    {/* Main pin */}
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={isSelected ? 4 : isHovered ? 3.5 : hasProperties ? 3 : 2}
                      className={cn(
                        'cursor-pointer transition-all duration-200',
                        hasProperties 
                          ? 'fill-destructive stroke-destructive-foreground' 
                          : 'fill-muted-foreground/50 stroke-background',
                        isSelected && 'fill-primary stroke-primary-foreground',
                        isHovered && !isSelected && 'scale-125'
                      )}
                      strokeWidth="0.5"
                      onMouseEnter={() => setHoveredCity(city.name)}
                      onMouseLeave={() => setHoveredCity(null)}
                      onClick={() => handleCityClick(city.name)}
                    />

                    {/* Property count badge */}
                    {hasProperties && (
                      <text
                        x={city.x}
                        y={city.y + 0.8}
                        textAnchor="middle"
                        className="fill-destructive-foreground text-[3px] font-bold pointer-events-none"
                      >
                        {count}
                      </text>
                    )}

                    {/* City label on hover */}
                    {(isHovered || isSelected) && (
                      <g className="animate-fade-in">
                        <rect
                          x={city.x - 12}
                          y={city.y - 10}
                          width="24"
                          height="6"
                          rx="1"
                          className="fill-background/95"
                        />
                        <text
                          x={city.x}
                          y={city.y - 5.5}
                          textAnchor="middle"
                          className="fill-foreground text-[3px] font-medium"
                        >
                          {city.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Available properties</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                <span className="text-muted-foreground">Coming soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property List Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full p-4 bg-card/50 backdrop-blur-sm">
            {selectedCity ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{selectedCity}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cityProperties.length} {cityProperties.length === 1 ? 'property' : 'properties'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCity(null)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {cityProperties.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {cityProperties.map((property) => (
                      <Link
                        key={property.id}
                        to={`/property/${property.id}`}
                        className="block group"
                      >
                        <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex">
                            <div className="w-24 h-20 shrink-0">
                              <img
                                src={property.images?.[0] || property.image}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2 flex-1 min-w-0">
                              <p className="font-semibold text-primary text-sm">
                                €{property.price.toLocaleString()}/mo
                              </p>
                              <p className="text-xs text-foreground truncate mt-0.5">
                                {property.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-0.5">
                                  <Bed className="w-3 h-3" />
                                  {property.bedrooms}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Bath className="w-3 h-3" />
                                  {property.bathrooms}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Maximize className="w-3 h-3" />
                                  {property.area}m²
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center pr-2">
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No properties available in {selectedCity} yet.</p>
                    <p className="text-xs mt-1">Check back soon!</p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <MapPin className="w-12 h-12 text-primary mb-3" />
                <h4 className="font-semibold text-foreground mb-1">Select a City</h4>
                <p className="text-sm text-muted-foreground">
                  Click on a red pin to view available properties in that city.
                </p>
                
                {/* Quick city buttons */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {Object.entries(cityCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 4)
                    .map(([city, count]) => (
                      <Button
                        key={city}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCityClick(city)}
                        className="text-xs"
                      >
                        {city} ({count})
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetherlandsMap;
