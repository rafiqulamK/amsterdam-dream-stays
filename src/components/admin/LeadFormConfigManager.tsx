import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, FormInput, GripVertical, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface FormField {
  key: string;
  label: string;
  placeholder: string;
  enabled: boolean;
  required: boolean;
  order: number;
}

interface LeadFormConfig {
  form_title: string;
  form_description: string;
  submit_button_text: string;
  success_message: string;
  fields: FormField[];
}

const defaultFields: FormField[] = [
  { key: 'firstName', label: 'First Name', placeholder: 'John', enabled: true, required: true, order: 1 },
  { key: 'lastName', label: 'Last Name', placeholder: 'Doe', enabled: true, required: true, order: 2 },
  { key: 'email', label: 'Email', placeholder: 'john@example.com', enabled: true, required: true, order: 3 },
  { key: 'phone', label: 'Phone Number', placeholder: '+31 6 12345678', enabled: true, required: true, order: 4 },
  { key: 'desiredMoveDate', label: 'Desired Move Date', placeholder: '', enabled: true, required: true, order: 5 },
  { key: 'hasCriminalHistory', label: 'Criminal History', placeholder: '', enabled: true, required: true, order: 6 },
  { key: 'peopleCount', label: 'Number of People', placeholder: '2', enabled: true, required: true, order: 7 },
  { key: 'desiredLocation', label: 'Desired Location', placeholder: 'Amsterdam', enabled: true, required: true, order: 8 },
  { key: 'priceRange', label: 'Price Range', placeholder: '', enabled: true, required: true, order: 9 },
  { key: 'propertyTypePreference', label: 'Property Type', placeholder: '', enabled: true, required: true, order: 10 },
  { key: 'bedroomPreference', label: 'Bedroom Preference', placeholder: '', enabled: true, required: true, order: 11 },
  { key: 'hasPets', label: 'Has Pets', placeholder: '', enabled: true, required: true, order: 12 },
  { key: 'employmentStatus', label: 'Employment Status', placeholder: '', enabled: true, required: true, order: 13 }
];

const defaultConfig: LeadFormConfig = {
  form_title: "I'm Interested",
  form_description: 'Fill out this form to apply for this property',
  submit_button_text: 'Submit Application',
  success_message: 'Your application has been submitted. We\'ll be in touch soon!',
  fields: defaultFields
};

const LeadFormConfigManager = () => {
  const [config, setConfig] = useState<LeadFormConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'lead_form_config')
      .single();

    if (data?.setting_value) {
      const value = data.setting_value as unknown as { value: LeadFormConfig };
      if (value?.value) {
        setConfig({ ...defaultConfig, ...value.value, fields: value.value.fields || defaultFields });
      }
    }
  };

  const handleFieldToggle = (fieldKey: string, property: 'enabled' | 'required', value: boolean) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.key === fieldKey ? { ...f, [property]: value } : f
      )
    }));
  };

  const handleFieldLabelChange = (fieldKey: string, label: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.key === fieldKey ? { ...f, label } : f
      )
    }));
  };

  const toggleAllRequired = (required: boolean) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.enabled ? { ...f, required } : f
      )
    }));
  };

  const toggleAllEnabled = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => ({ ...f, enabled }))
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert([{
        setting_key: 'lead_form_config',
        setting_value: { value: config } as unknown as Json,
        updated_at: new Date().toISOString()
      }], { onConflict: 'setting_key' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save lead form configuration",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Lead form configuration saved successfully"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FormInput className="h-5 w-5" />
          Lead Form Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Form Settings</h4>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="form_title">Form Title</Label>
              <Input
                id="form_title"
                value={config.form_title}
                onChange={(e) => setConfig({ ...config, form_title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="form_description">Form Description</Label>
              <Input
                id="form_description"
                value={config.form_description}
                onChange={(e) => setConfig({ ...config, form_description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="submit_button_text">Submit Button Text</Label>
                <Input
                  id="submit_button_text"
                  value={config.submit_button_text}
                  onChange={(e) => setConfig({ ...config, submit_button_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="success_message">Success Message</Label>
                <Input
                  id="success_message"
                  value={config.success_message}
                  onChange={(e) => setConfig({ ...config, success_message: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Form Fields</h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllRequired(true)}
                className="text-xs"
              >
                <ToggleRight className="h-3 w-3 mr-1" />
                All Required
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllRequired(false)}
                className="text-xs"
              >
                <ToggleLeft className="h-3 w-3 mr-1" />
                All Optional
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllEnabled(true)}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Show All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllEnabled(false)}
                className="text-xs"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Hide All
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Toggle fields on/off and customize their labels. Drag to reorder.
          </p>
          
          <div className="space-y-3">
            {config.fields.sort((a, b) => a.order - b.order).map((field) => (
              <div 
                key={field.key} 
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  field.enabled ? 'bg-background border-border' : 'bg-muted/30 border-muted'
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                
                <div className="flex-1">
                  <Input
                    value={field.label}
                    onChange={(e) => handleFieldLabelChange(field.key, e.target.value)}
                    className="h-8 text-sm"
                    disabled={!field.enabled}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${field.key}-required`} className="text-xs text-muted-foreground">
                      Required
                    </Label>
                    <Switch
                      id={`${field.key}-required`}
                      checked={field.required}
                      onCheckedChange={(checked) => handleFieldToggle(field.key, 'required', checked)}
                      disabled={!field.enabled}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {field.enabled ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={field.enabled}
                      onCheckedChange={(checked) => handleFieldToggle(field.key, 'enabled', checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Form Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeadFormConfigManager;
