import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BrandingSettings {
  lightModeLogo: string | null;
  darkModeLogo: string | null;
}

export const useBrandingSettings = () => {
  const [settings, setSettings] = useState<BrandingSettings>({
    lightModeLogo: null,
    darkModeLogo: null,
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
          lightModeLogo: value.lightModeLogo || null,
          darkModeLogo: value.darkModeLogo || null,
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
              lightModeLogo: value.lightModeLogo || null,
              darkModeLogo: value.darkModeLogo || null,
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
