/**
 * Footer. Wordmark, hackathon attribution and the link row, with the bottom
 * copyright and settlement line.
 * @returns the footer section
 */
export default function Footer() {
  return (
    <footer className="relative z-10 py-12 px-4 md:px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          {/* Logo slot: replace with public/logo.svg only after explicit ask */}
          <p className="font-display text-base font-bold text-[var(--text-primary)]">Verid</p>
          <p className="font-body text-xs text-[var(--text-muted)] mt-2">
            Verid, built for the Telegraph Hackathon Season I, Application Track
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <a
            href="https://docs.telegraphprotocol.com"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/dr4ken-soul/Verid"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://x.com/Telegraphprotoc"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            X
          </a>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-2 font-mono text-[11px] text-[var(--text-muted)]">
        <span>&copy; 2026 Verid</span>
        <span>Live on Telegraph &middot; Base</span>
      </div>
    </footer>
  )
}
