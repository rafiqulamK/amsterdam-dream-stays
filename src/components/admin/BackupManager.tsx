import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileJson,
  Calendar
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BackupStatus {
  lastCheck: string;
  tables: { table: string; count: number }[];
  healthy: boolean;
}

const BackupManager = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const { toast } = useToast();

  const checkStatus = async () => {
    setLoading('status');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to manage backups.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('backup-system', {
        body: { action: 'status' },
      });

      if (error) throw error;

      if (data.success) {
        setStatus(data.status);
        toast({
          title: 'Status Retrieved',
          description: 'Database status checked successfully.',
        });
      }
    } catch (error: any) {
      console.error('Status check error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to check status.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const createBackup = async () => {
    setLoading('export');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to create backups.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('backup-system', {
        body: { action: 'export' },
      });

      if (error) throw error;

      if (data.success && data.backup) {
        // Create downloadable file
        const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hause-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setLastBackup(data.backup.timestamp);
        toast({
          title: 'Backup Created',
          description: 'Database backup downloaded successfully.',
        });
      }
    } catch (error: any) {
      console.error('Backup error:', error);
      toast({
        title: 'Backup Failed',
        description: error.message || 'Failed to create backup.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading('restore');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to restore backups.',
          variant: 'destructive',
        });
        return;
      }

      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);

      const { data, error } = await supabase.functions.invoke('backup-system', {
        body: { action: 'restore', backupData },
      });

      if (error) throw error;

      if (data.success) {
        const successCount = data.results.filter((r: any) => r.success).length;
        toast({
          title: 'Restore Complete',
          description: `Successfully restored ${successCount}/${data.results.length} tables.`,
        });
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      toast({
        title: 'Restore Failed',
        description: error.message || 'Failed to restore backup.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Backup & Restore</h2>
        <p className="text-muted-foreground">Manage your database backups and restore data.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Create Backup
            </CardTitle>
            <CardDescription>
              Export all database tables to a JSON file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={createBackup} 
              disabled={loading === 'export'}
              className="w-full"
            >
              {loading === 'export' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <FileJson className="w-4 h-4 mr-2" />
                  Download Backup
                </>
              )}
            </Button>
            
            {lastBackup && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Last backup: {new Date(lastBackup).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Restore Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Restore Backup
            </CardTitle>
            <CardDescription>
              Import data from a previous backup file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Restoring will merge with existing data. This cannot be undone.
              </AlertDescription>
            </Alert>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={loading === 'restore'}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                variant="outline" 
                disabled={loading === 'restore'}
                className="w-full"
              >
                {loading === 'restore' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Backup File
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Database Status
              </CardTitle>
              <CardDescription>
                Current state of your database tables.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkStatus}
              disabled={loading === 'status'}
            >
              {loading === 'status' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {status.healthy ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-medium">
                  {status.healthy ? 'All systems healthy' : 'Issues detected'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {status.tables.map((table) => (
                  <div 
                    key={table.table}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">{table.table}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary mt-1">{table.count}</p>
                    <p className="text-xs text-muted-foreground">records</p>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Last checked: {new Date(status.lastCheck).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Click refresh to check database status</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManager;
