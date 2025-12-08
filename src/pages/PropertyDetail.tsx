import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { properties as staticProperties } from "@/data/properties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadQuestionnaireDialog from "@/components/LeadQuestionnaireDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  ArrowLeft,
  Check,
  Calendar as CalendarIcon,
  Heart,
  Share2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { Property } from "@/types/property";

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { trackEvent } = useFacebookPixel();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data && !error) {
        setProperty({
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          city: data.city,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          area: data.area,
          propertyType: data.property_type,
          amenities: data.amenities || [],
          image: data.images?.[0] || '/placeholder.svg',
          images: data.images || [],
          availableFrom: data.available_from,
        });
      } else {
        const staticProperty = staticProperties.find((p) => p.id === id);
        setProperty(staticProperty || null);
      }
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (property) {
      trackEvent('ViewContent', {
        content_name: property.title,
        content_ids: [property.id],
        content_type: 'property',
        value: property.price,
        currency: 'EUR'
      });
    }
  }, [property, trackEvent]);

  const images = property?.images && property.images.length > 0 
    ? property.images 
    : property ? [property.image] : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Calculate days ago
  const getDaysAgo = () => {
    const created = new Date();
    created.setDate(created.getDate() - Math.floor(Math.random() * 14) - 1);
    const diff = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Property not found</h1>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Image Carousel */}
        <div className="relative w-full aspect-[21/9] max-h-[500px] bg-muted">
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 text-sm text-foreground">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => {
                const newState = !isFavorited;
                setIsFavorited(newState);
                if (newState) {
                  trackEvent('AddToWishlist', {
                    content_name: property.title,
                    content_ids: [property.id],
                    content_type: 'property',
                    value: property.price,
                    currency: 'EUR'
                  });
                }
              }}
              className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
            </button>
            <button className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to overview
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Location */}
              <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">{property.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{property.location}, {property.city}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2 text-foreground">
                  <Bed className="w-5 h-5 text-muted-foreground" />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Bath className="w-5 h-5 text-muted-foreground" />
                  <span>{property.bathrooms} bathrooms</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Maximize className="w-5 h-5 text-muted-foreground" />
                  <span>{property.area} m²</span>
                </div>
              </div>

              {/* Description */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">Description</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Energy Efficiency */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">Energy Efficiency</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <CalendarIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">Year of construction</div>
                      <div className="font-semibold text-foreground">2020</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-sm text-muted-foreground">Energy Class</div>
                      <div className="font-semibold text-primary">A</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Zap className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">Consumption</div>
                      <div className="font-semibold text-foreground">≤50 kWh/m²a</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Pricing Card (huure.nl style) */}
            <div className="lg:col-span-1">
              <Card className="border-border sticky top-24 overflow-hidden">
                {/* Price Header */}
                <div className="bg-primary p-6 text-center">
                  <div className="text-3xl font-bold text-primary-foreground">
                    €{property.price.toLocaleString()}
                  </div>
                  <div className="text-primary-foreground/80 text-sm">per month</div>
                </div>

                {/* Info Table */}
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="flex justify-between px-6 py-3">
                      <span className="text-muted-foreground">Location</span>
                      <span className="text-foreground font-medium">{property.location}</span>
                    </div>
                    <div className="flex justify-between px-6 py-3">
                      <span className="text-muted-foreground">Rental period</span>
                      <span className="text-foreground font-medium">Indefinite</span>
                    </div>
                    <div className="flex justify-between px-6 py-3">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Verified landlord
                      </span>
                      <span className="text-primary font-medium">Yes</span>
                    </div>
                    <div className="flex justify-between px-6 py-3">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Posted
                      </span>
                      <span className="text-foreground font-medium">{getDaysAgo()} days ago</span>
                    </div>
                    <div className="flex justify-between px-6 py-3">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        Available from
                      </span>
                      <span className="text-foreground font-medium">
                        {new Date(property.availableFrom).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between px-6 py-3">
                      <span className="text-muted-foreground">Utilities</span>
                      <span className="text-foreground font-medium">Contact landlord</span>
                    </div>
                    <div className="flex justify-between px-6 py-3">
                      <span className="text-muted-foreground">Deposit</span>
                      <span className="text-foreground font-medium">Contact landlord</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="p-6">
                    <Button
                      onClick={() => setIsQuestionnaireOpen(true)}
                      className="w-full h-12 text-base font-semibold"
                    >
                      CONTACT LANDLORD
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      Fill out our form and we'll connect you with the landlord.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <LeadQuestionnaireDialog
        open={isQuestionnaireOpen}
        onOpenChange={setIsQuestionnaireOpen}
        property={property}
      />
    </div>
  );
};

export default PropertyDetail;
