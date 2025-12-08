import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import BlogSection from "@/components/BlogSection";
import { useProperties } from "@/hooks/useProperties";
import { useContactSettings } from "@/hooks/useContactSettings";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { Search, Shield, Zap, MapPin, Phone, Mail } from "lucide-react";
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
  // Fetch Amsterdam-only approved properties
  const { data: properties, isLoading } = useProperties("Amsterdam");
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
      <Hero />

      {/* Featured Properties Section - Amsterdam Only */}
      <section id="properties" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured properties in Amsterdam</h2>
              <p className="text-muted-foreground mt-2">Verified rentals available now</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {!isLoading && (!properties || properties.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground text-center">
            What makes {contact.company_name} special?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/News Section */}
      <BlogSection />

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Contact us</h2>
            <p className="text-muted-foreground mb-8">
              Have questions? We're here to help you find your perfect home in Amsterdam.
            </p>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <p>{contact.address}, {contact.city}, {contact.country}</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <a 
                  href={`mailto:${contact.email}`} 
                  className="hover:text-primary transition-colors"
                  onClick={() => handleContactClick('email')}
                >
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <a 
                  href={`tel:${contact.phone}`} 
                  className="hover:text-primary transition-colors"
                  onClick={() => handleContactClick('phone')}
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
