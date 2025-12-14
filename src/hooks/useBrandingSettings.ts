import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
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
      try {
        const data = await apiClient.getSettings('branding') as any;

        if (data?.setting_value) {
          const value = typeof data.setting_value === 'string' 
            ? JSON.parse(data.setting_value) 
            : data.setting_value;
          
          setSettings({
            lightModeLogo: value.lightModeLogo || hauseLogoDark,
            darkModeLogo: value.darkModeLogo || hauseLogoWhite,
          });
        }
      } catch (err) {
        console.warn('Branding settings fetch error, using defaults:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, isLoading };
};
