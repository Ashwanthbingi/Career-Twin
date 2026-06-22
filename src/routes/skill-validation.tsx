import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Filter, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { useSkillConfidenceSummary, useValidatedSkills } from "@/hooks/useSkillValidation";
import type { ValidatedSkillResponse } from "@/types/digital-twin";

type ConfidenceFilter = "all" | "high" | "medium" | "low";

export const Route = createFileRoute("/skill-validation")({
  head: () => ({
    meta: [
      { title: "Skill Validation - Twinos" },
      {
        name: "description",
        content: "Validate career skills using resume and GitHub evidence with confidence scores.",
      },
    ],
  }),
  component: SkillValidation,
});

function SkillValidation() {
  const skillsQuery = useValidatedSkills(1);
  const summaryQuery = useSkillConfidenceSummary(1);
  const [filter, setFilter] = useState<ConfidenceFilter>("all");
  const [sourceFilter, setSourceFilter] = useState("All");

  const skills = skillsQuery.data ?? [];
  const sources = useMemo(
    () => ["All", ...Array.from(new Set(skills.flatMap((skill) => skill.sources))).sort()],
    [skills],
  );

  const filteredSkills = skills.filter((skill) => {
    const inConfidenceBand =
      filter === "all" ||
      (filter === "high" && skill.confidence >= 80) ||
      (filter === "medium" && skill.confidence >= 50 && skill.confidence < 80) ||
      (filter === "low" && skill.confidence < 50);
    const hasSource = sourceFilter === "All" || skill.sources.includes(sourceFilter);
    return inConfidenceBand && hasSource;
  });

  const trustScore =
    skills.length === 0
      ? 0
      : Math.round(skills.reduce((total, skill) => total + skill.confidence, 0) / skills.length);

  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow="/ Skill Validation"
        title={
          <>
            Trust every <span className="text-gradient">skill signal</span>.
          </>
        }
        subtitle="Twinos validates extracted skills against real evidence from resume uploads and GitHub analysis, then assigns confidence scores."
      />

      <section className="px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-6">
          <Reveal>
            <div className="glass rounded-[2rem] border border-glass-border p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-2">
                    Skill Trust Score
                  </p>
                  <h2 className="font-display text-3xl font-bold">{trustScore}%</h2>
                </div>
                <ProgressRing value={trustScore} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <SummaryCard label="High" value={summaryQuery.data?.highConfidence ?? 0} />
                <SummaryCard label="Medium" value={summaryQuery.data?.mediumConfidence ?? 0} />
                <SummaryCard label="Low" value={summaryQuery.data?.lowConfidence ?? 0} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="size-4 text-accent" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Filters
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["all", "high", "medium", "low"] as ConfidenceFilter[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                        filter === item
                          ? "bg-white text-black"
                          : "bg-white/10 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sources.map((source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => setSourceFilter(source)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        sourceFilter === source
                          ? "bg-accent text-black"
                          : "bg-white/10 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass rounded-[2rem] border border-glass-border p-6 md:p-8 min-h-[520px]">
              {skillsQuery.isPending ? (
                <div className="h-full min-h-[420px] flex items-center justify-center">
                  <span className="size-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                </div>
              ) : skillsQuery.isError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
                  Failed to load validated skills.
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center">
                  <ShieldCheck className="size-10 text-accent mb-4" />
                  <h2 className="font-display text-2xl font-bold mb-2">No evidence yet</h2>
                  <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                    Upload a resume or run the GitHub Analyzer to generate real skill evidence.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSkills.map((skill) => (
                    <SkillValidationCard key={skill.skill} skill={skill} />
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2">
        {label}
      </p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative size-24">
      <svg viewBox="0 0 88 88" className="-rotate-90 size-24">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="oklch(0.78 0.16 220)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-bold">{value}%</span>
    </div>
  );
}

function SkillValidationCard({ skill }: { skill: ValidatedSkillResponse }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="size-4 text-accent" />
            <h3 className="font-display text-xl font-bold">{skill.skill}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skill.sources.map((source) => (
              <span
                key={source}
                className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-mono text-accent"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
        <div className="min-w-36">
          <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-muted-foreground">Confidence</span>
            <span className="text-white">{skill.confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${skill.confidence}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {skill.evidence.map((item) => (
          <div
            key={`${skill.skill}-${item.source}`}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-xs font-bold text-white">{item.source}</span>
              <span className="text-[10px] font-mono text-accent">+{item.confidenceScore}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.evidence}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
