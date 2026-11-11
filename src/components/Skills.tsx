"use client";
import { motion } from "motion/react";
import { profile } from "@/data/profile";
import { Reveal, ease } from "./Reveal";

export function Skills() {
  const all = profile.skills.flatMap((g) => g.items);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {profile.skills.map((g, gi) => (
          <Reveal key={g.group} delay={gi * 0.08} className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="font-mono text-sm text-accent">{g.group}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.items.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.05, ease }}
                  whileHover={{ y: -3 }}
                  className="rounded-full border border-border px-3 py-1.5 text-sm"
                >
                  {s}
                </motion.li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
      {/* duplicated once so the loop is seamless */}
      <div aria-hidden className="relative mt-16 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-3xl font-semibold tracking-tight text-muted/40 sm:text-5xl">
          {[...all, ...all].map((s, i) => (
            <span key={i}>
              {s} <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
