import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Search, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useBrandingSettings } from "@/hooks/useBrandingSettings";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();
  const { user, userRole } = useAuth();
  const { theme } = useTheme();
  const { settings: branding } = useBrandingSettings();

  const navLinks = [
    { name: "Frontpage", path: "/" },
    { name: "Find Properties", path: "/#properties" },
    { name: "Blog", path: "/blog" },
    { name: "Contact us", path: "/#contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname + location.hash === path;
  };

  const currentLogo = theme === 'dark' ? branding.darkModeLogo : branding.lightModeLogo;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-md border-b border-border/50 transition-all duration-300">
      <nav className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo with hover effect */}
          <Link to="/" className="shrink-0 group">
            <img 
              src={currentLogo} 
              alt="Hause" 
              className="h-7 w-auto transition-all duration-300 group-hover:scale-105 group-hover:opacity-80"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-3">
            <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
              <Input
                placeholder="Search properties..."
                className={`pl-9 h-9 bg-muted/50 border-border rounded-full text-sm transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-primary/20 border-primary/50 bg-background' : ''}`}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-all duration-200 hover:text-primary px-3 py-2 rounded-md ${
                  isActive(link.path) 
                    ? "text-primary bg-primary/5" 
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            ))}
            
            <div className="ml-2 flex items-center gap-2">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-2">
                  {(userRole === 'admin' || userRole === 'superadmin') && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" className="gap-1">
                        Admin
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Log in
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 rounded-md hover:bg-muted transition-all duration-200 active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="relative w-6 h-6">
                <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} aria-hidden="true" />
                <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`} aria-hidden="true" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-4 pb-2 border-t border-border mt-4">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Find your next home now"
                className="pl-10 h-10 bg-muted/50 border-border rounded-full text-sm"
              />
            </div>
            
            <div className="flex flex-col gap-1 stagger-children">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-all duration-200 hover:text-primary px-3 py-2.5 rounded-md ${
                    isActive(link.path) 
                      ? "text-primary bg-primary/5" 
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-2 mt-2 border-t border-border">
                {user ? (
                  <>
                    {(userRole === 'admin' || userRole === 'superadmin') && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">Admin Dashboard</Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full gap-2">
                      <User className="w-4 h-4" />
                      Log in
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
