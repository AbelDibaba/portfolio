"use client";
import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import { ThemeToggle } from "./ThemeToggle";
import { ease } from "./Reveal";

const links = [
  ["About", "#about"],
  ["Work", "#work"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
];

export function Nav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6, ease }}
      className="fixed inset-x-0 top-0 z-40 px-4 pt-4"
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-border bg-surface/70 py-2 pl-5 pr-2 backdrop-blur-md">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          abel<span className="text-accent">.</span>dev
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 sm:flex">
            {links.map(([label, href]) => (
              <li key={href}>
                <a href={href} className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-fg/5 hover:text-fg">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/resume" className="rounded-full bg-fg px-4 py-1.5 text-sm font-medium text-bg transition hover:opacity-85">
            Resume
          </Link>
          <ThemeToggle />
        </div>
      </nav>
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-accent to-accent-2"
      />
    </motion.header>
  );
}
