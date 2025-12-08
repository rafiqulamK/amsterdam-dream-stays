import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, BarChart3 } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface GASettings {
  measurement_id: string;
  enabled: boolean;
  track_page_view: boolean;
  track_events: boolean;
}

const defaultGASettings: GASettings = {
  measurement_id: '',
  enabled: false,
  track_page_view: true,
  track_events: true
};

const GoogleAnalyticsSettings = () => {
  const [settings, setSettings] = useState<GASettings>(defaultGASettings);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'google_analytics')
      .maybeSingle();

    if (data?.setting_value) {
      const value = data.setting_value as unknown as { value: GASettings };
      if (value?.value) {
        setSettings({ ...defaultGASettings, ...value.value });
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert([{
        setting_key: 'google_analytics',
        setting_value: { value: settings } as unknown as Json,
        updated_at: new Date().toISOString()
      }], { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save Google Analytics settings",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Google Analytics settings saved successfully"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Google Analytics Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="measurement_id">Measurement ID (GA4)</Label>
            <Input
              id="measurement_id"
              value={settings.measurement_id}
              onChange={(e) => setSettings({ ...settings, measurement_id: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Find your Measurement ID in Google Analytics → Admin → Data Streams
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div>
              <Label htmlFor="enabled" className="font-medium">Enable Google Analytics</Label>
              <p className="text-xs text-muted-foreground">Toggle to activate GA tracking on your site</p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-4">Tracking Options</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="track_page_view" className="cursor-pointer text-sm">
                Page Views - Track all page visits
              </Label>
              <Switch
                id="track_page_view"
                checked={settings.track_page_view}
                onCheckedChange={(checked) => setSettings({ ...settings, track_page_view: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="track_events" className="cursor-pointer text-sm">
                Custom Events - Track user interactions
              </Label>
              <Switch
                id="track_events"
                checked={settings.track_events}
                onCheckedChange={(checked) => setSettings({ ...settings, track_events: checked })}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Analytics Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoogleAnalyticsSettings;
