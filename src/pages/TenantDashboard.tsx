import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';
import Header from '@/components/Header';
import TenantPropertiesList from '@/components/tenant/TenantPropertiesList';
import TenantPropertyForm from '@/components/tenant/TenantPropertyForm';

const TenantDashboard = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Tenant Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your property listings</p>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="add">Add New Property</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <TenantPropertiesList />
          </TabsContent>

          <TabsContent value="add">
            <TenantPropertyForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TenantDashboard;
