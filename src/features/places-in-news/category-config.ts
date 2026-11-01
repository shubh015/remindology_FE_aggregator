import type { PlaceCategory } from '@/types/features';

// Monochrome scheme: every category shares the same ink tone and is told apart by
// its glyph (shape + filled/hollow) and its label. `color` stays a hex literal because
// callers build hex-alpha tints from it (e.g. `${cfg.color}14`).
export type CategoryGlyphShape = 'circle' | 'square' | 'diamond' | 'triangle';

export interface CategoryConfig {
  label: string;
  color: string;
  shape: CategoryGlyphShape;
  filled: boolean;
}

const INK = '#141414';

export const CATEGORY_CONFIG: Record<PlaceCategory, CategoryConfig> = {
  'border-dispute':        { label: 'Border Dispute',         color: INK, shape: 'triangle', filled: true  },
  'defence':                { label: 'Defence',                 color: INK, shape: 'square',   filled: true  },
  'disaster':               { label: 'Disaster',                color: INK, shape: 'diamond',  filled: true  },
  'summit-visit':           { label: 'Summit / Visit',          color: INK, shape: 'circle',   filled: true  },
  'environment-wildlife':   { label: 'Environment & Wildlife',  color: INK, shape: 'circle',   filled: false },
  'heritage-culture':       { label: 'Heritage & Culture',      color: INK, shape: 'square',   filled: false },
  'economy-infra':          { label: 'Economy & Infra',         color: INK, shape: 'diamond',  filled: false },
  'other':                  { label: 'Other',                   color: INK, shape: 'triangle', filled: false },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(([value, { label }]) => ({ value, label }));

// Static SVG markup for a category's glyph. Used both inside Leaflet divIcon HTML and
// in the React legend, so it is a plain string. `stroke` defaults to the ink token.
export function categoryGlyphSvg(
  category: PlaceCategory,
  size = 10,
  stroke = 'var(--color-ink)',
): string {
  const { shape, filled } = CATEGORY_CONFIG[category];
  const fill = filled ? stroke : 'none';
  const attrs = `style="fill:${fill};stroke:${stroke};stroke-width:1.6"`;
  let body: string;
  switch (shape) {
    case 'circle':   body = `<circle cx="6" cy="6" r="4.2" ${attrs}/>`; break;
    case 'square':   body = `<rect x="2" y="2" width="8" height="8" ${attrs}/>`; break;
    case 'diamond':  body = `<path d="M6 1.2 L10.8 6 L6 10.8 L1.2 6 Z" ${attrs}/>`; break;
    case 'triangle': body = `<path d="M6 1.5 L10.6 10 L1.4 10 Z" ${attrs}/>`; break;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 12 12" aria-hidden="true" style="display:block">${body}</svg>`;
}
