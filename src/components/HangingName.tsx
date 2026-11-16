"use client";
import { useEffect, useState } from "react";
import { hoist } from "./robotStore";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

// Same "random" numbers on server and client, so hydration matches.
const rand = (i: number) => (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;

const gravity = [0.55, 0, 1, 0.45] as const;

function Line({ word, seed, cut, up, gradient }: { word: string; seed: number; cut: boolean; up: boolean; gradient: boolean }) {
  const letters = word.split("");
  const mid = (letters.length - 1) / 2; // the middle letters drop first

  return (
    <span aria-hidden className="relative flex w-fit items-start" style={{ zIndex: 10 - seed / 10 }}>{/* lower lines' ropes pass behind the upper line */}

      {letters.map((ch, i) => {
        const r = rand(seed + i);
        const sway = (0.12 + r * 0.16) * (i % 2 ? 1 : -1); // small: the pivot is far above the screen
        const hole = /[A-Zlft]/.test(ch) ? 0.46 : 0.68; // tall letters are pinned higher
        return (
          <motion.span
            key={i}
            className="relative inline-flex flex-col items-center"
            style={{ originY: "-70vh" }}
            initial={{ y: 900 }} // waiting below the hero, out of sight, until the robot hoists it up
            animate={cut ? "fall" : up ? "hang" : undefined}
            variants={{
              hang: {
                y: 0,
                x: 0,
                opacity: 1,
                rotate: [0, sway, -sway, 0],
                transition: {
                  y: { type: "spring", stiffness: 120, damping: 15, delay: seed * 0.02 + i * 0.07 },
                  // starts swaying once the letter has been hoisted into place
                  rotate: { repeat: Infinity, duration: 4.4 + r * 3.2, ease: "easeInOut", delay: 1.3 + i * 0.07 },
                },
              },
              fall: {
                opacity: 1, // values left out snap back to `initial`, which would fade the letters
                y: 1200,
                x: (r - 0.5) * 120,
                rotate: (r - 0.5) * 200,
                transition: { duration: 1 + r * 0.5, delay: Math.abs(i - mid) * 0.06 + r * 0.08, ease: gravity },
              },
            }}
          >
            {/* the rope: runs straight up out of the top of the screen, where the robot's rope also goes; whips away when let go */}
            <motion.span
              className="absolute bottom-full left-1/2 h-[150vh] w-px origin-top -translate-x-1/2 bg-muted/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: up ? 1 : 0, scaleY: cut ? 0 : 1 }}
              transition={{ duration: 0.25 }}
            />
            {/* string runs down to a punched hole near the glyph's top (cap height or x-height) */}
            <span className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-muted/60" style={{ height: `${hole}em` }} />
            <span
              className="absolute left-1/2 z-10 size-[0.09em] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.022em] border-muted bg-bg"
              style={{ top: `${hole}em` }}
            />
            <span className={`pt-[0.3em] ${gradient ? "text-gradient" : ""}`}>{ch}</span>
          </motion.span>
        );
      })}
    </span>
  );
}

// The robot hoists the name up on ropes that run off the top of the screen (Companion fires "hoist");
// scrolling down makes it let go and the letters fall.
// Back at the top it is hoisted again.
export function HangingName({ name, className = "" }: { name: string; className?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [cut, setCut] = useState(false);
  const [gen, setGen] = useState(0); // remounts the lines so letters are hoisted again
  const [up, setUp] = useState(false);

  useEffect(() => {
    const go = () => {
      hoist.up = true;
      setUp(true);
    };
    addEventListener("hoist", go);
    const t = setTimeout(go, 2500); // no robot (reduced motion, slow load): don't keep the visitor waiting
    return () => {
      removeEventListener("hoist", go);
      clearTimeout(t);
    };
  }, []);

  useMotionValueEvent(scrollY, "change", (v) => {
    if (reduce) return;
    if (!cut && v > 60) setCut(true);
    else if (cut && v < 5) {
      setCut(false);
      setGen((g) => g + 1);
    }
  });

  return (
    <h1 aria-label={name} className={className}>
      {name.split(" ").map((word, w) => (
        <Line key={`${gen}-${w}`} word={word} seed={w * 10} cut={cut} up={up} gradient={w === 1} />
      ))}
    </h1>
  );
}
