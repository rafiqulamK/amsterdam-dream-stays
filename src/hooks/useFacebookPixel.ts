import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface PixelSettings {
  pixel_id: string;
  enabled: boolean;
  track_page_view: boolean;
  track_lead: boolean;
  track_view_content: boolean;
  track_search: boolean;
  track_contact: boolean;
  track_add_to_wishlist: boolean;
}

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

export const useFacebookPixel = () => {
  const [settings, setSettings] = useState<PixelSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await apiClient.getSettings('facebook_pixel') as { setting_value?: { value: PixelSettings } };
      if (response?.setting_value?.value) {
        setSettings(response.setting_value.value);
      }
    } catch (err) {
      console.log('Facebook Pixel settings not configured');
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!settings?.enabled || !settings?.pixel_id) return;

    // Check if already loaded
    if (window.fbq) return;

    try {
      // Initialize Facebook Pixel
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.pixel_id}');
        ${settings.track_page_view ? "fbq('track', 'PageView');" : ''}
      `;
      document.head.appendChild(script);

      // Add noscript fallback
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.pixel_id}&ev=PageView&noscript=1"/>`;
      document.body.appendChild(noscript);
    } catch (err) {
      console.warn('Failed to initialize Facebook Pixel:', err);
    }
  }, [settings]);

  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (!settings?.enabled || !window.fbq) return;

    try {
      const eventMap: Record<string, keyof PixelSettings> = {
        Lead: 'track_lead',
        ViewContent: 'track_view_content',
        Search: 'track_search',
        Contact: 'track_contact',
        AddToWishlist: 'track_add_to_wishlist'
      };

      const settingKey = eventMap[eventName];
      if (settingKey && !settings[settingKey]) return;

      window.fbq('track', eventName, params);
    } catch (err) {
      console.warn('Failed to track Facebook Pixel event:', err);
    }
  };

  return { trackEvent, isEnabled: settings?.enabled ?? false };
};

export default useFacebookPixel;
