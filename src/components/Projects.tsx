"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { profile, type Project } from "@/data/profile";
import { Reveal, ease } from "./Reveal";
import { BrowserFrame, PhoneFrame, PhonePlaceholder } from "./Mockups";

const lift = "transition-transform duration-500 ease-out";

// The device mockups at the top of each card. Layout depends on which screenshots exist.
function Stage({ project }: { project: Project }) {
  const { desktop } = project.shots;
  // `cover` picks which phone screens the card shows; the popup shows them all.
  const cover = "cover" in project.shots ? project.shots.cover : undefined;
  const phone = cover ? cover.map((i) => project.shots.phone[i]) : project.shots.phone;
  return (
    <div
      className="relative h-56 overflow-hidden rounded-2xl border border-border sm:h-64"
      style={{ background: "radial-gradient(120% 90% at 30% 0%, color-mix(in oklab, var(--c) 30%, transparent), transparent 70%), var(--bg)" }}
    >
      {desktop.length > 0 ? (
        <>
          <BrowserFrame shot={desktop[0]} url={project.name} fixed className={`absolute left-[6%] top-[10%] w-[82%] ${lift} motion-safe:group-hover:-translate-y-2`} />
          {phone[0] && <PhoneFrame shot={phone[0]} className={`absolute -bottom-[38%] right-[5%] w-[24%] ${lift} motion-safe:group-hover:-translate-y-6`} />}
        </>
      ) : phone.length > 0 ? (
        phone.slice(0, 3).map((s, i) => {
          const pos = [
            "left-[12%] rotate-[-10deg] motion-safe:group-hover:-translate-x-3 motion-safe:group-hover:rotate-[-14deg]",
            "left-1/2 -translate-x-1/2 z-10 motion-safe:group-hover:-translate-y-4",
            "right-[12%] rotate-[10deg] motion-safe:group-hover:translate-x-3 motion-safe:group-hover:rotate-[14deg]",
          ][phone.length === 1 ? 1 : i];
          return <PhoneFrame key={s.src} shot={s} className={`absolute -bottom-[45%] w-[28%] ${pos} ${lift}`} />;
        })
      ) : (
        <PhonePlaceholder accent={project.accent} className={`absolute -bottom-[40%] left-1/2 w-[30%] -translate-x-1/2 ${lift} motion-safe:group-hover:-translate-y-4`} />
      )}
    </div>
  );
}

function Card({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-5, 5]), { stiffness: 150, damping: 20 });

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
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border bg-surface p-4 text-left sm:p-5"
    >
      {/* cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(400px circle at var(--x) var(--y), color-mix(in oklab, var(--c) 14%, transparent), transparent 60%)" }}
      />
      <Stage project={project} />
      <div className="relative flex items-start justify-between gap-4 px-2 pt-5">
        <motion.h3 layoutId={`title-${project.name}`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {project.name}
        </motion.h3>
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border border-border transition group-hover:rotate-45 group-hover:border-[var(--c)]">
          ↗
        </span>
      </div>
      <p className="relative mt-1 px-2 text-muted">{project.tagline}</p>
      <ul className="relative mt-auto flex flex-wrap gap-2 px-2 pb-1 pt-6">
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

  const { desktop, phone } = project.shots;
  const item = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.2 + i * 0.08, duration: 0.6, ease },
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="project-title">
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        layoutId={`card-${project.name}`}
        data-lenis-prevent
        style={{ ["--c" as string]: project.accent }}
        className="relative max-h-[90svh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-border bg-surface p-5 sm:p-10"
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-40 blur-3xl" style={{ background: "var(--c)" }} />
        <div className="relative flex items-start justify-between gap-4">
          <motion.h3 id="project-title" layoutId={`title-${project.name}`} className="text-3xl font-semibold tracking-tight">
            {project.name}
          </motion.h3>
          <button autoFocus onClick={onClose} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted hover:text-fg">
            ✕
          </button>
        </div>
        <motion.div {...item(0)} className="relative">
          <p className="mt-2 font-medium" style={{ color: "var(--c)" }}>
            {project.tagline}
          </p>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">{project.description}</p>
        </motion.div>

        <div className="relative mt-10 space-y-6">
          {desktop.map((s, i) => (
            <motion.div key={s.src} {...item(i + 1)}>
              <BrowserFrame shot={s} url={project.name} />
            </motion.div>
          ))}
          {phone.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {phone.map((s, i) => (
                <motion.div key={s.src} {...item(desktop.length + i + 1)} className="w-[42%] max-w-[230px] sm:w-[30%]">
                  <PhoneFrame shot={s} />
                </motion.div>
              ))}
            </div>
          ) : (
            desktop.length === 0 && (
              <motion.div {...item(1)} className="mx-auto w-[45%] max-w-[220px]">
                <PhonePlaceholder accent={project.accent} />
              </motion.div>
            )
          )}
        </div>

        <motion.div {...item(desktop.length + phone.length + 1)} className="relative">
          <h4 className="mt-10 font-mono text-xs uppercase tracking-widest text-muted">Stack</h4>
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
          <Reveal key={p.name} delay={(i % 2) * 0.1}>
            <Card project={p} onOpen={() => setOpen(p)} />
          </Reveal>
        ))}
      </div>
      <AnimatePresence>{open && <Modal key={open.name} project={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}
