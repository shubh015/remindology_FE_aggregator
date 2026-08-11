export interface TrailPinPosition {
  id: string;
  x: number;
  y: number;
  index: number;
}

export interface TrailLayout {
  width: number;
  height: number;
  positions: TrailPinPosition[];
  pathD: string;
}

const SPACING_Y = 130;
const CENTER_OFFSET = 70;
const TOP_PADDING = 70;
const BOTTOM_PADDING = 70;

/**
 * Lays out N pins in a gentle vertical zigzag (sine-wave x offset) and
 * builds a single smooth cubic-bezier path connecting them in order.
 * No projection/zoom math — deliberately simple.
 */
export function buildTrailLayout(ids: string[], width = 320): TrailLayout {
  const center = width / 2;

  const positions: TrailPinPosition[] = ids.map((id, i) => ({
    id,
    index: i,
    x: center + Math.sin(i * 0.9) * CENTER_OFFSET,
    y: TOP_PADDING + i * SPACING_Y,
  }));

  const height = positions.length > 0
    ? positions[positions.length - 1].y + BOTTOM_PADDING
    : TOP_PADDING + BOTTOM_PADDING;

  let pathD = '';
  if (positions.length > 0) {
    pathD = `M ${positions[0].x} ${positions[0].y}`;
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const midY = (prev.y + curr.y) / 2;
      pathD += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
  }

  return { width, height, positions, pathD };
}
