import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import hauseLogoDark from '@/assets/hause-logo-dark.png';
import hauseLogoWhite from '@/assets/hause-logo-white.png';

interface BrandingSettings {
  lightModeLogo: string;
  darkModeLogo: string;
}

export const useBrandingSettings = () => {
  const [settings, setSettings] = useState<BrandingSettings>({
    lightModeLogo: hauseLogoDark,
    darkModeLogo: hauseLogoWhite,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'branding')
        .maybeSingle();

      if (!error && data?.setting_value) {
        const value = data.setting_value as Record<string, string>;
        setSettings({
          lightModeLogo: value.lightModeLogo || hauseLogoDark,
          darkModeLogo: value.darkModeLogo || hauseLogoWhite,
        });
      }
      setIsLoading(false);
    };

    fetchSettings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('branding-settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'setting_key=eq.branding',
        },
        (payload) => {
          if (payload.new && 'setting_value' in payload.new) {
            const value = payload.new.setting_value as Record<string, string>;
            setSettings({
              lightModeLogo: value.lightModeLogo || hauseLogoDark,
              darkModeLogo: value.darkModeLogo || hauseLogoWhite,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, isLoading };
};
