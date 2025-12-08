import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  company_name: 'Haus.online',
  address: 'Wamelplein 68',
  city: '1106 Amsterdam',
  country: 'Netherlands',
  phone: '+31 20 123 4567',
  email: 'info@haus.online',
  whatsapp_enabled: false,
  whatsapp_number: '',
  business_hours: 'Mon-Fri: 9:00 - 18:00'
};

export const useContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultContactSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_info')
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch contact settings, using defaults:', error.message);
        setLoading(false);
        return;
      }

      if (data?.setting_value) {
        const value = data.setting_value as unknown as { value: ContactSettings };
        if (value?.value) {
          setSettings({ ...defaultContactSettings, ...value.value });
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

    // Subscribe to realtime changes for instant updates
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      channel = supabase
        .channel('contact-settings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'site_settings',
            filter: 'setting_key=eq.contact_info'
          },
          () => {
            fetchSettings();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Failed to subscribe to contact settings changes:', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchSettings]);

  return { settings, loading };
};

export default useContactSettings;
