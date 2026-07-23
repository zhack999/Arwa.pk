import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

// ─── Scroll Reveal ───────────────────────────────────────────────────────────
// Drop-in replacement for plain <FadeIn> where you want a section to announce
// itself differently from its neighbors. Uses whileInView (IntersectionObserver
// under the hood via Framer Motion) rather than a scroll-position calculation,
// so it's cheap even with many sections on one page.
//
// Usage:
//   <ScrollReveal variant="zoom"><FeaturedProduct /></ScrollReveal>
//   <ScrollReveal variant="slideLeft" delay={0.1}>...</ScrollReveal>
//
// variant options: "fadeUp" | "slideLeft" | "slideRight" | "zoom" | "rotate" | "fadeIn"

export type RevealVariant = "fadeUp" | "slideLeft" | "slideRight" | "zoom" | "rotate" | "fadeIn";

const VARIANTS: Record<RevealVariant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 48 },
    show: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 64 },
    show: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -64 },
    show: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.92 },
    show: { opacity: 1, scale: 1 },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -3, y: 24 },
    show: { opacity: 1, rotate: 0, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
};

interface ScrollRevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  /** 0–1, how much of the element must be visible before it triggers. Lower = triggers earlier. */
  amount?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.7,
  amount = 0.2,
  className,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={VARIANTS[variant]}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

// Stagger wrapper — for a group of children (e.g. a grid of cards) that
// should reveal one-after-another rather than all at once. Wrap the group in
// <RevealStagger>, and each direct child in <RevealStaggerItem>.
const STAGGER_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function RevealStagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={STAGGER_CONTAINER}>
      {children}
    </motion.div>
  );
}

export function RevealStaggerItem({ children, variant = "fadeUp", className }: { children: ReactNode; variant?: RevealVariant; className?: string }) {
  return (
    <motion.div className={className} variants={VARIANTS[variant]} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
