import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContactSettings } from '@/hooks/useContactSettings';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { useBrandingSettings } from '@/hooks/useBrandingSettings';

const Footer = () => {
  const { settings: contact } = useContactSettings();
  const { trackEvent } = useFacebookPixel();
  const { settings: branding } = useBrandingSettings();

  const handleContactClick = (type: string) => {
    trackEvent('Contact', {
      content_type: type,
      content_name: `Footer ${type} Click`
    });
  };

  // Footer always uses white logo (dark mode logo) regardless of theme
  const footerLogo = branding.darkModeLogo;

  return (
    <footer className="py-12 bg-[#1a1a2e] text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <Link to="/">
              <img 
                src={footerLogo} 
                alt="Hause"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-white/80">
              Find your next home in the Netherlands with verified landlords and quality rentals.
            </p>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Useful Links</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">
                Frontpage
              </Link>
              <Link to="/#properties" className="text-white/80 hover:text-white transition-colors">
                Find rental properties
              </Link>
              <Link to="/page/privacy" className="text-white/80 hover:text-white transition-colors">
                Privacy policy
              </Link>
              <Link to="/#contact" className="text-white/80 hover:text-white transition-colors">
                Contact us
              </Link>
              <Link to="/page/subscription-terms" className="text-white/80 hover:text-white transition-colors">
                Subscription terms
              </Link>
              <Link to="/page/terms" className="text-white/80 hover:text-white transition-colors">
                Terms and Conditions
              </Link>
              <Link to="/auth" className="text-white/80 hover:text-white transition-colors">
                Log in
              </Link>
            </nav>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <a 
                href={`mailto:${contact.email}`} 
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                onClick={() => handleContactClick('email')}
                aria-label={`Email us at ${contact.email}`}
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                {contact.email}
              </a>
              <a 
                href={`tel:${contact.phone}`} 
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                onClick={() => handleContactClick('phone')}
                aria-label={`Call us at ${contact.phone}`}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {contact.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/20 text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} {contact.company_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
