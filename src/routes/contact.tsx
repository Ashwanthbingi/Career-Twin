import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Twinos" },
      { name: "description", content: "Request beta access or get in touch with the Twinos team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <main className="relative z-10">
      <PageHeader
        eyebrow="/ Get In Touch"
        title={
          <>
            Open a <span className="text-gradient">neural link.</span>
          </>
        }
        subtitle="Request enterprise beta access, partnerships, or press."
      />

      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <Reveal>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="glass rounded-3xl p-8 space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Name" placeholder="Ada Lovelace" />
                <Field label="Email" placeholder="ada@labs.io" type="email" />
              </div>
              <Field label="Company" placeholder="Independent" />
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us about your career architecture…"
                  className="w-full glass rounded-2xl px-4 py-3 text-sm outline-none focus:border-accent/40 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent text-accent-foreground font-bold py-4 rounded-xl hover:scale-[1.01] transition-transform"
              >
                {sent ? "Signal received ✓" : "Transmit"}
              </button>
            </form>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-8 h-full flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <Info label="Email" value="hello@twinos.io" />
                <Info label="Press" value="press@twinos.io" />
                <Info label="Enterprise" value="enterprise@twinos.io" />
                <Info label="HQ" value="San Francisco / Remote" />
              </div>
              <div className="pt-6 border-t border-glass-border">
                <p className="text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
                  Status
                </p>
                <p className="text-sm">Beta cohort #4 · 312 of 500 seats remaining.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full glass rounded-2xl px-4 py-3 text-sm outline-none focus:border-accent/40 transition-colors"
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-lg font-display">{value}</p>
    </div>
  );
}
