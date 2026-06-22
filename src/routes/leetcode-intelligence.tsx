import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Code2,
  LineChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useLeetCodeAnalysis, useLeetCodeIntelligence } from "@/hooks/useLeetCodeAnalysis";
import type { LeetCodeIntelligenceResponse } from "@/types/digital-twin";

export const Route = createFileRoute("/leetcode-intelligence")({
  head: () => ({
    meta: [
      { title: "LeetCode Intelligence - Twinos" },
      {
        name: "description",
        content:
          "Analyze LeetCode problem-solving patterns, interview readiness, and sync coding intelligence into your Digital Twin.",
      },
    ],
  }),
  component: LeetCodeIntelligence,
});

const TOPIC_SHORT: Record<string, string> = {
  Arrays: "Arrays",
  Strings: "Strings",
  Trees: "Trees",
  Graphs: "Graphs",
  "Dynamic Programming": "DP",
  Greedy: "Greedy",
  Backtracking: "BT",
  Heap: "Heap",
  "Binary Search": "BS",
};

const radarConfig = {
  score: {
    label: "Topic Score",
    color: "oklch(0.78 0.16 220)",
  },
};

function LeetCodeIntelligence() {
  const analysis = useLeetCodeAnalysis();
  const persisted = useLeetCodeIntelligence(1);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (persisted.data?.username) {
      setUsername(persisted.data.username);
    }
  }, [persisted.data?.username]);

  const canAnalyze = username.trim().length > 0 && !analysis.isPending;
  const result = analysis.data ?? persisted.data ?? undefined;
  const isStoredProfile = Boolean(persisted.data && !analysis.data);

  const radarData = useMemo(
    () =>
      result?.topicBreakdown.map((topic) => ({
        topic: TOPIC_SHORT[topic.topic] ?? topic.topic,
        fullTopic: topic.topic,
        score: topic.score,
        solved: topic.solved,
      })) ?? [],
    [result],
  );

  const runAnalysis = () => {
    if (!canAnalyze) {
      return;
    }

    analysis.mutate({
      userId: 1,
      username: username.trim(),
    });
  };

  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow="/ Competitive Coding Intelligence"
        title={
          <>
            Decode your <span className="text-gradient">problem-solving DNA</span>.
          </>
        }
        subtitle="Twinos fetches LeetCode signals, scores topic mastery, predicts interview readiness, and recalibrates your Digital Twin — not just stats, real intelligence."
      />

      <section className="px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          <Reveal>
            <div className="glass rounded-[2rem] p-6 md:p-8 border border-glass-border">
              <div className="flex items-center justify-between gap-4 mb-7">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-2">
                    LeetCode GraphQL
                  </p>
                  <h2 className="font-display text-2xl font-bold">Analyze Profile</h2>
                </div>
                <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent">
                  <Code2 className="size-5" />
                </div>
              </div>

              <label
                htmlFor="leetcode-username"
                className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3"
              >
                LeetCode username
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="leetcode-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="your-leetcode-handle"
                  className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-accent focus:bg-white/[0.07]"
                />
                <button
                  type="button"
                  disabled={!canAnalyze}
                  onClick={runAnalysis}
                  className="min-h-14 rounded-2xl bg-white text-black px-6 text-sm font-bold transition-all duration-300 hover:bg-accent active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analysis.isPending ? (
                    <>
                      <span className="size-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 rounded-3xl bg-black/20 border border-white/10 p-5">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Intelligence generated
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  {["Topic Scores", "Interview Readiness", "Strengths", "Growth Timeline"].map(
                    (label) => (
                      <div key={label} className="rounded-2xl bg-white/[0.04] p-3">
                        <p className="text-[11px] font-semibold text-white">{label}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {analysis.isError && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 flex gap-3">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    {analysis.error instanceof Error
                      ? analysis.error.message
                      : "LeetCode analysis failed."}
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass rounded-[2rem] p-6 md:p-8 border border-glass-border min-h-[640px]">
              {analysis.isPending || persisted.isLoading ? (
                <AnalysisLoading />
              ) : result ? (
                <IntelligenceDashboard
                  result={result}
                  radarData={radarData}
                  isStoredProfile={isStoredProfile}
                />
              ) : (
                <EmptyIntelligence />
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function IntelligenceDashboard({
  result,
  radarData,
  isStoredProfile = false,
}: {
  result: LeetCodeIntelligenceResponse;
  radarData: Array<{ topic: string; fullTopic: string; score: number; solved: number }>;
  isStoredProfile?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-2">
            {isStoredProfile ? "Loaded from MySQL" : "Twin Enriched"} · @{result.username}
          </p>
          <h2 className="font-display text-3xl font-bold">Coding Intelligence</h2>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-300">
          {isStoredProfile ? "Persisted" : "Recalibrated"}
        </span>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <MiniStat label="Total" value={result.totalSolved} />
        <MiniStat label="Medium" value={result.mediumSolved} accent />
        <MiniStat label="Hard" value={result.hardSolved} />
        <MiniStat label="Rating" value={result.contestRating || "—"} />
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="size-4 text-accent" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Problem Solving Score
            </p>
          </div>
          <div className="relative mx-auto size-40">
            <div
              className="absolute inset-0 rounded-full transition-all duration-700"
              style={{
                background: `conic-gradient(oklch(0.78 0.16 220) ${result.problemSolvingScore * 3.6}deg, rgb(255 255 255 / 0.08) 0deg)`,
              }}
            />
            <div className="absolute inset-4 rounded-full bg-background/80 border border-white/10 flex items-center justify-center">
              <p className="font-display text-5xl font-black">
                <AnimatedNumber value={result.problemSolvingScore} />
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Composite of volume, difficulty, topic breadth, and contest performance
          </p>
        </div>

        <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="size-4 text-accent" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Topic Radar
            </p>
          </div>
          <ChartContainer config={radarConfig} className="mx-auto aspect-square max-h-[220px]">
            <RadarChart data={radarData} outerRadius="78%">
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis
                dataKey="topic"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => (
                      <span className="font-mono">
                        {item.payload.fullTopic}: {value}/100 ({item.payload.solved} solved)
                      </span>
                    )}
                  />
                }
              />
              <Radar
                name="score"
                dataKey="score"
                stroke="oklch(0.78 0.16 220)"
                fill="oklch(0.78 0.16 220)"
                fillOpacity={0.35}
                animationDuration={900}
              />
            </RadarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <StrengthWeaknessCard
          title="Strengths"
          icon={<Sparkles className="size-4" />}
          items={result.strengths}
          variant="strength"
        />
        <StrengthWeaknessCard
          title="Weaknesses"
          icon={<Zap className="size-4" />}
          items={result.weaknesses}
          variant="weakness"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-4 text-accent" />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Interview Readiness
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <ReadinessCard
            label="Service Companies"
            value={result.interviewReadiness.serviceCompanies}
            description="Strong fundamentals and pattern coverage"
          />
          <ReadinessCard
            label="Product Companies"
            value={result.interviewReadiness.productCompanies}
            description="Medium-depth problem solving"
          />
          <ReadinessCard
            label="FAANG-Level"
            value={result.interviewReadiness.faangLevel}
            description="Hard problems and contest rigor"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-5">
          <LineChart className="size-4 text-accent" />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Coding Growth Timeline
          </p>
        </div>
        <div className="space-y-4">
          {result.growthTimeline.map((stage, index) => (
            <div key={stage.label} className="group">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-white flex items-center gap-2">
                  <span className="text-accent/60">0{index + 1}</span>
                  {stage.label}
                </span>
                <span className="text-accent">{stage.score}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/80 to-white transition-all duration-700 ease-out group-hover:from-accent group-hover:to-accent"
                  style={{ width: `${Math.min(100, stage.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] font-mono text-muted-foreground text-center">
        Digital Twin updated · Career readiness, technical confidence, and Software Engineer match
        recalculated
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-center">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p
        className={`font-display text-2xl font-black ${accent ? "text-accent" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}

function StrengthWeaknessCard({
  title,
  icon,
  items,
  variant,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  variant: "strength" | "weakness";
}) {
  const colors =
    variant === "strength"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : "border-amber-400/20 bg-amber-400/10 text-amber-300";

  return (
    <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-accent">{icon}</span>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-mono ${colors}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReadinessCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 hover:border-accent/30 transition-colors duration-300">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
        {label}
      </p>
      <p className="font-display text-4xl font-black text-white mb-2">
        <AnimatedNumber value={value} />
        <span className="text-xl text-muted-foreground">%</span>
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const interval = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setDisplayValue(Math.round(value * progress));

      if (frame >= totalFrames) {
        window.clearInterval(interval);
        setDisplayValue(value);
      }
    }, 18);

    return () => window.clearInterval(interval);
  }, [value]);

  return <>{displayValue}</>;
}

function AnalysisLoading() {
  return (
    <div className="h-full min-h-[560px] flex flex-col items-center justify-center text-center">
      <div className="relative size-24 mb-8">
        <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping" />
        <div className="absolute inset-3 rounded-full border border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        <Code2 className="absolute inset-0 m-auto size-7 text-accent" />
      </div>
      <h2 className="font-display text-3xl font-bold mb-3">Analyzing LeetCode Profile</h2>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
        Fetching solve stats, scoring topics, computing interview readiness, and syncing coding
        intelligence into your Digital Twin.
      </p>
    </div>
  );
}

function EmptyIntelligence() {
  const preview = useMemo(
    () => [
      ["Problem Solving", "81"],
      ["Arrays", "92"],
      ["Service Ready", "95%"],
      ["FAANG Ready", "68%"],
    ],
    [],
  );

  return (
    <div className="h-full min-h-[560px] flex flex-col justify-center">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-4">
        Awaiting Coding Signal
      </p>
      <h2 className="font-display text-3xl font-bold mb-3">
        Enter a username to unlock intelligence.
      </h2>
      <p className="text-sm text-muted-foreground max-w-xl leading-relaxed mb-8">
        Twinos transforms raw LeetCode data into topic scores, interview readiness predictions,
        strengths and weaknesses, and a growth timeline — then feeds it all into your Digital Twin.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {preview.map(([label, value]) => (
          <div key={label} className="rounded-3xl bg-white/[0.03] border border-white/10 p-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
              {label}
            </p>
            <p className="font-display text-xl font-bold text-white/60">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
        <Trophy className="size-4 text-accent" />
        <span>Powered by LeetCode public GraphQL · No password required</span>
      </div>
    </div>
  );
}
