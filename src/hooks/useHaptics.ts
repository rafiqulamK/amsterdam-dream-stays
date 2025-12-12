import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' | 'doorOpen' | 'stepChange';

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
      light: 10,
      medium: 25,
      heavy: 50,
      selection: 15,
      success: [30, 50, 30],
      warning: [50, 30, 50],
      error: [100, 50, 100, 50, 100],
      doorOpen: [30, 100, 50, 100, 30],
      stepChange: [20, 30, 20],
    };

    vibrate(patterns[type]);
  }, [vibrate]);

  const cancel = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(0);
    }
  }, [isSupported]);

  return { trigger, cancel, isSupported };
};
