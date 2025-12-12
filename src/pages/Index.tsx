import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import BlogSection from "@/components/BlogSection";
import WelcomeDoor from "@/components/WelcomeDoor";
import SectionReveal from "@/components/SectionReveal";
import GreetingText from "@/components/GreetingText";
import TourLauncher from "@/components/TourLauncher";
import CorridorTransition from "@/components/CorridorTransition";
import RoomSign from "@/components/RoomSign";
import { useProperties } from "@/hooks/useProperties";
import { useContactSettings } from "@/hooks/useContactSettings";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { Search, Shield, Zap, MapPin, Phone, Mail, Home, BookOpen, Headphones, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data: properties, isLoading } = useProperties("Amsterdam");
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
      
      {/* Hero Section - "Lobby" */}
      <div data-tour-target="hero">
        <Hero />
      </div>

      {/* Featured Properties Section - "Living Room" */}
      <CorridorTransition>
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
                subtitle="Verified rentals available now in Amsterdam"
                align="left"
                className="mb-10"
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
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties?.map((property, idx) => (
                  <SectionReveal key={property.id} delay={idx * 100} direction="up">
                    <PropertyCard property={property} />
                  </SectionReveal>
                ))}
              </div>
            )}

            {!isLoading && (!properties || properties.length === 0) && (
              <SectionReveal>
                <div className="text-center py-12 glass rounded-2xl">
                  <p className="text-muted-foreground">No properties available at the moment. Check back soon!</p>
                </div>
              </SectionReveal>
            )}
          </div>
        </section>
      </CorridorTransition>

      {/* Features Section - "Amenities Room" */}
      <CorridorTransition>
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
      </CorridorTransition>

      {/* Blog/News Section - "Reading Room" */}
      <CorridorTransition>
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
      </CorridorTransition>

      {/* Contact Section - "Reception" */}
      <CorridorTransition>
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
              <div className="max-w-2xl mx-auto">
                <div className="glass rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 hover-lift cursor-pointer">
                    <div className="p-3 rounded-full bg-primary/10">
                      <MapPin className="w-6 h-6 text-primary" aria-label="Address" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground">{contact.address}, {contact.city}, {contact.country}</p>
                    </div>
                  </div>

                  <a 
                    href={`mailto:${contact.email}`}
                    onClick={() => handleContactClick('email')}
                    className="flex items-center gap-4 p-4 rounded-xl bg-background/50 hover-lift block"
                  >
                    <div className="p-3 rounded-full bg-primary/10">
                      <Mail className="w-6 h-6 text-primary" aria-label="Email" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{contact.email}</p>
                    </div>
                  </a>

                  <a 
                    href={`tel:${contact.phone}`}
                    onClick={() => handleContactClick('phone')}
                    className="flex items-center gap-4 p-4 rounded-xl bg-background/50 hover-lift block"
                  >
                    <div className="p-3 rounded-full bg-primary/10">
                      <Phone className="w-6 h-6 text-primary" aria-label="Phone" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{contact.phone}</p>
                    </div>
                  </a>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      </CorridorTransition>

      <Footer />
      
      {/* Guided Tour Launcher */}
      <TourLauncher />
    </div>
  );
};

export default Index;