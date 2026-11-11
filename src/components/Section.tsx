import { Reveal } from "./Reveal";

export function Section({ id, label, title, children }: { id: string; label: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-sm text-accent">{label}</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
