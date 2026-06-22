import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Code2, Github, GitPullRequest, Star, Trophy } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { useGitHubAnalysis } from "@/hooks/useGitHubAnalysis";
import { useGitHubProfile } from "@/hooks/useGitHubProfile";
import type { GitHubAnalysisResponse } from "@/types/digital-twin";

export const Route = createFileRoute("/github-analyzer")({
  head: () => ({
    meta: [
      { title: "GitHub Analyzer - Twinos" },
      {
        name: "description",
        content: "Analyze public GitHub repositories and enrich your Twinos Digital Twin.",
      },
    ],
  }),
  component: GitHubAnalyzer,
});

function GitHubAnalyzer() {
  const analysis = useGitHubAnalysis();
  const profileQuery = useGitHubProfile(1);
  const [githubUsername, setGithubUsername] = useState("octocat");

  useEffect(() => {
    if (profileQuery.data?.githubUsername) {
      setGithubUsername(profileQuery.data.githubUsername);
    }
  }, [profileQuery.data?.githubUsername]);

  const canAnalyze = githubUsername.trim().length > 0 && !analysis.isPending;
  const result: GitHubAnalysisResponse | undefined =
    analysis.data ??
    (profileQuery.data
      ? {
          repositories: profileQuery.data.repositories,
          stars: profileQuery.data.stars,
          languages: profileQuery.data.languages,
          detectedSkills: profileQuery.data.detectedSkills,
          contributionScore: profileQuery.data.contributionScore,
          recommendedRole: profileQuery.data.recommendedRole,
        }
      : undefined);
  const isStoredProfile = Boolean(profileQuery.data && !analysis.data);
  const topLanguageCount = Math.max(1, result?.languages.length ?? 1);

  const runAnalysis = () => {
    if (!canAnalyze) {
      return;
    }

    analysis.mutate({
      userId: 1,
      githubUsername: githubUsername.trim(),
    });
  };

  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow="/ GitHub Portfolio Analyzer"
        title={
          <>
            Turn public repos into <span className="text-gradient">career signal</span>.
          </>
        }
        subtitle="Connect a GitHub username. Twinos reads public repositories, detects technologies, updates your skill graph, and recalibrates the Digital Twin."
      />

      <section className="px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          <Reveal>
            <div className="glass rounded-[2rem] p-6 md:p-8 border border-glass-border">
              <div className="flex items-center justify-between gap-4 mb-7">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-2">
                    Public GitHub API
                  </p>
                  <h2 className="font-display text-2xl font-bold">Analyze Portfolio</h2>
                </div>
                <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent">
                  <Github className="size-5" />
                </div>
              </div>

              <label
                htmlFor="github-username"
                className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3"
              >
                GitHub username
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="github-username"
                  value={githubUsername}
                  onChange={(event) => setGithubUsername(event.target.value)}
                  placeholder="octocat"
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
                  Signals inspected
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {["Languages", "Topics", "Descriptions"].map((label) => (
                    <div key={label} className="rounded-2xl bg-white/[0.04] p-3">
                      <p className="text-[11px] font-semibold text-white">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.isError && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 flex gap-3">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    {analysis.error instanceof Error
                      ? analysis.error.message
                      : "GitHub analysis failed."}
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass rounded-[2rem] p-6 md:p-8 border border-glass-border min-h-[560px]">
              {analysis.isPending || profileQuery.isLoading ? (
                <AnalysisLoading />
              ) : result ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-2">
                        {isStoredProfile ? "Loaded from MySQL" : "Twin Enriched"}
                      </p>
                      <h2 className="font-display text-3xl font-bold">GitHub Summary</h2>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-300">
                      {isStoredProfile ? "Persisted" : "Recalibrated"}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <MetricCard
                      icon={<GitPullRequest className="size-4" />}
                      label="Repositories"
                      value={result.repositories}
                    />
                    <MetricCard
                      icon={<Star className="size-4" />}
                      label="Stars"
                      value={result.stars}
                    />
                    <MetricCard
                      icon={<Trophy className="size-4" />}
                      label="Contribution"
                      value={result.contributionScore}
                      suffix="%"
                    />
                  </div>

                  <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
                    <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
                        Contribution Score
                      </p>
                      <div className="relative mx-auto size-44">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(oklch(0.78 0.16 220) ${result.contributionScore * 3.6}deg, rgb(255 255 255 / 0.08) 0deg)`,
                          }}
                        />
                        <div className="absolute inset-4 rounded-full bg-background/80 border border-white/10 flex items-center justify-center">
                          <p className="font-display text-5xl font-black">
                            <AnimatedNumber value={result.contributionScore} />
                            <span className="text-xl text-muted-foreground">%</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-5">
                        Languages
                      </p>
                      <div className="space-y-4">
                        {result.languages.length > 0 ? (
                          result.languages.map((language, index) => (
                            <div key={language}>
                              <div className="flex items-center justify-between text-xs font-mono mb-2">
                                <span className="text-white">{language}</span>
                                <span className="text-accent">#{index + 1}</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-accent to-white transition-all duration-700"
                                  style={{
                                    width: `${Math.max(22, 100 - (index * 100) / topLanguageCount)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No repository languages found.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
                    <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
                        Detected Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.detectedSkills.length > 0 ? (
                          result.detectedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-accent/15 border border-accent/20 px-3 py-1.5 text-[11px] font-mono text-accent"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No mapped skills discovered.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5">
                      <div className="size-10 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4">
                        <Code2 className="size-4" />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
                        Recommended Career
                      </p>
                      <h3 className="font-display text-2xl font-bold text-white">
                        {result.recommendedRole}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                        Recommendation recalculated after storing GitHub-discovered skills.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyAnalyzer />
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  suffix = "",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 min-h-36">
      <div className="size-9 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {label}
      </p>
      <p className="font-display text-4xl font-black tracking-tight text-white">
        <AnimatedNumber value={value} />
        {suffix && <span className="text-xl text-muted-foreground">{suffix}</span>}
      </p>
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
    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center">
      <div className="relative size-24 mb-8">
        <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping" />
        <div className="absolute inset-3 rounded-full border border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        <Github className="absolute inset-0 m-auto size-7 text-accent" />
      </div>
      <h2 className="font-display text-3xl font-bold mb-3">Analyzing GitHub Portfolio</h2>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
        Reading public repositories, extracting technologies, mapping skills, and recalibrating the
        Digital Twin.
      </p>
    </div>
  );
}

function EmptyAnalyzer() {
  const preview = useMemo(
    () => [
      ["Repositories", "24"],
      ["Stars", "156"],
      ["Contribution", "82%"],
      ["Role", "Software Engineer"],
    ],
    [],
  );

  return (
    <div className="h-full min-h-[500px] flex flex-col justify-center">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-4">
        Awaiting GitHub Signal
      </p>
      <h2 className="font-display text-3xl font-bold mb-3">Enter a username to enrich the twin.</h2>
      <p className="text-sm text-muted-foreground max-w-xl leading-relaxed mb-8">
        Twinos uses only public repository metadata: languages, topics, descriptions, stars, and
        repository count.
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
    </div>
  );
}
