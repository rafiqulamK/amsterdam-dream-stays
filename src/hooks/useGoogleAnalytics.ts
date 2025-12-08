import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface GASettings {
  measurement_id: string;
  enabled: boolean;
  track_page_view: boolean;
  track_events: boolean;
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const useGoogleAnalytics = () => {
  const [settings, setSettings] = useState<GASettings | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'google_analytics')
          .maybeSingle();

        if (error) {
          console.warn('Failed to fetch Google Analytics settings:', error.message);
          return;
        }

        if (data?.setting_value) {
          const value = data.setting_value as unknown as { value: GASettings };
          if (value?.value) {
            setSettings(value.value);
          }
        }
      } catch (err) {
        console.warn('Google Analytics settings fetch error:', err);
      }
    };

    fetchSettings();
  }, []);

  // Initialize GA script
  useEffect(() => {
    if (!settings?.enabled || !settings?.measurement_id) return;

    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return;

    try {
      // Load gtag.js
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.measurement_id}`;
      document.head.appendChild(script);

      // Initialize dataLayer and gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', settings.measurement_id, {
        send_page_view: settings.track_page_view
      });
    } catch (err) {
      console.warn('Failed to initialize Google Analytics:', err);
    }
  }, [settings]);

  // Track page views on route change
  useEffect(() => {
    if (!settings?.enabled || !settings?.track_page_view || !window.gtag) return;

    try {
      window.gtag('config', settings.measurement_id, {
        page_path: location.pathname + location.search
      });
    } catch (err) {
      console.warn('Failed to track page view:', err);
    }
  }, [location, settings]);

  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (!settings?.enabled || !settings?.track_events || !window.gtag) return;
    
    try {
      window.gtag('event', eventName, params);
    } catch (err) {
      console.warn('Failed to track Google Analytics event:', err);
    }
  };

  return { trackEvent, isEnabled: settings?.enabled ?? false };
};

export default useGoogleAnalytics;
