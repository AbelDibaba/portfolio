"use client";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { profile } from "@/data/profile";
import { Magnetic } from "./Magnetic";
import { ease } from "./Reveal";

export function Hero() {
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const spotlight = useMotionTemplate`radial-gradient(500px circle at ${mx}px ${my}px, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)`;
  const [first, last] = profile.name.split(" ");

  return (
    <section
      className="relative flex min-h-svh items-center overflow-hidden px-4 pt-24"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
    >
      {/* background */}
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div aria-hidden className="animate-blob absolute -left-32 top-1/4 size-96 rounded-full bg-accent/25 blur-3xl" />
      <div aria-hidden className="animate-blob absolute -right-24 bottom-10 size-80 rounded-full bg-accent-2/20 blur-3xl [animation-delay:-6s]" />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />

      <div className="relative mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {profile.experience[0].title} @ {profile.experience[0].company}
        </motion.div>

        <h1 className="text-[clamp(3rem,11vw,8.5rem)] font-semibold leading-[0.9] tracking-tighter">
          {[first, last].map((word, w) => (
            <span key={word} className="block overflow-hidden pb-2">
              {word.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className={`inline-block ${w === 1 ? "text-gradient" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + w * 0.15 + i * 0.04, ease }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease }}
          className="mt-8 max-w-xl text-lg text-muted sm:text-xl"
        >
          <span className="font-medium text-fg">{profile.role}.</span> {profile.headline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Magnetic>
            <a href="#work" className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 font-medium text-bg transition hover:opacity-85">
              View my work <span aria-hidden>→</span>
            </a>
          </Magnetic>
          <Magnetic>
            <Link href="/resume" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-medium transition hover:border-fg/40">
              Resume
            </Link>
          </Magnetic>
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 justify-center rounded-full border border-border pt-2">
          <motion.div
            className="h-2 w-1 rounded-full bg-muted"
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
