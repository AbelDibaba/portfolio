import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <Providers>
      <Nav />
      <main>
        <Hero />
        <Section id="about" label="01 · About" title="A bit about me">
          <About />
        </Section>
        <Section id="experience" label="02 · Experience" title="Where I work">
          <Experience />
        </Section>
        <Section id="work" label="03 · Selected work" title="Things I've built">
          <Projects />
        </Section>
        <Section id="skills" label="04 · Skills" title="My toolbox">
          <Skills />
        </Section>
        <Contact />
      </main>
    </Providers>
  );
}
