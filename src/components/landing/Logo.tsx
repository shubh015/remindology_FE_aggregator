/**
 * Brand mark — a navy medallion with a brass ring and a serif monogram,
 * styled like an official seal rather than a flat colored square. One
 * shared component so every header/footer instance stays in sync.
 */
export function Logo({ size = 32, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 28%, #2C4269, #16233E 72%)',
          border: '1.5px solid #8A6A12',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 3px rgba(22,35,62,0.35)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif-display), Georgia, serif',
            fontWeight: 600,
            fontSize: size * 0.48,
            color: '#D4AF37',
            lineHeight: 1,
          }}
        >
          R
        </span>
      </div>
      {wordmark && (
        <span className="font-bold text-[17px] text-primary">Remindology</span>
      )}
    </div>
  );
}
