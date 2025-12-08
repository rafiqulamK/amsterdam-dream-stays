import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  properties: { title: string } | null;
}

const AdminBookingsManager = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, properties(title)')
      .order('created_at', { ascending: false });

    if (!error) {
      setBookings(data || []);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Booking ${status}`
      });
      fetchBookings();
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2">{booking.guest_name}</h3>
              <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
              <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>
              <p className="mt-2">Property: {booking.properties?.title}</p>
              <p className="text-sm">
                {format(new Date(booking.start_date), 'MMM dd, yyyy')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
              </p>
              <p className="text-lg font-semibold text-primary mt-2">€{booking.total_price}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                {booking.status}
              </Badge>
              {booking.status === 'pending' && (
                <Button size="sm" onClick={() => updateStatus(booking.id, 'confirmed')}>
                  Confirm
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminBookingsManager;
