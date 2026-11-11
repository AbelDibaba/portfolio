"use client";
import { MotionConfig, useReducedMotion } from "motion/react";
import { ReactLenis } from "lenis/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      {reduce ? children : <ReactLenis root options={{ lerp: 0.1 }}>{children}</ReactLenis>}
    </MotionConfig>
  );
}
