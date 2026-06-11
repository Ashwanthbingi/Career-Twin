import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import simImg from "@/assets/simulator.jpg";
import { useCareerMatches } from "@/hooks/useCareerMatches";
import { AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/career-simulator")({
  head: () => ({
    meta: [
      { title: "Career Simulator — Twinos" },
      {
        name: "description",
        content:
          "Run 10,000 simulations of your next move. Salary, satisfaction, market relevance, modeled.",
      },
    ],
  }),
  component: Simulator,
});

function Simulator() {
  const { data: matches, isLoading, isError, error, refetch } = useCareerMatches(1);
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (isLoading) {
    return (
      <main className="relative z-10 animate-pulse">
        <div className="px-6 pt-20 pb-12 max-w-7xl mx-auto space-y-4">
          <div className="h-4 w-48 bg-white/10 rounded-full" />
          <div className="h-12 w-2/3 bg-white/10 rounded-2xl" />
          <div className="h-6 w-1/2 bg-white/10 rounded-xl" />
        </div>

        <section className="px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-[2.5rem] p-10 bg-white/5 space-y-8">
              <div className="h-4 w-48 bg-white/10 rounded-full" />
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl h-[300px] bg-white/5" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass p-5 rounded-2xl bg-white/5 h-[80px]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6">
        <div className="glass rounded-[2rem] p-10 max-w-lg w-full text-center space-y-6">
          <div className="mx-auto size-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
            <AlertCircle className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              Simulation Sync Failed
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't load the career simulator data from{" "}
              <code className="text-accent bg-white/5 px-1.5 py-0.5 rounded font-mono">
                http://localhost:8080
              </code>
              .
            </p>
            {error && (
              <p className="text-[11.5px] font-mono text-red-400/80 mt-4 bg-black/30 p-3 rounded-lg overflow-x-auto text-left">
                {error instanceof Error ? error.message : "Unknown connectivity error"}
              </p>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="w-full py-4 px-6 rounded-xl bg-white text-black font-semibold hover:bg-white/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="size-4 mr-2" />
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  const activeMatch = matches?.[selectedIdx] || {
    roleId: 0,
    title: "No simulation selected",
    description: "Please sync your twin or select an active role.",
    matchScore: 0,
    matchedSkills: 0,
    requiredSkills: 0,
    matchedSkillDetails: [],
  };

  const stats = [
    { label: "Market Match Score", value: `${activeMatch.matchScore}%`, w: activeMatch.matchScore },
    {
      label: "Matched Skills",
      value: `${activeMatch.matchedSkills} of ${activeMatch.requiredSkills}`,
      w: activeMatch.requiredSkills
        ? (activeMatch.matchedSkills / activeMatch.requiredSkills) * 100
        : 0,
    },
    {
      label: "Skill Gap Count",
      value: `${activeMatch.requiredSkills - activeMatch.matchedSkills} needed`,
      w: activeMatch.requiredSkills
        ? ((activeMatch.requiredSkills - activeMatch.matchedSkills) / activeMatch.requiredSkills) *
          100
        : 0,
    },
    {
      label: "Matched Details",
      value: `${
        activeMatch.matchedSkillDetails
          .map((s) => s.name)
          .slice(0, 3)
          .join(", ") || "None"
      }`,
      w: 100,
    },
  ];

  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow="/ Career Simulator · v4.0"
        title={
          <>
            Test every <span className="text-gradient">parallel life</span> before you live one.
          </>
        }
        subtitle="Monte Carlo trajectory modeling across 10,000 futures — calibrated against 50M real career paths."
      />

      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="glass rounded-[2.5rem] p-6 md:p-10">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-2.5 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-widest">
                    Simulation Details · {activeMatch.title}
                  </span>
                </div>
                <div className="flex gap-2 font-mono text-[10px]">
                  <span className="px-3 py-1 rounded-full bg-accent/15 text-accent uppercase tracking-widest">
                    Active
                  </span>
                  <span className="px-3 py-1 rounded-full glass uppercase tracking-widest text-muted-foreground">
                    Role ID: {activeMatch.roleId || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-black/40 relative">
                  <img
                    src={simImg}
                    alt="Simulator dashboard"
                    loading="lazy"
                    width={1600}
                    height={900}
                    className="w-full aspect-[16/10] object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <h3 className="font-display text-3xl font-bold mb-2 text-white">
                      {activeMatch.title}
                    </h3>
                    <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
                      {activeMatch.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="glass p-5 rounded-2xl flex flex-col justify-between min-h-[95px]"
                    >
                      <div>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                          {stat.label}
                        </p>
                        <p
                          className="font-display text-lg font-bold text-white truncate"
                          title={stat.value}
                        >
                          {stat.value}
                        </p>
                      </div>
                      <div className="h-[2px] bg-white/5 rounded-full overflow-hidden mt-3">
                        <div className="h-full bg-accent" style={{ width: `${stat.w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent mb-4">
              / Timelines under simulation
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tighter mb-12 max-w-3xl">
              Compare timelines side-by-side.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches?.map((p, i) => (
              <Reveal key={p.roleId} delay={i * 0.08}>
                <div
                  onClick={() => setSelectedIdx(i)}
                  className={`glass rounded-3xl p-7 h-full flex flex-col justify-between cursor-pointer border transition-all duration-300 hover:scale-[1.02] ${
                    selectedIdx === i
                      ? "border-accent shadow-[0_0_40px_-10px_oklch(0.78_0.16_220/0.4)] bg-accent/[0.03]"
                      : "border-glass-border hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <h3 className="font-display text-xl font-bold leading-tight">{p.title}</h3>
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-accent font-semibold whitespace-nowrap">
                        {p.matchScore}% Fit
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                      {p.description}
                    </p>
                  </div>
                  <dl className="space-y-3 font-mono text-[11px] uppercase tracking-widest pt-4 border-t border-glass-border">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Skills Matched</dt>
                      <dd className="text-white">
                        {p.matchedSkills} / {p.requiredSkills}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Missing Gaps</dt>
                      <dd className="text-amber-400/90 font-bold">
                        {p.requiredSkills - p.matchedSkills}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
