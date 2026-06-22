import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import mentorImg from "@/assets/mentor.jpg";

export const Route = createFileRoute("/ai-mentor")({
  head: () => ({
    meta: [
      { title: "AI Mentor — Twinos" },
      {
        name: "description",
        content:
          "An always-on AI mentor trained on your entire career history and the global market.",
      },
    ],
  }),
  component: Mentor,
});

const convo = [
  { who: "you", text: "Should I take the VP role in London?" },
  {
    who: "twin",
    text: "Your twin gives it a 71% positive expected value. Authority +42%, but joy index dips 0.6 for the first 9 months due to relocation. Want me to model a remote-first counter-offer?",
  },
  { who: "you", text: "Yes. Negotiate equity refresh too." },
  {
    who: "twin",
    text: "Drafting. Based on comp data from 134 peers, ask for 0.4% refresh with 2-yr cliff acceleration. Probability of acceptance: 68%.",
  },
];

function Mentor() {
  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow="/ AI Mentor · Always On"
        title={
          <>
            A mentor that <span className="text-gradient">evolved from you.</span>
          </>
        }
        subtitle="Trained on your work, your decisions, and 50M anonymized professional histories — speaking your language."
      />

      <section className="px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <Reveal>
            <div className="relative">
              <div className="absolute inset-0 blur-[100px] bg-accent/30 rounded-full" />
              <div className="relative aspect-square max-w-md mx-auto rounded-full overflow-hidden glass">
                <img
                  src={mentorImg}
                  alt="AI mentor avatar"
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 pb-4 border-b border-glass-border">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Twin Session · #41,208
                </span>
              </div>
              {convo.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.who === "you"
                      ? "ml-auto bg-white/5 border border-white/10"
                      : "bg-accent/10 border border-accent/20 text-white"
                  }`}
                >
                  <p className="text-[10px] font-mono uppercase tracking-widest mb-1 opacity-60">
                    {m.who}
                  </p>
                  {m.text}
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-glass-border flex items-center gap-2">
                <input
                  placeholder="Ask your twin…"
                  className="flex-1 bg-transparent text-sm outline-none px-3 py-2 placeholder:text-muted-foreground"
                />
                <button className="bg-accent text-accent-foreground px-4 py-2 rounded-xl text-xs font-bold">
                  Send
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              t: "Continuous Memory",
              b: "Every conversation, decision, and outcome compounds into long-term context.",
            },
            {
              t: "Market-Aware",
              b: "Connected to real-time labor, comp, and skill demand signals across 180 countries.",
            },
            {
              t: "Aligned to You",
              b: "Tuned on your values, not generic productivity dogma. Disagrees with you when needed.",
            },
          ].map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <div className="glass p-8 rounded-3xl h-full">
                <h3 className="font-display text-xl font-bold mb-3">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
