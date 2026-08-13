'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PhysicalFeature, PhysicalFeatureType } from '@/types/features';
import { PHYSICAL_FEATURE_CONFIG } from '../physical-feature-config';
import { useIsHoverCapable } from '../hooks/use-is-hover-capable';

const WORLD_CENTER: [number, number] = [15, 20];
const WORLD_ZOOM = 3;

type LatLng = [number, number];

// pulse=true adds a ping ring behind the marker — used on touch devices (no hover
// affordance) to visually invite a tap. Desktop markers stay static since hovering
// already reveals the card.
function dotIcon(color: string, pulse: boolean): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; width:14px; height:14px;">
        ${pulse ? `<div class="marker-pulse-ring" style="background:${color}; border-radius:50%;"></div>` : ''}
        <div style="position:relative; width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// Mahajanapadas get a diamond, not a circle — visually separates "historical/cultural"
// markers from the physical-geography ones at a glance.
function diamondIcon(color: string, pulse: boolean): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; width:13px; height:13px;">
        ${pulse ? `<div class="marker-pulse-ring" style="background:${color}; border-radius:2px; transform:rotate(45deg);"></div>` : ''}
        <div style="position:relative; width:11px;height:11px;margin:1px;transform:rotate(45deg);background:${color};border:2px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>
      </div>
    `,
    iconSize: [13, 13],
    iconAnchor: [6.5, 6.5],
  });
}

// A small upward triangle reads as a mountain peak far better than a plain dot.
function peakIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:11px solid ${color};filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4));"></div>`,
    iconSize: [12, 11],
    iconAnchor: [6, 9],
  });
}

// Chaikin's corner-cutting: turns a few straight waypoints into a smooth curve,
// which is what actually makes a river read as "water" rather than a ruler-straight
// line — without needing real traced-course geodata (see the waypoints-only tradeoff
// agreed on earlier).
// Fewer iterations = fewer points per path = less geometry the browser has to redraw
// on every frame of the flowing-water animation, across all rivers at once.
function smoothPath(points: LatLng[], iterations = 2): LatLng[] {
  let pts = points;
  for (let iter = 0; iter < iterations; iter++) {
    const next: LatLng[] = [pts[0]!];
    for (let i = 0; i < pts.length - 1; i++) {
      const [lat1, lng1] = pts[i]!;
      const [lat2, lng2] = pts[i + 1]!;
      next.push([lat1 * 0.75 + lat2 * 0.25, lng1 * 0.75 + lng2 * 0.25]);
      next.push([lat1 * 0.25 + lat2 * 0.75, lng1 * 0.25 + lng2 * 0.75]);
    }
    next.push(pts[pts.length - 1]!);
    pts = next;
  }
  return pts;
}

// Desktop: card opens/closes on hover. Touch: falls back to the default tap-to-open
// Popup behavior Leaflet already provides — no extra handling needed for that case.
function useHoverEventHandlers(hoverCapable: boolean) {
  return useMemo(() => (hoverCapable ? {
    mouseover: (e: L.LeafletMouseEvent) => e.target.openPopup(),
    mouseout: (e: L.LeafletMouseEvent) => e.target.closePopup(),
  } : undefined), [hoverCapable]);
}

// The detail card shown on click, shared by every feature kind (point/line/polygon).
function FeatureCard({ name, typeLabel, color, state, description }: {
  name: string; typeLabel: string; color: string; state?: string | null; description?: string | null;
}) {
  return (
    <div style={{ minWidth: 200, maxWidth: 260 }}>
      <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2, color: '#1A1836' }}>{name}</p>
      <p style={{ fontSize: 11, fontWeight: 600, color, marginBottom: description ? 5 : 0 }}>
        {typeLabel}{state ? ` · ${state}` : ''}
      </p>
      {description && <p style={{ fontSize: 12, lineHeight: 1.5, color: '#4B5563' }}>{description}</p>}
    </div>
  );
}

function PointFeature({ feature, hoverCapable }: { feature: PhysicalFeature; hoverCapable: boolean }) {
  const cfg = PHYSICAL_FEATURE_CONFIG[feature.type];
  const icon = useMemo(
    () => (cfg.shape === 'diamond' ? diamondIcon(cfg.color, !hoverCapable) : dotIcon(cfg.color, !hoverCapable)),
    [cfg.color, cfg.shape, hoverCapable],
  );
  const eventHandlers = useHoverEventHandlers(hoverCapable);
  return (
    <Marker position={[feature.lat!, feature.lng!]} icon={icon} eventHandlers={eventHandlers}>
      <Popup maxWidth={260} autoPan={false}>
        <FeatureCard
          name={feature.name} typeLabel={cfg.label} color={cfg.color}
          state={feature.state} description={feature.description}
        />
      </Popup>
    </Marker>
  );
}

