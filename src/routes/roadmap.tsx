import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import roadmapImg from "@/assets/roadmap.jpg";
import { useSkillGap } from "@/hooks/useSkillGap";
import { useRoadmap } from "@/hooks/useRoadmap";
import { useDigitalTwin } from "@/hooks/useDigitalTwin";
import { AlertCircle, RefreshCw, CheckCircle, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap Generator — Twinos" },
      {
        name: "description",
        content: "Convert any ambition into a quarterly plan: skills, projects, and people.",
      },
    ],
  }),
  component: Roadmap,
});

const ROLES = [
  { id: 1, title: "Software Engineer" },
  { id: 2, title: "Data Scientist" },
  { id: 3, title: "Product Manager" },
  { id: 4, title: "Engineering Manager" },
  { id: 5, title: "Cloud Architect" },
  { id: 6, title: "UX Designer" },
];

function Roadmap() {
  const { data: twin } = useDigitalTwin(1);
  const [selectedRoleId, setSelectedRoleId] = useState(() => twin?.topCareerRoleId ?? 1);

  useEffect(() => {
    if (twin?.topCareerRoleId) {
      setSelectedRoleId(twin.topCareerRoleId);
    }
  }, [twin?.topCareerRoleId]);
  const {
    data: skillGap,
    isLoading: gapLoading,
    isError: gapError,
    error: gapErrorObj,
    refetch: refetchGap,
  } = useSkillGap(1, selectedRoleId);

  const {
    data: roadmapData,
    isLoading: roadmapLoading,
    isError: roadmapError,
    error: roadmapErrorObj,
    refetch: refetchRoadmap,
  } = useRoadmap(1, selectedRoleId);

  const handleRetry = () => {
    refetchGap();
    refetchRoadmap();
  };

  const isLoading = gapLoading || roadmapLoading;
  const isError = gapError || roadmapError;
  const errorObj = gapErrorObj || roadmapErrorObj;

  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow="/ Roadmap Generator"
        title={
          <>
            From ambition to <span className="text-gradient">sequenced plan.</span>
          </>
        }
        subtitle="Select any career target. Your twin returns a custom skill-gap profile and a sequenced quarterly roadmap to achieve it."
      />

      {/* Target Role Selector */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="glass rounded-3xl p-3 flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-2 pl-4 w-full md:w-auto">
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest">
                  Target Career
                </span>
              </div>
              <div className="flex-1 w-full relative">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none text-white cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id} className="bg-neutral-900 text-white">
                      {role.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Skeleton Loading State */}
      {isLoading && (
        <section className="py-24 px-6 animate-pulse space-y-12">
          <div className="max-w-7xl mx-auto glass rounded-[2.5rem] p-10 bg-white/5 space-y-6">
            <div className="h-6 w-48 bg-white/10 rounded-full" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-24 bg-white/5 rounded-2xl" />
              <div className="h-24 bg-white/5 rounded-2xl" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-3xl p-7 h-[250px] bg-white/5" />
            ))}
          </div>
        </section>
      )}

      {/* Error Boundary */}
      {isError && (
        <section className="py-20 px-6 flex flex-col items-center justify-center">
          <div className="glass rounded-[2rem] p-10 max-w-lg w-full text-center space-y-6">
            <div className="mx-auto size-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
              <AlertCircle className="size-8" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Sync Failed</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Could not generate roadmap. Please check if the backend is running.
              </p>
              {errorObj && (
                <p className="text-[11.5px] font-mono text-red-400/80 mt-4 bg-black/30 p-3 rounded-lg overflow-x-auto text-left">
                  {errorObj instanceof Error ? errorObj.message : "Unknown connectivity error"}
                </p>
              )}
            </div>
            <button
              onClick={handleRetry}
              className="w-full py-4 px-6 rounded-xl bg-white text-black font-semibold hover:bg-white/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="size-4 mr-2" />
              Regenerate
            </button>
          </div>
        </section>
      )}

      {/* Actual Data State */}
      {!isLoading && !isError && (
        <>
          {/* Skill Gap Section */}
          {skillGap && (
            <section className="pt-20 px-6">
              <div className="max-w-7xl mx-auto">
                <Reveal>
                  <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-glass-border">
                    <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                      <span className="size-2 bg-accent rounded-full" />
                      Neural Skill Gap: {skillGap.targetRoleTitle}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Matched Skills */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle className="size-3.5 text-emerald-400" />
                          Matched Competencies ({skillGap.matchedSkills.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skillGap.matchedSkills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {skillGap.matchedSkills.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">
                              No matches yet.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <HelpCircle className="size-3.5 text-amber-400" />
                          Target Skill Gaps ({skillGap.missingSkills.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skillGap.missingSkills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/15"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {skillGap.missingSkills.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">
                              No gaps detected. Ready for promotion!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {skillGap.recommendations.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-glass-border">
                        <h4 className="text-[10px] font-mono text-accent uppercase tracking-widest mb-3">
                          Twin Action Plan Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {skillGap.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-white/80 flex items-start gap-2.5">
                              <span className="text-accent mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {/* Quarterly Roadmap Section */}
          {roadmapData && (
            <section className="py-24 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="relative">
                  <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                  <div className="grid md:grid-cols-4 gap-6">
                    {roadmapData.milestones.map((m, i) => (
                      <Reveal key={m.order} delay={i * 0.1}>
                        <div className="relative glass rounded-3xl p-7 h-full flex flex-col justify-between border border-glass-border hover:border-white/10 transition-colors">
                          <div>
                            <div className="absolute -top-3 left-7 px-3.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-mono font-bold tracking-widest uppercase shadow-lg">
                              Q{m.order} Plan
                            </div>
                            <h3 className="font-display text-2xl font-bold mt-4 mb-3">{m.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                              {m.description}
                            </p>
                          </div>
                          <div className="space-y-4 pt-4 border-t border-white/5">
                            {m.skills.length > 0 && (
                              <div>
                                <p className="text-[9px] font-mono text-accent uppercase tracking-widest mb-1.5">
                                  Focus Skills
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {m.skills.map((s) => (
                                    <span
                                      key={s}
                                      className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-white/70 border border-white/10"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {m.actions.length > 0 && (
                              <div>
                                <p className="text-[9px] font-mono text-accent uppercase tracking-widest mb-1.5">
                                  Actions
                                </p>
                                <ul className="space-y-1.5">
                                  {m.actions.map((act) => (
                                    <li
                                      key={act}
                                      className="flex gap-1.5 text-[11px] text-white/80 leading-normal"
                                    >
                                      <span className="text-accent">•</span>
                                      <span>{act}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <section className="px-6">
        <div className="max-w-7xl mx-auto glass rounded-[2rem] overflow-hidden">
          <img
            src={roadmapImg}
            alt="Roadmap timeline visualization"
            loading="lazy"
            width={1600}
            height={900}
            className="w-full aspect-[21/9] object-cover opacity-80"
          />
        </div>
      </section>
    </main>
  );
}
