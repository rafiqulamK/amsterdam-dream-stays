import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Property } from "@/types/property";
import { useAuth } from "@/contexts/AuthContext";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

interface FieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  enabled: boolean;
  required: boolean;
}

interface FormConfig {
  fields: FieldConfig[];
}

const defaultFormConfig: FormConfig = {
  fields: [
    { key: "firstName", label: "First Name", placeholder: "John", enabled: true, required: true },
    { key: "lastName", label: "Last Name", placeholder: "Doe", enabled: true, required: true },
    { key: "email", label: "Email", placeholder: "john@example.com", enabled: true, required: true },
    { key: "phone", label: "Phone Number", placeholder: "+31 6 12345678", enabled: true, required: true },
    { key: "desiredMoveDate", label: "What is your desired move date?", enabled: true, required: true },
    { key: "hasCriminalHistory", label: "Do you have any criminal history?", enabled: true, required: true },
    { key: "peopleCount", label: "How many people will move in?", placeholder: "2", enabled: true, required: true },
    { key: "desiredLocation", label: "What is your desired location?", placeholder: "Amsterdam, Rotterdam...", enabled: true, required: true },
    { key: "priceRange", label: "What is your price range?", enabled: true, required: true },
    { key: "propertyTypePreference", label: "What type of property are you looking for?", enabled: true, required: true },
    { key: "bedroomPreference", label: "How many bedrooms?", enabled: true, required: true },
    { key: "hasPets", label: "Do you have any pets?", enabled: true, required: true },
    { key: "employmentStatus", label: "Are you self-employed or do you work for someone else?", enabled: true, required: true },
  ],
};

// Create dynamic schema based on config
const createLeadSchema = (config: FormConfig) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  
  config.fields.forEach(field => {
    if (!field.enabled) return;
    
    switch (field.key) {
      case "firstName":
      case "lastName":
        schemaFields[field.key] = field.required 
          ? z.string().min(1, `${field.label} is required`).max(50)
          : z.string().max(50).optional();
        break;
      case "email":
        schemaFields[field.key] = field.required
          ? z.string().email("Invalid email address").max(255)
          : z.string().email("Invalid email address").max(255).optional().or(z.literal(""));
        break;
      case "phone":
        schemaFields[field.key] = field.required
          ? z.string().min(5, "Phone number is required").max(20)
          : z.string().max(20).optional();
        break;
      case "desiredMoveDate":
        schemaFields[field.key] = field.required
          ? z.string().min(1, "Move date is required")
          : z.string().optional();
        break;
      case "hasCriminalHistory":
      case "hasPets":
        schemaFields[field.key] = field.required
          ? z.enum(["yes", "no"])
          : z.enum(["yes", "no"]).optional();
        break;
      case "peopleCount":
        schemaFields[field.key] = field.required
          ? z.string().min(1, "This field is required")
          : z.string().optional();
        break;
      case "desiredLocation":
        schemaFields[field.key] = field.required
          ? z.string().min(1, "Location is required").max(100)
          : z.string().max(100).optional();
        break;
      case "priceRange":
        schemaFields[field.key] = field.required
          ? z.enum(["400-700", "700-1000", "1100-1600", "1600-3000", "other"])
          : z.enum(["400-700", "700-1000", "1100-1600", "1600-3000", "other"]).optional();
        break;
      case "propertyTypePreference":
        schemaFields[field.key] = field.required
          ? z.enum(["single-room", "condo", "studio", "couple-room", "big-apartment"])
          : z.enum(["single-room", "condo", "studio", "couple-room", "big-apartment"]).optional();
        break;
      case "bedroomPreference":
        schemaFields[field.key] = field.required
          ? z.enum(["1", "2", "3-4", "other"])
          : z.enum(["1", "2", "3-4", "other"]).optional();
        break;
      case "employmentStatus":
        schemaFields[field.key] = field.required
          ? z.enum(["self-employed", "employed"])
          : z.enum(["self-employed", "employed"]).optional();
        break;
    }
  });
  
  return z.object(schemaFields);
};

interface LeadQuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
}

