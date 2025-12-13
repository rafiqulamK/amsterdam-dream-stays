// Centralized z-index values for consistent layering
// Lower numbers = further back, higher numbers = closer to user

export const zIndex = {
  // Base layers
  base: 0,
  dropdown: 10,
  sticky: 20,
  
  // Floating UI elements (bottom of screen)
  floatingCTA: 30,        // Bottom-left CTA button
  tourLauncher: 35,       // Bottom-right tour button
  whatsApp: 40,           // Bottom-right WhatsApp (above tour)
  
  // Overlays and modals
  overlay: 45,
  cookieConsent: 50,      // Cookie banner (highest priority)
  modal: 50,
  tooltip: 60,
  
  // Maximum priority
  toast: 100,
} as const;

export type ZIndexKey = keyof typeof zIndex;
