// Animation variants and utilities

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// CSS class utilities for animations
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  shimmer: 'animate-shimmer',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
};

// Transition timings
export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
};

// Hover effects
export const hoverEffects = {
  lift: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
  scale: 'hover:scale-105 transition-transform duration-200',
  glow: 'hover:shadow-blue-500/50 hover:shadow-lg transition-shadow duration-200',
};

