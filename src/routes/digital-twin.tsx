import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import heroImg from "@/assets/hero-twin.jpg";
import skillImg from "@/assets/skill-graph.jpg";
import { useDigitalTwin } from "@/hooks/useDigitalTwin";
import { useCurrentResume } from "@/hooks/useCurrentResume";
import { useRefreshDigitalTwin } from "@/hooks/useRefreshDigitalTwin";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { useRagResumeAnalysis, useTriggerRagResumeAnalysis } from "@/hooks/useRagResumeAnalysis";
import { useRagCareerRecommendation, useTriggerRagCareerRecommendation } from "@/hooks/useRagCareerRecommendation";
import { AlertCircle, Database, RefreshCw, Upload, CheckCircle, Brain, Award, AlertTriangle, Activity, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/digital-twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin Demo — Twinos" },
      {
        name: "description",
        content: "A live preview of the digital twin: neural sync, skill graph, decision sandbox.",
      },
    ],
  }),
  component: DigitalTwin,
});

const skills: [string, number][] = [
  ["Systems Design", 92],
  ["Product Strategy", 87],
  ["Engineering Leadership", 79],
  ["Negotiation", 64],
  ["Public Speaking", 58],
  ["Machine Learning", 72],
];

function DigitalTwin() {
  const { data, isLoading, isError, error, refetch } = useDigitalTwin(1);
  const resumeQuery = useCurrentResume(1);
  const refreshMutation = useRefreshDigitalTwin();
  const uploadMutation = useResumeUpload();

  const ragResumeQuery = useRagResumeAnalysis(1);
  const ragCareerQuery = useRagCareerRecommendation(1);
  const triggerResumeMutation = useTriggerRagResumeAnalysis();
  const triggerCareerMutation = useTriggerRagCareerRecommendation();

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSyncingAI, setIsSyncingAI] = useState(false);

  const handleTriggerAISynapse = () => {
    setIsSyncingAI(true);
    toast.promise(
      Promise.all([
        triggerResumeMutation.mutateAsync(1),
        triggerCareerMutation.mutateAsync(1),
      ]),
      {
        loading: "Running RAG Synapse Engine...",
        success: () => {
          setIsSyncingAI(false);
          return "RAG career models synced successfully!";
        },
        error: (err) => {
          setIsSyncingAI(false);
          return `Failed to run cognitive RAG: ${err instanceof Error ? err.message : "Service offline"}`;
        }
      }
    );
  };

  const handleFile = (file: File) => {
    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      setUploadError("Only PDF resumes are accepted.");
      return;
    }
    setUploadError(null);
    setUploadProgress(0);
    uploadMutation.mutate(
      {
        userId: 1,
        file,
        onProgress: (progress) => setUploadProgress(progress),
      },
      {
        onSuccess: (response) => {
          toast.success("Digital twin recalibrated", {
            description: `${response.detectedSkillCount} resume skills stored and synced across your dashboard.`,
          });
        },
        onError: (err) => {
          setUploadError(err instanceof Error ? err.message : "Failed to parse resume.");
        },
      },
    );
  };

  const handleRefreshTwin = () => {
    refreshMutation.mutate(1, {
      onSuccess: () => {
        toast.success("Digital twin regenerated", {
          description:
            "Readiness score, top career, skill graph, and cached feature data were updated.",
        });
      },
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <main className="relative z-10 animate-pulse">
        <div className="px-6 pt-20 pb-12 max-w-7xl mx-auto space-y-4">
          <div className="h-4 w-48 bg-white/10 rounded-full" />
          <div className="h-12 w-2/3 bg-white/10 rounded-2xl" />
          <div className="h-6 w-1/2 bg-white/10 rounded-xl" />
        </div>

        <section className="px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-6">
            <div className="glass rounded-[2rem] p-3 relative overflow-hidden">
              <div className="relative aspect-[5/4] rounded-[1.5rem] bg-white/5" />
            </div>
            <div className="glass rounded-[2rem] p-8 h-full flex flex-col space-y-8 bg-white/5">
              <div className="h-4 w-32 bg-white/10 rounded-full" />
              <div className="space-y-6 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-white/10 rounded-full" />
                      <div className="h-3 w-8 bg-white/10 rounded-full" />
                    </div>
                    <div className="h-[3px] bg-white/5 rounded-full" />
                  </div>
                ))}
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
            <h2 className="text-2xl font-display font-bold text-white mb-2">Neural Sync Failed</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't connect to the digital twin service at{" "}
              <code className="text-accent bg-white/5 px-1.5 py-0.5 rounded font-mono">
                {import.meta.env.VITE_API_URL || "http://localhost:8080"}
              </code>
              . Please ensure the backend is running.
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

  const twin = data;

  if (!twin) {
    return null;
  }

  const isRecalibrating = uploadMutation.isPending && uploadProgress >= 95;
  const uploadStatusLabel = isRecalibrating
    ? "Recalibrating Twin..."
    : `Uploading resume... ${uploadProgress}%`;

  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow={`/ Digital Twin · MySQL · ${twin.userName}`}
        title={
          <>
            Meet the <span className="text-gradient">version of you</span> living in the cloud.
          </>
        }
        subtitle={`Live twin computed from persisted resume, GitHub, LeetCode, skills, career match, and roadmap data — accurate to ${twin.readinessScore}%.`}
      />

      <section className="px-6">
        <div className="max-w-7xl mx-auto flex justify-end">
          <button
            type="button"
            onClick={handleRefreshTwin}
            disabled={refreshMutation.isPending}
            className="rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`size-4 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Refresh Twin
          </button>
        </div>
      </section>

      <section className="pt-8 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-4">
          <OverviewMetric label="Readiness Score" value={`${twin.readinessScore}%`} />
          <OverviewMetric label="Top Career" value={twin.topCareer} />
          <OverviewMetric label="Career Projection" value={twin.projectedCareer || twin.topCareer} />
          <OverviewMetric label="Salary Projection" value={twin.salaryProjection || "Pending"} />
        </div>
      </section>

      <section className="px-6 pt-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          <PersistenceBadge label="Resume" active={twin.hasResume} />
          <PersistenceBadge label="GitHub" active={twin.hasGitHubProfile} />
          <PersistenceBadge label="LeetCode" active={twin.hasLeetCodeProfile} />
          {resumeQuery.data && (
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground px-3 py-1.5 rounded-full border border-white/10">
              {resumeQuery.data.originalFilename} · {resumeQuery.data.detectedSkillCount} skills
            </span>
          )}
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <Reveal>
            <div className="glass rounded-[2rem] p-3 relative overflow-hidden">
              <div className="relative aspect-[5/4] rounded-[1.5rem] overflow-hidden">
                <img
                  src={heroImg}
                  alt="Twin neural interface"
                  loading="lazy"
                  width={1600}
                  height={1280}
                  className="w-full h-full object-cover"
                />

                {/* 1. Readiness Score */}
                <div className="absolute top-6 left-6 p-4 glass rounded-xl animate-float">
                  <p className="text-[10px] font-mono text-accent mb-1">SYNC / READINESS</p>
                  <p className="text-xl font-display font-bold">{twin.readinessScore}%</p>
                </div>

                {/* 2. Top Career */}
                <div
                  className="absolute top-6 right-6 p-4 glass rounded-xl animate-float"
                  style={{ animationDelay: "0.75s" }}
                >
                  <p className="text-[10px] font-mono text-accent mb-1">TOP CAREER</p>
                  <p
                    className="text-sm font-display font-bold max-w-[150px] truncate"
                    title={twin.topCareer}
                  >
                    {twin.topCareer}
                  </p>
                </div>

                {/* 3. Projects Count */}
                <div
                  className="absolute bottom-6 left-6 p-4 glass rounded-xl animate-float"
                  style={{ animationDelay: "2.25s" }}
                >
                  <p className="text-[10px] font-mono text-accent mb-1">PROJECTS</p>
                  <p className="text-xl font-display font-bold">{twin.projectsCount}</p>
                </div>

                {/* 4. Skills Count */}
                <div
                  className="absolute bottom-6 right-6 p-4 glass rounded-xl animate-float"
                  style={{ animationDelay: "1.5s" }}
                >
                  <p className="text-[10px] font-mono text-accent mb-1">SKILLS SYNCED</p>
                  <p className="text-xl font-display font-bold">
                    {twin.skillsCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-[2rem] p-8 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-8">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Skill Graph · Realtime
                </span>
              </div>
              <div className="space-y-5 flex-1">
                {(twin.skillGraph && twin.skillGraph.length > 0
                  ? twin.skillGraph
                  : skills.map(([name, val]) => ({
                      skillId: 0,
                      name,
                      category: "Technical",
                      strength: val,
                      evidenceCount: 1,
                    }))
                ).map((node) => (
                  <div key={`${node.skillId}-${node.name}`}>
                    <div className="flex justify-between mb-2 text-xs font-mono">
                      <span className="text-white/80">{node.name}</span>
                      <span className="text-accent">{node.strength}</span>
                    </div>
                    <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-white"
                        style={{ width: `${node.strength}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-glass-border">
                <p className="text-[10px] font-mono text-accent tracking-widest mb-2">
                  TWIN SUGGESTION
                </p>
                <p className="text-sm leading-relaxed">
                  Investing 60 hrs/quarter in <span className="text-accent">Negotiation</span>{" "}
                  raises projected comp by <span className="text-accent">+18%</span> within 18
                  months.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pt-6 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <SnapshotList title="Strengths" items={twin.strengths ?? []} tone="accent" />
          <SnapshotList title="Weaknesses" items={twin.weaknesses ?? []} tone="muted" />
          <SnapshotList
            title="Missing Skills"
            items={(twin.missingSkills ?? []).map((skill) => skill.name)}
            tone="muted"
          />
        </div>
        <div className="max-w-7xl mx-auto mt-4 text-right text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Last Updated {twin.lastUpdatedAt ? new Date(twin.lastUpdatedAt).toLocaleString() : "Pending"}
        </div>
      </section>

      {/* AI Synaptic Insights Section */}
      <section className="pt-12 px-6 max-w-7xl mx-auto">
        <Reveal>
          <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-glass-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Brain className="size-5 text-accent animate-pulse" />
                  Cognitive RAG Synapse
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Retrieve context from vector base indexing + LLM generative analytics. Computes hidden strengths, missing competencies, and evidenced suitability pathways.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerAISynapse}
                disabled={isSyncingAI}
                className="rounded-full bg-accent/20 border border-accent/30 hover:bg-accent/30 px-5 py-2.5 text-xs font-semibold text-accent transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap self-start md:self-center"
              >
                <Activity className={`size-4 ${isSyncingAI ? "animate-spin" : ""}`} />
                Run AI Recalibration
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Resume Analysis */}
              <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-white flex items-center gap-2">
                    <Award className="size-4 text-accent" />
                    Deep Resume Synapse
                  </h4>
                  <span className="text-[9px] font-mono uppercase text-muted-foreground px-2 py-0.5 rounded border border-white/10">
                    24h TTL Cache
                  </span>
                </div>

                {ragResumeQuery.isLoading ? (
                  <div className="space-y-3 py-4">
                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                    <div className="h-16 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                  </div>
                ) : ragResumeQuery.data ? (
                  <div className="space-y-4">
                    <p className="text-xs leading-relaxed text-white/80 italic bg-black/20 p-3 rounded-xl border border-white/5">
                      "{ragResumeQuery.data.summary}"
                    </p>

                    <div>
                      <h5 className="text-[10px] font-mono uppercase tracking-wider text-accent mb-2">Inferred / Hidden Skills</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {ragResumeQuery.data.inferredSkills.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-1 bg-accent/10 border border-accent/20 rounded text-accent" title={`Evidence: ${s.evidence}`}>
                            {s.name} (Inferred)
                          </span>
                        ))}
                        {ragResumeQuery.data.hiddenSkills.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-1 bg-white/5 border border-white/10 rounded text-white/70" title={`Evidence: ${s.evidence}`}>
                            {s.name} (Hidden)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-[10px] font-mono uppercase tracking-wider text-accent mb-2 flex items-center gap-1">
                          <ShieldCheck className="size-3 text-emerald-400" /> Strengths
                        </h5>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {ragResumeQuery.data.strengths.slice(0, 2).map((s, idx) => (
                            <li key={idx} className="bg-black/10 p-2.5 rounded-lg border border-white/5">
                              <span className="font-semibold text-white/95 block text-[11px]">{s.area} ({s.score}%)</span>
                              <span className="text-[10px] leading-tight block mt-0.5">{s.evidence}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-mono uppercase tracking-wider text-accent mb-2 flex items-center gap-1">
                          <AlertTriangle className="size-3 text-amber-400" /> Gaps
                        </h5>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {ragResumeQuery.data.weaknesses.slice(0, 2).map((w, idx) => (
                            <li key={idx} className="bg-black/10 p-2.5 rounded-lg border border-white/5">
                              <span className="font-semibold text-white/95 block text-[11px]">{w.area} (Gap)</span>
                              <span className="text-[10px] leading-tight block mt-0.5">{w.evidence}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center italic">Run AI Recalibration to generate resume insights.</p>
                )}
              </div>

              {/* Career recommendations */}
              <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-white flex items-center gap-2">
                    <Brain className="size-4 text-accent" />
                    Generative Career Recommendation
                  </h4>
                  <span className="text-[9px] font-mono uppercase text-muted-foreground px-2 py-0.5 rounded border border-white/10">
                    evidence backed
                  </span>
                </div>

                {ragCareerQuery.isLoading ? (
                  <div className="space-y-3 py-4">
                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                    <div className="h-16 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                  </div>
                ) : ragCareerQuery.data ? (
                  <div className="space-y-4">
                    <p className="text-xs leading-relaxed text-white/80 italic bg-black/20 p-3 rounded-xl border border-white/5">
                      "{ragCareerQuery.data.summary}"
                    </p>

                    <div className="space-y-3">
                      {ragCareerQuery.data.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-white text-sm">{rec.role}</h5>
                            <span className="text-xs font-mono font-bold text-accent">{rec.score}% Match</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {rec.reasoning}
                          </p>
                          <div className="pt-1.5 flex flex-wrap gap-2 text-[10px] text-accent font-mono">
                            <span className="border border-accent/20 px-2 py-0.5 rounded">Gaps: {rec.gaps.length}</span>
                            <span className="border border-accent/20 px-2 py-0.5 rounded">Steps: {rec.nextSteps.length}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center italic">Run AI Recalibration to discover career recommendations.</p>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Resume Upload Sync Widget */}
      <section className="pt-16 px-6 max-w-7xl mx-auto">
        <Reveal>
          <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-glass-border">
            <h3 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="size-5 text-accent" />
              Resume Stored Once · Twin Recalibrated
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Upload your resume once. The PDF is stored on disk, metadata lives in MySQL, and skills
              persist across refresh — Career Match, Skill Gap, Roadmap, and Validation all read from
              the database.
            </p>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border border-dashed rounded-[1.5rem] p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-accent bg-accent/5 scale-[1.01]"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={uploadMutation.isPending}
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                <div
                  className={`size-14 rounded-2xl flex items-center justify-center border ${
                    uploadMutation.isPending
                      ? "bg-accent/10 border-accent/20 text-accent"
                      : "bg-white/5 border-white/10 text-muted-foreground"
                  }`}
                >
                  {uploadMutation.isPending ? (
                    <RefreshCw className="size-6 animate-spin" />
                  ) : (
                    <Upload className="size-6" />
                  )}
                </div>

                {uploadMutation.isPending ? (
                  <div className="w-full max-w-md">
                    <p className="text-sm text-white font-semibold">{uploadStatusLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isRecalibrating
                        ? "Refreshing career match, skill gap, roadmap, and twin metrics."
                        : "Securely sending your PDF for skill extraction."}
                    </p>
                    <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent via-white to-emerald-300 transition-all duration-500 ease-out"
                        style={{ width: `${Math.max(uploadProgress, 8)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-white font-semibold">
                      Drag and drop your PDF resume here, or{" "}
                      <label
                        htmlFor="resume-file-input"
                        className="text-accent underline cursor-pointer hover:text-accent/80 transition-colors"
                      >
                        browse files
                      </label>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only PDF format accepted. Max file size 5MB.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-sm text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Success Message & Parsed Data display */}
            {(uploadMutation.isSuccess && uploadMutation.data) || resumeQuery.data ? (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-emerald-400" />
                  <h4 className="text-sm font-display font-bold text-white">
                    {uploadMutation.isSuccess ? "Resume Synced Successfully!" : "Resume Loaded from MySQL"}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {uploadMutation.isSuccess && uploadMutation.data ? (
                    <>
                      Stored {uploadMutation.data.detectedSkillCount} skill nodes and refreshed{" "}
                      {uploadMutation.data.refresh.careerMatchCount} cached career matches,{" "}
                      {uploadMutation.data.refresh.missingSkillCount} skill gaps, and{" "}
                      {uploadMutation.data.refresh.roadmapMilestoneCount} roadmap milestones.
                    </>
                  ) : (
                    <>
                      Active resume <span className="text-white">{resumeQuery.data?.originalFilename}</span>{" "}
                      with {resumeQuery.data?.detectedSkillCount ?? 0} stored skills persists across refresh.
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(uploadMutation.data?.detectedSkills ?? []).map((s) => (
                    <span
                      key={s.id}
                      className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                    >
                      {s.name}
                    </span>
                  ))}
                  {uploadMutation.isSuccess &&
                    uploadMutation.data &&
                    uploadMutation.data.detectedSkillCount === 0 && (
                      <span className="text-xs text-muted-foreground italic">No matches.</span>
                    )}
                </div>
                {(uploadMutation.data?.extractedTextPreview || resumeQuery.data?.extractedTextPreview) && (
                  <details className="text-[10px] font-mono text-muted-foreground/80 cursor-pointer pt-2">
                    <summary className="hover:text-white transition-colors">
                      View extracted preview
                    </summary>
                    <pre className="mt-2 p-3 bg-black/40 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-[150px] leading-relaxed text-left text-muted-foreground select-none">
                      {uploadMutation.data?.extractedTextPreview ??
                        resumeQuery.data?.extractedTextPreview}
                    </pre>
                  </details>
                )}
              </div>
            ) : null}
          </div>
        </Reveal>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              t: "Ingest",
              b: "Connect calendar, docs, repos, LinkedIn. Twin observes — never broadcasts.",
            },
            {
              t: "Synthesize",
              b: "A graph neural net distills your behavior into a 9-dimensional persona vector.",
            },
            {
              t: "Simulate",
              b: "Your twin runs scenarios on dedicated GPU shards while you sleep.",
            },
          ].map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <div className="glass p-8 rounded-3xl h-full">
                <div className="text-[10px] font-mono text-accent tracking-widest mb-4">
                  / {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-7xl mx-auto glass rounded-[2rem] overflow-hidden">
          <img
            src={skillImg}
            alt="Skill node graph"
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

function PersistenceBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`text-[10px] font-mono uppercase tracking-[0.16em] px-3 py-1.5 rounded-full border ${
        active
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/5 text-muted-foreground"
      }`}
    >
      {label} · {active ? "Stored" : "Missing"}
    </span>
  );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5 border border-glass-border min-h-32">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
        {label}
      </p>
      <p className="font-display text-2xl font-bold leading-tight text-white">{value}</p>
    </div>
  );
}

function SnapshotList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "accent" | "muted";
}) {
  return (
    <div className="glass rounded-2xl p-6 border border-glass-border min-h-48">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground/60">No items yet</span>
        ) : (
          items.map((item) => (
            <span
              key={item}
              className={`rounded-full px-3 py-1 text-[11px] font-mono ${
                tone === "accent" ? "bg-accent/15 text-accent" : "bg-white/10 text-white/70"
              }`}
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
