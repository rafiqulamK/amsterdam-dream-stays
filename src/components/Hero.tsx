import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Home } from "lucide-react";
import { useHeroSettings } from "@/hooks/useHeroSettings";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import heroImage from "@/assets/hero-rental.jpg";
import HomepageLeadForm from "./HomepageLeadForm";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { settings, loading } = useHeroSettings();
  const { trackEvent } = useFacebookPixel();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackEvent('Search', {
        search_string: searchQuery,
        content_category: 'property'
      });
      // Scroll to properties section
      document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const backgroundImage = settings.background_image_url || heroImage;

  if (loading) {
    return (
      <section className="relative min-h-[70vh] md:min-h-[75vh] flex items-center overflow-hidden bg-muted">
        <div className="absolute inset-0 z-0">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-end">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 md:p-10 max-w-md w-full shadow-[var(--shadow-soft)]">
              <Skeleton className="h-10 w-3/4 mb-3" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-2/3 mb-5" />
              <Skeleton className="h-10 w-full mb-5 rounded-lg" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[70vh] md:min-h-[75vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Beautiful Amsterdam canal house interior"
          className="w-full h-full object-cover animate-scale-in"
          style={{ animationDuration: '1.5s' }}
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
      </div>

      {/* Content Card - Right aligned */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-end">
          <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-md w-full shadow-[var(--shadow-soft)] animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3 text-foreground">
              {settings.title}
            </h1>
            
            <p className="text-muted-foreground mb-5 text-base animate-fade-in stagger-1">
              {settings.subtitle}
            </p>

            {/* Search Bar */}
            <div className="relative mb-5">
              <Input
                placeholder={settings.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-10 pl-4 pr-10 rounded-lg border-border bg-background text-sm"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-md transition-colors"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Popular Areas */}
            <div className="mb-5">
              <span className="text-xs text-muted-foreground">Popular: </span>
              <span className="text-xs">
                {settings.popular_areas.map((area, idx) => (
                  <span key={area}>
                    <a href="#properties" className="text-primary hover:underline font-medium">
                      {area}
                    </a>
                    {idx < settings.popular_areas.length - 1 && ", "}
                  </span>
                ))}
              </span>
            </div>

            {/* Primary CTA Button */}
            <Button 
              size="default" 
              variant="glow"
              className="w-full gap-2 animate-fade-in stagger-2"
              onClick={() => setIsFormOpen(true)}
            >
              <Home className="w-4 h-4" />
              Get Personalized Matches
            </Button>
          </div>
        </div>
      </div>

      <HomepageLeadForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        source="hero_cta"
      />
    </section>
  );
};

export default Hero;
