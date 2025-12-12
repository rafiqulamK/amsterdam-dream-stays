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
    images: [rental1, rental2],
    description: "Beautiful canal house apartment with stunning views of the historic Amsterdam canals. Features modern interior design while maintaining authentic Dutch architectural elements. High ceilings, original wooden floors, and large windows flooding the space with natural light.",
    amenities: ["WiFi", "Heating", "Washing Machine", "Dishwasher", "Canal View", "Bicycle Storage", "Furnished", "Historic Building"],
    availableFrom: "2025-02-01",
    propertyType: "Apartment"
  },
  {
    id: "2",
    title: "Modern Jordaan Studio",
    location: "Jordaan, Amsterdam",
    city: "Amsterdam",
    price: 1650,
    bedrooms: 1,
    bathrooms: 1,
    area: 48,
    image: rental2,
    images: [rental2],
    description: "Bright and stylish studio apartment in the trendy Jordaan neighborhood. Perfect for young professionals seeking the authentic Amsterdam experience. Walking distance to cafes, boutiques, and cultural attractions.",
    amenities: ["WiFi", "Air Conditioning", "Smart Home", "Furnished", "Central Location"],
    availableFrom: "2025-01-15",
    propertyType: "Studio"
  },
  {
    id: "3",
    title: "Spacious De Pijp Family Home",
    location: "De Pijp, Amsterdam",
    city: "Amsterdam",
    price: 3200,
    bedrooms: 4,
    bathrooms: 2,
    area: 165,
    image: rental3,
    images: [rental3, rental4],
    description: "Wonderful family home in the vibrant De Pijp neighborhood. Features a private garden, modern kitchen, and plenty of space for the whole family. Near Albert Cuyp Market and excellent schools.",
    amenities: ["WiFi", "Garden", "Heating", "Pet Friendly", "Washing Machine", "Dishwasher", "Storage", "Family Friendly"],
    availableFrom: "2025-03-01",
    propertyType: "House"
  },
  {
    id: "4",
    title: "Penthouse with Skyline Views",
    location: "Zuidas, Amsterdam",
    city: "Amsterdam",
    price: 4500,
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    image: rental4,
    images: [rental4, rental1],
    description: "Exclusive penthouse offering panoramic views of Amsterdam skyline. Two-level living with designer interior, wrap-around terrace, and premium finishes throughout. Building includes concierge, gym, and underground parking.",
    amenities: ["WiFi", "Air Conditioning", "Terrace", "Gym Access", "Parking", "24/7 Security", "Concierge", "Elevator"],
    availableFrom: "2025-02-15",
    propertyType: "Penthouse"
  }
];
