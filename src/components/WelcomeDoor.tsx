import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface WelcomeDoorProps {
  onComplete?: () => void;
}

const WelcomeDoor = ({ onComplete }: WelcomeDoorProps) => {
  const [phase, setPhase] = useState<'closed' | 'unlocking' | 'opening' | 'entering' | 'walking' | 'complete'>('closed');
  const { trigger } = useHaptics();

  useEffect(() => {
    // Phase 1: Door unlock effect (extended)
    const unlockTimer = setTimeout(() => {
      setPhase('unlocking');
      trigger('light');
    }, 1500);
    
    // Phase 2: Doors start opening (extended)
    const openTimer = setTimeout(() => {
      setPhase('opening');
      trigger('doorOpen');
    }, 3000);
    
    // Phase 3: Walk through effect
    const enterTimer = setTimeout(() => {
      setPhase('entering');
      trigger('success');
    }, 5500);

    // Phase 4: Walking in
    const walkTimer = setTimeout(() => {
      setPhase('walking');
      trigger('footstep');
    }, 6500);
    
    // Phase 5: Complete
    const completeTimer = setTimeout(() => {
      setPhase('complete');
      onComplete?.();
    }, 7500);

    return () => {
      clearTimeout(unlockTimer);
      clearTimeout(openTimer);
      clearTimeout(enterTimer);
      clearTimeout(walkTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, trigger]);

  if (phase === 'complete') return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'transition-all duration-1000',
        (phase === 'entering' || phase === 'walking') && 'pointer-events-none'
      )}
      style={{ perspective: '2500px' }}
    >
      {/* Background - the "outside" */}
      <div 
        className={cn(
          'absolute inset-0 transition-all duration-1500',
          (phase === 'entering' || phase === 'walking') ? 'bg-background' : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
        )}
      />

      {/* Stars/particles in the dark (outside) */}
      {phase !== 'entering' && phase !== 'walking' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse-soft"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Ambient particles during unlock */}
      {phase === 'unlocking' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-primary/40 rounded-full animate-float"
              style={{
                left: `${40 + Math.random() * 20}%`,
                top: `${40 + Math.random() * 20}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${1.5 + Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Door frame */}
      <div 
        className={cn(
          'absolute inset-x-[10%] inset-y-[5%] border-8 border-primary/80 rounded-t-[100px]',
          'transition-all duration-1500',
          (phase === 'entering' || phase === 'walking') && 'scale-150 opacity-0'
        )}
        style={{ 
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5), 0 0 60px hsl(var(--primary) / 0.3)',
        }}
      >
        {/* Light from inside (visible when doors open) */}
        <div 
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            phase === 'opening' || phase === 'entering' || phase === 'walking' ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--background)) 0%, transparent 70%)',
          }}
        />
        
        {/* Light spill effect */}
        {(phase === 'opening' || phase === 'entering') && (
          <div 
            className="absolute inset-0 animate-pulse-soft"
            style={{
              background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.1), transparent)',
            }}
          />
        )}
      </div>

      {/* Left door */}
      <div
        className={cn(
          'absolute inset-y-[5%] left-[10%] w-[40%]',
          'origin-left transition-all ease-out',
          (phase === 'entering' || phase === 'walking') ? 'duration-1000' : 'duration-[1.8s]'
        )}
        style={{
          transform: phase === 'opening' || phase === 'entering' || phase === 'walking'
            ? 'rotateY(-115deg) translateZ(50px)'
            : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Door surface */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-tl-[92px]"
          style={{
            boxShadow: 'inset -30px 0 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Door panels */}
          <div className="absolute inset-8 flex flex-col gap-4">
            <div className="flex-1 border-2 border-primary-foreground/15 rounded-t-3xl" />
            <div className="flex-1 border-2 border-primary-foreground/15" />
            <div className="flex-1 border-2 border-primary-foreground/15" />
          </div>
          
          {/* Door handle */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div 
              className={cn(
                'w-4 h-28 bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 rounded-full',
                'shadow-lg transition-all duration-700',
                phase === 'unlocking' && 'animate-pulse scale-110 shadow-[0_0_30px_rgba(234,179,8,0.6)]'
              )}
            />
            {/* Keyhole with glow during unlock */}
            <div 
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 w-3 h-6 bg-black/60 rounded-full transition-all duration-500',
                phase === 'unlocking' && 'shadow-[0_0_20px_hsl(var(--primary))]'
              )}
            />
          </div>
        </div>

        {/* Door edge (visible when opening) */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-4 bg-primary/60 origin-right"
          style={{ transform: 'rotateY(90deg) translateX(2px)' }}
        />
      </div>

      {/* Right door */}
      <div
        className={cn(
          'absolute inset-y-[5%] right-[10%] w-[40%]',
          'origin-right transition-all ease-out',
          (phase === 'entering' || phase === 'walking') ? 'duration-1000' : 'duration-[1.8s]'
        )}
        style={{
          transform: phase === 'opening' || phase === 'entering' || phase === 'walking'
            ? 'rotateY(115deg) translateZ(50px)'
            : 'rotateY(0deg)',
          transitionDelay: phase === 'opening' ? '200ms' : '0ms',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Door surface */}
        <div 
          className="absolute inset-0 bg-gradient-to-bl from-primary via-primary to-primary/80 rounded-tr-[92px]"
          style={{
            boxShadow: 'inset 30px 0 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Door panels */}
          <div className="absolute inset-8 flex flex-col gap-4">
            <div className="flex-1 border-2 border-primary-foreground/15 rounded-t-3xl" />
            <div className="flex-1 border-2 border-primary-foreground/15" />
            <div className="flex-1 border-2 border-primary-foreground/15" />
          </div>
          
          {/* Door handle */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
            <div 
              className={cn(
                'w-4 h-28 bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 rounded-full',
                'shadow-lg transition-all duration-700',
                phase === 'unlocking' && 'animate-pulse scale-110 shadow-[0_0_30px_rgba(234,179,8,0.6)]'
              )}
            />
          </div>
        </div>

        {/* Door edge */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-4 bg-primary/60 origin-left"
          style={{ transform: 'rotateY(-90deg) translateX(-2px)' }}
        />
      </div>

      {/* Welcome text */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center z-20',
          'transition-all duration-1000'
        )}
        style={{
          opacity: phase === 'closed' || phase === 'unlocking' ? 1 : 0,
          transform: phase === 'opening' || phase === 'entering' || phase === 'walking' ? 'scale(0.8) translateY(-50px)' : 'scale(1)',
        }}
      >
        <div 
          className={cn(
            'text-center transition-all duration-700',
            phase === 'unlocking' && 'animate-pulse'
          )}
        >
          <p className="text-lg text-primary-foreground/60 mb-2 uppercase tracking-[0.3em]">
            {phase === 'unlocking' ? 'Unlocking...' : 'Welcome to'}
          </p>
          <h1 className="text-6xl md:text-8xl font-bold text-primary-foreground tracking-tight mb-4">
            Hause
          </h1>
          <p className="text-xl text-primary-foreground/70">
            Your journey home begins here
          </p>
        </div>
      </div>

      {/* Light rays entering when doors open */}
      {(phase === 'opening' || phase === 'entering' || phase === 'walking') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] animate-scale-in"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--background) / 0.9) 0%, transparent 50%)',
            }}
          />
        </div>
      )}

      {/* Footstep indicators during walking phase */}
      {phase === 'walking' && (
        <div className="absolute inset-0 flex items-end justify-center pb-[20%] pointer-events-none">
          <div className="flex gap-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-8 h-12 rounded-full bg-primary/20 animate-footstep"
                style={{
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Walking in effect overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-background pointer-events-none transition-opacity duration-1500',
          (phase === 'entering' || phase === 'walking') ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};

export default WelcomeDoor;