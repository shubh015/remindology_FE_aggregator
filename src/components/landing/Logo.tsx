/**
 * Brand mark: a small ink square with an Alumni Sans "R" next to the tracked
 * uppercase wordmark. One shared component so every header/footer stays in
 * sync. (`variant` is accepted for backwards compatibility; only the
 * monochrome mark exists now.)
 */
export function Logo({
  size = 32,
  wordmark = true,
}: {
  size?: number;
  wordmark?: boolean;
  /** @deprecated only the monochrome mark exists now */
  variant?: 'default' | 'mono';
}) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div
        className="flex items-center justify-center shrink-0 bg-ink text-paper rounded-[3px]"
        style={{ width: size * 0.8, height: size * 0.8 }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: size * 0.56, lineHeight: 1 }}>
          R
        </span>
      </div>
      {wordmark && (
        <span
          className="text-ink uppercase"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.25rem', letterSpacing: '0.18em', lineHeight: 1 }}
        >
          Remindology
        </span>
      )}
    </div>
  );
}
