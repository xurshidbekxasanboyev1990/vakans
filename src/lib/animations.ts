/**
 * Shared Animation Constants
 * Barcha sahifalarda ishlatiladigan animatsiyalar
 */

// Stagger container - list items uchun
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger item - har bir element uchun
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

// Fade in up - asosiy animatsiya
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Fade in - oddiy
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

// Scale up - hover effect uchun
export const scaleUp = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },
  tap: { scale: 0.98 },
};

// Slide in from left
export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Slide in from right
export const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Page transition - sahifalar o'rtasida
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 },
  },
};

// Modal overlay
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Modal content
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Card hover effect
export const cardHover = {
  y: -4,
  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

// Floating animation - decorative elements uchun
export const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Pulse animation
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Spring transition - umumiy
export const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 17,
};

// Smooth transition - yumshoq
export const smoothTransition = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94],
};
