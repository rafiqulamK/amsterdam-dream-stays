import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { cn } from '@/lib/utils';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type NewsletterData = z.infer<typeof newsletterSchema>;

interface NewsletterSignupProps {
  className?: string;
  variant?: 'inline' | 'card';
}

const NewsletterSignup = ({ className, variant = 'inline' }: NewsletterSignupProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { trackEvent } = useFacebookPixel();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert({
        name: 'Newsletter Subscriber',
        email: data.email,
        message: 'Newsletter subscription',
        status: 'new',
        source: 'newsletter',
      });

      if (error) throw error;

      trackEvent('Lead', {
        content_name: 'Newsletter Signup',
        content_type: 'newsletter',
      });

      setIsSuccess(true);
      toast.success('Subscribed successfully!');
      reset();

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn(
        'flex items-center gap-2 text-primary',
        variant === 'card' && 'p-6 rounded-2xl glass',
        className
      )}>
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">Thanks for subscribing!</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('p-6 rounded-2xl glass', className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">Get weekly listings in your inbox</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>
        {errors.email && (
          <p className="text-sm text-destructive mt-2">{errors.email.message}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Get weekly listings..."
          {...register('email')}
          className="pl-10"
        />
      </div>
      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Subscribe'
        )}
      </Button>
      {errors.email && (
        <p className="text-sm text-destructive absolute -bottom-5 left-0">{errors.email.message}</p>
      )}
    </form>
  );
};

export default NewsletterSignup;
