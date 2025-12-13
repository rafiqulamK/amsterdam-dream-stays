import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { properties as staticProperties } from "@/data/properties";

export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images?: string[];
  description: string;
  amenities: string[];
  availableFrom: string;
  propertyType: string;
  status?: string;
}

export const useProperties = (cityFilter?: string) => {
  return useQuery({
    queryKey: ["properties", cityFilter],
    queryFn: async () => {
      try {
        const response = await apiClient.getProperties({ status: 'approved' });
        const data = response;

        // Transform API data to match Property interface
        const apiProperties: Property[] = data.properties.map((p: any) => ({
          id: p.id.toString(),
          title: p.title,
          location: p.location,
          city: p.city,
          price: Number(p.price),
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: Number(p.area),
          image: p.images?.[0] || "/placeholder.svg",
          images: Array.isArray(p.images) ? p.images : [],
          description: p.description,
          amenities: Array.isArray(p.amenities) ? p.amenities : [],
          availableFrom: p.available_from,
          propertyType: p.property_type,
          status: p.status,
        }));

        return apiProperties;
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Fallback to static properties filtered by city
        return cityFilter
          ? staticProperties.filter(p => p.city.toLowerCase() === cityFilter.toLowerCase())
          : staticProperties;
      }
    },
  });
};
