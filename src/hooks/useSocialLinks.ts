import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SocialLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  tiktok: string;
}

const defaultSocialLinks: SocialLinks = {
  facebook: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  youtube: '',
  tiktok: ''
};

export const useSocialLinks = () => {
  const [links, setLinks] = useState<SocialLinks>(defaultSocialLinks);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'social_links')
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch social links, using defaults:', error.message);
        setLoading(false);
        return;
      }

      if (data?.setting_value) {
        const value = data.setting_value as unknown as { value: SocialLinks };
        if (value?.value) {
          setLinks({ ...defaultSocialLinks, ...value.value });
        }
      }
    } catch (err) {
      console.warn('Social links fetch error, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();

    // Subscribe to realtime changes for instant updates
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      channel = supabase
        .channel('social-links-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'site_settings',
            filter: 'setting_key=eq.social_links'
          },
          () => {
            fetchLinks();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Failed to subscribe to social links changes:', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchLinks]);

  return { links, loading };
};

export default useSocialLinks;
