export default function GlassBackground() {
  // Always provide a dark, depth‑friendly canvas so glass elements pop,
  // regardless of light/dark theme toggle.
  const noiseSvg = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.03"/></svg>'
  )}")`;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep base gradient (dark) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f14] via-[#0a1117] to-[#0a0f14]" />

      {/* Soft spotlight to lift center content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 600px at 50% 35%, rgba(255,255,255,0.06), transparent 60%)',
        }}
      />

      {/* Chromatic blobs for depth & color pickup in glass */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(700px 500px at 15% 10%, rgba(132,204,22,0.10), transparent 60%),' +
            'radial-gradient(800px 600px at 85% 5%, rgba(56,189,248,0.10), transparent 60%),' +
            'radial-gradient(900px 700px at 50% 100%, rgba(244,63,94,0.09), transparent 65%)',
        }}
      />

      {/* Fine noise for realistic glass refraction */}
      <div className="absolute inset-0 pointer-events-none mix-blend-soft-light" style={{ backgroundImage: noiseSvg }} />

      {/* Vignette for edge contrast */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_600px_at_center,transparent,rgba(0,0,0,0.14))]" />
    </div>
  );
}
