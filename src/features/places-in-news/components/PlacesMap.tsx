'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_CONFIG } from '../category-config';
import type { PlaceInNewsMapPoint } from '@/types/features';

// Default center: roughly the geographic centre of India, so an empty or
// still-loading map isn't just a blank grey rectangle.
const INDIA_CENTER: [number, number] = [22.5, 79];
const INDIA_ZOOM = 5;

function pinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 26px; height: 26px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

// Fits the map to all visible pins whenever the point set changes.
function FitToPoints({ points }: { points: PlaceInNewsMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 7);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

export function PlacesMap({ points }: { points: PlaceInNewsMapPoint[] }) {
  const icons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    for (const cat of Object.keys(CATEGORY_CONFIG) as (keyof typeof CATEGORY_CONFIG)[]) {
      cache.set(cat, pinIcon(CATEGORY_CONFIG[cat].color));
    }
    return cache;
  }, []);

  return (
    <MapContainer
      center={INDIA_CENTER}
      zoom={INDIA_ZOOM}
      scrollWheelZoom
      style={{ height: '100%', width: '100%', borderRadius: 16 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToPoints points={points} />
      {points.map((p) => {
        const cfg = CATEGORY_CONFIG[p.category];
        return (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icons.get(p.category) ?? pinIcon(cfg.color)}>
            <Popup>
              <div style={{ minWidth: 200 }}>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#1A1836' }}>{p.name}</p>
                <span
                  style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 999, marginBottom: 6,
                    background: `${cfg.color}14`, color: cfg.color, border: `1px solid ${cfg.color}33`,
                  }}
                >
                  {cfg.label}
                </span>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: '#4B5563', marginBottom: p.currentAffairId ? 8 : 0 }}>
                  {p.context}
                </p>
                {p.currentAffairId && (
                  <Link
                    href={`/current-affairs/${p.currentAffairId}`}
                    style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Read the article <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default PlacesMap;
