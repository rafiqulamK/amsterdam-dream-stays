import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Phone, MapPin } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface ContactSettings {
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  business_address: string;
  business_city: string;
  business_country: string;
}

const ContactSettingsEditor = () => {
  const [settings, setSettings] = useState<ContactSettings>({
    contact_email: '',
    contact_phone: '',
    whatsapp_number: '',
    business_address: 'Wamelplein 68',
    business_city: '1106 Amsterdam',
    business_country: 'Netherlands'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'contact_settings')
      .single();

    if (data?.setting_value) {
      const value = data.setting_value as unknown as { value: ContactSettings };
      if (value?.value) {
        setSettings(prev => ({ ...prev, ...value.value }));
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert([{
        setting_key: 'contact_settings',
        setting_value: { value: settings } as unknown as Json,
        updated_at: new Date().toISOString()
      }], { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save contact settings",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Contact settings saved successfully"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              placeholder="info@hause.ink"
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              placeholder="+31 20 123 4567"
            />
          </div>
          <div>
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input
              id="whatsapp_number"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              placeholder="+31612345678"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Business Address</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="business_address">Street Address</Label>
              <Input
                id="business_address"
                value={settings.business_address}
                onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                placeholder="Wamelplein 68"
              />
            </div>
            <div>
              <Label htmlFor="business_city">City / Postal Code</Label>
              <Input
                id="business_city"
                value={settings.business_city}
                onChange={(e) => setSettings({ ...settings, business_city: e.target.value })}
                placeholder="1106 Amsterdam"
              />
            </div>
            <div>
              <Label htmlFor="business_country">Country</Label>
              <Input
                id="business_country"
                value={settings.business_country}
                onChange={(e) => setSettings({ ...settings, business_country: e.target.value })}
                placeholder="Netherlands"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Contact Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContactSettingsEditor;
