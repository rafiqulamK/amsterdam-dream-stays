import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  X, 
  Home, 
  Sparkles, 
  BookOpen, 
  Headphones,
  ChevronDown,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  icon: React.ElementType;
  narration: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'properties',
    title: 'The Living Room',
    description: 'Browse our curated collection of verified rental properties',
    targetSelector: '#properties',
    icon: Home,
    narration: 'Welcome to the Living Room, where your journey to finding the perfect home begins. Browse our carefully curated collection of verified rental properties.',
  },
  {
    id: 'features',
    title: 'The Amenities',
    description: 'Discover what makes our platform special',
    targetSelector: 'section.bg-muted\\/30:nth-of-type(1)',
    icon: Sparkles,
    narration: 'Step into the Amenities room. Here you\'ll discover the features that set us apart - from verified properties to our smooth, fast search experience.',
  },
  {
    id: 'blog',
    title: 'The Reading Room',
    description: 'Stay informed with the latest market insights',
    targetSelector: 'section:has(.container):nth-of-type(3)',
    icon: BookOpen,
    narration: 'Welcome to the Reading Room. Stay informed with the latest insights and updates from the rental market to make confident decisions.',
  },
  {
    id: 'contact',
    title: 'The Reception',
    description: 'Get in touch with our helpful team',
    targetSelector: '#contact',
    icon: Headphones,
    narration: 'Finally, you\'ve arrived at the Reception. Our friendly team is ready to assist you in finding your perfect home. Reach out anytime!',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidedTour = ({ isOpen, onClose }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { trigger } = useHaptics();
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const step = tourSteps[currentStep];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Handle step change
  useEffect(() => {
    if (!isOpen) return;
    
    setShowTooltip(false);
    
    // Scroll to target element
    const scrollToTarget = () => {
      try {
        const element = document.querySelector(step.targetSelector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          trigger('stepChange');
        }
      } catch (e) {
        // Fallback for complex selectors
        const sections = document.querySelectorAll('section');
        if (sections[currentStep]) {
          sections[currentStep].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    scrollToTarget();

    // Show tooltip after scroll
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true);
      trigger('selection');
    }, 800);

    return () => clearTimeout(tooltipTimer);
  }, [currentStep, isOpen, step.targetSelector, trigger]);

  // Handle narration
  useEffect(() => {
    if (!isOpen || !showTooltip || isMuted) return;

    const speak = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(step.narration);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onstart = () => setIsNarrating(true);
        utterance.onend = () => {
          setIsNarrating(false);
          if (isPlaying && currentStep < tourSteps.length - 1) {
            autoPlayRef.current = setTimeout(() => {
              setCurrentStep(prev => prev + 1);
            }, 1500);
          }
        };
        utterance.onerror = () => setIsNarrating(false);
        
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    };

    const speakTimer = setTimeout(speak, 400);
    return () => {
      clearTimeout(speakTimer);
      window.speechSynthesis?.cancel();
    };
  }, [showTooltip, step.narration, isMuted, isOpen, isPlaying, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      window.speechSynthesis?.cancel();
      setCurrentStep(prev => prev + 1);
      trigger('medium');
    }
  }, [currentStep, trigger]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      window.speechSynthesis?.cancel();
      setCurrentStep(prev => prev - 1);
      trigger('medium');
    }
  }, [currentStep, trigger]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    trigger('selection');
    
    if (!isPlaying && currentStep === tourSteps.length - 1) {
      setCurrentStep(0);
    }
  }, [isPlaying, currentStep, trigger]);

  const handleClose = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    trigger('light');
    onClose();
  }, [onClose, trigger]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (!isMuted) {
      window.speechSynthesis?.cancel();
    }
    trigger('selection');
  }, [isMuted, trigger]);

  if (!isOpen) return null;

  const Icon = step.icon;

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div 
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, hsl(var(--background) / 0.8) 100%)',
        }}
      />

      {/* Floating Tooltip */}
      <div
        className={cn(
          'fixed z-50 max-w-sm transition-all duration-700',
          'left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2',
          showTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        <div 
          className={cn(
            'relative p-6 rounded-2xl glass',
            'border border-primary/20',
            'shadow-2xl',
            isNarrating && 'animate-glow-pulse'
          )}
        >
          {/* Room icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              'p-3 rounded-xl bg-primary/10',
              isNarrating && 'animate-pulse-soft'
            )}>
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider">
                Room {currentStep + 1} of {tourSteps.length}
              </p>
              <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
            </div>
          </div>

          <p className="text-muted-foreground mb-4">{step.description}</p>

          {/* Narration indicator */}
          {isNarrating && (
            <div className="flex items-center gap-2 text-sm text-primary mb-4">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-4 bg-primary rounded-full animate-pulse-soft"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span>Narrating...</span>
            </div>
          )}

          {/* Scroll indicator */}
          <div className="flex items-center justify-center text-muted-foreground animate-bounce-subtle">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-2 rounded-full glass border border-primary/20 shadow-2xl">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 px-3">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  trigger('light');
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  idx === currentStep 
                    ? 'w-6 bg-primary' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Playback controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="rounded-full"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="rounded-full w-10 h-10"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentStep === tourSteps.length - 1}
            className="rounded-full"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border" />

          {/* Mute button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="rounded-full"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default GuidedTour;
