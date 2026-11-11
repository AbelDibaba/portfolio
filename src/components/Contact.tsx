import { profile } from "@/data/profile";
import { Magnetic } from "./Magnetic";
import { Reveal } from "./Reveal";

export function Contact() {
  const { email, links } = profile;
  const contacts = [
    email && { label: "Email", href: `mailto:${email}` },
    { label: "GitHub", href: links.github },
    links.linkedin && { label: "LinkedIn", href: links.linkedin },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden px-4 py-32">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-accent/15 to-transparent" />
      <div className="relative mx-auto max-w-5xl text-center">
        <Reveal>
          <p className="font-mono text-sm text-accent">05 · Contact</p>
          <h2 className="mt-4 text-[clamp(2.5rem,8vw,6rem)] font-semibold leading-none tracking-tighter">
            Let&apos;s build <span className="text-gradient">something.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-muted">Open to iOS and full-stack roles, freelance work and collaborations.</p>
        </Reveal>
        <Reveal delay={0.15} className="mt-10 flex flex-wrap justify-center gap-3">
          {contacts.map((c) => (
            <Magnetic key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="inline-flex rounded-full border border-border bg-surface px-6 py-3 font-medium transition hover:border-accent hover:text-accent"
              >
                {c.label} ↗
              </a>
            </Magnetic>
          ))}
        </Reveal>
      </div>
      <footer className="relative mx-auto mt-32 flex max-w-5xl flex-wrap justify-between gap-2 border-t border-border pt-6 text-sm text-muted">
        <span>© {profile.name}</span>
        <span>{profile.location}</span>
      </footer>
    </section>
  );
}
