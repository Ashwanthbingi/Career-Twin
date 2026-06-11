import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Twinos" },
      {
        name: "description",
        content:
          "Skill graphs, AI recommendations, career simulation, roadmap generation, and an always-on mentor.",
      },
    ],
  }),
  component: Features,
});

const features = [
  {
    tag: "01",
    title: "Living Skill Graph",
    body: "Map 42,000+ micro-competencies into a dynamic graph that updates as you work.",
  },
  {
    tag: "02",
    title: "AI Career Recommender",
    body: "Recommendations derived from your twin, the market, and 50M anonymized trajectories.",
  },
  {
    tag: "03",
    title: "Career Simulator",
    body: "Run Monte Carlo simulations across decades — salary, satisfaction, market relevance.",
  },
  {
    tag: "04",
    title: "Roadmap Generator",
    body: "Convert any ambition into a sequenced quarterly plan with skills, projects, and people.",
  },
  {
    tag: "05",
    title: "AI Mentor",
    body: "A persistent neural coach that remembers every conversation and decision.",
  },
  {
    tag: "06",
    title: "Privacy Vault",
    body: "End-to-end encrypted twin model. You own the weights, you control the access.",
  },
  {
    tag: "07",
    title: "Decision Sandbox",
    body: "Test offers, pivots, and relocations against your twin before committing.",
  },
  {
    tag: "08",
    title: "Skill Decay Forecasting",
    body: "Detect when an expertise becomes obsolete — before recruiters do.",
  },
  {
    tag: "09",
    title: "Future Vision Synthesis",
    body: "A continuously updated narrative of who your twin is becoming.",
  },
];

function Features() {
  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow="/ Capabilities"
        title={
          <>
            Nine systems. <span className="text-gradient">One twin.</span>
          </>
        }
        subtitle="Every primitive needed to architect a career — composed into a single intelligent organism."
      />

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="glass rounded-3xl p-8 h-full group hover:border-accent/40 transition-colors">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-[10px] font-mono text-accent tracking-widest">
                    / {f.tag}
                  </span>
                  <div className="size-2 rounded-full bg-accent shadow-[0_0_12px_oklch(0.78_0.16_220/0.8)] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
