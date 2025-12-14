import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters, { PropertyFiltersState } from "@/components/PropertyFilters";
import BlogSection from "@/components/BlogSection";
import SectionReveal from "@/components/SectionReveal";
import FloatingCTA from "@/components/FloatingCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import HomepageLeadForm from "@/components/HomepageLeadForm";
import { useProperties } from "@/hooks/useProperties";
import { useFilteredProperties } from "@/hooks/useFilteredProperties";
import { useContactSettings } from "@/hooks/useContactSettings";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { Search, Shield, Zap, MapPin, Phone, Mail, Home, Send } from "lucide-react";
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

  const handleContactClick = (type: string) => {
    trackEvent('Contact', {
      content_type: type,
      content_name: `Contact Section ${type} Click`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content">
        {/* Hero Section */}
        <div data-tour-target="hero">
          <Hero />
        </div>

        {/* Featured Properties Section */}
        <section id="properties" data-tour-target="properties" className="py-12">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-1">Find your new home</h2>
                <p className="text-muted-foreground">Verified rentals available now in the Netherlands</p>
              </div>
            </SectionReveal>

            <SectionReveal delay={100}>
              <PropertyFilters 
                filters={filters}
                onFiltersChange={setFilters}
                cities={cities}
                className="mb-6"
              />
            </SectionReveal>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProperties.map((property, idx) => (
                  <SectionReveal key={property.id} delay={idx * 50} direction="up">
                    <PropertyCard property={property} />
                  </SectionReveal>
                ))}
              </div>
            ) : (
              <SectionReveal>
                <div className="text-center py-10 bg-muted/50 rounded-xl">
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

        {/* Features Section */}
        <section data-tour-target="features" className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-1">What makes {contact.company_name} special?</h2>
                <p className="text-muted-foreground">Discover the features that set us apart</p>
              </div>
            </SectionReveal>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, idx) => (
                <SectionReveal key={idx} delay={100 + idx * 100}>
                  <div className="text-center p-6 rounded-xl bg-background border border-border">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" aria-label={feature.title} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Blog/News Section */}
        <section data-tour-target="blog" className="py-12">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-1">Stay informed</h2>
                <p className="text-muted-foreground">Latest insights and updates from the rental market</p>
              </div>
            </SectionReveal>
          </div>
          <BlogSection />
        </section>

        {/* Contact Section */}
        <section id="contact" data-tour-target="contact" className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-1">We're here to help</h2>
                <p className="text-muted-foreground">Have questions? Our team is ready to assist you in finding your perfect home.</p>
              </div>
            </SectionReveal>

            <SectionReveal delay={100}>
              <div className="max-w-3xl mx-auto">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Contact Info */}
                  <div className="bg-background rounded-xl border border-border p-5 space-y-3">
                    <h3 className="font-semibold text-foreground mb-3">Get in Touch</h3>
                    
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                      <div className="p-1.5 rounded-full bg-primary/10">
                        <MapPin className="w-4 h-4 text-primary" aria-label="Address" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium text-foreground">{contact.address}, {contact.city}</p>
                      </div>
                    </div>

                    <a 
                      href={`mailto:${contact.email}`}
                      onClick={() => handleContactClick('email')}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors block"
                    >
                      <div className="p-1.5 rounded-full bg-primary/10">
                        <Mail className="w-4 h-4 text-primary" aria-label="Email" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{contact.email}</p>
                      </div>
                    </a>

                    <a 
                      href={`tel:${contact.phone}`}
                      onClick={() => handleContactClick('phone')}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors block"
                    >
                      <div className="p-1.5 rounded-full bg-primary/10">
                        <Phone className="w-4 h-4 text-primary" aria-label="Phone" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{contact.phone}</p>
                      </div>
                    </a>
                  </div>

                  {/* Lead Capture Card */}
                  <div className="bg-background rounded-xl border border-border p-5 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Send className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Let Us Find Your Home
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Tell us what you're looking for and we'll send you personalized matches.
                      </p>
                      <Button 
                        size="default" 
                        className="w-full gap-2"
                        onClick={() => setShowContactForm(true)}
                      >
                        <Home className="w-4 h-4" />
                        Start Your Search
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      </main>

      <Footer />

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
