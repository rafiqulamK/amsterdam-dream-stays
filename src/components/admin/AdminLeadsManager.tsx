import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Download, Search, Eye, Mail, Phone, MapPin, Calendar, Filter } from 'lucide-react';
import LeadDetailModal from './LeadDetailModal';

interface Lead {
  id: string;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  message: string;
  status: string;
  source?: string | null;
  desired_location?: string | null;
  price_range?: string | null;
  bedroom_preference?: string | null;
  property_type_preference?: string | null;
  people_count?: number | null;
  employment_status?: string | null;
  has_pets?: boolean | null;
  desired_move_date?: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  converted: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const AdminLeadsManager = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchQuery, statusFilter, sourceFilter]);

  const fetchLeads = async () => {
    try {
      const data = await apiClient.getLeads() as any[];
      setLeads(data.map((l: any) => ({
        ...l,
        id: l.id?.toString(),
      })));
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
    setLoading(false);
  };

  const filterLeads = () => {
    let filtered = [...leads];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.desired_location?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    setFilteredLeads(filtered);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.updateLead(id, { status });
      toast({
        title: "Success",
        description: "Lead status updated"
      });
      fetchLeads();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive"
      });
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Source', 'Location', 'Budget', 'Bedrooms', 'Move Date', 'Created'];
    const rows = filteredLeads.map(lead => [
      lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : lead.name,
      lead.email,
      lead.phone || '',
      lead.status,
      lead.source || '',
      lead.desired_location || '',
      lead.price_range || '',
      lead.bedroom_preference || '',
      lead.desired_move_date || '',
      format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const uniqueSources = [...new Set(leads.map(l => l.source).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-32 ml-4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by name, email, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {uniqueSources.map(source => (
              <SelectItem key={source} value={source || 'direct'}>
                {(source || 'direct').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>

      {/* Leads list */}
      {filteredLeads.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No leads found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Lead Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {lead.first_name && lead.last_name 
                        ? `${lead.first_name} ${lead.last_name}` 
                        : lead.name}
                    </h3>
                    <Badge className={statusColors[lead.status] || statusColors.new}>
                      {lead.status}
                    </Badge>
                    {lead.source && (
                      <Badge variant="outline" className="text-xs">
                        {lead.source.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" aria-hidden="true" />
                      {lead.email}
                    </span>
                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" aria-hidden="true" />
                        {lead.phone}
                      </span>
                    )}
                    {lead.desired_location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {lead.desired_location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {/* Quick preferences */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {lead.price_range && (
                      <Badge variant="secondary" className="text-xs">
                        {lead.price_range}
                      </Badge>
                    )}
                    {lead.bedroom_preference && (
                      <Badge variant="secondary" className="text-xs">
                        {lead.bedroom_preference} BR
                      </Badge>
                    )}
                    {lead.property_type_preference && (
                      <Badge variant="secondary" className="text-xs">
                        {lead.property_type_preference}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsModalOpen(true);
                    }}
                    className="gap-1"
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    View
                  </Button>
                  
                  <Select value={lead.status} onValueChange={(value) => updateStatus(lead.id, value)}>
                    <SelectTrigger className="w-[130px]">
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
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal 
        lead={selectedLead} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
};

export default AdminLeadsManager;
