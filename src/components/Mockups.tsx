import Image from "next/image";

export type Shot = { src: string; w: number; h: number; alt: string };

// A desktop browser window around a screenshot. `fixed` crops to 16:10 (card); otherwise natural size (modal).
export function BrowserFrame({
  shot,
  url,
  fixed,
  className = "",
}: {
  shot: Shot;
  url: string;
  fixed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/40 ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-neutral-800/90 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate rounded-md bg-neutral-900/80 px-3 py-0.5 font-mono text-[10px] text-neutral-400">
          {url}
        </span>
      </div>
      {fixed ? (
        <div className="relative aspect-[16/10]">
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            sizes="(min-width: 640px) 400px, 90vw"
            className="object-cover object-top"
          />
        </div>
      ) : (
        <Image
          src={shot.src}
          alt={shot.alt}
          width={shot.w}
          height={shot.h}
          sizes="(min-width: 896px) 800px, 95vw"
          className="h-auto w-full"
        />
      )}
    </div>
  );
}

const phoneShell =
  "relative aspect-[390/844] overflow-hidden rounded-[2rem] border-[6px] border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/50 ring-1 ring-white/10";
const island = (
  <span
    aria-hidden
    className="absolute left-1/2 top-2 z-10 h-[5%] w-[32%] -translate-x-1/2 rounded-full bg-black"
  />
);

export function PhoneFrame({
  shot,
  className = "",
}: {
  shot: Shot;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={phoneShell}>
        {island}
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="(min-width: 640px) 220px, 40vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

// Shown until real screenshots are added for a project.
export function PhonePlaceholder({
  accent,
  className = "",
}: {
  accent: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={phoneShell}>
        {island}
        <div
          className="absolute inset-0 grid place-items-center"
          style={{
            background: `radial-gradient(circle at 50% 40%, color-mix(in oklab, ${accent} 35%, transparent), transparent 70%)`,
          }}
        >
          <div className="relative grid size-14 place-items-center">
            <span
              className="absolute inset-0 rounded-full motion-safe:animate-ping"
              style={{ background: accent, opacity: 0.3 }}
            />
            <span
              className="relative grid size-14 place-items-center rounded-full text-black"
              style={{ background: accent }}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="currentColor"
                aria-hidden
              >
                <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
              </svg>
            </span>
          </div>
          <span className="absolute bottom-[14%] font-mono text-[10px] text-neutral-400">
            Screens coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
