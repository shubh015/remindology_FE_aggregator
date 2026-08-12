// Soft rounded-square colour blocks used as ambient background texture
// behind section content. Flat colour + opacity + blur (not a radial
// gradient that also fades to transparent) so the block actually reads
// as a visible shape instead of disappearing into the page.
const PALETTES = {
  violet: ['#7C3AED', '#4F46E5'], // Violet - Indigo
  amber: ['#6366F1', '#3B82F6'], // Indigo - Blue
  emerald: ['#4F46E5', '#7C3AED'], // Indigo - Violet
  sky: ['#3B82F6', '#0891B2'], // Blue - Sky
  rose: ['#7C3AED', '#3B82F6'], // Violet - Blue
} as const;

export function AmbientBlobs({ palette = 'violet' }: { palette?: keyof typeof PALETTES }) {
  const [c1, c2] = PALETTES[palette];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute"
        style={{
          top: '-15%', left: '-10%', width: 650, height: 650, borderRadius: 999,
          background: c1, opacity: 0.05, filter: 'blur(120px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '-15%', right: '-10%', width: 600, height: 600, borderRadius: 999,
          background: c2, opacity: 0.04, filter: 'blur(110px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '30%', right: '15%', width: 450, height: 450, borderRadius: 999,
          background: c1, opacity: 0.02, filter: 'blur(90px)',
        }}
      />
    </div>
  );
}
