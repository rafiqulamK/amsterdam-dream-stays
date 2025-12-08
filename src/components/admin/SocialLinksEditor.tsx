import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Share2, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface SocialLinks {
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

const SocialLinksEditor = () => {
  const [links, setLinks] = useState<SocialLinks>(defaultSocialLinks);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'social_links')
      .single();

    if (data?.setting_value) {
      const value = data.setting_value as unknown as { value: SocialLinks };
      if (value?.value) {
        setLinks({ ...defaultSocialLinks, ...value.value });
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert([{
        setting_key: 'social_links',
        setting_value: { value: links } as unknown as Json,
        updated_at: new Date().toISOString()
      }], { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save social links",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Social links saved successfully"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Social Media Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </Label>
            <Input
              id="facebook"
              value={links.facebook}
              onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
              placeholder="https://facebook.com/hausonline"
            />
          </div>
          <div>
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={links.instagram}
              onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
              placeholder="https://instagram.com/hausonline"
            />
          </div>
          <div>
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={links.linkedin}
              onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/hausonline"
            />
          </div>
          <div>
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter / X
            </Label>
            <Input
              id="twitter"
              value={links.twitter}
              onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
              placeholder="https://twitter.com/hausonline"
            />
          </div>
          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              value={links.youtube}
              onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
              placeholder="https://youtube.com/@hausonline"
            />
          </div>
          <div>
            <Label htmlFor="tiktok">TikTok</Label>
            <Input
              id="tiktok"
              value={links.tiktok}
              onChange={(e) => setLinks({ ...links, tiktok: e.target.value })}
              placeholder="https://tiktok.com/@hausonline"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Social Links
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialLinksEditor;
