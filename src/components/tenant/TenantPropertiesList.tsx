import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
  bedrooms: number;
  bathrooms: number;
}

const TenantPropertiesList = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setProperties(data);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{property.title}</h3>
            <Badge variant={property.status === 'approved' ? 'default' : property.status === 'pending' ? 'secondary' : 'destructive'}>
              {property.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mb-2">{property.city}</p>
          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
            <span>{property.bedrooms} beds</span>
            <span>{property.bathrooms} baths</span>
          </div>
          <p className="text-2xl font-bold text-primary">€{property.price}/month</p>
        </Card>
      ))}
      {properties.length === 0 && (
        <p className="text-muted-foreground col-span-2">No properties yet. Add your first property!</p>
      )}
    </div>
  );
};

export default TenantPropertiesList;
