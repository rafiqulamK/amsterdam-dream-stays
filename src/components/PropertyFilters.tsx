import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, MapPin, Bed, Euro, Home, List, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PropertyFiltersState {
  search: string;
  city: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  propertyType: string;
}

export type ViewMode = 'list' | 'map';

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  onFiltersChange: (filters: PropertyFiltersState) => void;
  cities: string[];
  className?: string;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

const defaultFilters: PropertyFiltersState = {
  search: '',
  city: '',
  minPrice: 0,
  maxPrice: 5000,
  bedrooms: '',
  propertyType: '',
};

const PropertyFilters = ({ filters, onFiltersChange, cities, className, viewMode = 'list', onViewModeChange }: PropertyFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const activeFilterCount = [
    filters.city,
    filters.bedrooms,
    filters.propertyType,
    filters.minPrice > 0 ? 'price' : '',
    filters.maxPrice < 5000 ? 'price' : '',
  ].filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    onFiltersChange(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const handleQuickFilter = (key: keyof PropertyFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: filters[key] === value ? '' : value };
    onFiltersChange(newFilters);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Bar with View Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex border border-border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none h-10 px-3"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">List</span>
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none h-10 px-3"
              onClick={() => onViewModeChange('map')}
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">Map</span>
            </Button>
          </div>
        )}
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 relative h-10">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Properties</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect property
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* City Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </Label>
                <Select
                  value={localFilters.city}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Price Range (€/month)
                </Label>
                <div className="px-2">
                  <Slider
                    value={[localFilters.minPrice, localFilters.maxPrice]}
                    onValueChange={([min, max]) => 
                      setLocalFilters({ ...localFilters, minPrice: min, maxPrice: max })
                    }
                    max={5000}
                    step={100}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>€{localFilters.minPrice}</span>
                  <span>€{localFilters.maxPrice}+</span>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Bedrooms
                </Label>
                <Select
                  value={localFilters.bedrooms}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, bedrooms: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Property Type
                </Label>
                <Select
                  value={localFilters.propertyType}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, propertyType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'].map((city) => (
          <Badge
            key={city}
            variant={filters.city === city ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleQuickFilter('city', city)}
          >
            <MapPin className="h-3 w-3 mr-1" />
            {city}
          </Badge>
        ))}
        
        {['1', '2', '3'].map((beds) => (
          <Badge
            key={beds}
            variant={filters.bedrooms === beds ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleQuickFilter('bedrooms', beds)}
          >
            <Bed className="h-3 w-3 mr-1" />
            {beds} bed{beds !== '1' && 's'}
          </Badge>
        ))}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.city && (
            <Badge variant="secondary" className="gap-1">
              {filters.city}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleQuickFilter('city', '')}
              />
            </Badge>
          )}
          {filters.bedrooms && (
            <Badge variant="secondary" className="gap-1">
              {filters.bedrooms} bed{filters.bedrooms !== '1' && 's'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleQuickFilter('bedrooms', '')}
              />
            </Badge>
          )}
          {filters.propertyType && (
            <Badge variant="secondary" className="gap-1">
              {filters.propertyType}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleQuickFilter('propertyType', '')}
              />
            </Badge>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < 5000) && (
            <Badge variant="secondary" className="gap-1">
              €{filters.minPrice} - €{filters.maxPrice}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, minPrice: 0, maxPrice: 5000 })}
              />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs"
            onClick={handleClearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;
