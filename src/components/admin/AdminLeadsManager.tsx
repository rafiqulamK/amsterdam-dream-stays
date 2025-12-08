import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
}

const AdminLeadsManager = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setLeads(data || []);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Lead status updated"
      });
      fetchLeads();
    }
  };

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <Card key={lead.id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{lead.name}</h3>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
              {lead.phone && <p className="text-sm text-muted-foreground">{lead.phone}</p>}
              <p className="mt-4">{lead.message}</p>
            </div>
            <div className="ml-4">
              <Select value={lead.status} onValueChange={(value) => updateStatus(lead.id, value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminLeadsManager;
