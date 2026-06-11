export function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Subtle neutral glows — Apple-style: monochrome, never colorful */}
      <div
        className="aurora absolute -top-[30%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full"
        style={{ background: "oklch(0.3 0 0 / 0.6)" }}
      />
      <div
        className="aurora absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full"
        style={{ background: "oklch(0.25 0.02 256 / 0.4)" }}
      />
    </div>
  );
}
