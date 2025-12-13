import { useMemo } from 'react';
import { Property } from '@/hooks/useProperties';
import { PropertyFiltersState } from '@/components/PropertyFilters';

export const useFilteredProperties = (
  properties: Property[] | undefined,
  filters: PropertyFiltersState
) => {
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter((property) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          property.title.toLowerCase().includes(searchLower) ||
          property.location.toLowerCase().includes(searchLower) ||
          property.city.toLowerCase().includes(searchLower) ||
          property.description.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // City filter
      if (filters.city && property.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      // Price filter
      if (property.price < filters.minPrice || property.price > filters.maxPrice) {
        return false;
      }

      // Bedrooms filter
      if (filters.bedrooms) {
        const bedroomCount = parseInt(filters.bedrooms);
        if (filters.bedrooms === '4') {
          if (property.bedrooms < 4) return false;
        } else if (property.bedrooms !== bedroomCount) {
          return false;
        }
      }

      // Property type filter
      if (filters.propertyType && property.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [properties, filters]);

  const cities = useMemo(() => {
    if (!properties) return [];
    const uniqueCities = [...new Set(properties.map(p => p.city))];
    return uniqueCities.sort();
  }, [properties]);

  return { filteredProperties, cities };
};
