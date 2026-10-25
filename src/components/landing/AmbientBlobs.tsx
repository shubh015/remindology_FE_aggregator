// Soft rounded-square colour blocks used as ambient background texture
// behind section content. Flat colour + opacity + blur (not a radial
// gradient that also fades to transparent) so the block actually reads
// as a visible shape instead of disappearing into the page.
//
// Clean Editorial uses one quiet accent tone everywhere — the `palette`
// prop is kept (all values resolve to the same tone) so existing call
// sites across page.tsx don't need to change.
const PALETTES = {
  violet: ['#8A6A12', '#8A6A12'],
  amber: ['#8A6A12', '#8A6A12'],
  emerald: ['#8A6A12', '#8A6A12'],
  sky: ['#8A6A12', '#8A6A12'],
  rose: ['#8A6A12', '#8A6A12'],
} as const;

export function AmbientBlobs({ palette = 'violet' }: { palette?: keyof typeof PALETTES }) {
  const [c1, c2] = PALETTES[palette];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute"
        style={{
          top: '-15%', left: '-10%', width: 650, height: 650, borderRadius: 999,
          background: c1, opacity: 0.025, filter: 'blur(120px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '-15%', right: '-10%', width: 600, height: 600, borderRadius: 999,
          background: c2, opacity: 0.02, filter: 'blur(110px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '30%', right: '15%', width: 450, height: 450, borderRadius: 999,
          background: c1, opacity: 0.012, filter: 'blur(90px)',
        }}
      />
    </div>
  );
}
