'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { toISO } from '@/components/ui/calendar';
import { useAuthStore } from '@/store/use-auth-store';
import { placesInNewsService } from '@/services/places-in-news.service';
import { CATEGORY_CONFIG, CATEGORY_OPTIONS } from '@/features/places-in-news/category-config';
import type { PlaceInNews, PlaceCategory } from '@/types/features';
import {
  Send, Trash2, AlertCircle, CheckCircle2, X, Loader2,
  ShieldCheck, MapPin, MapPinOff, Pencil, Check,
} from 'lucide-react';

// ── Toast (mirrors admin/general-studies) ───────────────────────

type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string }

function ToastList({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-[3px] shadow-lift-2 pointer-events-auto animate-in slide-in-from-bottom-4 duration-200 text-paper ${t.type === 'success' ? 'bg-ink' : 'bg-[oklch(52%_.16_35)]'}`}
          style={{ minWidth: 280 }}
        >
          {t.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span className="text-sm font-semibold flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const show = useCallback((type: ToastType, message: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  return { toasts, show, dismiss };
}

// ── Confirm dialog ───────────────────────────────────────────────

function ConfirmDialog({
  heading, body, confirmLabel, confirmBg, onConfirm, onCancel, loading,
}: {
  heading: string; body: string; confirmLabel: string; confirmBg: string;
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancel} />
      <div className="relative bg-paper-raised border border-rule rounded-[3px] p-6 shadow-lift-2 max-w-sm w-full space-y-4">
        <div>
          <p className="font-semibold text-ink">{heading}</p>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">{body}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-md border border-rule hover:bg-paper-deep transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-md text-paper hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
            style={{ background: confirmBg }}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const selectCls =
  'flex h-9 w-full rounded-md border border-rule-strong bg-paper-raised px-3 py-1 text-sm text-ink transition-colors focus-visible:outline-none focus-visible:border-ink disabled:cursor-not-allowed disabled:opacity-50';

const numInputCls =
  'flex h-8 w-24 rounded-md border border-rule-strong bg-paper-raised px-2 font-label text-xs text-ink transition-colors focus-visible:outline-none focus-visible:border-ink';

const EMPTY_FORM = { name: '', context: '', category: 'other' as PlaceCategory, newsDate: toISO(new Date()) };

// ── Date-range default: last 90 days ────────────────────────────
function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

interface DateGroup { dateKey: string; displayDate: string; places: PlaceInNews[] }

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
        displayDate: isNaN(d.getTime())
          ? key
          : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        places: items,
      };
    });
}

// ── Editable row ─────────────────────────────────────────────────

function PlaceRow({
  place, onSaved, onDeleteRequest, updateMutation,
}: {
  place: PlaceInNews;
  onSaved: () => void;
  onDeleteRequest: () => void;
  updateMutation: ReturnType<typeof useEditMutation>;
}) {
  const [editing, setEditing] = useState(false);
  const [context, setContext] = useState(place.context);
  const [category, setCategory] = useState<PlaceCategory>(place.category);
  const [lat, setLat] = useState(place.lat != null ? String(place.lat) : '');
  const [lng, setLng] = useState(place.lng != null ? String(place.lng) : '');

  const cfg = CATEGORY_CONFIG[place.category];
  const resolved = place.lat != null && place.lng != null;
  const busy = updateMutation.isPending && updateMutation.variables?.id === place.id;

  const startEdit = () => {
    setContext(place.context);
    setCategory(place.category);
    setLat(place.lat != null ? String(place.lat) : '');
    setLng(place.lng != null ? String(place.lng) : '');
    setEditing(true);
  };

  const save = () => {
    const latNum = lat.trim() === '' ? undefined : Number(lat);
    const lngNum = lng.trim() === '' ? undefined : Number(lng);
    updateMutation.mutate(
      {
        id: place.id,
        input: {
          ...(context !== place.context ? { context } : {}),
          ...(category !== place.category ? { category } : {}),
          ...(latNum !== undefined && latNum !== place.lat ? { lat: latNum } : {}),
          ...(lngNum !== undefined && lngNum !== place.lng ? { lng: lngNum } : {}),
        },
      },
      { onSuccess: () => { setEditing(false); onSaved(); } },
    );
  };

  if (editing) {
    return (
      <div className="rounded-[2px] border border-ink bg-paper-raised p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{place.name}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={save}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[3px] text-xs font-semibold bg-ink text-paper cursor-pointer disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={updateMutation.isPending}
              className="h-8 w-8 rounded-[3px] flex items-center justify-center text-ink-muted hover:bg-paper-deep cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} className="text-sm" />

        <div className="flex items-center gap-3 flex-wrap">
          <select value={category} onChange={(e) => setCategory(e.target.value as PlaceCategory)} className={selectCls} style={{ width: 200 }}>
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex items-center gap-1.5">
            <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">Lat</label>
            <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} className={numInputCls} placeholder="—" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">Lng</label>
            <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} className={numInputCls} placeholder="—" />
          </div>
          {!resolved && (
            <span className="text-[11px] text-ink font-semibold">Type in coordinates to resolve this pin.</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2px] border border-rule bg-paper-raised p-4 flex items-start justify-between gap-3 hover:border-rule-strong transition-colors duration-150 ease-ks">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-ink">{place.name}</p>
          <span className="ks-tag">
            {cfg.label}
          </span>
          {resolved ? (
            <span className="flex items-center gap-1 font-label text-[11px] text-ink">
              <MapPin className="h-3 w-3" />
              {place.lat!.toFixed(4)}, {place.lng!.toFixed(4)}
            </span>
          ) : (
            <span className="ks-tag ks-tag-gold gap-1">
              <MapPinOff className="h-3 w-3" />
              Unresolved
            </span>
          )}
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">{place.context}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={startEdit}
          className="h-8 w-8 rounded-[3px] flex items-center justify-center text-ink-muted hover:bg-paper-deep transition-colors cursor-pointer"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDeleteRequest}
          className="h-8 w-8 rounded-[3px] flex items-center justify-center text-[oklch(52%_.16_35)] hover:bg-[oklch(52%_.16_35)]/10 transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function useEditMutation(onError: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof placesInNewsService.update>[1] }) =>
      placesInNewsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'places-in-news', 'list'] }),
    onError,
  });
}

export default function AdminPlacesInNewsPage() {
  const { user } = useAuthStore();
  const router   = useRouter();
  const qc       = useQueryClient();
  const { toasts, show: showToast, dismiss } = useToast();

  useEffect(() => {
    if (user !== null && !user.is_admin && !user.isAdmin) router.replace('/dashboard');
  }, [user, router]);

  const isAdmin = !!user?.is_admin || !!user?.isAdmin;

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [lastResult, setLastResult] = useState<{ name: string; lat: number | null; lng: number | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const from = daysAgoISO(90);
  const to   = toISO(new Date());

  const { data: places, isLoading: listLoading } = useQuery({
    queryKey: ['admin', 'places-in-news', 'list', from, to],
    queryFn: () => placesInNewsService.getList(from, to),
    enabled: isAdmin,
    staleTime: 0,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () => placesInNewsService.create({
      name: form.name.trim(),
      context: form.context.trim(),
      category: form.category,
      newsDate: form.newsDate,
    }),
    onSuccess: (created) => {
      setLastResult({ name: created.name, lat: created.lat, lng: created.lng });
      showToast(
        'success',
        created.lat != null && created.lng != null
          ? `Resolved to ${created.lat.toFixed(2)}, ${created.lng.toFixed(2)}`
          : 'Could not resolve coordinates — will show in list only, not on map.',
      );
      setForm({ ...EMPTY_FORM });
      qc.invalidateQueries({ queryKey: ['admin', 'places-in-news', 'list'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Could not create place. Try again.';
      showToast('error', msg);
    },
  });

  const updateMutation = useEditMutation(() => showToast('error', 'Could not save changes. Try again.'));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => placesInNewsService.remove(id),
    onSettled: () => setDeleteTarget(null),
    onSuccess: () => {
      showToast('success', 'Place deleted.');
      qc.invalidateQueries({ queryKey: ['admin', 'places-in-news', 'list'] });
    },
    onError: () => showToast('error', 'Could not delete. Try again.'),
  });

  const set = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.context.trim()) return;
    createMutation.mutate();
  };

  if (!isAdmin) return null;

  const canSubmit = form.name.trim() && form.context.trim() && form.newsDate;
  const groups = groupByDate(places ?? []);
  const totalCount = places?.length ?? 0;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Places in News Admin" />

      <div className="flex-1 p-5 lg:p-6 max-w-4xl w-full mx-auto space-y-6">

        {/* Admin badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-[2px] bg-paper-deep text-ink border border-rule">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin · Places in News
          </div>
          <span className="text-xs text-ink-muted">
            Coordinates are geocoded automatically from the place name — check the result below each entry.
          </span>
        </div>

        {/* ── Create form ── */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-[2px] border border-rule bg-paper-raised p-6 space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  Name <span className="text-[oklch(52%_.16_35)]">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Pangong Tso"
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  Category <span className="text-[oklch(52%_.16_35)]">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  disabled={createMutation.isPending}
                  className={selectCls}
                >
                  {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Context <span className="text-[oklch(52%_.16_35)]">*</span>
              </label>
              <Textarea
                value={form.context}
                onChange={(e) => set('context', e.target.value)}
                placeholder="Why is this place in the news right now?"
                rows={4}
                disabled={createMutation.isPending}
                className="resize-y min-h-24"
              />
            </div>

            <div className="space-y-1.5 max-w-[240px]">
              <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Date <span className="text-[oklch(52%_.16_35)]">*</span>
              </label>
              <DatePicker
                value={form.newsDate}
                onChange={(iso) => set('newsDate', iso)}
                max={toISO(new Date())}
              />
            </div>

            <div className="pt-1 flex items-center justify-between gap-4">
              {createMutation.isPending && (
                <p className="text-xs text-ink-muted flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink" />
                  Resolving coordinates…
                </p>
              )}
              <button
                type="submit"
                disabled={!canSubmit || createMutation.isPending}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold bg-ink text-paper transition-colors hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {createMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Adding…</>
                  : <><Send className="h-4 w-4" />Add Place</>}
              </button>
            </div>
          </div>
        </form>

        {/* ── Last-result banner — persists until dismissed since the admin may need to act on it ── */}
        {lastResult && (
          <div
            className={`flex items-center justify-between gap-3 rounded-[2px] p-4 border ${lastResult.lat != null ? 'bg-paper-raised border-rule-strong' : 'bg-paper-deep border-gold/55 border-l-2 border-l-gold'}`}
          >
            <div className="flex items-center gap-2.5">
              {lastResult.lat != null
                ? <MapPin className="h-4 w-4 shrink-0 text-ink" />
                : <MapPinOff className="h-4 w-4 shrink-0 text-ink" />}
              <p className="text-sm font-semibold text-ink">
                {lastResult.name}: {lastResult.lat != null && lastResult.lng != null
                  ? `Resolved to ${lastResult.lat.toFixed(4)}, ${lastResult.lng.toFixed(4)}`
                  : 'Could not resolve coordinates — it will show in the list only, not on the map, until you add coordinates by hand below.'}
              </p>
            </div>
            <button onClick={() => setLastResult(null)} className="shrink-0 text-ink-muted hover:text-ink cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── List, grouped by date ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ink-muted" />
            <h2 className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">Places (last 90 days)</h2>
            {totalCount > 0 && (
              <span
                className="h-4.5 min-w-4.5 px-1 rounded-[2px] font-label text-[10px] tabular-nums bg-ink text-paper flex items-center justify-center"
              >
                {totalCount}
              </span>
            )}
          </div>

          {listLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-[2px]" />)}
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-rule bg-paper-raised p-10 text-center gap-2">
              <MapPin className="h-8 w-8 text-ink-faint" />
              <p className="text-sm font-semibold text-ink">No places yet</p>
              <p className="text-xs text-ink-muted">Add one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.dateKey} className="space-y-2.5">
                  <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    {group.displayDate}
                  </p>
                  <div className="space-y-2.5">
                    {group.places.map((place) => (
                      <PlaceRow
                        key={place.id}
                        place={place}
                        updateMutation={updateMutation}
                        onSaved={() => showToast('success', 'Place updated.')}
                        onDeleteRequest={() => setDeleteTarget({ id: place.id, name: place.name })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          heading="Delete place?"
          body={`"${deleteTarget.name}" will be permanently deleted.`}
          confirmLabel="Delete"
          confirmBg="oklch(52% .16 35)"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending}
        />
      )}

      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
