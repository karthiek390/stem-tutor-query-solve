
// Animation utility functions and configurations
export const animationConfig = {
  // Fast animations for microinteractions
  fast: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  // Medium animations for transitions
  medium: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  // Slow animations for page transitions
  slow: {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get animation duration based on user preferences
export const getAnimationDuration = (duration: number) => {
  return prefersReducedMotion() ? 0 : duration;
};
