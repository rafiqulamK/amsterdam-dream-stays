import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  User, Mail, Phone, Calendar, MapPin, Home, 
  Users, DollarSign, Briefcase, PawPrint, CheckCircle2,
  Sparkles, Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Property } from '@/types/property';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import FuturisticForm from './FuturisticForm';
import { cn } from '@/lib/utils';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(5, 'Phone is required'),
  desiredMoveDate: z.string().min(1, 'Move date is required'),
  peopleCount: z.string().min(1, 'Required'),
  desiredLocation: z.string().min(1, 'Location is required'),
  priceRange: z.string(),
  propertyTypePreference: z.string(),
  bedroomPreference: z.string(),
  hasPets: z.string(),
  employmentStatus: z.string(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface ImmersiveLeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
}

const ImmersiveLeadForm = ({ open, onOpenChange, property }: ImmersiveLeadFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { trackEvent } = useFacebookPixel();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      desiredMoveDate: '',
      peopleCount: '',
      desiredLocation: property.city || '',
      priceRange: '1100-1600',
      propertyTypePreference: 'studio',
      bedroomPreference: '1',
      hasPets: 'no',
      employmentStatus: 'employed',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert({
        first_name: data.firstName,
        last_name: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        message: `Interested in: ${property.title}`,
        property_id: property.id,
        desired_move_date: data.desiredMoveDate,
        people_count: parseInt(data.peopleCount),
        desired_location: data.desiredLocation,
        price_range: data.priceRange,
        property_type_preference: data.propertyTypePreference,
        bedroom_preference: data.bedroomPreference,
        has_pets: data.hasPets === 'yes',
        employment_status: data.employmentStatus,
        status: 'new',
      });

      if (error) throw error;

      trackEvent('Lead', {
        content_name: property.title,
        content_ids: [property.id],
        content_type: 'property',
        value: property.price,
        currency: 'EUR',
      });

      setIsSuccess(true);
      toast.success('Application submitted!');

      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
        form.reset();
        setCurrentStep(0);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option card component for selections
  const OptionCard = ({ 
    value, 
    label, 
    description, 
    icon, 
    selected 
  }: { 
    value: string; 
    label: string; 
    description?: string; 
    icon?: React.ReactNode;
    selected: boolean;
  }) => (
    <div
      className={cn(
        'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
        'hover:border-primary/50 hover:bg-primary/5',
        selected 
          ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
          : 'border-border bg-background'
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
            selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            {icon}
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
      )}
    </div>
  );

  const formSteps = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: `Let's find your perfect home at ${property.title}`,
      icon: <Sparkles className="w-8 h-8" />,
      content: (
        <div className="text-center py-8">
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden">
            <img
              src={property.images?.[0] || '/placeholder.svg'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <p className="font-bold text-foreground">{property.title}</p>
              <p className="text-sm text-muted-foreground">{property.location}</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Complete this quick questionnaire and we'll get back to you within 24 hours.
          </p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Your Details',
      description: 'How can we reach you?',
      icon: <User className="w-8 h-8" />,
      content: (
        <div className="space-y-4 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" /> First Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} className="h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+31 6 12345678" {...field} className="h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      id: 'moving',
      title: 'Moving Plans',
      description: 'When and where?',
      icon: <Calendar className="w-8 h-8" />,
      content: (
        <div className="space-y-4 max-w-md mx-auto">
          <FormField
            control={form.control}
            name="desiredMoveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Desired Move Date
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="desiredLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Preferred Location
                </FormLabel>
                <FormControl>
                  <Input placeholder="Amsterdam, Rotterdam..." {...field} className="h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="peopleCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> How many people?
                </FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="2" {...field} className="h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Help us find your match',
      icon: <Home className="w-8 h-8" />,
      content: (
        <div className="space-y-6 max-w-lg mx-auto">
          <FormField
            control={form.control}
            name="propertyTypePreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 mb-3">
                  <Building className="w-4 h-4" /> Property Type
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { value: 'studio', label: 'Studio', icon: <Home className="w-5 h-5" /> },
                      { value: 'single-room', label: 'Single Room', icon: <Home className="w-5 h-5" /> },
                      { value: 'condo', label: 'Condo', icon: <Building className="w-5 h-5" /> },
                      { value: 'big-apartment', label: 'Apartment', icon: <Building className="w-5 h-5" /> },
                    ].map((option) => (
                      <Label key={option.value} htmlFor={option.value} className="cursor-pointer">
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <OptionCard
                          value={option.value}
                          label={option.label}
                          icon={option.icon}
                          selected={field.value === option.value}
                        />
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bedroomPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-3 block">Bedrooms</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-3"
                  >
                    {['1', '2', '3-4', 'other'].map((val) => (
                      <Label key={val} htmlFor={`bed-${val}`} className="cursor-pointer flex-1">
                        <RadioGroupItem value={val} id={`bed-${val}`} className="sr-only" />
                        <div
                          className={cn(
                            'p-3 rounded-xl border-2 text-center transition-all',
                            field.value === val
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {val === 'other' ? '4+' : val}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      id: 'budget',
      title: 'Budget & Lifestyle',
      description: 'Almost there!',
      icon: <DollarSign className="w-8 h-8" />,
      content: (
        <div className="space-y-6 max-w-lg mx-auto">
          <FormField
            control={form.control}
            name="priceRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4" /> Monthly Budget
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { value: '400-700', label: '€400 - €700' },
                      { value: '700-1000', label: '€700 - €1000' },
                      { value: '1100-1600', label: '€1100 - €1600' },
                      { value: '1600-3000', label: '€1600+' },
                    ].map((option) => (
                      <Label key={option.value} htmlFor={`price-${option.value}`} className="cursor-pointer">
                        <RadioGroupItem value={option.value} id={`price-${option.value}`} className="sr-only" />
                        <div
                          className={cn(
                            'p-4 rounded-xl border-2 text-center transition-all',
                            field.value === option.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {option.label}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hasPets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4" /> Pets?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-2"
                    >
                      {['yes', 'no'].map((val) => (
                        <Label key={val} htmlFor={`pet-${val}`} className="cursor-pointer flex-1">
                          <RadioGroupItem value={val} id={`pet-${val}`} className="sr-only" />
                          <div
                            className={cn(
                              'p-3 rounded-xl border-2 text-center transition-all capitalize',
                              field.value === val
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            {val}
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Employment
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-2"
                    >
                      <Label htmlFor="emp-employed" className="cursor-pointer flex-1">
                        <RadioGroupItem value="employed" id="emp-employed" className="sr-only" />
                        <div
                          className={cn(
                            'p-3 rounded-xl border-2 text-center transition-all text-sm',
                            field.value === 'employed'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          Employed
                        </div>
                      </Label>
                      <Label htmlFor="emp-self" className="cursor-pointer flex-1">
                        <RadioGroupItem value="self-employed" id="emp-self" className="sr-only" />
                        <div
                          className={cn(
                            'p-3 rounded-xl border-2 text-center transition-all text-sm',
                            field.value === 'self-employed'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          Self
                        </div>
                      </Label>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      ),
    },
  ];

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg border-0 bg-transparent shadow-none">
          <div className="relative p-8 rounded-3xl bg-background border border-border overflow-hidden">
            {/* Success animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
            
            <div className="relative text-center py-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center animate-scale-in">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3 animate-fade-in">Welcome Home!</h2>
              <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
                Your application for {property.title} has been submitted.
                <br />
                We'll be in touch within 24 hours.
              </p>
            </div>

            {/* Confetti-like particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary/40"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 bg-transparent shadow-none p-0">
        <div className="relative rounded-3xl bg-background border border-border overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          {/* Header */}
          <div className="relative p-6 pb-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img
                  src={property.images?.[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-bold text-foreground">{property.title}</h2>
                <p className="text-sm text-muted-foreground">{property.location}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative p-6">
              <FuturisticForm
                steps={formSteps}
                onComplete={() => form.handleSubmit(onSubmit)()}
                onStepChange={setCurrentStep}
                isSubmitting={isSubmitting}
              />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImmersiveLeadForm;
