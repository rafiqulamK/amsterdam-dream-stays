import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useHeroSettings } from "@/hooks/useHeroSettings";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import heroImage from "@/assets/hero-rental.jpg";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { settings } = useHeroSettings();
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

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Beautiful Amsterdam canal house interior"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Card - Right aligned */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-end">
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-8 md:p-12 max-w-lg w-full shadow-[var(--shadow-soft)] animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-foreground">
              {settings.title}
            </h1>
            
            <p className="text-muted-foreground mb-6 text-lg">
              {settings.subtitle}
            </p>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Input
                placeholder={settings.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 pl-4 pr-12 rounded-lg border-border bg-background text-base"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-md transition-colors"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Popular Areas */}
            <div>
              <span className="text-sm text-muted-foreground">Popular areas: </span>
              <span className="text-sm">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
