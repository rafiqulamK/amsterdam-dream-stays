import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupResult {
  table: string;
  recordCount: number;
  data?: any[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action } = await req.json();

    if (action === 'export') {
      console.log('Starting database backup export...');
      
      const tables = ['properties', 'leads', 'bookings', 'pages', 'site_settings', 'media_library', 'profiles'];
      const backupData: BackupResult[] = [];

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        
        if (error) {
          console.error(`Error backing up ${table}:`, error);
          backupData.push({ table, recordCount: 0 });
        } else {
          backupData.push({ table, recordCount: data?.length || 0, data });
          console.log(`Backed up ${table}: ${data?.length || 0} records`);
        }
      }

      // Get storage bucket info
      const { data: brandingFiles } = await supabase.storage.from('branding').list();
      const { data: mediaFiles } = await supabase.storage.from('media').list();

      const backup = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        tables: backupData,
        storage: {
          branding: brandingFiles?.length || 0,
          media: mediaFiles?.length || 0,
        }
      };

      console.log('Backup export completed successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          backup,
          downloadable: true,
          message: 'Backup created successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'restore') {
      const { backupData } = await req.json();
      
      if (!backupData || !backupData.tables) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid backup data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Starting database restore...');
      const results: { table: string; success: boolean; error?: string }[] = [];

      for (const tableBackup of backupData.tables) {
        if (!tableBackup.data || tableBackup.data.length === 0) {
          results.push({ table: tableBackup.table, success: true });
          continue;
        }

        // Upsert data to preserve existing records
        const { error } = await supabase
          .from(tableBackup.table)
          .upsert(tableBackup.data, { onConflict: 'id' });

        if (error) {
          console.error(`Error restoring ${tableBackup.table}:`, error);
          results.push({ table: tableBackup.table, success: false, error: error.message });
        } else {
          console.log(`Restored ${tableBackup.table}: ${tableBackup.data.length} records`);
          results.push({ table: tableBackup.table, success: true });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          results,
          message: 'Restore completed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'status') {
      // Get table counts for backup status
      const tables = ['properties', 'leads', 'bookings', 'pages', 'site_settings', 'media_library'];
      const counts: { table: string; count: number }[] = [];

      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        counts.push({ table, count: count || 0 });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: {
            lastCheck: new Date().toISOString(),
            tables: counts,
            healthy: true
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Backup system error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
