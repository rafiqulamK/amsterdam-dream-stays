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
  latitude?: number;
  longitude?: number;
}
