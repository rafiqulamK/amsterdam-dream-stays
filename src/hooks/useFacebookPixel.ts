import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'facebook_pixel')
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch Facebook Pixel settings:', error.message);
        return;
      }

      if (data?.setting_value) {
        const value = data.setting_value as unknown as { value: PixelSettings };
        if (value?.value) {
          setSettings(value.value);
        }
      }
    } catch (err) {
      console.warn('Facebook Pixel settings fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes for instant updates
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      channel = supabase
        .channel('facebook-pixel-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'site_settings',
            filter: 'setting_key=eq.facebook_pixel'
          },
          () => {
            fetchSettings();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Failed to subscribe to Facebook Pixel changes:', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
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
