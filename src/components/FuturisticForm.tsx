import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface FuturisticFormProps {
  steps: FormStep[];
  onComplete: () => void;
  onStepChange?: (step: number) => void;
  isSubmitting?: boolean;
  className?: string;
}

const FuturisticForm = ({
  steps,
  onComplete,
  onStepChange,
  isSubmitting = false,
  className,
}: FuturisticFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToStep = (step: number) => {
    if (step < 0 || step >= steps.length || isTransitioning) return;
    
    setDirection(step > currentStep ? 'forward' : 'backward');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStep(step);
      onStepChange?.(step);
      setIsTransitioning(false);
    }, 300);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('relative', className)}>
      {/* Futuristic progress bar */}
      <div className="relative mb-8">
        {/* Background track */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="absolute -top-3 left-0 right-0 flex justify-between">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => index < currentStep && goToStep(index)}
              disabled={index > currentStep}
              className={cn(
                'relative w-8 h-8 rounded-full flex items-center justify-center',
                'transition-all duration-500 transform',
                'border-2',
                index < currentStep && 'bg-primary border-primary cursor-pointer hover:scale-110',
                index === currentStep && 'bg-primary border-primary scale-110 ring-4 ring-primary/20',
                index > currentStep && 'bg-muted border-muted-foreground/30 cursor-not-allowed'
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4 text-primary-foreground" />
              ) : (
                <span
                  className={cn(
                    'text-xs font-bold',
                    index <= currentStep ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {index + 1}
                </span>
              )}

              {/* Pulse animation for current step */}
              {index === currentStep && (
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
              )}

              {/* Step label */}
              <span
                className={cn(
                  'absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap',
                  'text-xs font-medium transition-all duration-300',
                  index === currentStep ? 'text-primary opacity-100' : 'text-muted-foreground opacity-60'
                )}
              >
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form content with transition */}
      <div className="relative mt-16 overflow-hidden min-h-[300px]">
        {/* Room entrance effect */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none transition-all duration-500',
            isTransitioning ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background: direction === 'forward'
              ? 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)'
              : 'linear-gradient(-90deg, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div
          className={cn(
            'transition-all duration-500 ease-out',
            isTransitioning && direction === 'forward' && '-translate-x-10 opacity-0',
            isTransitioning && direction === 'backward' && 'translate-x-10 opacity-0',
            !isTransitioning && 'translate-x-0 opacity-100'
          )}
        >
          {/* Step header */}
          <div className="text-center mb-8">
            {steps[currentStep].icon && (
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-scale-in">
                {steps[currentStep].icon}
              </div>
            )}
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {steps[currentStep].title}
            </h3>
            {steps[currentStep].description && (
              <p className="text-muted-foreground max-w-md mx-auto">
                {steps[currentStep].description}
              </p>
            )}
          </div>

          {/* Step content */}
          <div className="animate-fade-in">
            {steps[currentStep].content}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 0 || isTransitioning}
          className={cn(
            'group transition-all duration-300',
            currentStep === 0 && 'opacity-0 pointer-events-none'
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{currentStep + 1}</span>
          <span>/</span>
          <span>{steps.length}</span>
        </div>

        <Button
          type="button"
          onClick={nextStep}
          disabled={isTransitioning || isSubmitting}
          className="group relative overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <span className="relative flex items-center">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Complete
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="absolute -z-10 top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -z-10 bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
    </div>
  );
};

export default FuturisticForm;
