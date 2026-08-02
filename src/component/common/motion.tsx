import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/* Shared scroll-driven motion primitives for the Executive Off-White design
   system. Animates only opacity/transform (GPU-composited, CLS-safe) and fires
   once per element. Collapses to opacity-only when the user prefers reduced
   motion. */

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const gridContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

const gridItemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

type MotionSectionProps = React.ComponentProps<typeof motion.section>;

/** Section that fades/slides up once when scrolled into view. */
export function MotionSection({ children, ...rest }: MotionSectionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

type MotionDivProps = React.ComponentProps<typeof motion.div>;

/** Grid wrapper that staggers its MotionItem children into view. */
export function MotionGrid({ children, ...rest }: MotionDivProps) {
  return (
    <motion.div
      variants={gridContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Child of MotionGrid: fades/slides up as part of the stagger sequence. */
export function MotionItem({ children, ...rest }: MotionDivProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div variants={reduced ? gridItemReduced : gridItem} {...rest}>
      {children}
    </motion.div>
  );
}
