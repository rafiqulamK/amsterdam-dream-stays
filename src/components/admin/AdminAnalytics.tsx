import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, TrendingUp, Users, DollarSign, Target, MapPin, Home } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import LeadSourceChart from './LeadSourceChart';
import LeadsOverTimeChart from './LeadsOverTimeChart';

interface PropertyStats {
  id: string;
  title: string;
  leadCount: number;
}

interface LocationStats {
  location: string;
  count: number;
}

const SOURCE_COLORS: Record<string, string> = {
  homepage: 'hsl(var(--chart-1))',
  property_detail: 'hsl(var(--chart-2))',
  tour_completion: 'hsl(var(--chart-3))',
  floating_cta: 'hsl(var(--chart-4))',
  exit_intent: 'hsl(var(--chart-5))',
  newsletter: 'hsl(var(--primary))',
  direct: 'hsl(var(--muted-foreground))',
};

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyBookings: 0,
    conversionRate: 0,
    avgBookingValue: 0,
    totalLeads: 0,
    newLeadsThisWeek: 0,
  });
  const [leadSources, setLeadSources] = useState<{ name: string; value: number; color: string }[]>([]);
  const [leadsOverTime, setLeadsOverTime] = useState<{ date: string; leads: number; converted: number }[]>([]);
  const [topProperties, setTopProperties] = useState<PropertyStats[]>([]);
  const [topLocations, setTopLocations] = useState<LocationStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    // Fetch bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_price, created_at');

    // Fetch leads with all details
    const { data: leads } = await supabase
      .from('leads')
      .select('id, status, source, created_at, desired_location, property_id');

    // Fetch properties for lead counts
    const { data: properties } = await supabase
      .from('properties')
      .select('id, title');

    if (bookings && leads) {
      const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price.toString()), 0);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyBookings = bookings.filter(b => new Date(b.created_at || '') >= thisMonth).length;
      const converted = leads.filter(l => l.status === 'converted').length;
      const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0;
      const avgBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;
      
      // New leads this week
      const weekAgo = subDays(new Date(), 7);
      const newLeadsThisWeek = leads.filter(l => new Date(l.created_at || '') >= weekAgo).length;

      setAnalytics({
        totalRevenue,
        monthlyBookings,
        conversionRate,
        avgBookingValue,
        totalLeads: leads.length,
        newLeadsThisWeek,
      });

      // Calculate lead sources
      const sourceMap: Record<string, number> = {};
      leads.forEach(lead => {
        const source = lead.source || 'direct';
        sourceMap[source] = (sourceMap[source] || 0) + 1;
      });
      
      const sourceData = Object.entries(sourceMap).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: SOURCE_COLORS[name] || 'hsl(var(--muted-foreground))',
      }));
      setLeadSources(sourceData);

      // Calculate leads over time (last 14 days)
      const last14Days = eachDayOfInterval({
        start: subDays(new Date(), 13),
        end: new Date(),
      });

      const timeData = last14Days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayLeads = leads.filter(l => {
          const leadDate = new Date(l.created_at || '');
          return leadDate >= dayStart && leadDate < dayEnd;
        });

        return {
          date: format(day, 'MMM d'),
          leads: dayLeads.length,
          converted: dayLeads.filter(l => l.status === 'converted').length,
        };
      });
      setLeadsOverTime(timeData);

      // Calculate top properties by lead count
      if (properties) {
        const propertyLeadCounts: Record<string, number> = {};
        leads.forEach(lead => {
          if (lead.property_id) {
            propertyLeadCounts[lead.property_id] = (propertyLeadCounts[lead.property_id] || 0) + 1;
          }
        });

        const propertyStats = properties
          .map(p => ({
            id: p.id,
            title: p.title,
            leadCount: propertyLeadCounts[p.id] || 0,
          }))
          .filter(p => p.leadCount > 0)
          .sort((a, b) => b.leadCount - a.leadCount)
          .slice(0, 5);
        
        setTopProperties(propertyStats);
      }

      // Calculate top locations
      const locationMap: Record<string, number> = {};
      leads.forEach(lead => {
        if (lead.desired_location) {
          locationMap[lead.desired_location] = (locationMap[lead.desired_location] || 0) + 1;
        }
      });

      const locationStats = Object.entries(locationMap)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopLocations(locationStats);
    }
    
    setLoading(false);
  };

  const exportReport = () => {
    const report = `
Analytics Report - ${new Date().toLocaleDateString()}
=====================================
Total Revenue: €${analytics.totalRevenue.toFixed(2)}
Monthly Bookings: ${analytics.monthlyBookings}
Conversion Rate: ${analytics.conversionRate.toFixed(2)}%
Average Booking Value: €${analytics.avgBookingValue.toFixed(2)}
Total Leads: ${analytics.totalLeads}
New Leads This Week: ${analytics.newLeadsThisWeek}

Lead Sources:
${leadSources.map(s => `  - ${s.name}: ${s.value}`).join('\n')}

Top Locations:
${topLocations.map(l => `  - ${l.location}: ${l.count} leads`).join('\n')}

Top Properties:
${topProperties.map(p => `  - ${p.title}: ${p.leadCount} leads`).join('\n')}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
        <Button onClick={exportReport} className="gap-2">
          <Download className="h-4 w-4" aria-hidden="true" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" aria-hidden="true" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">€{analytics.totalRevenue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Home className="w-3 h-3" aria-hidden="true" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.monthlyBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" aria-hidden="true" />
              Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" aria-hidden="true" />
              Avg Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">€{analytics.avgBookingValue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" aria-hidden="true" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analytics.newLeadsThisWeek}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Lead Trends</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads Over Time (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadsOverTimeChart data={leadsOverTime} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadSourceChart data={leadSources} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" aria-hidden="true" />
                  Top Properties by Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topProperties.length > 0 ? (
                  <div className="space-y-3">
                    {topProperties.map((property, idx) => (
                      <div key={property.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-5">
                            #{idx + 1}
                          </span>
                          <span className="text-sm text-foreground truncate max-w-[200px]">
                            {property.title}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {property.leadCount} leads
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No property leads yet</p>
                )}
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                  Top Desired Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topLocations.length > 0 ? (
                  <div className="space-y-3">
                    {topLocations.map((location, idx) => (
                      <div key={location.location} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-5">
                            #{idx + 1}
                          </span>
                          <span className="text-sm text-foreground">
                            {location.location}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {location.count} leads
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No location data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
