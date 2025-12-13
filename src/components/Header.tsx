import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Search, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useBrandingSettings } from "@/hooks/useBrandingSettings";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <header className="sticky top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img 
              src={currentLogo} 
              alt="Hause" 
              className="h-8 w-auto transition-opacity duration-200"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Find your next home now"
                className="pl-10 h-10 bg-muted/50 border-border rounded-full text-sm"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-2">
                {(userRole === 'admin' || userRole === 'superadmin') && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">Admin</Button>
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border animate-fade-in">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Find your next home now"
                className="pl-10 h-10 bg-muted/50 border-border rounded-full text-sm"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary" : "text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
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
        )}
      </nav>
    </header>
  );
};

export default Header;
