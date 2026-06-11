import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative py-20 px-6 border-t border-glass-border mt-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="size-4 bg-accent rounded-full shadow-[0_0_20px_oklch(0.78_0.16_220/0.8)]" />
            <span className="font-display font-black tracking-tighter text-2xl uppercase">
              Twinos
            </span>
          </div>
          <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
            The interface between human ambition and artificial intelligence. Your career is no
            longer a linear path — it's an evolving architecture.
          </p>
          <div className="flex gap-3">
            {["X", "in", "GH"].map((s) => (
              <div
                key={s}
                className="size-9 rounded-lg glass grid place-items-center text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors cursor-pointer"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-white mb-6">
            Platform
          </h4>
          <ul className="text-muted-foreground text-sm space-y-3">
            <li>
              <Link to="/digital-twin" className="hover:text-accent transition-colors">
                Digital Twin
              </Link>
            </li>
            <li>
              <Link to="/career-simulator" className="hover:text-accent transition-colors">
                Career Simulator
              </Link>
            </li>
            <li>
              <Link to="/roadmap" className="hover:text-accent transition-colors">
                Roadmap
              </Link>
            </li>
            <li>
              <Link to="/ai-mentor" className="hover:text-accent transition-colors">
                AI Mentor
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-white mb-6">
            Company
          </h4>
          <ul className="text-muted-foreground text-sm space-y-3">
            <li>
              <Link to="/vision" className="hover:text-accent transition-colors">
                Vision
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-accent transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-accent transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          © 2026 Twinos Systems · All rights synced
        </p>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Latency: 12ms // Status: Optimal
        </p>
      </div>
    </footer>
  );
}
