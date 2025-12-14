import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  property_title?: string;
}

const AdminBookingsManager = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await apiClient.getBookings() as any[];
      setBookings(data.map((b: any) => ({
        ...b,
        id: b.id?.toString(),
      })));
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.updateBooking(id, { status });
      toast({
        title: "Success",
        description: `Booking ${status}`
      });
      fetchBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-56 mt-2" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24 mt-2" />
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No bookings found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2">{booking.guest_name}</h3>
              <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
              <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>
              {booking.property_title && (
                <p className="mt-2">Property: {booking.property_title}</p>
              )}
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
