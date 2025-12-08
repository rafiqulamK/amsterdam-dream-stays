import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface SectionVisibility {
  show_hero: boolean;
  show_featured_properties: boolean;
  show_search_section: boolean;
  show_testimonials: boolean;
  show_newsletter: boolean;
  show_contact_section: boolean;
  show_footer_address: boolean;
}

const defaultVisibility: SectionVisibility = {
  show_hero: true,
  show_featured_properties: true,
  show_search_section: true,
  show_testimonials: true,
  show_newsletter: true,
  show_contact_section: true,
  show_footer_address: true
};

const sectionLabels: Record<keyof SectionVisibility, string> = {
  show_hero: 'Hero Section',
  show_featured_properties: 'Featured Properties',
  show_search_section: 'Search Section',
  show_testimonials: 'Testimonials',
  show_newsletter: 'Newsletter Signup',
  show_contact_section: 'Contact Section',
  show_footer_address: 'Footer Address'
};

const SectionVisibilityManager = () => {
  const [visibility, setVisibility] = useState<SectionVisibility>(defaultVisibility);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisibility();
  }, []);

  const fetchVisibility = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'section_visibility')
      .single();

    if (data?.setting_value) {
      const value = data.setting_value as unknown as { value: SectionVisibility };
      if (value?.value) {
        setVisibility({ ...defaultVisibility, ...value.value });
      }
    }
  };

  const handleToggle = (key: keyof SectionVisibility) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert([{
        setting_key: 'section_visibility',
        setting_value: { value: visibility } as unknown as Json,
        updated_at: new Date().toISOString()
      }], { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save visibility settings",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Section visibility updated"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          Section Visibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Toggle which sections appear on the homepage.
        </p>
        <div className="space-y-4">
          {(Object.keys(sectionLabels) as Array<keyof SectionVisibility>).map(key => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {visibility[key] ? (
                  <Eye className="h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor={key} className="cursor-pointer">
                  {sectionLabels[key]}
                </Label>
              </div>
              <Switch
                id={key}
                checked={visibility[key]}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Visibility Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SectionVisibilityManager;
