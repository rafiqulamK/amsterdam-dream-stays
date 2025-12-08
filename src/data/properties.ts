import { Property } from "@/types/property";
import rental1 from "@/assets/rental-1.jpg";
import rental2 from "@/assets/rental-2.jpg";
import rental3 from "@/assets/rental-3.jpg";
import rental4 from "@/assets/rental-4.jpg";

export const properties: Property[] = [
  {
    id: "1",
    title: "Luxury Canal House Apartment",
    location: "Prinsengracht, Amsterdam",
    city: "Amsterdam",
    price: 2800,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: rental1,
    description: "Beautiful canal house apartment with stunning views of the historic Amsterdam canals. Features modern interior design while maintaining authentic Dutch architectural elements.",
    amenities: ["WiFi", "Heating", "Washing Machine", "Dishwasher", "Canal View", "Bicycle Storage"],
    availableFrom: "2025-02-01",
    propertyType: "Apartment"
  },
  {
    id: "2",
    title: "Modern Rotterdam Penthouse",
    location: "City Center, Rotterdam",
    city: "Rotterdam",
    price: 3200,
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    image: rental2,
    description: "Stunning penthouse with panoramic city views. Floor-to-ceiling windows, modern minimalist design, and premium amenities throughout.",
    amenities: ["WiFi", "Air Conditioning", "Balcony", "Gym Access", "Parking", "24/7 Security"],
    availableFrom: "2025-03-01",
    propertyType: "Penthouse"
  },
  {
    id: "3",
    title: "Cozy Utrecht Townhouse",
    location: "Historic Center, Utrecht",
    city: "Utrecht",
    price: 2200,
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    image: rental3,
    description: "Charming townhouse with exposed wooden beams and traditional Dutch interior. Located in the heart of Utrecht's historic district.",
    amenities: ["WiFi", "Heating", "Garden", "Fireplace", "Fully Furnished", "Pet Friendly"],
    availableFrom: "2025-01-15",
    propertyType: "House"
  },
  {
    id: "4",
    title: "Beachside Apartment The Hague",
    location: "Scheveningen, The Hague",
    city: "The Hague",
    price: 2600,
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    image: rental4,
    description: "Luxurious beachside apartment with ocean views and private terrace. Perfect for enjoying the Dutch coast while being close to the city center.",
    amenities: ["WiFi", "Beach Access", "Terrace", "Parking", "Storage", "Sea View"],
    availableFrom: "2025-02-15",
    propertyType: "Apartment"
  }
];
