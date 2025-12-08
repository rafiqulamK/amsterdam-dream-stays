import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Search, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Json } from '@/integrations/supabase/types';

interface SEOSettings {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  canonical_url: string;
}

const defaultSEO: SEOSettings = {
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_title: '',
  og_description: '',
  og_image: '',
  twitter_card: 'summary_large_image',
  canonical_url: ''
};

const SEOSettingsEditor = () => {
  const [seo, setSeo] = useState<SEOSettings>(defaultSEO);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSEO();
  }, []);

  const fetchSEO = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'seo_settings')
      .single();

    if (data?.setting_value) {
      const value = data.setting_value as unknown as { value: SEOSettings };
      if (value?.value) {
        setSeo({ ...defaultSEO, ...value.value });
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert([{
        setting_key: 'seo_settings',
        setting_value: { value: seo } as unknown as Json,
        updated_at: new Date().toISOString()
      }], { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save SEO settings",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "SEO settings saved successfully"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic SEO</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={seo.meta_title}
                onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })}
                placeholder="Haus.online - Premium Amsterdam Rentals"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {seo.meta_title.length}/60 characters
              </p>
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={seo.meta_description}
                onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
                placeholder="Find your perfect rental property in Amsterdam..."
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {seo.meta_description.length}/160 characters
              </p>
            </div>
            <div>
              <Label htmlFor="meta_keywords">Keywords</Label>
              <Input
                id="meta_keywords"
                value={seo.meta_keywords}
                onChange={(e) => setSeo({ ...seo, meta_keywords: e.target.value })}
                placeholder="amsterdam rentals, apartments, housing"
              />
            </div>
            <div>
              <Label htmlFor="canonical_url">Canonical URL</Label>
              <Input
                id="canonical_url"
                value={seo.canonical_url}
                onChange={(e) => setSeo({ ...seo, canonical_url: e.target.value })}
                placeholder="https://haus.online"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">Open Graph / Social Sharing</span>
            </div>
            <div>
              <Label htmlFor="og_title">OG Title</Label>
              <Input
                id="og_title"
                value={seo.og_title}
                onChange={(e) => setSeo({ ...seo, og_title: e.target.value })}
                placeholder="Haus.online - Find Your Home"
              />
            </div>
            <div>
              <Label htmlFor="og_description">OG Description</Label>
              <Textarea
                id="og_description"
                value={seo.og_description}
                onChange={(e) => setSeo({ ...seo, og_description: e.target.value })}
                placeholder="Premium rental properties in Amsterdam"
              />
            </div>
            <div>
              <Label htmlFor="og_image">OG Image URL</Label>
              <Input
                id="og_image"
                value={seo.og_image}
                onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
                placeholder="https://haus.online/og-image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="twitter_card">Twitter Card Type</Label>
              <Input
                id="twitter_card"
                value={seo.twitter_card}
                onChange={(e) => setSeo({ ...seo, twitter_card: e.target.value })}
                placeholder="summary_large_image"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save SEO Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SEOSettingsEditor;
