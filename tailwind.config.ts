import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "door-open-left": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(-105deg)" },
        },
        "door-open-right": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(105deg)" },
        },
        "door-slide": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "room-reveal": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "greeting-appear": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "card-hover": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-8px)" },
        },
        "walk-in": {
          "0%": { transform: "translateZ(-500px) scale(0.7)", opacity: "0" },
          "100%": { transform: "translateZ(0) scale(1)", opacity: "1" },
        },
        "corridor-pan": {
          "0%": { transform: "perspective(2000px) translateZ(-200px)" },
          "100%": { transform: "perspective(2000px) translateZ(0)" },
        },
        "reveal-content": {
          "0%": { clipPath: "inset(50% 0 50% 0)", opacity: "0" },
          "100%": { clipPath: "inset(0 0 0 0)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" },
        },
        "text-reveal": {
          "0%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "rotate-in": {
          "0%": { transform: "rotateX(-10deg) rotateY(-10deg)", opacity: "0" },
          "100%": { transform: "rotateX(0) rotateY(0)", opacity: "1" },
        },
        "footstep": {
          "0%": { opacity: "0", transform: "scale(0.5) translateY(0)" },
          "50%": { opacity: "1", transform: "scale(1) translateY(-10px)" },
          "100%": { opacity: "0", transform: "scale(0.8) translateY(-20px)" },
        },
        "tour-door-left": {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(-90deg)" },
          "100%": { transform: "rotateY(-90deg)", opacity: "0" },
        },
        "tour-door-right": {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(90deg)", opacity: "0" },
        },
        "sound-wave": {
          "0%, 100%": { height: "4px" },
          "50%": { height: "16px" },
        },
        "swing": {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "spotlight": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Property-specific animations
        "property-door-left": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(-105deg)" },
        },
        "property-door-right": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(105deg)" },
        },
        "gallery-slide": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "50%": { transform: "translateX(-10%)", opacity: "0" },
          "51%": { transform: "translateX(10%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "section-enter": {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slide-up 0.8s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "door-open-left": "door-open-left 1s ease-out forwards",
        "door-open-right": "door-open-right 1s ease-out forwards",
        "door-slide": "door-slide 1s ease-out forwards",
        "room-reveal": "room-reveal 0.8s ease-out forwards",
        "greeting-appear": "greeting-appear 0.7s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "scale-in": "scale-in 0.5s ease-out forwards",
        "card-hover": "card-hover 0.3s ease-out forwards",
        "walk-in": "walk-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "corridor-pan": "corridor-pan 1s ease-out forwards",
        "reveal-content": "reveal-content 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "text-reveal": "text-reveal 1s ease-out forwards",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "rotate-in": "rotate-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "footstep": "footstep 0.8s ease-out forwards",
        "tour-door-left": "tour-door-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "tour-door-right": "tour-door-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "sound-wave": "sound-wave 0.6s ease-in-out infinite",
        "swing": "swing 3s ease-in-out infinite",
        "spotlight": "spotlight 0.5s ease-out forwards",
        // Property-specific animations
        "property-door-left": "property-door-left 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "property-door-right": "property-door-right 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "gallery-slide": "gallery-slide 0.8s ease-out forwards",
        "section-enter": "section-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-accent': 'var(--gradient-accent)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
