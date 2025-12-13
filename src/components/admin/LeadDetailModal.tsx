import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Calendar, Bed, Users, Briefcase, Home, DollarSign, MessageSquare } from 'lucide-react';

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

interface LeadDetailModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  converted: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const LeadDetailModal = ({ lead, open, onOpenChange }: LeadDetailModalProps) => {
  if (!lead) return null;

  const displayName = lead.first_name && lead.last_name 
    ? `${lead.first_name} ${lead.last_name}` 
    : lead.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{displayName}</span>
            <Badge className={statusColors[lead.status] || statusColors.new}>
              {lead.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Preferences</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {lead.desired_location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground">{lead.desired_location}</span>
                </div>
              )}
              {lead.price_range && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="text-foreground">{lead.price_range}</span>
                </div>
              )}
              {lead.bedroom_preference && (
                <div className="flex items-center gap-2 text-sm">
                  <Bed className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Bedrooms:</span>
                  <span className="text-foreground">{lead.bedroom_preference}</span>
                </div>
              )}
              {lead.property_type_preference && (
                <div className="flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground">{lead.property_type_preference}</span>
                </div>
              )}
              {lead.people_count && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">People:</span>
                  <span className="text-foreground">{lead.people_count}</span>
                </div>
              )}
              {lead.employment_status && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Employment:</span>
                  <span className="text-foreground">{lead.employment_status}</span>
                </div>
              )}
              {lead.desired_move_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Move Date:</span>
                  <span className="text-foreground">
                    {format(new Date(lead.desired_move_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {lead.has_pets !== null && lead.has_pets !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Has Pets:</span>
                  <Badge variant={lead.has_pets ? 'default' : 'outline'}>
                    {lead.has_pets ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              Message
            </h3>
            <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
              {lead.message || 'No message provided'}
            </p>
          </div>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
            <div className="flex items-center gap-4">
              {lead.source && (
                <span>Source: <Badge variant="outline" className="ml-1">{lead.source}</Badge></span>
              )}
            </div>
            <span>
              Received: {format(new Date(lead.created_at), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailModal;
