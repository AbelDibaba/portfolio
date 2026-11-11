"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { profile, type Project } from "@/data/profile";
import { Reveal, ease } from "./Reveal";

function Card({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 150, damping: 20 });

  return (
    <motion.button
      layoutId={`card-${project.name}`}
      onClick={onOpen}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
        e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      style={{ rotateX, rotateY, transformPerspective: 900, ["--c" as string]: project.accent }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border bg-surface p-6 text-left sm:p-8"
    >
      {/* cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(400px circle at var(--x) var(--y), color-mix(in oklab, var(--c) 18%, transparent), transparent 60%)" }}
      />
      <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60" style={{ background: "var(--c)" }} />

      <div className="relative flex items-start justify-between gap-4">
        <motion.h3 layoutId={`title-${project.name}`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {project.name}
        </motion.h3>
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border border-border transition group-hover:rotate-45 group-hover:border-[var(--c)]">
          ↗
        </span>
      </div>
      <p className="relative mt-2 text-muted">{project.tagline}</p>
      <ul className="relative mt-auto flex flex-wrap gap-2 pt-8">
        {project.stack.slice(0, 4).map((s) => (
          <li key={s} className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted">
            {s}
          </li>
        ))}
        {project.stack.length > 4 && <li className="px-1 py-1 font-mono text-xs text-muted">+{project.stack.length - 4}</li>}
      </ul>
    </motion.button>
  );
}

function Modal({ project, onClose }: { project: Project; onClose: () => void }) {
  const lenis = useLenis();
  useEffect(() => {
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [lenis, onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="project-title">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        layoutId={`card-${project.name}`}
        data-lenis-prevent
        style={{ ["--c" as string]: project.accent }}
        className="relative max-h-[85svh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-surface p-6 sm:p-10"
      >
        <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full opacity-40 blur-3xl" style={{ background: "var(--c)" }} />
        <div className="relative flex items-start justify-between gap-4">
          <motion.h3 id="project-title" layoutId={`title-${project.name}`} className="text-3xl font-semibold tracking-tight">
            {project.name}
          </motion.h3>
          <button autoFocus onClick={onClose} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted hover:text-fg">
            ✕
          </button>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ease }} className="relative">
          <p className="mt-2 font-medium" style={{ color: "var(--c)" }}>
            {project.tagline}
          </p>
          <p className="mt-6 leading-relaxed text-muted">{project.description}</p>
          <h4 className="mt-8 font-mono text-xs uppercase tracking-widest text-muted">Stack</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li key={s} className="rounded-full border border-border px-3 py-1 font-mono text-xs">
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">Private repository · demo available on request.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {profile.projects.map((p, i) => (
          <Reveal key={p.name} delay={(i % 2) * 0.1} className="min-h-64">
            <Card project={p} onOpen={() => setOpen(p)} />
          </Reveal>
        ))}
      </div>
      <AnimatePresence>{open && <Modal key={open.name} project={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}
