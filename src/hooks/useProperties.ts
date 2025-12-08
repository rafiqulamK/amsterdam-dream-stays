import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      // Fetch approved properties from Supabase
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "approved");

      // Filter by city if specified (Amsterdam only for homepage)
      if (cityFilter) {
        query = query.ilike("city", cityFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching properties:", error);
        // Fallback to static properties filtered by city
        return cityFilter 
          ? staticProperties.filter(p => p.city.toLowerCase() === cityFilter.toLowerCase())
          : staticProperties;
      }

      // Transform Supabase data to match Property interface
      const supabaseProperties: Property[] = (data || []).map((p) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        city: p.city,
        price: Number(p.price),
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: Number(p.area),
        image: p.images?.[0] || "/placeholder.svg",
        images: p.images || [],
        description: p.description,
        amenities: p.amenities || [],
        availableFrom: p.available_from,
        propertyType: p.property_type,
        status: p.status,
      }));

      // If no Supabase data, use filtered static properties
      if (supabaseProperties.length === 0) {
        return cityFilter 
          ? staticProperties.filter(p => p.city.toLowerCase() === cityFilter.toLowerCase())
          : staticProperties;
      }

      return supabaseProperties;
    },
  });
};
