import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import visionImg from "@/assets/vision.jpg";

export const Route = createFileRoute("/vision")({
  head: () => ({
    meta: [
      { title: "Future Vision — Twinos" },
      {
        name: "description",
        content:
          "By 2030, every professional will operate through a synthetic proxy. We are building that infrastructure.",
      },
      { property: "og:title", content: "Future Vision — Twinos" },
      { property: "og:image", content: "/assets/vision.jpg" },
    ],
  }),
  component: Vision,
});

function Vision() {
  return (
    <main className="relative z-10">
      <section className="relative pt-28 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent mb-8">
              / Vision 2030
            </p>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-balance mb-10">
              THE FUTURE
              <br />
              <span className="text-gradient">ISN'T GUESSED.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground text-pretty">
              By 2030, every serious professional will operate through a digital proxy. Twinos is
              the infrastructure layer for that workforce.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6">
        <Reveal>
          <div className="max-w-7xl mx-auto glass rounded-[3rem] overflow-hidden group">
            <img
              src={visionImg}
              alt="The vision of an AI-augmented future"
              loading="lazy"
              width={1600}
              height={900}
              className="w-full aspect-[21/9] object-cover group-hover:scale-105 transition-transform duration-[2s]"
            />
          </div>
        </Reveal>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto space-y-24">
          {[
            {
              y: "2026",
              h: "The Twin emerges",
              b: "Personal models become legally distinct entities, capable of operating asynchronously on your behalf.",
            },
            {
              y: "2028",
              h: "Negotiated by proxy",
              b: "Salary, scope, and equity terms are pre-negotiated between twins before humans ever meet.",
            },
            {
              y: "2030",
              h: "Autonomy",
              b: "Twins proactively secure opportunities, manage growth, and protect time. You direct — the twin executes.",
            },
          ].map((m, i) => (
            <Reveal key={m.y} delay={i * 0.1}>
              <div className="grid md:grid-cols-[160px_1fr] gap-8 items-start">
                <div className="font-display text-5xl md:text-6xl font-black tracking-tighter text-gradient">
                  {m.y}
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold mb-4">{m.h}</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">{m.b}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-[2.5rem] p-12">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-tighter mb-6">
              Be early. Be sovereign.
            </h2>
            <p className="text-muted-foreground mb-8">
              Join the first cohort of professionals operating as twins.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Request access
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
