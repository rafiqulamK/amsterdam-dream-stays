import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

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
      const data = await apiClient.getSettings('hero_section') as any;

      if (data?.setting_value) {
        const value = typeof data.setting_value === 'string' 
          ? JSON.parse(data.setting_value) 
          : data.setting_value;
        
        if (value?.value) {
          setSettings({ ...defaultHeroSettings, ...value.value });
        } else if (value) {
          setSettings({ ...defaultHeroSettings, ...value });
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
  }, [fetchSettings]);

  return { settings, loading };
};

export default useHeroSettings;
