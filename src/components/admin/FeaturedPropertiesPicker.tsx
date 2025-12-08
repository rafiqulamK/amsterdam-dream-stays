import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Save, Star, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
  images: string[];
}

const FeaturedPropertiesPicker = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [propertiesRes, settingsRes] = await Promise.all([
      supabase.from('properties').select('id, title, city, price, status, images').eq('status', 'approved'),
      supabase.from('site_settings').select('setting_value').eq('setting_key', 'featured_properties').single()
    ]);

    if (propertiesRes.data) {
      setProperties(propertiesRes.data);
    }

    if (settingsRes.data) {
      const value = settingsRes.data.setting_value as { value: string[] };
      setFeaturedIds(value.value || []);
    }
  };

  const toggleFeatured = (id: string) => {
    setFeaturedIds(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'featured_properties',
        setting_value: { value: featuredIds },
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save featured properties",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `${featuredIds.length} properties marked as featured`
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Featured Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Select properties to feature on the homepage. Featured properties appear first.
        </p>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {properties.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved properties available</p>
          ) : (
            properties.map(property => (
              <div 
                key={property.id} 
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  featuredIds.includes(property.id) ? 'bg-primary/10 border-primary' : 'bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={featuredIds.includes(property.id)}
                  onCheckedChange={() => toggleFeatured(property.id)}
                />
                <div className="h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  {property.images?.[0] ? (
                    <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{property.title}</p>
                  <p className="text-sm text-muted-foreground">{property.city} • €{property.price}/mo</p>
                </div>
                {featuredIds.includes(property.id) && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Featured Properties ({featuredIds.length})
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeaturedPropertiesPicker;
