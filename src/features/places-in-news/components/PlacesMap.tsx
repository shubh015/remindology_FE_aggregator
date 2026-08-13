'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_CONFIG } from '../category-config';
import { useIsHoverCapable } from '../hooks/use-is-hover-capable';
import type { PlaceInNewsMapPoint } from '@/types/features';

// Default center: roughly the geographic centre of India, so an empty or
// still-loading map isn't just a blank grey rectangle.
const INDIA_CENTER: [number, number] = [22.5, 79];
const INDIA_ZOOM = 5;

// pulse=true adds a ping ring behind the pin — used on touch devices, which have no
// hover affordance, to visually invite a tap. Desktop pins stay static since hovering
// over them already reveals the card.
function pinIcon(color: string, pulse: boolean): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; width:26px; height:26px;">
        ${pulse ? `<div class="marker-pulse-ring" style="background:${color};"></div>` : ''}
        <div style="
          position:relative; width: 26px; height: 26px; border-radius: 50% 50% 50% 0;
          background: ${color}; transform: rotate(-45deg);
          border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        "></div>
      </div>
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
  const hoverCapable = useIsHoverCapable();

  const icons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    for (const cat of Object.keys(CATEGORY_CONFIG) as (keyof typeof CATEGORY_CONFIG)[]) {
      cache.set(cat, pinIcon(CATEGORY_CONFIG[cat].color, !hoverCapable));
    }
    return cache;
  }, [hoverCapable]);

  return (
    <>
      <style>{`
        .marker-pulse-ring {
          position: absolute; inset: 0; border-radius: 50% 50% 50% 0;
          animation: marker-pulse 1.6s ease-out infinite;
        }
        @keyframes marker-pulse {
          0%   { transform: rotate(-45deg) scale(1);   opacity: 0.55; }
          100% { transform: rotate(-45deg) scale(2.1);  opacity: 0; }
        }
      `}</style>

      <MapContainer
        center={INDIA_CENTER}
        zoom={INDIA_ZOOM}
        minZoom={2}
        maxZoom={8}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', borderRadius: 16 }}
      >
        {/* Esri World Physical Map — pure shaded-relief terrain, no political boundaries
            rendered at all (see PhysicalMap.tsx for the fuller rationale). Reused here so
            this map never shows the disputed-border artifact either. */}
        <TileLayer
          attribution='Tiles &copy; Esri — Source: US National Park Service'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
          noWrap
          maxZoom={8}
        />
        <FitToPoints points={points} />
        {points.map((p) => {
          const cfg = CATEGORY_CONFIG[p.category];
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={icons.get(p.category) ?? pinIcon(cfg.color, !hoverCapable)}
              eventHandlers={hoverCapable ? {
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
              } : undefined}
            >
              <Popup autoPan={false}>
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
    </>
  );
}

export default PlacesMap;
