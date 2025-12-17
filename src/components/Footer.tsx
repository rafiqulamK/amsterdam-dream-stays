import { Mail, Phone, ArrowUpRight, Heart } from 'lucide-react';
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

  const footerLogo = branding.darkModeLogo;

  const footerLinks = [
    { name: 'Frontpage', path: '/' },
    { name: 'Find rental properties', path: '/#properties' },
    { name: 'Privacy policy', path: '/page/privacy' },
    { name: 'Contact us', path: '/#contact' },
    { name: 'Subscription terms', path: '/page/subscription-terms' },
    { name: 'Terms and Conditions', path: '/page/terms' },
    { name: 'Log in', path: '/auth' },
  ];

  return (
    <footer className="py-16 bg-[#1a1a2e] text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Logo & Tagline */}
          <div className="space-y-5">
            <Link to="/" className="inline-block group">
              <img 
                src={footerLogo} 
                alt="Hause"
                className="h-8 w-auto transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
              />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Find your next home in the Netherlands with verified landlords and quality rentals.
            </p>
          </div>

          {/* Useful Links */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Useful Links
            </h3>
            <nav className="flex flex-col gap-2.5 text-sm">
              {footerLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className="text-white/70 hover:text-white transition-all duration-200 inline-flex items-center gap-1 group w-fit"
                >
                  <span className="relative">
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white/50 transition-all duration-300 group-hover:w-full" />
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 transition-all duration-200 group-hover:opacity-70 group-hover:translate-y-0 group-hover:translate-x-0" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Us */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Contact Us
            </h3>
            <div className="space-y-4 text-sm">
              <a 
                href={`mailto:${contact.email}`} 
                className="flex items-center gap-3 text-white/70 hover:text-white transition-all duration-200 group w-fit"
                onClick={() => handleContactClick('email')}
                aria-label={`Email us at ${contact.email}`}
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <span>{contact.email}</span>
              </a>
              <a 
                href={`tel:${contact.phone}`} 
                className="flex items-center gap-3 text-white/70 hover:text-white transition-all duration-200 group w-fit"
                onClick={() => handleContactClick('phone')}
                aria-label={`Call us at ${contact.phone}`}
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </div>
                <span>{contact.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-sm">
          <p>© {new Date().getFullYear()} {contact.company_name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 animate-pulse-soft" /> in Amsterdam
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
