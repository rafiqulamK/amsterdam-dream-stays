import { MessageCircle } from 'lucide-react';
import { useContactSettings } from '@/hooks/useContactSettings';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { zIndex } from '@/styles/z-index';

const WhatsAppButton = () => {
  const { settings, loading } = useContactSettings();
  const { trackEvent } = useFacebookPixel();

  if (loading || !settings.whatsapp_enabled || !settings.whatsapp_number) {
    return null;
  }

  const handleClick = () => {
    trackEvent('Contact', {
      content_type: 'whatsapp',
      content_name: 'WhatsApp Button Click'
    });
    
    const cleanNumber = settings.whatsapp_number.replace(/\D/g, '');
    const message = encodeURIComponent('Hello! I am interested in your rental properties.');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20BA5C] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      style={{ zIndex: zIndex.whatsApp }}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat with us
      </span>
    </button>
  );
};

export default WhatsAppButton;
