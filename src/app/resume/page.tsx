import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/data/profile";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = { title: `Resume — ${profile.name}` };

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-2 mt-6 border-b border-neutral-300 pb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">{children}</h2>
);

// Paper is always light, on screen and in print. Browser "Save as PDF" gives the download.
export default function Resume() {
  const { email, links, location } = profile;
  const contact = [location, email, links.github.replace("https://", ""), links.linkedin.replace("https://", "")].filter(Boolean);

  return (
    <div className="min-h-screen px-4 py-8 print:p-0">
      <div className="mx-auto mb-6 flex max-w-[210mm] items-center justify-between print:hidden">
        <Link href="/" className="text-sm text-muted hover:text-fg">
          ← Back to portfolio
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-[14mm] py-[12mm] text-[12.5px] leading-relaxed text-neutral-800 shadow-2xl print:max-w-none print:shadow-none">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{profile.name}</h1>
          <p className="mt-0.5 text-[15px] font-medium text-indigo-600">{profile.role}</p>
          <p className="mt-1 text-neutral-500">{contact.join("  ·  ")}</p>
        </header>

        <H>Summary</H>
        <p>{profile.about.join(" ")}</p>

        <H>Experience</H>
        {profile.experience.map((job) => (
          <section key={job.company} className="break-inside-avoid">
            <div className="flex flex-wrap justify-between gap-x-4">
              <h3 className="font-semibold text-neutral-950">
                {job.title} — {job.company}
              </h3>
              <span className="text-neutral-500">{job.period}</span>
            </div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {job.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ))}

        <H>Projects</H>
        <div className="space-y-2.5">
          {profile.projects.map((p) => (
            <section key={p.name} className="break-inside-avoid">
              <h3 className="font-semibold text-neutral-950">
                {p.name} <span className="font-normal text-neutral-500">— {p.tagline}</span>
              </h3>
              <p>{p.description}</p>
              <p className="text-[11.5px] text-neutral-500">{p.stack.join(" · ")}</p>
            </section>
          ))}
        </div>

        <H>Skills</H>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
          {profile.skills.map((g) => (
            <div key={g.group} className="contents">
              <dt className="font-semibold text-neutral-950">{g.group}</dt>
              <dd>{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>

        {profile.education.length > 0 && (
          <>
            <H>Education</H>
            {profile.education.map((e) => (
              <div key={e.degree} className="flex flex-wrap justify-between gap-x-4">
                <span>
                  <span className="font-semibold text-neutral-950">{e.degree}</span> — {e.school}
                </span>
                <span className="text-neutral-500">{e.period}</span>
              </div>
            ))}
          </>
        )}
      </article>
    </div>
  );
}
