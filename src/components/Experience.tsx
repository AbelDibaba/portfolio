"use client";
import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { profile } from "@/data/profile";
import { Reveal } from "./Reveal";

export function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  return (
    <ol ref={ref} className="relative space-y-12 pl-8">
      <div aria-hidden className="absolute left-[5px] top-2 h-full w-px bg-border" />
      <motion.div aria-hidden style={{ scaleY: scrollYProgress }} className="absolute left-[5px] top-2 h-full w-px origin-top bg-gradient-to-b from-accent to-accent-2" />
      {profile.experience.map((job) => (
        <li key={job.company} className="relative">
          <span aria-hidden className="absolute -left-8 top-2 size-[11px] rounded-full border-2 border-accent bg-bg" />
          <Reveal>
            <p className="font-mono text-sm text-muted">{job.period}</p>
            <h3 className="mt-1 text-2xl font-semibold">{job.title}</h3>
            <p className="text-accent">{job.company}</p>
            <ul className="mt-4 space-y-2 text-muted">
              {job.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-muted" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
