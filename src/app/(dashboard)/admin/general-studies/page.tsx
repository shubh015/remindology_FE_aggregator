'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/use-auth-store';
import { generalStudiesService } from '@/services/general-studies.service';
import {
  Send, Trash2, AlertCircle, CheckCircle2, X, Loader2,
  ShieldCheck, BookOpen, FileText, CheckCheck, Pencil, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Toast (mirrors admin/current-affairs) ──────────────────────────

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

const EMPTY_FORM = { subjectSlug: '', categorySlug: '', title: '', rawContent: '' };

export default function AdminGeneralStudiesPage() {
  const { user } = useAuthStore();
  const router   = useRouter();
  const qc       = useQueryClient();
  const { toasts, show: showToast, dismiss } = useToast();

  useEffect(() => {
    if (user !== null && !user.is_admin && !user.isAdmin) router.replace('/dashboard');
  }, [user, router]);

  const isAdmin = !!user?.is_admin || !!user?.isAdmin;

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────────
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['admin', 'general-studies', 'subjects'],
    queryFn: () => generalStudiesService.getSubjects(),
    enabled: isAdmin,
    staleTime: 60 * 60 * 1000,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin', 'general-studies', 'categories', form.subjectSlug],
    queryFn: () => generalStudiesService.getCategories(form.subjectSlug),
    enabled: isAdmin && !!form.subjectSlug,
    staleTime: 0,
  });

  const { data: drafts, isLoading: draftsLoading } = useQuery({
    queryKey: ['admin', 'general-studies', 'drafts'],
    queryFn: () => generalStudiesService.getDrafts(),
    enabled: isAdmin,
    staleTime: 0,
    retry: false,
  });

  // ── Mutations ────────────────────────────────────────────────────
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => generalStudiesService.createCategory(form.subjectSlug, name),
    onSuccess: (created) => {
      showToast('success', `Category "${created.name}" created.`);
      setNewCategoryName('');
      setAddingCategory(false);
      set('categorySlug', created.slug);
      qc.invalidateQueries({ queryKey: ['admin', 'general-studies', 'categories', form.subjectSlug] });
    },
    onError: () => showToast('error', 'Could not create category. Try again.'),
  });

  const createArticleMutation = useMutation({
    mutationFn: () => generalStudiesService.createArticle({
      subjectSlug: form.subjectSlug,
      categorySlug: form.categorySlug || undefined,
      title: form.title,
      rawContent: form.rawContent,
    }),
    onSuccess: () => {
      showToast('success', 'Draft created! AI enrichment complete — review it below.');
      setForm((prev) => ({ ...EMPTY_FORM, subjectSlug: prev.subjectSlug, categorySlug: prev.categorySlug }));
      qc.invalidateQueries({ queryKey: ['admin', 'general-studies', 'drafts'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Could not create draft. Try again.';
      showToast('error', msg);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => generalStudiesService.publishArticle(id),
    onMutate: (id) => setPublishingId(id),
    onSettled: () => setPublishingId(null),
    onSuccess: () => {
      showToast('success', 'Article published to the public site.');
      qc.invalidateQueries({ queryKey: ['admin', 'general-studies', 'drafts'] });
    },
    onError: () => showToast('error', 'Could not publish. Try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => generalStudiesService.deleteArticle(id),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => { setDeletingId(null); setDeleteTarget(null); },
    onSuccess: () => {
      showToast('success', 'Draft deleted.');
      qc.invalidateQueries({ queryKey: ['admin', 'general-studies', 'drafts'] });
    },
    onError: () => showToast('error', 'Could not delete. Try again.'),
  });

  const set = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubjectChange = (slug: string) => {
    setForm((prev) => ({ ...prev, subjectSlug: slug, categorySlug: '' }));
    setAddingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.subjectSlug || !form.title.trim() || !form.rawContent.trim()) return;
    createArticleMutation.mutate();
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate(newCategoryName.trim());
  };

  if (!isAdmin) return null;

  const draftCount = drafts?.length ?? 0;
  const canSubmit = form.subjectSlug && form.title.trim() && form.rawContent.trim();

  return (
    <div className="flex-1 flex flex-col">
      <Header title="General Studies Admin" />

      <div className="flex-1 p-5 lg:p-6 max-w-4xl w-full mx-auto space-y-6">

        {/* Admin badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-[2px] bg-paper-deep text-ink border border-rule">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin · General Studies Publisher
          </div>
          <span className="text-xs text-ink-muted">
            Editing raw content later won't regenerate the AI output — review before publishing.
          </span>
        </div>

        {/* ── Create form ── */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-[2px] border border-rule bg-paper-raised p-6 space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  Subject <span className="text-[oklch(52%_.16_35)]">*</span>
                </label>
                <select
                  value={form.subjectSlug}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={subjectsLoading || createArticleMutation.isPending}
                  className={selectCls}
                >
                  <option value="">Select a subject…</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  Category <span className="text-ink-muted">(optional)</span>
                </label>
                {addingCategory ? (
                  <div className="space-y-1.5">
                    {categories && categories.length === 0 && (
                      <p className="text-[11px] text-ink">This subject has no categories yet — add one, or cancel to post without a category.</p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Constitutional Framework"
                        disabled={createCategoryMutation.isPending}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                        className="shrink-0 h-9 px-3 rounded-md text-xs font-semibold bg-ink text-paper cursor-pointer disabled:opacity-50"
                      >
                        {createCategoryMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingCategory(false); setNewCategoryName(''); }}
                        className="shrink-0 h-9 w-9 rounded-md flex items-center justify-center text-ink-muted hover:bg-paper-deep cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={form.categorySlug}
                      onChange={(e) => set('categorySlug', e.target.value)}
                      disabled={!form.subjectSlug || categoriesLoading || createArticleMutation.isPending}
                      className={selectCls}
                    >
                      <option value="">
                        {!form.subjectSlug
                          ? 'Select a subject first…'
                          : categoriesLoading
                          ? 'Loading…'
                          : categories && categories.length === 0
                          ? 'No categories — will post directly to subject'
                          : 'No category (optional)…'}
                      </option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setAddingCategory(true)}
                      disabled={!form.subjectSlug}
                      title="Add a new category"
                      className="shrink-0 h-9 w-9 rounded-md border border-rule-strong flex items-center justify-center text-ink-muted hover:bg-paper-deep transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Title <span className="text-[oklch(52%_.16_35)]">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Champaran Satyagraha 1917"
                disabled={createArticleMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Raw Content <span className="text-[oklch(52%_.16_35)]">*</span>
              </label>
              <Textarea
                value={form.rawContent}
                onChange={(e) => set('rawContent', e.target.value)}
                placeholder="Paste the full raw text — as much detail as you have. AI will generate summary, key points, sections, mains angles &amp; FAQs…"
                rows={8}
                disabled={createArticleMutation.isPending}
                className="resize-y min-h-32"
              />
              <p className="text-[10px] text-ink-muted">
                {form.rawContent.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between gap-4">
              {createArticleMutation.isPending && (
                <p className="text-xs text-ink-muted flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink" />
                  AI is generating the article… this takes a few seconds
                </p>
              )}
              <button
                type="submit"
                disabled={!canSubmit || createArticleMutation.isPending}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold bg-ink text-paper transition-colors hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {createArticleMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
                  : <><Send className="h-4 w-4" />Create Draft</>}
              </button>
            </div>
          </div>
        </form>

        {/* ── Drafts list ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-ink-muted" />
            <h2 className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">Drafts</h2>
            {draftCount > 0 && (
              <span
                className="h-4.5 min-w-4.5 px-1 rounded-[2px] font-label text-[10px] tabular-nums bg-ink text-paper flex items-center justify-center"
              >
                {draftCount}
              </span>
            )}
          </div>

          {draftsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-[2px]" />)}
            </div>
          ) : !drafts || drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-rule bg-paper-raised p-10 text-center gap-2">
              <BookOpen className="h-8 w-8 text-ink-faint" />
              <p className="text-sm font-semibold text-ink">No drafts pending review</p>
              <p className="text-xs text-ink-muted">Create one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => {
                const subject = subjects?.find((s) => s.id === draft.subjectId);
                const isPublishing = publishingId === draft.id;
                const isDeleting   = deletingId === draft.id;
                const busy = isPublishing || isDeleting;
                return (
                  <div
                    key={draft.id}
                    className="ks-card p-5 space-y-3 transition-opacity"
                    style={{ opacity: busy ? 0.6 : 1 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-ink leading-snug">{draft.title}</p>
                        <p className="text-[11px] text-ink-muted">
                          {subject?.name ?? '—'} · {draft.readTimeMins} min read
                        </p>
                      </div>
                      <div
                        className="ks-tag shrink-0"
                      >
                        Draft
                      </div>
                    </div>

                    {draft.summary && (
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-2 border-l-2 border-ink pl-3">
                        {draft.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => router.push(`/admin/general-studies/drafts/${draft.id}`)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold border border-rule text-ink hover:bg-paper-deep transition-colors disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => publishMutation.mutate(draft.id)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-ink text-paper transition-colors hover:bg-ink/90 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isPublishing
                          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Publishing…</>
                          : <><CheckCheck className="h-3.5 w-3.5" />Publish</>}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: draft.id, title: draft.title })}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold border border-[oklch(52%_.16_35)]/30 text-[oklch(52%_.16_35)] hover:bg-[oklch(52%_.16_35)]/10 transition-colors disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          heading="Delete draft?"
          body={`"${deleteTarget.title}" will be permanently deleted.`}
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
