import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Trash2, Sun, Moon } from 'lucide-react';

const BrandingSettingsEditor = () => {
  const [lightModeLogo, setLightModeLogo] = useState<string | null>(null);
  const [darkModeLogo, setDarkModeLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'branding')
      .maybeSingle();

    if (!error && data?.setting_value) {
      const value = data.setting_value as { lightModeLogo?: string; darkModeLogo?: string };
      setLightModeLogo(value.lightModeLogo || null);
      setDarkModeLogo(value.darkModeLogo || null);
    }
    setIsLoading(false);
  };

  const uploadLogo = async (file: File, type: 'light' | 'dark') => {
    const isLight = type === 'light';
    isLight ? setUploadingLight(true) : setUploadingDark(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(fileName);

      const newLight = isLight ? publicUrl : lightModeLogo;
      const newDark = isLight ? darkModeLogo : publicUrl;

      await saveSettings(newLight, newDark);
      
      if (isLight) {
        setLightModeLogo(publicUrl);
      } else {
        setDarkModeLogo(publicUrl);
      }
      
      toast.success(`${isLight ? 'Light' : 'Dark'} mode logo uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      isLight ? setUploadingLight(false) : setUploadingDark(false);
    }
  };

  const removeLogo = async (type: 'light' | 'dark') => {
    const isLight = type === 'light';
    const newLight = isLight ? null : lightModeLogo;
    const newDark = isLight ? darkModeLogo : null;

    await saveSettings(newLight, newDark);
    
    if (isLight) {
      setLightModeLogo(null);
    } else {
      setDarkModeLogo(null);
    }
    
    toast.success(`${type === 'light' ? 'Light' : 'Dark'} mode logo removed`);
  };

  const saveSettings = async (newLight: string | null, newDark: string | null) => {
    try {
      const settingsValue = {
        lightModeLogo: newLight,
        darkModeLogo: newDark,
      };

      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'branding')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('site_settings')
          .update({ setting_value: settingsValue })
          .eq('setting_key', 'branding');
      } else {
        await supabase
          .from('site_settings')
          .insert([{ setting_key: 'branding', setting_value: settingsValue }]);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark') => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo(file, type);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branding Settings</CardTitle>
          <CardDescription>
            Upload your logo for light and dark modes. The logo should include your brand name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Light Mode Logo */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light Mode Logo
            </Label>
            <div className="flex items-center gap-4">
              <div className="w-48 h-16 border rounded-lg flex items-center justify-center bg-white">
                {lightModeLogo ? (
                  <img
                    src={lightModeLogo}
                    alt="Light mode logo"
                    className="max-h-14 max-w-44 object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-900">Hause</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingLight}
                  asChild
                >
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingLight ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'light')}
                    />
                  </label>
                </Button>
                {lightModeLogo && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeLogo('light')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Dark Mode Logo */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark Mode Logo
            </Label>
            <div className="flex items-center gap-4">
              <div className="w-48 h-16 border rounded-lg flex items-center justify-center bg-gray-900">
                {darkModeLogo ? (
                  <img
                    src={darkModeLogo}
                    alt="Dark mode logo"
                    className="max-h-14 max-w-44 object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">Hause</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingDark}
                  asChild
                >
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingDark ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'dark')}
                    />
                  </label>
                </Button>
                {darkModeLogo && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeLogo('dark')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Tip: For best results, use PNG or SVG logos with transparent backgrounds.
            Recommended size: 200x60 pixels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingSettingsEditor;
