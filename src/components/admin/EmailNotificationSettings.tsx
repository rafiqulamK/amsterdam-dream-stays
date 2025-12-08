import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Mail, Send, Shield, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Json } from '@/integrations/supabase/types';

interface EmailSettings {
  admin_email: string;
  from_name: string;
  new_lead_enabled: boolean;
  new_booking_enabled: boolean;
  lead_subject_template: string;
  lead_body_template: string;
  booking_subject_template: string;
  booking_body_template: string;
  webhook_secret: string;
}

const defaultEmailSettings: EmailSettings = {
  admin_email: '',
  from_name: 'Hause',
  new_lead_enabled: true,
  new_booking_enabled: true,
  lead_subject_template: 'New Lead: {{name}} is interested!',
  lead_body_template: 'You have a new lead from {{name}}.\n\nEmail: {{email}}\nPhone: {{phone}}\n\nMessage:\n{{message}}',
  booking_subject_template: 'New Booking Request for {{property}}',
  booking_body_template: 'A new booking request has been received.\n\nGuest: {{guest_name}}\nProperty: {{property}}\nDates: {{start_date}} to {{end_date}}\nTotal: €{{total_price}}',
  webhook_secret: ''
};

const EmailNotificationSettings = () => {
  const [settings, setSettings] = useState<EmailSettings>(defaultEmailSettings);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'email_settings')
      .single();

    if (data?.setting_value) {
      const value = data.setting_value as unknown as { value: EmailSettings };
      if (value?.value) {
        setSettings({ ...defaultEmailSettings, ...value.value });
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert([{
        setting_key: 'email_settings',
        setting_value: { value: settings } as unknown as Json,
        updated_at: new Date().toISOString()
      }], { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Email notification settings saved"
      });
    }
    setLoading(false);
  };

  const sendTestEmail = async () => {
    if (!settings.admin_email) {
      toast({
        title: "Error",
        description: "Please enter an admin email first",
        variant: "destructive"
      });
      return;
    }

    setTestLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'test',
          to: settings.admin_email,
          data: {
            name: 'Test User',
            email: 'test@example.com',
            message: 'This is a test email from Hause'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test email sent! Check your inbox."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your Resend API key.",
        variant: "destructive"
      });
    }
    setTestLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="leads">Lead Emails</TabsTrigger>
            <TabsTrigger value="bookings">Booking Emails</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="admin_email">Admin Email (receives notifications)</Label>
              <Input
                id="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                placeholder="admin@hause.ink"
              />
            </div>
            <div>
              <Label htmlFor="from_name">From Name</Label>
              <Input
                id="from_name"
                value={settings.from_name}
                onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                placeholder="Hause"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="new_lead_enabled">New Lead Notifications</Label>
              <Switch
                id="new_lead_enabled"
                checked={settings.new_lead_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, new_lead_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="new_booking_enabled">New Booking Notifications</Label>
              <Switch
                id="new_booking_enabled"
                checked={settings.new_booking_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, new_booking_enabled: checked })}
              />
            </div>
            <Button onClick={sendTestEmail} disabled={testLoading} variant="outline" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {testLoading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                The webhook secret protects your email endpoint from unauthorized access. 
                When configured, all email requests must include this secret to be processed.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="webhook_secret">Email Webhook Secret</Label>
              <div className="relative">
                <Input
                  id="webhook_secret"
                  type={showSecret ? "text" : "password"}
                  value={settings.webhook_secret}
                  onChange={(e) => setSettings({ ...settings, webhook_secret: e.target.value })}
                  placeholder="Enter a secure random string"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to allow public access (not recommended for production)
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                const secret = crypto.randomUUID().replace(/-/g, '');
                setSettings({ ...settings, webhook_secret: secret });
                toast({
                  title: "Secret Generated",
                  description: "A new webhook secret has been generated. Don't forget to save!"
                });
              }}
            >
              <Shield className="mr-2 h-4 w-4" />
              Generate Random Secret
            </Button>
            <p className="text-xs text-muted-foreground">
              After saving, you'll need to add this secret as <code className="bg-muted px-1 rounded">EMAIL_WEBHOOK_SECRET</code> in your backend secrets.
            </p>
          </TabsContent>
          
          <TabsContent value="leads" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="lead_subject_template">Email Subject Template</Label>
              <Input
                id="lead_subject_template"
                value={settings.lead_subject_template}
                onChange={(e) => setSettings({ ...settings, lead_subject_template: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {"{{name}}, {{email}}, {{phone}}"}
              </p>
            </div>
            <div>
              <Label htmlFor="lead_body_template">Email Body Template</Label>
              <Textarea
                id="lead_body_template"
                value={settings.lead_body_template}
                onChange={(e) => setSettings({ ...settings, lead_body_template: e.target.value })}
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {"{{name}}, {{email}}, {{phone}}, {{message}}"}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="booking_subject_template">Email Subject Template</Label>
              <Input
                id="booking_subject_template"
                value={settings.booking_subject_template}
                onChange={(e) => setSettings({ ...settings, booking_subject_template: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {"{{property}}, {{guest_name}}"}
              </p>
            </div>
            <div>
              <Label htmlFor="booking_body_template">Email Body Template</Label>
              <Textarea
                id="booking_body_template"
                value={settings.booking_body_template}
                onChange={(e) => setSettings({ ...settings, booking_body_template: e.target.value })}
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {"{{property}}, {{guest_name}}, {{start_date}}, {{end_date}}, {{total_price}}"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Email Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailNotificationSettings;
