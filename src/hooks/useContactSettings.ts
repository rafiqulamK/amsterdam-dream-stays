import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export interface ContactSettings {
  company_name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  whatsapp_enabled: boolean;
  whatsapp_number: string;
  business_hours: string;
}

const defaultContactSettings: ContactSettings = {
  company_name: 'Hause',
  address: 'Wamelplein 68',
  city: '1106 Amsterdam',
  country: 'Netherlands',
  phone: '+31 20 123 4567',
  email: 'info@hause.ink',
  whatsapp_enabled: false,
  whatsapp_number: '',
  business_hours: 'Mon-Fri: 9:00 - 18:00'
};

export const useContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultContactSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await apiClient.getSettings('contact_info') as any;

      if (data?.setting_value) {
        const value = typeof data.setting_value === 'string' 
          ? JSON.parse(data.setting_value) 
          : data.setting_value;
        
        if (value?.value) {
          setSettings({ ...defaultContactSettings, ...value.value });
        } else if (value) {
          setSettings({ ...defaultContactSettings, ...value });
        }
      }
    } catch (err) {
      console.warn('Contact settings fetch error, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading };
};

export default useContactSettings;
