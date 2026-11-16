"use client";
import { motion } from "motion/react";
import { profile } from "@/data/profile";
import { ease } from "./Reveal";

export function Skills() {
  const all = profile.skills.flatMap((g) => g.items);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {profile.skills.map((g) => (
          <div key={g.group} data-block="mechanic">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6">
              <span
                data-sheen
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                style={{ transform: "translateX(-100%)" }}
              />
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-sm text-accent">{g.group}</h3>
                <div aria-hidden className="flex items-center gap-2">
                  <span
                    data-badge
                    className="rounded-full bg-emerald-400/15 px-2 py-0.5 font-mono text-[10px] text-emerald-400 transition-opacity duration-500"
                  >
                    ✓ tuned
                  </span>
                  <svg viewBox="0 0 40 22" className="h-5 w-9">
                    <path
                      d="M4 20 A16 16 0 0 1 36 20"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                    <path
                      d="M28.5 7 A16 16 0 0 1 36 20"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                    <line
                      data-needle
                      x1={20}
                      y1={20}
                      x2={20}
                      y2={7}
                      stroke="var(--fg)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      style={{
                        transformOrigin: "20px 20px",
                        transform: "rotate(55deg)",
                      }}
                    />
                  </svg>
                </div>
              </div>
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
                    <span
                      data-chip
                      className="inline-flex items-center gap-1.5 transition-transform duration-300"
                    >
                      <svg
                        data-bolt
                        viewBox="0 0 10 10"
                        aria-hidden
                        className="size-2.5 text-muted transition-transform duration-500"
                      >
                        <path
                          d="M5 .5 9 2.75v4.5L5 9.5 1 7.25v-4.5Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.2}
                        />
                        <circle cx={5} cy={5} r={1.4} fill="currentColor" />
                      </svg>
                      {s}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      {/* duplicated once so the loop is seamless */}
      <div
        aria-hidden
        className="relative mt-16 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]"
      >
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
