import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  User, Mail, Phone, Calendar, MapPin, 
  Home, CheckCircle2, Sparkles, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { cn } from '@/lib/utils';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(5, 'Phone is required'),
  desiredMoveDate: z.string().min(1, 'Move date is required'),
  desiredLocation: z.string().min(1, 'Location is required'),
  priceRange: z.string(),
  bedroomPreference: z.string(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface HomepageLeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
}

const HomepageLeadForm = ({ open, onOpenChange, source = 'homepage_form' }: HomepageLeadFormProps) => {
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
      desiredLocation: '',
      priceRange: '1100-1600',
      bedroomPreference: '1',
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
        message: `General inquiry - Looking for ${data.bedroomPreference} bedroom in ${data.desiredLocation}`,
        desired_move_date: data.desiredMoveDate,
        desired_location: data.desiredLocation,
        price_range: data.priceRange,
        bedroom_preference: data.bedroomPreference,
        status: 'new',
        source: source,
      });

      if (error) throw error;

      trackEvent('Lead', {
        content_name: 'Homepage Lead Form',
        content_type: 'general_inquiry',
        value: 0,
        currency: 'EUR',
      });

      setIsSuccess(true);
      toast.success('Thank you! We\'ll be in touch soon.');

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

  const steps = [
    {
      title: 'Your Details',
      fields: ['firstName', 'lastName', 'email', 'phone'],
    },
    {
      title: 'What are you looking for?',
      fields: ['desiredMoveDate', 'desiredLocation', 'priceRange', 'bedroomPreference'],
    },
  ];

  const validateCurrentStep = async () => {
    const currentFields = steps[currentStep].fields as (keyof LeadFormData)[];
    const result = await form.trigger(currentFields);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary animate-scale-in" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              We've received your inquiry and will contact you within 24 hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Find Your Perfect Home</DialogTitle>
              <DialogDescription>
                Tell us what you're looking for
              </DialogDescription>
            </div>
          </div>
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  idx <= currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {currentStep === 0 && (
              <div className="space-y-4 animate-fade-in">
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
                          <Input placeholder="John" {...field} />
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
                          <Input placeholder="Doe" {...field} />
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
                        <Input type="email" placeholder="john@example.com" {...field} />
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
                        <Input type="tel" placeholder="+31 6 12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="desiredMoveDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Move Date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          <MapPin className="w-4 h-4" /> Location
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Amsterdam" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          {[
                            { value: '400-700', label: '€400-700' },
                            { value: '700-1000', label: '€700-1000' },
                            { value: '1100-1600', label: '€1100-1600' },
                            { value: '1600-3000', label: '€1600+' },
                          ].map((opt) => (
                            <Label key={opt.value} htmlFor={`price-${opt.value}`} className="cursor-pointer">
                              <RadioGroupItem value={opt.value} id={`price-${opt.value}`} className="sr-only" />
                              <div className={cn(
                                'p-3 rounded-lg border-2 text-center text-sm transition-all',
                                field.value === opt.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              )}>
                                {opt.label}
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
                  name="bedroomPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Home className="w-4 h-4" /> Bedrooms
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-2"
                        >
                          {['Studio', '1', '2', '3+'].map((val) => (
                            <Label key={val} htmlFor={`bed-home-${val}`} className="cursor-pointer flex-1">
                              <RadioGroupItem value={val} id={`bed-home-${val}`} className="sr-only" />
                              <div className={cn(
                                'p-2 rounded-lg border-2 text-center text-sm transition-all',
                                field.value === val
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              )}>
                                {val}
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext} className="flex-1">
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Get Matched'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HomepageLeadForm;
