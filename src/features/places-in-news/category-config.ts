import type { PlaceCategory } from '@/types/features';

export const CATEGORY_CONFIG: Record<PlaceCategory, { label: string; color: string }> = {
  'border-dispute':        { label: 'Border Dispute',         color: '#DC2626' },
  'defence':                { label: 'Defence',                 color: '#475569' },
  'disaster':               { label: 'Disaster',                color: '#EA580C' },
  'summit-visit':           { label: 'Summit / Visit',          color: '#7C3AED' },
  'environment-wildlife':   { label: 'Environment & Wildlife',  color: '#059669' },
  'heritage-culture':       { label: 'Heritage & Culture',      color: '#D97706' },
  'economy-infra':          { label: 'Economy & Infra',         color: '#0891B2' },
  'other':                  { label: 'Other',                   color: '#6B7280' },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(([value, { label }]) => ({ value, label }));
