import { useState, useEffect, useRef, RefObject } from 'react';

interface UseScrollTriggerOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseScrollTriggerReturn {
  ref: RefObject<HTMLDivElement>;
  isVisible: boolean;
  progress: number;
}

export const useScrollTrigger = (
  options: UseScrollTriggerOptions = {}
): UseScrollTriggerReturn => {
  const { threshold = 0.3, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Calculate progress based on how much of the element is visible
          const visibleRatio = entry.intersectionRatio;
          setProgress(Math.min(visibleRatio / threshold, 1));
          
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
          setProgress(0);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible, progress };
};

export default useScrollTrigger;
