'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin, List, Map as MapIcon, ChevronDown, ArrowLeft, ArrowRight,
  AlertCircle, Loader2, MapPinOff, Mountain,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { toISO } from '@/components/ui/calendar';
import { usePlacesInNewsList, usePlacesInNewsMap } from '@/features/places-in-news/hooks/use-places-in-news';
import { usePhysicalFeatures } from '@/features/places-in-news/hooks/use-physical-features';
import { useMapSubjects, useMapCategories } from '@/features/places-in-news/hooks/use-map-taxonomy';
import { CATEGORY_CONFIG, categoryGlyphSvg } from '@/features/places-in-news/category-config';
import { cn } from '@/lib/utils';
import type { PlaceInNews } from '@/types/features';

const PlacesMap = dynamic(
  () => import('@/features/places-in-news/components/PlacesMap').then((m) => m.PlacesMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    ),
  },
);

const PhysicalMap = dynamic(
  () => import('@/features/places-in-news/components/PhysicalMap').then((m) => m.PhysicalMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    ),
  },
);

type ViewMode = 'map' | 'list' | 'physical';

const ERROR_CLS = 'flex items-center gap-2 rounded-[2px] border border-[oklch(52%_.16_35_/_.3)] bg-paper-raised p-4 text-sm text-[oklch(52%_.16_35)]';

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

function CategoryGlyph({ category, size = 10 }: { category: PlaceInNews['category']; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0"
      dangerouslySetInnerHTML={{ __html: categoryGlyphSvg(category, size) }}
    />
  );
}

