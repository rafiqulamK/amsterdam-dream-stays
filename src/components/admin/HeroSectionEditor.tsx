import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Image } from 'lucide-react';

interface HeroSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_background_url: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
}

const HeroSectionEditor = () => {
  const [settings, setSettings] = useState<HeroSettings>({
    hero_title: '',
    hero_subtitle: '',
    hero_background_url: '',
    hero_cta_text: '',
    hero_cta_link: '',
    hero_secondary_cta_text: '',
    hero_secondary_cta_link: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .in('setting_key', Object.keys(settings));

    if (data) {
      const settingsObj: Record<string, string> = {};
      data.forEach(item => {
        const valueObj = item.setting_value as { value: string };
        settingsObj[item.setting_key] = valueObj.value || '';
      });
      setSettings(prev => ({ ...prev, ...settingsObj }));
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: { value },
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'setting_key' });
      }

      toast({
        title: "Success",
        description: "Hero section settings saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Hero Section
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="hero_title">Hero Title</Label>
            <Input
              id="hero_title"
              value={settings.hero_title}
              onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
              placeholder="Find Your Perfect Home in Amsterdam"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
            <Textarea
              id="hero_subtitle"
              value={settings.hero_subtitle}
              onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
              placeholder="Discover premium rental properties in Amsterdam's most sought-after neighborhoods"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="hero_background_url">Background Image URL</Label>
            <Input
              id="hero_background_url"
              value={settings.hero_background_url}
              onChange={(e) => setSettings({ ...settings, hero_background_url: e.target.value })}
              placeholder="https://example.com/hero-image.jpg"
            />
          </div>
          <div>
            <Label htmlFor="hero_cta_text">Primary CTA Text</Label>
            <Input
              id="hero_cta_text"
              value={settings.hero_cta_text}
              onChange={(e) => setSettings({ ...settings, hero_cta_text: e.target.value })}
              placeholder="Browse Properties"
            />
          </div>
          <div>
            <Label htmlFor="hero_cta_link">Primary CTA Link</Label>
            <Input
              id="hero_cta_link"
              value={settings.hero_cta_link}
              onChange={(e) => setSettings({ ...settings, hero_cta_link: e.target.value })}
              placeholder="/properties"
            />
          </div>
          <div>
            <Label htmlFor="hero_secondary_cta_text">Secondary CTA Text</Label>
            <Input
              id="hero_secondary_cta_text"
              value={settings.hero_secondary_cta_text}
              onChange={(e) => setSettings({ ...settings, hero_secondary_cta_text: e.target.value })}
              placeholder="List Your Property"
            />
          </div>
          <div>
            <Label htmlFor="hero_secondary_cta_link">Secondary CTA Link</Label>
            <Input
              id="hero_secondary_cta_link"
              value={settings.hero_secondary_cta_link}
              onChange={(e) => setSettings({ ...settings, hero_secondary_cta_link: e.target.value })}
              placeholder="/tenant-dashboard"
            />
          </div>
        </div>
        <Button onClick={handleSaveAll} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Hero Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default HeroSectionEditor;
