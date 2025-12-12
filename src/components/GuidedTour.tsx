import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';
import { useProperties } from '@/hooks/useProperties';
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
  VolumeX,
  Building,
  Star,
  MapPin,
  Bed,
  Bath,
  Check,
  Footprints
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  icon: React.ElementType;
  narration: string;
  showPropertySpotlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'hero',
    title: 'The Lobby',
    description: 'Welcome to Hause - your gateway to finding the perfect rental home',
    targetSelector: '[data-tour-target="hero"]',
    icon: Building,
    narration: 'Welcome to the Lobby of Hause. This is where your journey to finding the perfect home begins. Take a moment to admire our elegant entrance.',
  },
  {
    id: 'properties',
    title: 'The Living Room',
    description: 'Browse our curated collection of verified rental properties',
    targetSelector: '[data-tour-target="properties"]',
    icon: Home,
    narration: 'Step into the Living Room, where you can explore our carefully curated collection of verified rental properties. Each home has been handpicked for quality and comfort.',
    showPropertySpotlight: true,
  },
  {
    id: 'property-spotlight',
    title: 'Featured Home',
    description: 'Take a closer look at one of our premium listings',
    targetSelector: '[data-tour-target="properties"]',
    icon: Star,
    narration: 'Let me show you one of our featured properties. Notice the attention to detail - spacious rooms, modern amenities, and prime locations.',
    showPropertySpotlight: true,
  },
  {
    id: 'features',
    title: 'The Amenities',
    description: 'Discover what makes our platform special',
    targetSelector: '[data-tour-target="features"]',
    icon: Sparkles,
    narration: 'Welcome to the Amenities room. Here you will discover the features that set us apart. From verified properties to our smooth, fast search experience, we have everything you need.',
  },
  {
    id: 'blog',
    title: 'The Reading Room',
    description: 'Stay informed with the latest market insights',
    targetSelector: '[data-tour-target="blog"]',
    icon: BookOpen,
    narration: 'Enter the Reading Room. Stay informed with the latest insights and updates from the rental market to make confident decisions about your next home.',
  },
  {
    id: 'contact',
    title: 'The Reception',
    description: 'Get in touch with our helpful team',
    targetSelector: '[data-tour-target="contact"]',
    icon: Headphones,
    narration: 'Finally, you have arrived at the Reception. Our friendly team is ready to assist you in finding your perfect home. Do not hesitate to reach out anytime!',
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
  const [isDoorTransitioning, setIsDoorTransitioning] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [visitedRooms, setVisitedRooms] = useState<Set<number>>(new Set([0]));
  const [showWalkingPath, setShowWalkingPath] = useState(false);
  
  // Touch gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { trigger } = useHaptics();
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: properties } = useProperties('Amsterdam');

  const step = tourSteps[currentStep];

  // Update visited rooms
  useEffect(() => {
    if (isOpen) {
      setVisitedRooms(prev => new Set([...prev, currentStep]));
    }
  }, [currentStep, isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Handle step change with door transition
  useEffect(() => {
    if (!isOpen) return;
    
    setShowTooltip(false);
    setIsDoorTransitioning(true);
    setShowWalkingPath(true);
    trigger('doorOpen');
    
    // Walking path animation
    const walkTimer = setTimeout(() => {
      setShowWalkingPath(false);
    }, 600);

    // Door transition duration
    const doorTimer = setTimeout(() => {
      setIsDoorTransitioning(false);
      
      // Scroll to target element
      const scrollToTarget = () => {
        const element = document.querySelector(step.targetSelector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Get element rect for spotlight
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setHighlightRect(rect);
          }, 500);
        }
      };

      scrollToTarget();

      // Show tooltip after scroll
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
        trigger('roomEnter');
      }, 800);

      return () => clearTimeout(tooltipTimer);
    }, 800);

    return () => {
      clearTimeout(doorTimer);
      clearTimeout(walkTimer);
    };
  }, [currentStep, isOpen, step.targetSelector, trigger]);

  // Handle narration
  useEffect(() => {
    if (!isOpen || !showTooltip || isMuted) return;

    const speak = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(step.narration);
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onstart = () => setIsNarrating(true);
        utterance.onend = () => {
          setIsNarrating(false);
          trigger('contentReveal');
          if (isPlaying && currentStep < tourSteps.length - 1) {
            autoPlayRef.current = setTimeout(() => {
              setCurrentStep(prev => prev + 1);
            }, 2000);
          }
        };
        utterance.onerror = () => setIsNarrating(false);
        
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    };

    const speakTimer = setTimeout(speak, 600);
    return () => {
      clearTimeout(speakTimer);
      window.speechSynthesis?.cancel();
    };
  }, [showTooltip, step.narration, isMuted, isOpen, isPlaying, currentStep, trigger]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
    trigger('tap');
  }, [trigger]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Detect swipe direction
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      trigger('swipe');
    }
  }, [touchStart, isDragging, trigger]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Horizontal swipe - navigate steps
    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && currentStep > 0) {
        // Swipe right - previous
        window.speechSynthesis?.cancel();
        setCurrentStep(prev => prev - 1);
        trigger('medium');
      } else if (deltaX < 0 && currentStep < tourSteps.length - 1) {
        // Swipe left - next
        window.speechSynthesis?.cancel();
        setCurrentStep(prev => prev + 1);
        trigger('medium');
      }
    }
    
    // Vertical swipe down - exit tour
    if (deltaY > 100 && Math.abs(deltaY) > Math.abs(deltaX)) {
      trigger('light');
      onClose();
    }
    
    setTouchStart(null);
    setIsDragging(false);
  }, [touchStart, currentStep, onClose, trigger]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      window.speechSynthesis?.cancel();
      setCurrentStep(prev => prev + 1);
      trigger('footstep');
    }
  }, [currentStep, trigger]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      window.speechSynthesis?.cancel();
      setCurrentStep(prev => prev - 1);
      trigger('footstep');
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
  const featuredProperty = properties?.[0];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[100]"
    >
      {/* Door Transition Overlay */}
      {isDoorTransitioning && (
        <div className="absolute inset-0 z-[60] pointer-events-none flex">
          <div 
            className="w-1/2 h-full bg-primary origin-left animate-tour-door-left"
            style={{
              boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.3)',
            }}
          />
          <div 
            className="w-1/2 h-full bg-primary origin-right animate-tour-door-right"
            style={{
              boxShadow: 'inset 20px 0 40px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      )}

      {/* Walking Path Animation */}
      {showWalkingPath && (
        <div className="absolute inset-0 z-[55] pointer-events-none flex items-center justify-center">
          <div className="flex items-center gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Footprints 
                key={i}
                className="w-8 h-8 text-primary-foreground animate-footstep"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  transform: i % 2 === 0 ? 'scaleX(-1)' : 'scaleX(1)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Spotlight overlay */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Dark overlay with cutout */}
        <div 
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: highlightRect 
              ? `radial-gradient(ellipse 400px 300px at ${highlightRect.left + highlightRect.width / 2}px ${highlightRect.top + highlightRect.height / 2}px, transparent 0%, hsl(var(--background) / 0.85) 100%)`
              : 'hsl(var(--background) / 0.85)',
          }}
        />
        
        {/* Spotlight glow */}
        {highlightRect && showTooltip && (
          <div 
            className="absolute pointer-events-none animate-glow-pulse rounded-2xl"
            style={{
              left: highlightRect.left - 20,
              top: highlightRect.top - 20,
              width: highlightRect.width + 40,
              height: highlightRect.height + 40,
              border: '2px solid hsl(var(--primary) / 0.5)',
            }}
          />
        )}
      </div>

      {/* Breadcrumb Trail - Top */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20">
          {tourSteps.map((s, idx) => {
            const StepIcon = s.icon;
            const isActive = idx === currentStep;
            const isVisited = visitedRooms.has(idx);
            
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentStep(idx);
                    trigger('light');
                  }}
                  className={cn(
                    'relative flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300',
                    isActive && 'bg-primary text-primary-foreground',
                    isVisited && !isActive && 'bg-primary/20 text-primary',
                    !isVisited && !isActive && 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={`${s.title}${isVisited ? ' (visited)' : ''}`}
                >
                  <StepIcon className="w-3 h-3" aria-hidden="true" />
                  {isActive && (
                    <span className="text-xs font-medium hidden sm:inline">{s.title}</span>
                  )}
                  {isVisited && !isActive && (
                    <Check className="w-2 h-2 absolute -top-1 -right-1 text-primary" aria-hidden="true" />
                  )}
                </button>
                
                {/* Connector */}
                {idx < tourSteps.length - 1 && (
                  <div 
                    className={cn(
                      'w-4 h-0.5 transition-colors duration-300',
                      isVisited ? 'bg-primary/50' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Walking Path Indicator - Left Side */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-3">
        {tourSteps.map((s, idx) => {
          const StepIcon = s.icon;
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          const isVisited = visitedRooms.has(idx);
          
          return (
            <div key={s.id} className="relative">
              <button
                onClick={() => {
                  setCurrentStep(idx);
                  trigger('footstep');
                }}
                className={cn(
                  'relative p-3 rounded-xl transition-all duration-300',
                  'hover:scale-110',
                  isActive && 'bg-primary text-primary-foreground scale-110 shadow-lg',
                  isPast && 'bg-primary/30 text-primary',
                  !isActive && !isPast && 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
                aria-label={`Go to ${s.title}`}
              >
                <StepIcon className="w-5 h-5" aria-hidden="true" />
                
                {/* Visited checkmark */}
                {isVisited && !isActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" aria-hidden="true" />
                  </div>
                )}
              </button>
              
              {/* Connector line with footsteps */}
              {idx < tourSteps.length - 1 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full flex flex-col items-center">
                  <div 
                    className={cn(
                      'w-0.5 h-3',
                      isPast ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                  {isPast && (
                    <Footprints className="w-3 h-3 text-primary/50 rotate-180" aria-hidden="true" />
                  )}
                </div>
              )}
              
              {/* Room name tooltip on hover */}
              <div className={cn(
                'absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-popover border border-border',
                'text-sm font-medium whitespace-nowrap',
                'opacity-0 pointer-events-none transition-opacity',
                'group-hover:opacity-100'
              )}>
                {s.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Tooltip */}
      <div
        className={cn(
          'fixed z-50 max-w-md transition-all duration-700',
          'right-4 md:right-8 top-24 md:top-1/4',
          showTooltip && !isDoorTransitioning ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
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
          {/* Room sign header */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full">
            <p className="text-xs font-bold text-primary-foreground uppercase tracking-wider">
              Room {currentStep + 1} of {tourSteps.length}
            </p>
          </div>

          {/* Room icon and title */}
          <div className="flex items-center gap-3 mb-4 mt-2">
            <div className={cn(
              'p-3 rounded-xl bg-primary/10',
              isNarrating && 'animate-pulse-soft'
            )}>
              <Icon className="w-6 h-6 text-primary" aria-label={step.title} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>

          {/* Property Preview Card */}
          {step.showPropertySpotlight && featuredProperty && (
            <div className="mb-4 p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-start gap-3">
                <div 
                  className="w-20 h-20 rounded-lg bg-muted bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: featuredProperty.images?.[0] 
                      ? `url(${featuredProperty.images[0]})` 
                      : 'none'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate text-sm">
                    {featuredProperty.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    <span>{featuredProperty.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" aria-hidden="true" />
                      {featuredProperty.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" aria-hidden="true" />
                      {featuredProperty.bathrooms}
                    </span>
                  </div>
                  <p className="text-primary font-bold mt-2">
                    €{featuredProperty.price.toLocaleString()}/mo
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Narration indicator */}
          {isNarrating && (
            <div className="flex items-center gap-2 text-sm text-primary mb-4">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-4 bg-primary rounded-full animate-sound-wave"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span>Speaking...</span>
            </div>
          )}

          {/* Swipe hint for mobile */}
          <div className="flex flex-col items-center gap-1 text-muted-foreground md:hidden">
            <div className="flex items-center gap-2 text-xs">
              <ChevronDown className="w-4 h-4 rotate-90" aria-hidden="true" />
              <span>Swipe to navigate</span>
              <ChevronDown className="w-4 h-4 -rotate-90" aria-hidden="true" />
            </div>
            <span className="text-xs opacity-60">Pull down to exit</span>
          </div>

          {/* Scroll indicator for desktop */}
          <div className="hidden md:flex items-center justify-center text-muted-foreground animate-bounce-subtle">
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs ml-1">Scroll to explore</span>
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-2 rounded-full glass border border-primary/20 shadow-2xl">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 px-3">
            {tourSteps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStep(idx);
                  trigger('footstep');
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  idx === currentStep 
                    ? 'w-8 bg-primary' 
                    : idx < currentStep 
                      ? 'bg-primary/50'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-border" aria-hidden="true" />

          {/* Playback controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="rounded-full"
            aria-label="Previous room"
          >
            <SkipBack className="w-4 h-4" aria-hidden="true" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="rounded-full w-10 h-10"
            aria-label={isPlaying ? 'Pause tour' : 'Play tour'}
          >
            {isPlaying ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentStep === tourSteps.length - 1}
            className="rounded-full"
            aria-label="Next room"
          >
            <SkipForward className="w-4 h-4" aria-hidden="true" />
          </Button>

          <div className="w-px h-6 bg-border" aria-hidden="true" />

          {/* Mute button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="rounded-full"
            aria-label={isMuted ? 'Unmute narration' : 'Mute narration'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
          </Button>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full"
            aria-label="Exit tour"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Tour completion celebration */}
      {currentStep === tourSteps.length - 1 && showTooltip && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2">
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Tour Complete! {visitedRooms.size}/{tourSteps.length} rooms visited</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedTour;