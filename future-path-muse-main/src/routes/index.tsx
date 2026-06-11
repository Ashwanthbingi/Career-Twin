import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-twin.jpg";
import skillImg from "@/assets/skill-graph.jpg";
import simImg from "@/assets/simulator.jpg";
import visionImg from "@/assets/vision.jpg";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Twinos — Your Career, Synchronized." },
      {
        name: "description",
        content:
          "Smart Career Digital Twin: mirror your skills, simulate every future, and generate a roadmap with an always-on AI mentor.",
      },
      { property: "og:title", content: "Twinos — Your Career, Synchronized." },
      { property: "og:description", content: "AI digital twin of your professional self." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative z-10">
      {/* HERO */}
      <section className="relative pt-20 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center [animation:blur-in_1.2s_var(--ease-apple)_both]">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full mb-8">
            <span className="size-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
              Simulation Engine · Live
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-balance mb-10">
            YOUR CAREER,
            <br />
            <span className="text-gradient">SYNCHRONIZED.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground text-pretty mb-12">
            Twinos builds a living digital twin of your professional self — so you can simulate,
            rehearse, and engineer every possible future before you live it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/digital-twin"
              className="px-8 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-8px_oklch(0.78_0.16_220/0.6)]"
            >
              Generate My Twin
            </Link>
            <Link
              to="/career-simulator"
              className="px-8 py-4 glass rounded-xl hover:bg-white/10 transition-colors"
            >
              Explore Simulator
            </Link>
          </div>
        </div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 60, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <div className="glass rounded-[2rem] p-3 relative overflow-hidden">
            <div className="relative w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-black">
              <img
                src={heroImg}
                alt="Digital twin neural interface"
                width={1600}
                height={900}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-6 left-6 p-4 glass rounded-xl animate-float">
                <p className="text-[10px] font-mono text-accent mb-1">SYNC_STATUS</p>
                <p className="text-2xl font-display font-bold">98.4%</p>
              </div>
              <div
                className="absolute bottom-6 right-6 p-4 glass rounded-xl animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <p className="text-[10px] font-mono text-accent mb-1">NEURAL_LINK</p>
                <p className="text-2xl font-display font-bold">ACTIVE</p>
              </div>
              <div className="absolute bottom-6 left-6 p-4 glass rounded-xl">
                <p className="text-[10px] font-mono text-muted-foreground">v4.0 · Obsidian</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <section className="py-12 border-y border-glass-border overflow-hidden">
        <div className="flex gap-16 animate-[drift_30s_linear_infinite] whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-16">
              <span>Neural sync</span>
              <span>·</span>
              <span>Skill graph</span>
              <span>·</span>
              <span>Career simulation</span>
              <span>·</span>
              <span>AI mentor</span>
              <span>·</span>
              <span>Roadmap engine</span>
              <span>·</span>
              <span>Future vision</span>
              <span>·</span>
              <span>Twin model v4</span>
              <span>·</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent mb-4">
              / 01 — Architecture
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter mb-16 max-w-3xl">
              A high-fidelity model of <span className="text-gradient">who you are becoming.</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: "Skill Graph",
                title: "Visual Intelligence",
                body: "Every skill mapped in a living 3D graph. See where you lead and where the market is pulling you next.",
                img: skillImg,
              },
              {
                tag: "Simulator",
                title: "Timeline Sandbox",
                body: "Run 10,000 simulations of your next move. Forecast salary, fulfillment, and longevity before you commit.",
                img: simImg,
              },
              {
                tag: "AI Mentor",
                title: "Neural Coaching",
                body: "A 24/7 mentor that knows your full history and future. Strategic advice that compounds over time.",
                img: visionImg,
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.1}>
                <div className="glass p-8 rounded-3xl flex flex-col gap-8 h-full hover:-translate-y-1 transition-transform duration-500">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/40">
                    <img
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      width={1200}
                      height={900}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-3">
                      {c.tag}
                    </p>
                    <h3 className="text-2xl font-display font-bold mb-3">{c.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto glass rounded-[2.5rem] p-12 md:p-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              ["10K+", "Simulated futures / user"],
              ["42K", "Skill nodes mapped"],
              ["98.4%", "Twin sync fidelity"],
              ["24/7", "AI mentor uptime"],
            ].map(([n, l]) => (
              <Reveal key={l}>
                <div>
                  <div className="font-display text-5xl md:text-6xl font-black tracking-tighter text-gradient mb-2">
                    {n}
                  </div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    {l}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VISION TEASER */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-tighter mb-8">
              THE FUTURE ISN'T GUESSED.
              <br />
              <span className="text-accent">IT'S COMPUTED.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              Twinos isn't a job board. It's the infrastructure layer for a decentralized workforce
              — where every professional operates through a synthetic proxy.
            </p>
            <Link
              to="/vision"
              className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-accent hover:gap-4 transition-all"
            >
              Read the vision →
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
