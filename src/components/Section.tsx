import { Reveal } from "./Reveal";

export function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl lg:grid lg:max-w-[1348px] lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
        {/* the robot's stage: a lane beside the content (desktop) or a strip above it (phones). Nothing else goes here. */}
        <div
          data-stage
          aria-hidden
          className="h-40 motion-reduce:hidden lg:order-2 lg:h-auto"
        />
        <div className="min-w-0">
          <Reveal>
            <p className="font-mono text-sm text-accent">{label}</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h2>
          </Reveal>
          <div className="mt-12">{children}</div>
        </div>
      </div>
    </section>
  );
}