function RiverFeature({ feature, hoverCapable }: { feature: PhysicalFeature; hoverCapable: boolean }) {
  const cfg = PHYSICAL_FEATURE_CONFIG.river;
  const path = feature.path!;
  const smoothed = useMemo(() => smoothPath(path.map((p) => [p.lat, p.lng] as LatLng)), [path]);
  const eventHandlers = useHoverEventHandlers(hoverCapable);

  return (
    <>
      <Polyline
        positions={smoothed}
        eventHandlers={eventHandlers}
        pathOptions={{
          color: cfg.color, weight: 4, opacity: 0.85,
          lineCap: 'round', lineJoin: 'round',
          className: 'river-flow-animated',
        }}
      >
        <Popup maxWidth={260} autoPan={false}>
          <FeatureCard name={feature.name} typeLabel={cfg.label} color={cfg.color} description={feature.description} />
        </Popup>
      </Polyline>
      {path.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.lat, p.lng]}
          radius={3.5}
          pathOptions={{ color: cfg.color, fillColor: '#FFFFFF', fillOpacity: 1, weight: 2 }}
        >
          {p.label && <Tooltip>{p.label}</Tooltip>}
        </CircleMarker>
      ))}
    </>
  );
}

function MountainRangeFeature({ feature, hoverCapable }: { feature: PhysicalFeature; hoverCapable: boolean }) {
  const cfg = PHYSICAL_FEATURE_CONFIG['mountain-range'];
  const path = feature.path!;
  const positions = path.map((p) => [p.lat, p.lng] as LatLng);
  const icon = useMemo(() => peakIcon(cfg.color), [cfg.color]);
  const eventHandlers = useHoverEventHandlers(hoverCapable);

  return (
    <>
      <Polyline
        positions={positions}
        eventHandlers={eventHandlers}
        pathOptions={{ color: cfg.color, weight: 2.5, opacity: 0.7, dashArray: '2 6', lineCap: 'round' }}
      >
        <Popup maxWidth={260} autoPan={false}>
          <FeatureCard name={feature.name} typeLabel={cfg.label} color={cfg.color} description={feature.description} />
        </Popup>
      </Polyline>
      {path.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} icon={icon}>
          {p.label && <Tooltip>{p.label}</Tooltip>}
        </Marker>
      ))}
    </>
  );
}

function PlateFeature({ feature, hoverCapable }: { feature: PhysicalFeature; hoverCapable: boolean }) {
  const cfg = PHYSICAL_FEATURE_CONFIG['tectonic-plate'];
  const positions = feature.path!.map((p) => [p.lat, p.lng] as LatLng);
  const eventHandlers = useHoverEventHandlers(hoverCapable);
  return (
    <Polygon
      positions={positions}
      eventHandlers={eventHandlers}
      // fill: false — a plate's interior is huge (most of the map) and must not swallow
      // hover/click events meant for smaller features sitting inside it; only the thin
      // boundary line itself should be interactive.
      pathOptions={{ color: cfg.color, weight: 1.5, opacity: 0.55, fill: false, dashArray: '4 4' }}
    >
      <Tooltip sticky>{feature.name}</Tooltip>
      <Popup maxWidth={260}>
        <FeatureCard name={feature.name} typeLabel={cfg.label} color={cfg.color} description={feature.description} />
      </Popup>
    </Polygon>
  );
}

export function PhysicalMap({
  features, visibleTypes,
}: {
  features: PhysicalFeature[];
  visibleTypes: Set<PhysicalFeatureType>;
}) {
  const hoverCapable = useIsHoverCapable();
  const visible = features.filter((f) => visibleTypes.has(f.type));
  const pointFeatures = visible.filter((f) => f.lat != null && f.lng != null);
  const lineOrPolygonFeatures = visible.filter((f) => f.path && f.path.length > 1);

  return (
    <>
      {/* Flowing-water effect on rivers, and a pulse ring for touch-device markers
          (no hover affordance on touch, so a pulse invites a tap instead). */}
      <style>{`
        .river-flow-animated {
          stroke-dasharray: 10 8;
          animation: river-flow 1.4s linear infinite;
        }
        @keyframes river-flow {
          to { stroke-dashoffset: -18; }
        }
        .marker-pulse-ring {
          position: absolute; inset: 0;
          animation: marker-pulse 1.6s ease-out infinite;
        }
        @keyframes marker-pulse {
          0%   { transform: scale(1);   opacity: 0.55; }
          100% { transform: scale(2.3); opacity: 0; }
        }
      `}</style>

      <MapContainer
        center={WORLD_CENTER}
        zoom={WORLD_ZOOM}
        minZoom={2}
        maxZoom={8}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', borderRadius: 16 }}
      >
        {/* Esri World Physical Map — pure shaded-relief terrain (elevation, mountains, water),
            no political/administrative boundaries rendered at all, no API key required.
            Sidesteps the disputed-border issue entirely instead of just minimizing it. */}
        <TileLayer
          attribution='Tiles &copy; Esri — Source: US National Park Service'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={8}
          noWrap
        />

        {/* Plates render first (bottom of the overlay stack) since their boundary lines
            span almost the whole map — rivers/mountains on top read clearly over them. */}
        {lineOrPolygonFeatures.filter((f) => f.type === 'tectonic-plate').map((f) => (
          <PlateFeature key={f.id} feature={f} hoverCapable={hoverCapable} />
        ))}
        {lineOrPolygonFeatures.filter((f) => f.type === 'mountain-range').map((f) => (
          <MountainRangeFeature key={f.id} feature={f} hoverCapable={hoverCapable} />
        ))}
        {lineOrPolygonFeatures.filter((f) => f.type === 'river').map((f) => (
          <RiverFeature key={f.id} feature={f} hoverCapable={hoverCapable} />
        ))}

        {pointFeatures.map((f) => <PointFeature key={f.id} feature={f} hoverCapable={hoverCapable} />)}
      </MapContainer>
    </>
  );
}

export default PhysicalMap;
