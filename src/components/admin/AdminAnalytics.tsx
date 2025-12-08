import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyBookings: 0,
    conversionRate: 0,
    avgBookingValue: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_price, created_at');

    const { data: leads } = await supabase
      .from('leads')
      .select('id, status');

    if (bookings && leads) {
      const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price.toString()), 0);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyBookings = bookings.filter(b => new Date(b.created_at) >= thisMonth).length;
      const converted = leads.filter(l => l.status === 'converted').length;
      const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0;
      const avgBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

      setAnalytics({
        totalRevenue,
        monthlyBookings,
        conversionRate,
        avgBookingValue
      });
    }
  };

  const exportReport = () => {
    const report = `
Analytics Report - ${new Date().toLocaleDateString()}
=====================================
Total Revenue: €${analytics.totalRevenue.toFixed(2)}
Monthly Bookings: ${analytics.monthlyBookings}
Conversion Rate: ${analytics.conversionRate.toFixed(2)}%
Average Booking Value: €${analytics.avgBookingValue.toFixed(2)}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <Button onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">€{analytics.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{analytics.monthlyBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{analytics.conversionRate.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">€{analytics.avgBookingValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