function PlaceListItem({ place }: { place: PlaceInNews }) {
  const cfg = CATEGORY_CONFIG[place.category];
  return (
    <div className="py-4 space-y-1.5 border-t border-rule first:border-t-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-semibold text-ink">{place.name}</p>
        <span className="ks-tag">
          <CategoryGlyph category={place.category} size={9} />
          {cfg.label}
        </span>
        {place.lat == null && (
          <span className="ks-tag ks-tag-gold">
            <MapPinOff className="h-3 w-3" />
            Not on map
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-ink-muted">{place.context}</p>
      {place.currentAffairId && (
        <Link
          href={`/current-affairs/${place.currentAffairId}`}
          className="ks-card-link"
        >
          Read the article
        </Link>
      )}
    </div>
  );
}

function DayAccordionItem({ group, defaultOpen }: { group: DateGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-rule">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer group"
        style={{ background: 'transparent', border: 'none' }}
      >
        <div>
          <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            {group.dayOfWeek}
          </p>
          <p className="text-base font-semibold text-ink">{group.displayDate}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="ks-group-count">
            {group.places.length} {group.places.length === 1 ? 'place' : 'places'}
          </span>
          <ChevronDown
            className="h-4 w-4 text-ink-muted transition-transform duration-150 ease-ks group-hover:text-ink"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>
      {open && (
        <div className="pb-4 pl-0 sm:pl-4 sm:border-l sm:border-rule sm:ml-1 mb-4">
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
  const { data: physicalFeatures, isLoading: physicalLoading, isError: physicalError } = usePhysicalFeatures();

  const { data: mapSubjects } = useMapSubjects();
  const [selectedSubject, setSelectedSubject] = useState('geography');
  const { data: subjectCategories } = useMapCategories(selectedSubject);

  // Tracks explicitly-hidden categories rather than an explicit "visible" set — so
  // switching subjects never needs a reset effect: any category not in this set is
  // visible by default, including ones from a subject picked for the first time.
  const [hiddenCategorySlugs, setHiddenCategorySlugs] = useState<Set<string>>(new Set());
  const toggleCategory = (slug: string) => {
    setHiddenCategorySlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  const visibleCategorySlugs = useMemo(
    () => new Set((subjectCategories ?? []).filter((c) => !hiddenCategorySlugs.has(c.slug)).map((c) => c.slug)),
    [subjectCategories, hiddenCategorySlugs],
  );
  const subjectFeatures = useMemo(
    () => (physicalFeatures ?? []).filter((f) => f.subject.slug === selectedSubject),
    [physicalFeatures, selectedSubject],
  );

  const groups = useMemo(() => groupByDate(places ?? []), [places]);

  const chipCls = (active: boolean) => cn(
    'chip cursor-pointer transition-colors duration-150 ease-ks',
    active ? 'bg-ink text-paper border-ink' : 'hover:border-ink hover:text-ink',
  );

  return (
    <div className="text-ink-soft">

      {/* ── Hero ── */}
      <section className="bg-background border-b border-rule">
        <div className="ks-container pt-14 pb-14">
          <div className="flex items-center gap-2 text-xs mb-6 text-ink-muted">
            <Link href="/current-affairs" className="hover:text-ink transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Current Affairs
            </Link>
          </div>

          <div className="max-w-2xl">
            {view === 'physical' ? (
              <>
                <p className="eyebrow mb-5">
                  <Mountain className="h-3.5 w-3.5" />
                  UPSC Through Map
                </p>
                <h1 className="doc-title mb-4">
                  Straits, ranges, rivers &amp; plates — one atlas.
                </h1>
                <p className="doc-lede">
                  Every major strait, mountain range, river and tectonic plate in the world,
                  toggle-able by layer — physical geography, the way GS1 actually needs it.
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow mb-5">
                  <MapPin className="h-3.5 w-3.5" />
                  Places in the News
                </p>
                <h1 className="doc-title mb-4">
                  Every place that made the news.
                </h1>
                <p className="doc-lede">
                  Border disputes, summits, disasters and more — mapped by location and
                  grouped by day, so geography stays part of your current affairs prep.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-paper" style={{ minHeight: '70vh' }}>
        <div className="ks-container py-10">

          {/* Controls: view toggle + date range */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setView('map')}
                className={chipCls(view === 'map')}
              >
                <MapIcon className="h-3.5 w-3.5" />
                Map
              </button>
              <button
                onClick={() => setView('list')}
                className={chipCls(view === 'list')}
              >
                <List className="h-3.5 w-3.5" />
                Day-wise
              </button>
              <button
                onClick={() => setView('physical')}
                className={chipCls(view === 'physical')}
              >
                <Mountain className="h-3.5 w-3.5" />
                UPSC Through Map
              </button>
            </div>

            {/* Date range only applies to news-driven views — the physical map is static reference geography */}
            {view !== 'physical' && (
              <div className="flex items-center gap-2">
                <div style={{ width: 160 }}>
                  <DatePicker value={from} onChange={setFrom} max={to} placeholder="From" />
                </div>
                <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">to</span>
                <div style={{ width: 160 }}>
                  <DatePicker value={to} onChange={setTo} min={from} max={toISO(new Date())} placeholder="To" />
                </div>
              </div>
            )}
          </div>

          {/* ── Map view ── */}
          {view === 'map' && (
            <div>
              {mapError ? (
                <div className={ERROR_CLS}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Could not load the map. Please try again later.
                </div>
              ) : (
                // isolate: Leaflet's internal zoom-control layer uses z-index:1000, which
                // would otherwise paint over the page's sticky header (z-50) on scroll —
                // isolation:isolate scopes it to this box only.
                <div className="relative isolate rounded-[2px] overflow-hidden border border-rule bg-paper-deep" style={{ height: 560 }}>
                  {mapLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
                    </div>
                  ) : (
                    <PlacesMap points={mapPoints ?? []} />
                  )}
                </div>
              )}
              {!mapLoading && (mapPoints?.length ?? 0) === 0 && !mapError && (
                <p className="text-center text-xs text-ink-muted mt-3">
                  No resolved locations in this date range.
                </p>
              )}

              {/* Category legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5">
                {(Object.keys(CATEGORY_CONFIG) as PlaceInNews['category'][]).map((key) => (
                  <span key={key} className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <CategoryGlyph category={key} />
                    {CATEGORY_CONFIG[key].label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Day-wise list view ── */}
          {view === 'list' && (
            <div>
              {listError ? (
                <div className={ERROR_CLS}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Could not load places. Please try again later.
                </div>
              ) : listLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-[2px] animate-pulse bg-paper-deep" />
                  ))}
                </div>
              ) : groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong bg-paper-raised p-16 text-center gap-3">
                  <MapPin className="h-10 w-10 text-ink-faint" />
                  <p className="text-sm font-semibold text-ink">No places in this date range</p>
                  <p className="text-xs text-ink-muted">Try widening the date range above.</p>
                </div>
              ) : (
                <div className="border-t border-rule">
                  {groups.map((group, i) => (
                    <DayAccordionItem key={group.dateKey} group={group} defaultOpen={i === 0} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── UPSC Through Map ── */}
          {view === 'physical' && (
            <div>
              {/* Subject picker — Geography, History, and whatever gets added later */}
              <div className="flex flex-wrap items-center gap-1.5 mb-5">
                {(mapSubjects ?? []).map((subject) => {
                  const active = subject.slug === selectedSubject;
                  return (
                    <button
                      key={subject.slug}
                      onClick={() => setSelectedSubject(subject.slug)}
                      className={chipCls(active)}
                    >
                      {subject.icon && <span>{subject.icon}</span>}
                      {subject.name}
                    </button>
                  );
                })}
              </div>

              {physicalError ? (
                <div className={ERROR_CLS}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Could not load the physical map. Please try again later.
                </div>
              ) : (
                // isolate: Leaflet's internal zoom-control layer uses z-index:1000, which
                // would otherwise paint over the page's sticky header (z-50) on scroll —
                // isolation:isolate scopes it to this box only.
                <div className="relative isolate rounded-[2px] overflow-hidden border border-rule bg-paper-deep" style={{ height: 560 }}>
                  {physicalLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
                    </div>
                  ) : (
                    <PhysicalMap features={subjectFeatures} visibleCategorySlugs={visibleCategorySlugs} />
                  )}
                </div>
              )}

              {/* Category toggles — scoped to the selected subject, so this never grows
                  past a handful of pills no matter how many subjects exist overall */}
              <div className="flex flex-wrap items-center gap-1.5 mt-5">
                {(subjectCategories ?? []).map((cfg) => {
                  const active = !hiddenCategorySlugs.has(cfg.slug);
                  return (
                    <button
                      key={cfg.slug}
                      onClick={() => toggleCategory(cfg.slug)}
                      aria-pressed={active}
                      className={cn(
                        'chip cursor-pointer transition-colors duration-150 ease-ks',
                        active ? 'border-ink text-ink' : 'text-ink-faint border-rule hover:text-ink-muted',
                      )}
                    >
                      <span
                        className={cn('h-2.5 w-2.5 shrink-0', active ? 'bg-ink' : 'bg-paper-gray')}
                        style={{
                          borderRadius: cfg.kind === 'point' ? '50%' : cfg.kind === 'line' ? 2 : 0,
                          ...(cfg.shape === 'diamond' ? { transform: 'rotate(45deg) scale(0.85)' } : {}),
                        }}
                      />
                      {cfg.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-ink-muted mt-3">
                Rivers and mountain ranges are shown as key waypoints (origin, major landmarks, mouth) rather than a precisely traced course.
                Tectonic plate boundaries are real data, simplified from a standard scientific plate model for lightweight rendering.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
