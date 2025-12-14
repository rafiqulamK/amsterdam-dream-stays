import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

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
      const data = await apiClient.getSettings('social_links') as any;

      if (data?.setting_value) {
        const value = typeof data.setting_value === 'string' 
          ? JSON.parse(data.setting_value) 
          : data.setting_value;
        
        if (value?.value) {
          setLinks({ ...defaultSocialLinks, ...value.value });
        } else if (value) {
          setLinks({ ...defaultSocialLinks, ...value });
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
  }, [fetchLinks]);

  return { links, loading };
};

export default useSocialLinks;
