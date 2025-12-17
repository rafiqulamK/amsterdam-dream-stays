import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Home, ArrowRight } from "lucide-react";
import { useHeroSettings } from "@/hooks/useHeroSettings";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import heroImage from "@/assets/hero-rental.jpg";
import HomepageLeadForm from "./HomepageLeadForm";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { settings, loading } = useHeroSettings();
  const { trackEvent } = useFacebookPixel();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackEvent('Search', {
        search_string: searchQuery,
        content_category: 'property'
      });
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
          <Skeleton className="w-full h-full skeleton-pulse" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-end">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 md:p-10 max-w-md w-full shadow-[var(--shadow-soft)]">
              <Skeleton className="h-10 w-3/4 mb-3 skeleton-pulse" />
              <Skeleton className="h-5 w-full mb-2 skeleton-pulse" />
              <Skeleton className="h-5 w-2/3 mb-5 skeleton-pulse" />
              <Skeleton className="h-10 w-full mb-5 rounded-lg skeleton-pulse" />
              <Skeleton className="h-4 w-1/2 skeleton-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[70vh] md:min-h-[75vh] flex items-center overflow-hidden">
      {/* Background Image with parallax-like effect */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Beautiful Amsterdam canal house interior"
          className="w-full h-full object-cover scale-105 transition-transform duration-[2s]"
        />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-transparent" />
      </div>

      {/* Content Card - Right aligned */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-end">
          <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-md w-full shadow-[var(--shadow-soft)] animate-fade-in-up stagger-children">
            {/* Title with gradient effect */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3 text-foreground">
              {settings.title}
            </h1>
            
            <p className="text-muted-foreground mb-5 text-base">
              {settings.subtitle}
            </p>

            {/* Enhanced Search Bar */}
            <div className={`relative mb-5 transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
              <Input
                placeholder={settings.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`h-11 pl-4 pr-12 rounded-lg border-border bg-background text-sm transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-primary/20 border-primary/50' : ''}`}
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-primary hover:text-primary-foreground rounded-md transition-all duration-200 group"
              >
                <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
              </button>
            </div>

            {/* Popular Areas with hover effect */}
            <div className="mb-5">
              <span className="text-xs text-muted-foreground">Popular: </span>
              <span className="text-xs">
                {settings.popular_areas.map((area, idx) => (
                  <span key={area}>
                    <a 
                      href="#properties" 
                      className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      {area}
                    </a>
                    {idx < settings.popular_areas.length - 1 && ", "}
                  </span>
                ))}
              </span>
            </div>

            {/* Primary CTA Button with enhanced animation */}
            <Button 
              size="lg" 
              variant="glow"
              className="w-full gap-2 group"
              onClick={() => setIsFormOpen(true)}
            >
              <Home className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              Get Personalized Matches
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
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
