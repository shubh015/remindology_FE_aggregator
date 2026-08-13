import type { PhysicalFeatureType } from '@/types/features';

type FeatureKind = 'point' | 'line' | 'polygon';
type MarkerShape = 'circle' | 'diamond';

export const PHYSICAL_FEATURE_CONFIG: Record<PhysicalFeatureType, {
  label: string; color: string; kind: FeatureKind; shape?: MarkerShape;
}> = {
  'national-park':      { label: 'National Parks',       color: '#059669', kind: 'point',   shape: 'circle' },
  'wildlife-sanctuary':  { label: 'Wildlife Sanctuaries', color: '#65A30D', kind: 'point',   shape: 'circle' },
  'lake':                { label: 'Lakes',                 color: '#0891B2', kind: 'point',   shape: 'circle' },
  'strait':              { label: 'Straits',                color: '#0EA5E9', kind: 'point',   shape: 'circle' },
  'mahajanapada':        { label: 'Mahajanapadas (Ancient India)', color: '#D97706', kind: 'point', shape: 'diamond' },
  'river':               { label: 'Rivers',                color: '#2563EB', kind: 'line'    },
  'mountain-range':      { label: 'Mountain Ranges',       color: '#92400E', kind: 'line'    },
  'tectonic-plate':      { label: 'Tectonic Plates',       color: '#DC2626', kind: 'polygon' },
};

export const PHYSICAL_FEATURE_TYPES = Object.keys(PHYSICAL_FEATURE_CONFIG) as PhysicalFeatureType[];
