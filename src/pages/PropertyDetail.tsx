import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { properties as staticProperties } from "@/data/properties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImmersiveLeadForm from "@/components/ImmersiveLeadForm";
import VideoPlayer from "@/components/VideoPlayer";
import SectionReveal from "@/components/SectionReveal";
import PropertyGallery from "@/components/PropertyGallery";
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
  Clock,
  Shield,
  Play,
} from "lucide-react";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { useHaptics } from "@/hooks/useHaptics";
import { Property } from "@/types/property";

interface PropertyWithVideos extends Property {
  videos?: string[];
}

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyWithVideos | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const { trackEvent } = useFacebookPixel();
  const { trigger } = useHaptics();

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
          videos: (data as any).videos || [],
          availableFrom: data.available_from,
        });
      } else {
        const staticProperty = staticProperties.find((p) => p.id === id);
        setProperty(staticProperty ? { ...staticProperty, videos: [] } : null);
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

  const videos = property?.videos || [];

  const getDaysAgo = () => {
    const created = new Date();
    created.setDate(created.getDate() - Math.floor(Math.random() * 14) - 1);
    const diff = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main id="main-content" className="flex-1 container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Loading property" />
            <p className="text-muted-foreground text-sm">Loading property details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Property not found</h1>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" aria-label="Back" />
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
        {/* Image Gallery */}
        <PropertyGallery images={images} propertyTitle={property.title} />

        {/* Action Buttons */}
        <div className="container mx-auto px-4 -mt-14 relative z-10">
          <div className="flex justify-end gap-2">
            {videos.length > 0 && (
              <button 
                onClick={() => setShowVideos(!showVideos)}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 px-4 shadow-md"
              >
                <Play className="w-4 h-4" aria-label="Play tour" />
                <span className="text-sm font-medium">Video Tour</span>
              </button>
            )}
            <button 
              onClick={() => {
                const newState = !isFavorited;
                setIsFavorited(newState);
                trigger('tap');
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
              className="p-2.5 rounded-full bg-card shadow-md hover:bg-accent transition-colors"
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
            </button>
            <button 
              className="p-2.5 rounded-full bg-card shadow-md hover:bg-accent transition-colors"
              aria-label="Share property"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Video Gallery */}
        {showVideos && videos.length > 0 && (
          <div className="container mx-auto px-4 py-5">
            <SectionReveal>
              <h3 className="text-lg font-semibold mb-3 text-foreground">Property Tour Videos</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {videos.map((video, idx) => (
                  <VideoPlayer
                    key={idx}
                    src={video}
                    className="aspect-video"
                    autoPlay={false}
                    muted={true}
                  />
                ))}
              </div>
            </SectionReveal>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-primary hover:underline mb-4 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" aria-label="Back" />
            Back to overview
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Title & Location */}
              <SectionReveal>
                <div className="mb-4">
                  <h1 className="text-2xl font-bold mb-1 text-foreground">{property.title}</h1>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" aria-label="Location" />
                    <span>{property.location}, {property.city}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-5 py-3 border-y border-border text-sm">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Bed className="w-4 h-4 text-muted-foreground" aria-label="Bedrooms" />
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Bath className="w-4 h-4 text-muted-foreground" aria-label="Bathrooms" />
                    <span>{property.bathrooms} bathrooms</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Maximize className="w-4 h-4 text-muted-foreground" aria-label="Area" />
                    <span>{property.area} m²</span>
                  </div>
                </div>
              </SectionReveal>

              {/* Description */}
              <SectionReveal delay={50}>
                <Card className="border-border">
                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-3 text-foreground">About This Property</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </CardContent>
                </Card>
              </SectionReveal>

              {/* Amenities */}
              <SectionReveal delay={100}>
                <Card className="border-border">
                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Features & Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {property.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-foreground text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0" aria-label="Included" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </SectionReveal>
            </div>

            {/* Sidebar - Pricing Card */}
            <div className="lg:col-span-1">
              <SectionReveal delay={150}>
                <Card className="border-border sticky top-24 overflow-hidden">
                  {/* Price Header */}
                  <div className="bg-primary p-5 text-center">
                    <div className="text-2xl font-bold text-primary-foreground">
                      €{property.price.toLocaleString()}
                    </div>
                    <div className="text-primary-foreground/80 text-sm">per month</div>
                  </div>

                  {/* Info Table */}
                  <CardContent className="p-0">
                    <div className="divide-y divide-border text-sm">
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-muted-foreground">Location</span>
                        <span className="text-foreground font-medium">{property.location}</span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-muted-foreground">Rental period</span>
                        <span className="text-foreground font-medium">Indefinite</span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" aria-label="Verified" />
                          Verified landlord
                        </span>
                        <span className="text-primary font-medium">Yes</span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" aria-label="Posted date" />
                          Posted
                        </span>
                        <span className="text-foreground font-medium">{getDaysAgo()} days ago</span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" aria-label="Available from" />
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
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-muted-foreground">Utilities</span>
                        <span className="text-foreground font-medium">Contact landlord</span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-muted-foreground">Deposit</span>
                        <span className="text-foreground font-medium">Contact landlord</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="p-4 border-t border-border">
                      <Button 
                        className="w-full" 
                        size="default"
                        onClick={() => {
                          setIsQuestionnaireOpen(true);
                          trackEvent('InitiateCheckout', {
                            content_name: property.title,
                            content_ids: [property.id],
                            content_type: 'property',
                            value: property.price,
                            currency: 'EUR'
                          });
                        }}
                      >
                        Contact Landlord
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SectionReveal>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lead Form Dialog */}
      <ImmersiveLeadForm 
        open={isQuestionnaireOpen}
        onOpenChange={setIsQuestionnaireOpen}
        property={property}
      />
    </div>
  );
};

export default PropertyDetail;
