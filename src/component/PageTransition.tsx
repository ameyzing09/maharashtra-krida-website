import { PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";

type PageTransitionProps = PropsWithChildren<{
  className?: string;
}>;

export default function PageTransition({ children, className }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: shouldReduceMotion ? 0.1 : 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}


