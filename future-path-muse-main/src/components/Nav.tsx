import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const links = [
  { to: "/features", label: "Features" },
  { to: "/digital-twin", label: "Twin" },
  { to: "/skill-validation", label: "Validation" },
  { to: "/github-analyzer", label: "GitHub" },
  { to: "/leetcode-intelligence", label: "LeetCode" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/ai-mentor", label: "Mentor" },
  { to: "/vision", label: "Vision" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-4">
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between glass rounded-full px-6 py-2 transition-all duration-500 ${
          scrolled ? "shadow-[0_8px_40px_-12px_oklch(0.78_0.16_220/0.3)]" : ""
        }`}
      >
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-4 rounded-full bg-accent shadow-[0_0_20px_oklch(0.78_0.16_220/0.8)] group-hover:scale-110 transition-transform" />
          <span className="font-display font-black tracking-tighter text-lg uppercase">Twinos</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-white transition-colors"
              activeProps={{ className: "text-white" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          to="/digital-twin"
          className="bg-white text-black text-xs font-bold px-5 py-2 rounded-full hover:bg-accent transition-all duration-300"
        >
          Launch Twin
        </Link>
      </div>
    </nav>
  );
}
