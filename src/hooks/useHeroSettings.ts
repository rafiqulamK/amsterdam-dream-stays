import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSettings {
  title: string;
  subtitle: string;
  search_placeholder: string;
  background_image_url: string;
  popular_areas: string[];
}

const defaultHeroSettings: HeroSettings = {
  title: 'Your dream home in Amsterdam',
  subtitle: "Find verified rental properties in Amsterdam's best neighborhoods",
  search_placeholder: 'Search Amsterdam properties...',
  background_image_url: '',
  popular_areas: ['Centrum', 'Jordaan', 'De Pijp', 'Oud-West']
};

export const useHeroSettings = () => {
  const [settings, setSettings] = useState<HeroSettings>(defaultHeroSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'hero_section')
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch hero settings, using defaults:', error.message);
        setLoading(false);
        return;
      }

      if (data?.setting_value) {
        const value = data.setting_value as unknown as { value: HeroSettings };
        if (value?.value) {
          setSettings({ ...defaultHeroSettings, ...value.value });
        }
      }
    } catch (err) {
      console.warn('Hero settings fetch error, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      channel = supabase
        .channel('hero-settings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'site_settings',
            filter: 'setting_key=eq.hero_section'
          },
          () => {
            fetchSettings();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Failed to subscribe to hero settings changes:', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchSettings]);

  return { settings, loading };
};

export default useHeroSettings;
