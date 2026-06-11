import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import heroImg from "@/assets/hero-twin.jpg";
import skillImg from "@/assets/skill-graph.jpg";
import { useDigitalTwin } from "@/hooks/useDigitalTwin";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { AlertCircle, RefreshCw, Upload, CheckCircle } from "lucide-react";

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

const skills = [
  ["Systems Design", 92],
  ["Product Strategy", 87],
  ["Engineering Leadership", 79],
  ["Negotiation", 64],
  ["Public Speaking", 58],
  ["Machine Learning", 72],
];

function DigitalTwin() {
  const { data, isLoading, isError, error, refetch } = useDigitalTwin(1);
  const uploadMutation = useResumeUpload();

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      setUploadError("Only PDF resumes are accepted.");
      return;
    }
    setUploadError(null);
    uploadMutation.mutate(
      { userId: 1, file },
      {
        onError: (err) => {
          setUploadError(err instanceof Error ? err.message : "Failed to parse resume.");
        },
      },
    );
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
                http://localhost:8080
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

  const twin = data || {
    name: "User",
    readinessScore: 98,
    skillsCount: 42184,
    projectsCount: 12,
    topCareer: "Systems Designer",
  };

  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow={`/ Digital Twin · Live Demo · ${twin.name}`}
        title={
          <>
            Meet the <span className="text-gradient">version of you</span> living in the cloud.
          </>
        }
        subtitle={`A persistent neural model trained on ${twin.name}'s work, decisions, and ambitions — accurate to ${twin.readinessScore}%.`}
      />

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
                {skills.map(([name, val]) => (
                  <div key={name as string}>
                    <div className="flex justify-between mb-2 text-xs font-mono">
                      <span className="text-white/80">{name}</span>
                      <span className="text-accent">{val}</span>
                    </div>
                    <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-white"
                        style={{ width: `${val}%` }}
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

      {/* Resume Upload Sync Widget */}
      <section className="pt-16 px-6 max-w-7xl mx-auto">
        <Reveal>
          <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-glass-border">
            <h3 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="size-2 bg-accent rounded-full animate-ping" />
              Ingest & Re-calibrate Twin
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Upload your latest resume (PDF) to synchronize new projects and experience. Our
              parsing model will extract your competencies, update your skill graph nodes, and
              re-calculate your career match profiles dynamically.
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
                      ? "bg-accent/10 border-accent/20 text-accent animate-spin"
                      : "bg-white/5 border-white/10 text-muted-foreground"
                  }`}
                >
                  {uploadMutation.isPending ? (
                    <RefreshCw className="size-6" />
                  ) : (
                    <Upload className="size-6" />
                  )}
                </div>

                {uploadMutation.isPending ? (
                  <div>
                    <p className="text-sm text-white font-semibold">
                      Uploading and analyzing resume...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This takes a few seconds to run NLP extraction
                    </p>
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
            {uploadMutation.isSuccess && uploadMutation.data && (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-emerald-400" />
                  <h4 className="text-sm font-display font-bold text-white">
                    Resume Synced Successfully!
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Detected {uploadMutation.data.detectedSkillCount} skill nodes on your resume:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {uploadMutation.data.detectedSkills.map((s) => (
                    <span
                      key={s.id}
                      className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                    >
                      {s.name}
                    </span>
                  ))}
                  {uploadMutation.data.detectedSkillCount === 0 && (
                    <span className="text-xs text-muted-foreground italic">No matches.</span>
                  )}
                </div>
                {uploadMutation.data.extractedTextPreview && (
                  <details className="text-[10px] font-mono text-muted-foreground/80 cursor-pointer pt-2">
                    <summary className="hover:text-white transition-colors">
                      View extracted preview
                    </summary>
                    <pre className="mt-2 p-3 bg-black/40 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-[150px] leading-relaxed text-left text-muted-foreground select-none">
                      {uploadMutation.data.extractedTextPreview}
                    </pre>
                  </details>
                )}
              </div>
            )}
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
