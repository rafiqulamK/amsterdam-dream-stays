import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Activity } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface PixelSettings {
  pixel_id: string;
  enabled: boolean;
  track_page_view: boolean;
  track_lead: boolean;
  track_view_content: boolean;
  track_search: boolean;
  track_contact: boolean;
  track_add_to_wishlist: boolean;
}

const defaultPixelSettings: PixelSettings = {
  pixel_id: '',
  enabled: false,
  track_page_view: true,
  track_lead: true,
  track_view_content: true,
  track_search: true,
  track_contact: true,
  track_add_to_wishlist: true
};

const eventLabels: Record<keyof Omit<PixelSettings, 'pixel_id' | 'enabled'>, string> = {
  track_page_view: 'PageView - Track all page visits',
  track_lead: 'Lead - When lead form is submitted',
  track_view_content: 'ViewContent - When viewing property details',
  track_search: 'Search - Property searches',
  track_contact: 'Contact - Contact interactions',
  track_add_to_wishlist: 'AddToWishlist - Save property actions'
};

const FacebookPixelSettings = () => {
  const [settings, setSettings] = useState<PixelSettings>(defaultPixelSettings);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'facebook_pixel')
      .maybeSingle();

    if (data?.setting_value) {
      const value = data.setting_value as unknown as { value: PixelSettings };
      if (value?.value) {
        setSettings({ ...defaultPixelSettings, ...value.value });
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert([{
        setting_key: 'facebook_pixel',
        setting_value: { value: settings } as unknown as Json,
        updated_at: new Date().toISOString()
      }], { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save Facebook Pixel settings",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Facebook Pixel settings saved successfully"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Facebook Pixel Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="pixel_id">Facebook Pixel ID</Label>
            <Input
              id="pixel_id"
              value={settings.pixel_id}
              onChange={(e) => setSettings({ ...settings, pixel_id: e.target.value })}
              placeholder="Enter your Facebook Pixel ID (e.g., 123456789012345)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Find your Pixel ID in Facebook Events Manager
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div>
              <Label htmlFor="enabled" className="font-medium">Enable Facebook Pixel</Label>
              <p className="text-xs text-muted-foreground">Toggle to activate pixel tracking on your site</p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-4">Event Tracking (Full Funnel)</h4>
          <div className="space-y-3">
            {(Object.keys(eventLabels) as Array<keyof typeof eventLabels>).map((key) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label htmlFor={key} className="cursor-pointer text-sm">
                  {eventLabels[key]}
                </Label>
                <Switch
                  id={key}
                  checked={settings[key]}
                  onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Pixel Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default FacebookPixelSettings;
