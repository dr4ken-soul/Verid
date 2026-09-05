/**
 * VeridField, the site's one visual asset. A fixed procedural light canvas:
 * a technical dot field with two soft blue ambient blooms drifting slowly.
 * Coded, not sourced. Mounted once at app root, sits at z-0 behind everything.
 * Blooms go static when the user prefers reduced motion.
 * @returns the fixed background layer
 */
export default function VeridField() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--bg-primary)]">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(var(--border-default) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute w-[60vw] h-[60vw] rounded-full bg-[var(--accent)] opacity-[0.06] blur-[120px] top-[-10%] left-[-5%] animate-float motion-reduce:animate-none" />
      <div className="absolute w-[50vw] h-[50vw] rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px] bottom-[-10%] right-[-5%] animate-[float_22s_ease-in-out_infinite] motion-reduce:animate-none" />
      {/* Logo slot: replace with public/logo.svg only after explicit ask */}
    </div>
  )
}
