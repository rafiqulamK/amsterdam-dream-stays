import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { properties as staticProperties } from "@/data/properties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImmersiveLeadForm from "@/components/ImmersiveLeadForm";
import VideoPlayer from "@/components/VideoPlayer";
import SectionReveal from "@/components/SectionReveal";
import PropertyDoorEntrance from "@/components/PropertyDoorEntrance";
import PropertyTour from "@/components/PropertyTour";
import PropertyTourLauncher from "@/components/PropertyTourLauncher";
import PropertyGalleryDoor from "@/components/PropertyGalleryDoor";
import PropertySection from "@/components/PropertySection";
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
  Zap,
  Play,
  Info,
  FileText,
  Sparkles,
  MessageSquare,
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideos, setShowVideos] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { trackEvent } = useFacebookPixel();
  const { trigger } = useHaptics();

  // Check if entrance animation should play (once per property session)
  useEffect(() => {
    if (id) {
      const sessionKey = `property_visited_${id}`;
      const hasVisited = sessionStorage.getItem(sessionKey);
      if (hasVisited) {
        setShowWelcome(false);
      }
    }
  }, [id]);

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

  const handleEntranceComplete = () => {
    setShowWelcome(false);
    if (id) {
      sessionStorage.setItem(`property_visited_${id}`, 'true');
    }
    trigger('propertyEnter');
  };

  const images = property?.images && property.images.length > 0 
    ? property.images 
    : property ? [property.image] : [];

  const videos = property?.videos || [];

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
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading" />
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
      {/* Property entrance animation */}
      {showWelcome && (
        <PropertyDoorEntrance
          propertyTitle={property.title}
          propertyImage={images[0]}
          propertyLocation={`${property.location}, ${property.city}`}
          propertyPrice={property.price}
          onComplete={handleEntranceComplete}
        />
      )}

      <Header />
      
      <main className="flex-1">
        {/* Image Gallery with Door Transitions */}
        <PropertyGalleryDoor
          images={images}
          currentIndex={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
          propertyTitle={property.title}
        />

        {/* Action Buttons Overlay */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="flex justify-end gap-2">
            {videos.length > 0 && (
              <button 
                onClick={() => setShowVideos(!showVideos)}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 px-4 shadow-lg"
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
              className="p-3 rounded-full bg-card shadow-lg hover:bg-accent transition-colors"
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
            </button>
            <button 
              className="p-3 rounded-full bg-card shadow-lg hover:bg-accent transition-colors"
              aria-label="Share property"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Video Gallery */}
        {showVideos && videos.length > 0 && (
          <div className="container mx-auto px-4 py-6">
            <SectionReveal>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Property Tour Videos</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" aria-label="Back" />
            Back to overview
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Location */}
              <PropertySection
                id="property-details"
                title="Details"
                roomNumber={1}
                icon={Info}
                showSign={false}
              >
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2 text-foreground">{property.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" aria-label="Location" />
                    <span>{property.location}, {property.city}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 py-4 border-y border-border">
                  <div className="flex items-center gap-2 text-foreground">
                    <Bed className="w-5 h-5 text-muted-foreground" aria-label="Bedrooms" />
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Bath className="w-5 h-5 text-muted-foreground" aria-label="Bathrooms" />
                    <span>{property.bathrooms} bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Maximize className="w-5 h-5 text-muted-foreground" aria-label="Area" />
                    <span>{property.area} m²</span>
                  </div>
                </div>
              </PropertySection>

              {/* Description */}
              <PropertySection
                id="property-description"
                title="Description"
                roomNumber={2}
                icon={FileText}
              >
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">About This Property</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </CardContent>
                </Card>
              </PropertySection>

              {/* Amenities */}
              <PropertySection
                id="property-amenities"
                title="Amenities"
                roomNumber={3}
                icon={Sparkles}
              >
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Features & Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0" aria-label="Included" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </PropertySection>

              {/* Energy Efficiency */}
              <PropertySection
                id="property-energy"
                title="Energy"
                roomNumber={4}
                icon={Zap}
              >
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Energy Efficiency</h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <CalendarIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" aria-label="Year built" />
                        <div className="text-sm text-muted-foreground">Year of construction</div>
                        <div className="font-semibold text-foreground">2020</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Zap className="w-6 h-6 mx-auto mb-2 text-primary" aria-label="Energy class" />
                        <div className="text-sm text-muted-foreground">Energy Class</div>
                        <div className="font-semibold text-primary">A</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Zap className="w-6 h-6 mx-auto mb-2 text-muted-foreground" aria-label="Consumption" />
                        <div className="text-sm text-muted-foreground">Consumption</div>
                        <div className="font-semibold text-foreground">≤50 kWh/m²a</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </PropertySection>
            </div>

            {/* Sidebar - Pricing Card */}
            <div className="lg:col-span-1">
              <PropertySection
                id="property-contact"
                title="Contact"
                roomNumber={5}
                icon={MessageSquare}
                showSign={false}
              >
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
                          <Shield className="w-4 h-4" aria-label="Verified" />
                          Verified landlord
                        </span>
                        <span className="text-primary font-medium">Yes</span>
                      </div>
                      <div className="flex justify-between px-6 py-3">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" aria-label="Posted date" />
                          Posted
                        </span>
                        <span className="text-foreground font-medium">{getDaysAgo()} days ago</span>
                      </div>
                      <div className="flex justify-between px-6 py-3">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" aria-label="Available from" />
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
                        onClick={() => {
                          setIsQuestionnaireOpen(true);
                          trigger('tap');
                        }}
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
              </PropertySection>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Property Tour Launcher */}
      <PropertyTourLauncher onStartTour={() => {
        setIsTourOpen(true);
        trigger('tourStart');
      }} />

      {/* Property Tour */}
      <PropertyTour 
        isOpen={isTourOpen} 
        onClose={() => {
          setIsTourOpen(false);
          trigger('tourComplete');
        }}
        onComplete={() => setIsQuestionnaireOpen(true)}
      />

      <ImmersiveLeadForm
        open={isQuestionnaireOpen}
        onOpenChange={setIsQuestionnaireOpen}
        property={property}
      />
    </div>
  );
};

export default PropertyDetail;
