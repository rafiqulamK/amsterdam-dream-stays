import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters, { PropertyFiltersState } from "@/components/PropertyFilters";
import BlogSection from "@/components/BlogSection";
import WelcomeDoor from "@/components/WelcomeDoor";
import SectionReveal from "@/components/SectionReveal";
import GreetingText from "@/components/GreetingText";
import TourLauncher from "@/components/TourLauncher";
import RoomWalkthrough from "@/components/RoomWalkthrough";
import RoomSign from "@/components/RoomSign";
import FloatingCTA from "@/components/FloatingCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import HomepageLeadForm from "@/components/HomepageLeadForm";
import { useProperties } from "@/hooks/useProperties";
import { useFilteredProperties } from "@/hooks/useFilteredProperties";
import { useContactSettings } from "@/hooks/useContactSettings";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { Search, Shield, Zap, MapPin, Phone, Mail, Home, BookOpen, Headphones, Sparkles, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "All rental properties in one search",
    description: "Fine-tune your search criteria and find more active listings than anywhere else.",
  },
  {
    icon: Zap,
    title: "A smoother, faster way to find home",
    description: "Our platform is designed to help you find your perfect rental quickly and easily.",
  },
  {
    icon: Shield,
    title: "Verified properties only",
    description: "Every listing is verified to ensure you're seeing real, available properties.",
  },
];

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [filters, setFilters] = useState<PropertyFiltersState>({
    search: '',
    city: '',
    minPrice: 0,
    maxPrice: 5000,
    bedrooms: '',
    propertyType: '',
  });
  
  const { data: properties, isLoading } = useProperties();
  const { filteredProperties, cities } = useFilteredProperties(properties, filters);
  const { settings: contact } = useContactSettings();
  const { trackEvent } = useFacebookPixel();

  // Check if user has seen the welcome animation in this session
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  const handleContactClick = (type: string) => {
    trackEvent('Contact', {
      content_type: type,
      content_name: `Contact Section ${type} Click`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Door Animation */}
      {showWelcome && <WelcomeDoor onComplete={handleWelcomeComplete} />}

      <Header />
      
      <main id="main-content">
        {/* Hero Section - "Lobby" */}
        <div data-tour-target="hero">
          <Hero />
        </div>

      {/* Featured Properties Section - "Living Room" */}
      <RoomWalkthrough
        roomName="The Living Room"
        roomNumber={1}
        icon={<Home className="w-5 h-5" />}
      >
        <section id="properties" data-tour-target="properties" className="py-20">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <RoomSign 
                roomNumber={1} 
                title="The Living Room" 
                icon={Home}
                className="mb-4"
              />
            </SectionReveal>

            <SectionReveal delay={100}>
              <GreetingText
                title="Step into your new home"
                subtitle="Verified rentals available now in the Netherlands"
                align="left"
                className="mb-6"
              />
            </SectionReveal>

            <SectionReveal delay={150}>
              <PropertyFilters 
                filters={filters}
                onFiltersChange={setFilters}
                cities={cities}
                className="mb-8"
              />
            </SectionReveal>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl shimmer" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProperties.map((property, idx) => (
                  <SectionReveal key={property.id} delay={idx * 100} direction="up">
                    <PropertyCard property={property} />
                  </SectionReveal>
                ))}
              </div>
            ) : (
              <SectionReveal>
                <div className="text-center py-12 glass rounded-2xl">
                  <p className="text-muted-foreground">
                    {filters.search || filters.city || filters.bedrooms || filters.propertyType
                      ? "No properties match your filters. Try adjusting your search criteria."
                      : "No properties available at the moment. Check back soon!"}
                  </p>
                  {(filters.search || filters.city || filters.bedrooms || filters.propertyType) && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setFilters({
                        search: '',
                        city: '',
                        minPrice: 0,
                        maxPrice: 5000,
                        bedrooms: '',
                        propertyType: '',
                      })}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </SectionReveal>
            )}
          </div>
        </section>
      </RoomWalkthrough>

      {/* Features Section - "Amenities Room" */}
      <RoomWalkthrough
        roomName="The Amenities"
        roomNumber={2}
        icon={<Sparkles className="w-5 h-5" />}
      >
        <section data-tour-target="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="flex justify-center mb-4">
                <RoomSign 
                  roomNumber={2} 
                  title="The Amenities" 
                  icon={Sparkles}
                />
              </div>
            </SectionReveal>

            <SectionReveal delay={100}>
              <GreetingText
                title={`What makes ${contact.company_name} special?`}
                subtitle="Discover the features that set us apart"
                className="mb-12"
              />
            </SectionReveal>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, idx) => (
                <SectionReveal key={idx} delay={200 + idx * 150}>
                  <div className="text-center p-8 rounded-2xl glass hover-lift">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-primary" aria-label={feature.title} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>
      </RoomWalkthrough>

      {/* Blog/News Section - "Reading Room" */}
      <RoomWalkthrough
        roomName="The Reading Room"
        roomNumber={3}
        icon={<BookOpen className="w-5 h-5" />}
      >
        <section data-tour-target="blog" className="py-20">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="flex justify-center mb-4">
                <RoomSign 
                  roomNumber={3} 
                  title="The Reading Room" 
                  icon={BookOpen}
                />
              </div>
            </SectionReveal>

            <SectionReveal delay={100}>
              <GreetingText
                title="Stay informed"
                subtitle="Latest insights and updates from the rental market"
                className="mb-12"
              />
            </SectionReveal>
          </div>
          <BlogSection />
        </section>
      </RoomWalkthrough>

      {/* Contact Section - "Reception" */}
      <RoomWalkthrough
        roomName="The Reception"
        roomNumber={4}
        icon={<Headphones className="w-5 h-5" />}
      >
        <section id="contact" data-tour-target="contact" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="flex justify-center mb-4">
                <RoomSign 
                  roomNumber={4} 
                  title="The Reception" 
                  icon={Headphones}
                />
              </div>
            </SectionReveal>

            <SectionReveal delay={100}>
              <GreetingText
                title="We're here to help"
                subtitle="Have questions? Our team is ready to assist you in finding your perfect home."
                className="mb-12"
              />
            </SectionReveal>

            <SectionReveal delay={200}>
              <div className="max-w-3xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Info */}
                  <div className="glass rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-foreground mb-4">Get in Touch</h3>
                    
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-background/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <MapPin className="w-5 h-5 text-primary" aria-label="Address" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium text-foreground">{contact.address}, {contact.city}</p>
                      </div>
                    </div>

                    <a 
                      href={`mailto:${contact.email}`}
                      onClick={() => handleContactClick('email')}
                      className="flex items-center gap-4 p-3 rounded-xl bg-background/50 hover:bg-background/70 transition-colors block"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Mail className="w-5 h-5 text-primary" aria-label="Email" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{contact.email}</p>
                      </div>
                    </a>

                    <a 
                      href={`tel:${contact.phone}`}
                      onClick={() => handleContactClick('phone')}
                      className="flex items-center gap-4 p-3 rounded-xl bg-background/50 hover:bg-background/70 transition-colors block"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Phone className="w-5 h-5 text-primary" aria-label="Phone" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{contact.phone}</p>
                      </div>
                    </a>
                  </div>

                  {/* Lead Capture Card */}
                  <div className="glass rounded-2xl p-6 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Send className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Let Us Find Your Home
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Tell us what you're looking for and we'll send you personalized matches.
                      </p>
                      <Button 
                        size="lg" 
                        className="w-full gap-2"
                        onClick={() => setShowContactForm(true)}
                      >
                        <Home className="w-5 h-5" />
                        Start Your Search
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      </RoomWalkthrough>
      </main>

      <Footer />
      
      {/* Guided Tour Launcher */}
      <TourLauncher />

      {/* Floating CTA */}
      <FloatingCTA />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />

      {/* Homepage Lead Form */}
      <HomepageLeadForm 
        open={showContactForm} 
        onOpenChange={setShowContactForm}
        source="contact_section"
      />
    </div>
  );
};

export default Index;