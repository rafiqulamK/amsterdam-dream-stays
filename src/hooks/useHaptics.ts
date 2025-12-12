import { useCallback } from 'react';

type HapticPattern = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'selection' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'doorOpen' 
  | 'doorClose'
  | 'stepChange'
  | 'footstep'
  | 'contentReveal'
  | 'roomEnter'
  | 'swipe'
  | 'tap'
  | 'doubleTap';

export const useHaptics = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: number | number[]) => {
    if (isSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently fail if vibration isn't available
      }
    }
  }, [isSupported]);

  const trigger = useCallback((type: HapticPattern) => {
    const patterns: Record<HapticPattern, number | number[]> = {
      // Basic patterns
      light: 10,
      medium: 25,
      heavy: 50,
      selection: 15,
      
      // Feedback patterns
      success: [30, 50, 30],
      warning: [50, 30, 50],
      error: [100, 50, 100, 50, 100],
      
      // Door animations
      doorOpen: [30, 80, 40, 100, 50, 120, 30],
      doorClose: [40, 60, 80],
      
      // Tour-specific patterns
      stepChange: [20, 40, 20, 40],
      footstep: [15, 80, 15],
      contentReveal: [10, 30, 10, 30, 10],
      roomEnter: [20, 60, 30, 80, 40],
      
      // Touch gestures
      swipe: [10, 20, 10],
      tap: 8,
      doubleTap: [8, 30, 8],
    };

    vibrate(patterns[type]);
  }, [vibrate]);

  const cancel = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(0);
    }
  }, [isSupported]);

  // Sequence of haptics for complex interactions
  const sequence = useCallback((types: HapticPattern[], delays: number[]) => {
    types.forEach((type, index) => {
      setTimeout(() => {
        trigger(type);
      }, delays[index] || 0);
    });
  }, [trigger]);

  return { trigger, cancel, sequence, isSupported };
};