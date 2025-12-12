import { useState, useEffect, useCallback } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Images, 
  Info, 
  FileText, 
  Sparkles, 
  Zap, 
  MessageSquare,
  Check,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyTourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  targetId: string;
}

const TOUR_STEPS: PropertyTourStep[] = [
  {
    id: 'gallery',
    title: 'Property Gallery',
    description: 'Browse through all available photos of this property. Use arrows or swipe to navigate.',
    icon: Images,
    targetId: 'property-gallery',
  },
  {
    id: 'details',
    title: 'Property Details',
    description: 'Key specifications including bedrooms, bathrooms, and total area.',
    icon: Info,
    targetId: 'property-details',
  },
  {
    id: 'description',
    title: 'Full Description',
    description: 'Read the complete property description and learn about its features.',
    icon: FileText,
    targetId: 'property-description',
  },
  {
    id: 'amenities',
    title: 'Amenities',
    description: 'Explore all the amenities and features included with this property.',
    icon: Sparkles,
    targetId: 'property-amenities',
  },
  {
    id: 'energy',
    title: 'Energy Efficiency',
    description: 'Check the energy rating and environmental information.',
    icon: Zap,
    targetId: 'property-energy',
  },
  {
    id: 'contact',
    title: 'Contact Landlord',
    description: 'Ready to move forward? Fill out the form to connect with the landlord.',
    icon: MessageSquare,
    targetId: 'property-contact',
  },
];

interface PropertyTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const PropertyTour = ({ isOpen, onClose, onComplete }: PropertyTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { trigger } = useHaptics();

  const currentTourStep = TOUR_STEPS[currentStep];

  const scrollToTarget = useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= TOUR_STEPS.length || isTransitioning) return;
    
    setIsTransitioning(true);
    trigger('stepChange');

    setTimeout(() => {
      setCurrentStep(stepIndex);
      setVisitedSteps(prev => new Set([...prev, stepIndex]));
      scrollToTarget(TOUR_STEPS[stepIndex].targetId);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, trigger, scrollToTarget]);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      trigger('success');
      onClose();
      // Trigger lead form after tour completion
      if (onComplete) {
        setTimeout(() => onComplete(), 300);
      }
    }
  }, [currentStep, goToStep, onClose, onComplete, trigger]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, nextStep, prevStep]);

  // Initial scroll to first target
  useEffect(() => {
    if (isOpen) {
      scrollToTarget(TOUR_STEPS[0].targetId);
    }
  }, [isOpen, scrollToTarget]);

  if (!isOpen) return null;

  const Icon = currentTourStep.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Tour tooltip */}
      <div 
        className={cn(
          "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md",
          "bg-card border border-border rounded-2xl shadow-2xl",
          "transition-all duration-300",
          isTransitioning && "opacity-50 scale-95"
        )}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-muted hover:bg-destructive/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToStep(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  idx === currentStep 
                    ? "w-6 bg-primary" 
                    : visitedSteps.has(idx) 
                      ? "bg-primary/50" 
                      : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Icon and title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Room {currentStep + 1} of {TOUR_STEPS.length}
              </div>
              <h3 className="font-semibold text-foreground">{currentTourStep.title}</h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6">
            {currentTourStep.description}
          </p>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={nextStep}
              className="flex-1"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-muted-foreground/60 text-center mt-4">
            Use ← → arrow keys or Esc to exit
          </p>
        </div>
      </div>
    </>
  );
};

export default PropertyTour;
