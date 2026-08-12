'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin, List, Map as MapIcon, ChevronDown, ArrowLeft, ArrowRight,
  AlertCircle, Loader2, MapPinOff,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { toISO } from '@/components/ui/calendar';
import { usePlacesInNewsList, usePlacesInNewsMap } from '@/features/places-in-news/hooks/use-places-in-news';
import { CATEGORY_CONFIG } from '@/features/places-in-news/category-config';
import type { PlaceInNews } from '@/types/features';

const PlacesMap = dynamic(
  () => import('@/features/places-in-news/components/PlacesMap').then((m) => m.PlacesMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

const MIDNIGHT  = '#09091F';
const TEXT_GRAD = {
  background: 'linear-gradient(135deg, #A78BFA, #E879F9)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
};

type ViewMode = 'map' | 'list';

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

interface DateGroup { dateKey: string; displayDate: string; dayOfWeek: string; places: PlaceInNews[] }

function groupByDate(places: PlaceInNews[]): DateGroup[] {
  const map = new Map<string, PlaceInNews[]>();
  for (const p of places) {
    if (!map.has(p.newsDate)) map.set(p.newsDate, []);
    map.get(p.newsDate)!.push(p);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const d = new Date(`${key}T00:00:00`);
      return {
        dateKey: key,
        displayDate: isNaN(d.getTime()) ? key : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        dayOfWeek: isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { weekday: 'long' }),
        places: items,
      };
    });
}

// ── Day-wise accordion ────────────────────────────────────────────

function PlaceListItem({ place }: { place: PlaceInNews }) {
  const cfg = CATEGORY_CONFIG[place.category];
  return (
    <div className="rounded-xl border border-border bg-white p-4 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-bold" style={{ color: '#111827' }}>{place.name}</p>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${cfg.color}14`, color: cfg.color, border: `1px solid ${cfg.color}33` }}
        >
          {cfg.label}
        </span>
        {place.lat == null && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
            <MapPinOff className="h-3 w-3" />
            Not on map
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{place.context}</p>
      {place.currentAffairId && (
        <Link
          href={`/current-affairs/${place.currentAffairId}`}
          className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
          style={{ color: '#7C3AED' }}
        >
          Read the article <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function DayAccordionItem({ group, defaultOpen }: { group: DateGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: open ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(124,58,237,0.12)',
        background: open ? 'rgba(124,58,237,0.03)' : '#FFFFFF',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
        style={{ background: 'transparent', border: 'none' }}
      >
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#7C3AED', opacity: 0.7 }}>
            {group.dayOfWeek}
          </p>
          <p className="text-sm font-bold" style={{ color: '#111827' }}>{group.displayDate}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}
          >
            {group.places.length} {group.places.length === 1 ? 'place' : 'places'}
          </span>
          <ChevronDown
            className="h-4 w-4 transition-transform"
            style={{ color: '#7C3AED', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2.5">
          {group.places.map((p) => <PlaceListItem key={p.id} place={p} />)}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default function PlacesInNewsPage() {
  const [view, setView] = useState<ViewMode>('map');
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo]     = useState(toISO(new Date()));

  const { data: mapPoints, isLoading: mapLoading, isError: mapError } = usePlacesInNewsMap(from, to);
  const { data: places, isLoading: listLoading, isError: listError } = usePlacesInNewsList(from, to);

  const groups = useMemo(() => groupByDate(places ?? []), [places]);

  return (
    <div style={{ color: '#1A1836' }}>

      {/* ── Dark hero ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%', right: '-5%', transform: 'translateY(-50%)',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 68%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-16">
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(196,181,253,0.5)' }}>
            <Link href="/current-affairs" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Current Affairs
            </Link>
          </div>

          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#C4B5FD' }}
            >
              <MapPin className="h-3.5 w-3.5" />
              Places in the News
            </div>

            <h1
              className="font-extrabold tracking-tight mb-3"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, color: '#F0EEFF' }}
            >
              Every place that made <span style={TEXT_GRAD}>the news.</span>
            </h1>
            <p style={{ color: 'rgba(196,181,253,0.65)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 520 }}>
              Border disputes, summits, disasters and more — mapped by location and
              grouped by day, so geography stays part of your current affairs prep.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ background: '#FFFFFF', minHeight: '70vh' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Controls: view toggle + date range */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(124,58,237,0.06)' }}>
              <button
                onClick={() => setView('map')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={view === 'map'
                  ? { background: '#7C3AED', color: '#FFFFFF' }
                  : { background: 'transparent', color: '#6B63A0' }}
              >
                <MapIcon className="h-3.5 w-3.5" />
                Map
              </button>
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={view === 'list'
                  ? { background: '#7C3AED', color: '#FFFFFF' }
                  : { background: 'transparent', color: '#6B63A0' }}
              >
                <List className="h-3.5 w-3.5" />
                Day-wise
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div style={{ width: 160 }}>
                <DatePicker value={from} onChange={setFrom} max={to} placeholder="From" />
              </div>
              <span className="text-xs text-muted-foreground">to</span>
              <div style={{ width: 160 }}>
                <DatePicker value={to} onChange={setTo} min={from} max={toISO(new Date())} placeholder="To" />
              </div>
            </div>
          </div>

          {/* ── Map view ── */}
          {view === 'map' && (
            <div>
              {mapError ? (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Could not load the map. Please try again later.
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ height: 560, border: '1px solid rgba(124,58,237,0.12)' }}>
                  {mapLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <PlacesMap points={mapPoints ?? []} />
                  )}
                </div>
              )}
              {!mapLoading && (mapPoints?.length ?? 0) === 0 && !mapError && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                  No resolved locations in this date range.
                </p>
              )}

              {/* Category legend */}
              <div className="flex flex-wrap items-center gap-3 mt-5">
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <span key={key} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#6B7280' }}>
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: cfg.color }} />
                    {cfg.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Day-wise list view ── */}
          {view === 'list' && (
            <div className="space-y-3">
              {listError ? (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Could not load places. Please try again later.
                </div>
              ) : listLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(124,58,237,0.05)' }} />
                  ))}
                </div>
              ) : groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-16 text-center gap-3">
                  <MapPin className="h-10 w-10 text-muted-foreground/25" />
                  <p className="text-sm font-semibold text-foreground">No places in this date range</p>
                  <p className="text-xs text-muted-foreground">Try widening the date range above.</p>
                </div>
              ) : (
                groups.map((group, i) => (
                  <DayAccordionItem key={group.dateKey} group={group} defaultOpen={i === 0} />
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
