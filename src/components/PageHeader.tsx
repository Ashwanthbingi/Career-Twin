import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <section className="relative pt-20 pb-16 px-6 z-10">
      <div className="max-w-5xl mx-auto text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full mb-8">
            <span className="size-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
              {eyebrow}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-balance mb-6">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground text-pretty">
            {subtitle}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
