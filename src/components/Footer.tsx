import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContactSettings } from '@/hooks/useContactSettings';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import logoLight from '@/assets/logo-light.png';

const Footer = () => {
  const { settings: contact } = useContactSettings();
  const { trackEvent } = useFacebookPixel();

  const handleContactClick = (type: string) => {
    trackEvent('Contact', {
      content_type: type,
      content_name: `Footer ${type} Click`
    });
  };

  return (
    <footer className="py-12 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <Link to="/">
              <img 
                src={logoLight} 
                alt={contact.company_name}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Find your next home in the Netherlands with verified landlords and quality rentals.
            </p>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Useful Links</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Frontpage
              </Link>
              <Link to="/#properties" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Find rental properties
              </Link>
              <Link to="/page/privacy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Privacy policy
              </Link>
              <Link to="/#contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Contact us
              </Link>
              <Link to="/page/subscription-terms" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Subscription terms
              </Link>
              <Link to="/page/terms" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Terms and Conditions
              </Link>
              <Link to="/auth" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Log in
              </Link>
            </nav>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <a 
                href={`mailto:${contact.email}`} 
                className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                onClick={() => handleContactClick('email')}
              >
                <Mail className="w-4 h-4" />
                {contact.email}
              </a>
              <a 
                href={`tel:${contact.phone}`} 
                className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                onClick={() => handleContactClick('phone')}
              >
                <Phone className="w-4 h-4" />
                {contact.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/60 text-sm">
          <p>© {new Date().getFullYear()} {contact.company_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
