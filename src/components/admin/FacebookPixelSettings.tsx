import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Save, Activity, Loader2, ExternalLink } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.getSettings('facebook_pixel') as { setting_value?: { value: PixelSettings } };
      if (response?.setting_value?.value) {
        setSettings({ ...defaultPixelSettings, ...response.setting_value.value });
      }
    } catch (error) {
      console.log('Facebook Pixel settings not found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (settings.enabled && !settings.pixel_id.trim()) {
      toast.error('Please enter a Facebook Pixel ID');
      return;
    }

    setSaving(true);
    try {
      await apiClient.updateSettings('facebook_pixel', { value: settings });
      toast.success('Facebook Pixel settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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
              Find your Pixel ID in{' '}
              <a
                href="https://business.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Meta Events Manager
                <ExternalLink className="w-3 h-3" />
              </a>
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

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            How Facebook Pixel Works
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Track visitor actions to measure ad effectiveness</li>
            <li>• Build custom audiences for retargeting</li>
            <li>• Optimize ads for conversions</li>
            <li>• Events are sent automatically when enabled</li>
          </ul>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Pixel Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FacebookPixelSettings;