const LeadQuestionnaireDialog = ({ open, onOpenChange, property }: LeadQuestionnaireDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formConfig, setFormConfig] = useState<FormConfig>(defaultFormConfig);
  const { user } = useAuth();
  const { trackEvent } = useFacebookPixel();

  useEffect(() => {
    const fetchFormConfig = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'lead_form_config')
        .maybeSingle();

      if (data?.setting_value) {
        const value = data.setting_value as unknown as { value: FormConfig };
        if (value?.value?.fields) {
          setFormConfig(value.value);
        }
      }
    };

    fetchFormConfig();
  }, []);

  const leadSchema = createLeadSchema(formConfig);
  type LeadFormData = z.infer<typeof leadSchema>;

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      desiredMoveDate: "",
      hasCriminalHistory: "no",
      peopleCount: "",
      desiredLocation: property.city || "",
      priceRange: "1100-1600",
      propertyTypePreference: "studio",
      bedroomPreference: "1",
      hasPets: "no",
      employmentStatus: "employed",
    },
  });

  const getFieldConfig = (key: string): FieldConfig | undefined => {
    return formConfig.fields.find(f => f.key === key);
  };

  const isFieldEnabled = (key: string): boolean => {
    const field = getFieldConfig(key);
    return field?.enabled ?? true;
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        first_name: data.firstName || null,
        last_name: data.lastName || null,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
        email: data.email || '',
        phone: data.phone || null,
        message: `Interested in: ${property.title}`,
        property_id: property.id,
        desired_move_date: data.desiredMoveDate || null,
        has_criminal_history: data.hasCriminalHistory === "yes",
        people_count: data.peopleCount ? parseInt(data.peopleCount) : null,
        desired_location: data.desiredLocation || null,
        price_range: data.priceRange || null,
        property_type_preference: data.propertyTypePreference || null,
        bedroom_preference: data.bedroomPreference || null,
        has_pets: data.hasPets === "yes",
        employment_status: data.employmentStatus || null,
        status: "new",
      });

      if (error) throw error;

      // Track Lead event in Facebook Pixel
      trackEvent('Lead', {
        content_name: property.title,
        content_ids: [property.id],
        content_type: 'property',
        value: property.price,
        currency: 'EUR'
      });

      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      const userEmail = data.email || '';
      
      // Send admin notification email
      supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'lead',
          to: 'admin@hause.ink',
          data: {
            name: fullName,
            email: userEmail,
            phone: data.phone || '',
            property: property.title,
            message: `Interested in: ${property.title}`
          }
        }
      }).catch(console.error);

      // Send user confirmation email
      if (userEmail) {
        supabase.functions.invoke('send-notification-email', {
          body: {
            type: 'user_confirmation',
            to: userEmail,
            data: {
              name: fullName || 'Valued Customer',
              email: userEmail,
              phone: data.phone || '',
              property: property.title,
              move_date: data.desiredMoveDate || 'Not specified'
            }
          }
        }).catch(console.error);
      }

      setIsSuccess(true);
      toast.success("Application submitted successfully!");
      
      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">
              Your application has been submitted. We'll be in touch soon!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">I'm Interested</DialogTitle>
          <DialogDescription>
            Fill out this form to apply for <span className="font-medium">{property.title}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {isFieldEnabled("firstName") && (
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{getFieldConfig("firstName")?.label || "First Name"}</FormLabel>
                        <FormControl>
                          <Input placeholder={getFieldConfig("firstName")?.placeholder || "John"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {isFieldEnabled("lastName") && (
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{getFieldConfig("lastName")?.label || "Last Name"}</FormLabel>
                        <FormControl>
                          <Input placeholder={getFieldConfig("lastName")?.placeholder || "Doe"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {isFieldEnabled("email") && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("email")?.label || "Email"}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={getFieldConfig("email")?.placeholder || "john@example.com"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("phone") && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("phone")?.label || "Phone Number"}</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder={getFieldConfig("phone")?.placeholder || "+31 6 12345678"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Your Preferences</h3>

              {isFieldEnabled("desiredMoveDate") && (
                <FormField
                  control={form.control}
                  name="desiredMoveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("desiredMoveDate")?.label || "What is your desired move date?"}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("hasCriminalHistory") && (
                <FormField
                  control={form.control}
                  name="hasCriminalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("hasCriminalHistory")?.label || "Do you have any criminal history?"}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="criminal-yes" />
                            <Label htmlFor="criminal-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="criminal-no" />
                            <Label htmlFor="criminal-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("peopleCount") && (
                <FormField
                  control={form.control}
                  name="peopleCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("peopleCount")?.label || "How many people will move in?"}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder={getFieldConfig("peopleCount")?.placeholder || "2"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("desiredLocation") && (
                <FormField
                  control={form.control}
                  name="desiredLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("desiredLocation")?.label || "What is your desired location?"}</FormLabel>
                      <FormControl>
                        <Input placeholder={getFieldConfig("desiredLocation")?.placeholder || "Amsterdam, Rotterdam..."} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("priceRange") && (
                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("priceRange")?.label || "What is your price range?"}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          {[
                            { value: "400-700", label: "€400 - €700" },
                            { value: "700-1000", label: "€700 - €1,000" },
                            { value: "1100-1600", label: "€1,100 - €1,600" },
                            { value: "1600-3000", label: "€1,600 - €3,000" },
                            { value: "other", label: "Other" },
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={`price-${option.value}`} />
                              <Label htmlFor={`price-${option.value}`}>{option.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("propertyTypePreference") && (
                <FormField
                  control={form.control}
                  name="propertyTypePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("propertyTypePreference")?.label || "What type of property are you looking for?"}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          {[
                            { value: "single-room", label: "Single Room" },
                            { value: "condo", label: "Condo" },
                            { value: "studio", label: "Studio Apartment" },
                            { value: "couple-room", label: "Couple Room" },
                            { value: "big-apartment", label: "Big Apartment" },
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={`type-${option.value}`} />
                              <Label htmlFor={`type-${option.value}`}>{option.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("bedroomPreference") && (
                <FormField
                  control={form.control}
                  name="bedroomPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("bedroomPreference")?.label || "How many bedrooms?"}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          {[
                            { value: "1", label: "1 bedroom" },
                            { value: "2", label: "2 bedrooms" },
                            { value: "3-4", label: "3-4 bedrooms" },
                            { value: "other", label: "Other" },
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={`bedroom-${option.value}`} />
                              <Label htmlFor={`bedroom-${option.value}`}>{option.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("hasPets") && (
                <FormField
                  control={form.control}
                  name="hasPets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("hasPets")?.label || "Do you have any pets?"}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="pets-yes" />
                            <Label htmlFor="pets-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="pets-no" />
                            <Label htmlFor="pets-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isFieldEnabled("employmentStatus") && (
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldConfig("employmentStatus")?.label || "Are you self-employed or do you work for someone else?"}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="self-employed" id="emp-self" />
                            <Label htmlFor="emp-self">Self-employed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="employed" id="emp-other" />
                            <Label htmlFor="emp-other">Employed</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadQuestionnaireDialog;