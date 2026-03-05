import { Variants } from 'framer-motion';

// ============================================================================
// Animation Variants
// ============================================================================

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const fadeInUpTransition = {
    duration: 0.3,
    ease: 'easeOut',
};

export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

export const scaleInTransition = {
    duration: 0.2,
    ease: 'easeOut',
};

export const slideInFromRight: Variants = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
};

export const slideInFromRightTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
};

export const slideInFromLeft: Variants = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
};

export const slideInFromBottom: Variants = {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
};

// ============================================================================
// Button Animation Variants
// ============================================================================

export const buttonVariants: Variants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

export const iconButtonVariants: Variants = {
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.9 },
};

// ============================================================================
// Card Animation Variants
// ============================================================================

export const cardHoverVariants: Variants = {
    hover: {
        y: -4,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 },
    },
};

// ============================================================================
// List Animation Variants
// ============================================================================

export const listItemVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};

// ============================================================================
// Modal/Dialog Animation Variants
// ============================================================================

export const modalBackdropVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const modalContentVariants: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
};

// ============================================================================
// Toast Animation Variants
// ============================================================================

export const toastVariants: Variants = {
    initial: { opacity: 0, y: 50, scale: 0.3 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

// ============================================================================
// Number Counter Animation
// ============================================================================

export const counterVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
};

// ============================================================================
// Page Transition Variants
// ============================================================================

export const pageTransitionVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const pageTransition = {
    duration: 0.3,
    ease: 'easeInOut',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation variants with reduced motion support
 */
export function getAnimationVariants(variants: Variants): Variants {
    if (prefersReducedMotion()) {
        return {
            initial: {},
            animate: {},
            exit: {},
        };
    }
    return variants;
}

/**
 * Get transition with reduced motion support
 */
export function getTransition(transition: any): any {
    if (prefersReducedMotion()) {
        return { duration: 0 };
    }
    return transition;
}
