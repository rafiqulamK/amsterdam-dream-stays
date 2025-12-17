import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters, { PropertyFiltersState, ViewMode } from "@/components/PropertyFilters";
import PropertyMap from "@/components/PropertyMap";
import BlogSection from "@/components/BlogSection";
import SectionReveal from "@/components/SectionReveal";
import FloatingCTA from "@/components/FloatingCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import HomepageLeadForm from "@/components/HomepageLeadForm";
import { useProperties } from "@/hooks/useProperties";
import { useFilteredProperties } from "@/hooks/useFilteredProperties";
import { useContactSettings } from "@/hooks/useContactSettings";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { Search, Shield, Zap, MapPin, Phone, Mail, Home, Send, ArrowRight } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      <main id="main-content">
        {/* Hero Section */}
        <div data-tour-target="hero">
          <Hero />
        </div>

        {/* Featured Properties Section */}
        <section id="properties" data-tour-target="properties" className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Find your new home</h2>
                <p className="text-muted-foreground">Verified rentals available now in the Netherlands</p>
              </div>
            </SectionReveal>

            <SectionReveal delay={100}>
              <PropertyFilters 
                filters={filters}
                onFiltersChange={setFilters}
                cities={cities}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                className="mb-6"
              />
            </SectionReveal>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-xl skeleton-pulse" />
                    <Skeleton className="h-4 w-3/4 skeleton-pulse" />
                    <Skeleton className="h-4 w-1/2 skeleton-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              viewMode === 'list' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredProperties.map((property, idx) => (
                    <SectionReveal key={property.id} delay={idx * 50} direction="up">
                      <PropertyCard property={property} />
                    </SectionReveal>
                  ))}
                </div>
              ) : (
                <SectionReveal direction="scale">
                  <PropertyMap properties={filteredProperties} className="mt-4" />
                </SectionReveal>
              )
            ) : (
              <SectionReveal direction="fade">
                <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {filters.search || filters.city || filters.bedrooms || filters.propertyType
                      ? "No properties match your filters. Try adjusting your search criteria."
                      : "No properties available at the moment. Check back soon!"}
                  </p>
                  {(filters.search || filters.city || filters.bedrooms || filters.propertyType) && (
                    <Button 
                      variant="outline" 
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
        <section data-tour-target="features" className="py-10 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">What makes {contact.company_name} special?</h2>
                <p className="text-muted-foreground">Discover the features that set us apart</p>
              </div>
            </SectionReveal>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, idx) => (
                <SectionReveal key={idx} delay={100 + idx * 100} direction="up">
                  <div className="text-center p-6 rounded-2xl bg-background border border-border card-interactive group">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                      <feature.icon className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" aria-label={feature.title} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Blog/News Section */}
        <section data-tour-target="blog" className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Stay informed</h2>
                <p className="text-muted-foreground">Latest insights and updates from the rental market</p>
              </div>
            </SectionReveal>
          </div>
          <BlogSection />
        </section>

        {/* Contact Section */}
        <section id="contact" data-tour-target="contact" className="py-10 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionReveal>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">We&apos;re here to help</h2>
                <p className="text-muted-foreground">Have questions? Our team is ready to assist you.</p>
              </div>
            </SectionReveal>

            <SectionReveal delay={100}>
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Info */}
                  <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-foreground mb-4">Get in Touch</h3>
                    
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 transition-colors hover:bg-muted">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <MapPin className="w-5 h-5 text-primary" aria-label="Address" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="font-medium text-foreground">{contact.address}, {contact.city}</p>
                      </div>
                    </div>

                    <a 
                      href={`mailto:${contact.email}`}
                      onClick={() => handleContactClick('email')}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 group"
                    >
                      <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Mail className="w-5 h-5 text-primary" aria-label="Email" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{contact.email}</p>
                      </div>
                    </a>

                    <a 
                      href={`tel:${contact.phone}`}
                      onClick={() => handleContactClick('phone')}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 group"
                    >
                      <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Phone className="w-5 h-5 text-primary" aria-label="Phone" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{contact.phone}</p>
                      </div>
                    </a>
                  </div>

                  {/* Lead Capture Card */}
                  <div className="bg-background rounded-2xl border border-border p-6 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Send className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Let Us Find Your Home
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Tell us what you&apos;re looking for and we&apos;ll send you personalized matches.
                      </p>
                      <Button 
                        size="lg"
                        variant="glow" 
                        className="w-full gap-2 group"
                        onClick={() => setShowContactForm(true)}
                      >
                        <Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        Start Your Search
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
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
