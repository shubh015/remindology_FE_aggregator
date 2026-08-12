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
          className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg pointer-events-auto animate-in slide-in-from-bottom-4 duration-200"
          style={{
            background: t.type === 'success' ? 'rgba(5,150,105,0.95)' : 'rgba(220,38,38,0.95)',
            color: '#FFFFFF', backdropFilter: 'blur(8px)', minWidth: 280,
          }}
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4">
        <div>
          <p className="font-semibold text-foreground">{heading}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-border hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

const numInputCls =
  'flex h-8 w-24 rounded-md border border-input bg-background px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

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
      <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-foreground">{place.name}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={save}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-white cursor-pointer disabled:opacity-50"
              style={{ background: '#059669' }}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={updateMutation.isPending}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary cursor-pointer"
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lat</label>
            <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} className={numInputCls} placeholder="—" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lng</label>
            <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} className={numInputCls} placeholder="—" />
          </div>
          {!resolved && (
            <span className="text-[11px] text-amber-600 font-semibold">Type in coordinates to resolve this pin.</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-foreground">{place.name}</p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${cfg.color}14`, color: cfg.color, border: `1px solid ${cfg.color}33` }}
          >
            {cfg.label}
          </span>
          {resolved ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <MapPin className="h-3 w-3" />
              {place.lat!.toFixed(4)}, {place.lng!.toFixed(4)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              <MapPinOff className="h-3 w-3" />
              Unresolved
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{place.context}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={startEdit}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDeleteRequest}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
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
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin · Places in News
          </div>
          <span className="text-xs text-muted-foreground">
            Coordinates are geocoded automatically from the place name — check the result below each entry.
          </span>
        </div>

        {/* ── Create form ── */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5" style={{ boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Pangong Tso"
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Category <span className="text-destructive">*</span>
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
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Context <span className="text-destructive">*</span>
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
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Date <span className="text-destructive">*</span>
              </label>
              <DatePicker
                value={form.newsDate}
                onChange={(iso) => set('newsDate', iso)}
                max={toISO(new Date())}
              />
            </div>

            <div className="pt-1 flex items-center justify-between gap-4">
              {createMutation.isPending && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Resolving coordinates…
                </p>
              )}
              <button
                type="submit"
                disabled={!canSubmit || createMutation.isPending}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
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
            className="flex items-center justify-between gap-3 rounded-2xl p-4"
            style={{
              background: lastResult.lat != null ? 'rgba(5,150,105,0.06)' : 'rgba(217,119,6,0.06)',
              border: `1px solid ${lastResult.lat != null ? 'rgba(5,150,105,0.25)' : 'rgba(217,119,6,0.25)'}`,
            }}
          >
            <div className="flex items-center gap-2.5">
              {lastResult.lat != null
                ? <MapPin className="h-4 w-4 shrink-0" style={{ color: '#059669' }} />
                : <MapPinOff className="h-4 w-4 shrink-0" style={{ color: '#D97706' }} />}
              <p className="text-sm font-semibold" style={{ color: lastResult.lat != null ? '#059669' : '#D97706' }}>
                {lastResult.name}: {lastResult.lat != null && lastResult.lng != null
                  ? `Resolved to ${lastResult.lat.toFixed(4)}, ${lastResult.lng.toFixed(4)}`
                  : 'Could not resolve coordinates — it will show in the list only, not on the map, until you add coordinates by hand below.'}
              </p>
            </div>
            <button onClick={() => setLastResult(null)} className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── List, grouped by date ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">Places (last 90 days)</h2>
            {totalCount > 0 && (
              <span
                className="h-4.5 min-w-4.5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: '#7C3AED' }}
              >
                {totalCount}
              </span>
            )}
          </div>

          {listLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center gap-2">
              <MapPin className="h-8 w-8 text-muted-foreground/25" />
              <p className="text-sm font-semibold text-foreground">No places yet</p>
              <p className="text-xs text-muted-foreground">Add one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.dateKey} className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
          confirmBg="#DC2626"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending}
        />
      )}

      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
