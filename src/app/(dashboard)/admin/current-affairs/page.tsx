'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/use-auth-store';
import { currentAffairsService } from '@/services/current-affairs.service';
import {
  Send, Trash2, AlertCircle, CheckCircle2, X,
  Loader2, Newspaper, ShieldCheck, BookOpen, Tag,
  FileText, CheckCheck, XCircle, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────

const GS_OPTIONS = ['GS1', 'GS2', 'GS3', 'GS4', 'ESSAY'] as const;

const GS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  GS1:   { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.3)'  },
  GS2:   { color: '#0891B2', bg: 'rgba(8,145,178,0.1)',   border: 'rgba(8,145,178,0.3)'   },
  GS3:   { color: '#059669', bg: 'rgba(5,150,105,0.1)',   border: 'rgba(5,150,105,0.3)'   },
  GS4:   { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   border: 'rgba(220,38,38,0.3)'   },
  ESSAY: { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   border: 'rgba(217,119,6,0.3)'   },
};

type TabId = 'new' | 'drafts' | 'published';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'new',       label: 'New Article', icon: Send      },
  { id: 'drafts',    label: 'Drafts',      icon: FileText  },
  { id: 'published', label: 'Published',   icon: Newspaper },
];

// ── Toast ─────────────────────────────────────────────────────────

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
            color: '#FFFFFF',
            backdropFilter: 'blur(8px)',
            minWidth: 280,
          }}
        >
          {t.type === 'success'
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />}
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

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

// ── Tag input ─────────────────────────────────────────────────────

function TagInput({
  tags, onChange, placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const add = (value: string) => {
    const trimmed = value.trim().replace(/,+$/, '');
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 min-h-9 p-2 rounded-xl border border-input bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/40">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-primary/10 text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="hover:opacity-70 cursor-pointer"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input && add(input)}
        placeholder={tags.length ? '' : placeholder}
        className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

// ── Confirm dialog (generic) ──────────────────────────────────────

function ConfirmDialog({
  icon, iconBg, iconColor,
  heading, body,
  confirmLabel, confirmBg,
  onConfirm, onCancel, loading,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  heading: string;
  body: string;
  confirmLabel: string;
  confirmBg: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: iconBg, color: iconColor }}
          >
            {icon}
          </div>
          <div>
            <p className="font-semibold text-foreground">{heading}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
          </div>
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

// ── GS tag chips (shared render) ──────────────────────────────────

function GsTags({ tags }: { tags: string[] }) {
  return (
    <>
      {tags.map((tag) => {
        const cfg = GS_COLORS[tag];
        return cfg ? (
          <span
            key={tag}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {tag}
          </span>
        ) : null;
      })}
    </>
  );
}

// ── Draft card ────────────────────────────────────────────────────

type ArticleLike = {
  id: string;
  title: string;
  publishedDate: string;
  gsPaperTags: string[];
  topicTags: string[];
  sourceName: string;
  summary: string;
};

function DraftCard({
  draft,
  onPublish,
  onReject,
  publishingId,
  rejectingId,
}: {
  draft: ArticleLike;
  onPublish: (id: string, title: string) => void;
  onReject: (id: string, title: string) => void;
  publishingId: string | null;
  rejectingId: string | null;
}) {
  const dateStr = draft.publishedDate
    ? new Date(draft.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const isPublishing = publishingId === draft.id;
  const isRejecting  = rejectingId  === draft.id;
  const busy         = isPublishing || isRejecting;

  return (
    <div
      className="rounded-2xl border border-border bg-card p-5 space-y-4 transition-opacity"
      style={{ opacity: busy ? 0.6 : 1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-foreground leading-snug">{draft.title}</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {draft.sourceName && <span>{draft.sourceName}</span>}
            {draft.sourceName && <span>·</span>}
            <span>{dateStr}</span>
          </div>
        </div>
        <div
          className="h-7 px-2.5 rounded-lg flex items-center text-[10px] font-bold shrink-0"
          style={{ background: 'rgba(217,119,6,0.1)', color: '#D97706', border: '1px solid rgba(217,119,6,0.25)' }}
        >
          Draft
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <GsTags tags={draft.gsPaperTags} />
        {draft.topicTags.slice(0, 5).map((tag) => (
          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      {/* Summary preview */}
      {draft.summary && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 border-l-2 border-primary/20 pl-3">
          {draft.summary}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onPublish(draft.id, draft.title)}
          disabled={busy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #059669, #0891B2)', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}
        >
          {isPublishing
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Publishing…</>
            : <><CheckCheck className="h-3.5 w-3.5" />Publish</>}
        </button>
        <button
          onClick={() => onReject(draft.id, draft.title)}
          disabled={busy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-destructive/30 text-destructive hover:bg-destructive/8 transition-colors disabled:cursor-not-allowed cursor-pointer"
        >
          {isRejecting
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Rejecting…</>
            : <><XCircle className="h-3.5 w-3.5" />Reject</>}
        </button>
      </div>
    </div>
  );
}

// ── Published article row ─────────────────────────────────────────

function ArticleRow({
  article,
  onDelete,
}: {
  article: ArticleLike;
  onDelete: (id: string, title: string) => void;
}) {
  const dateStr = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-colors">
      <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
        <Newspaper className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-foreground leading-snug">{article.title}</p>
          <span className="text-[11px] text-muted-foreground shrink-0">{dateStr}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <GsTags tags={article.gsPaperTags} />
          {article.topicTags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => onDelete(article.id, article.title)}
        className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
        title="Delete article"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Skeleton list ─────────────────────────────────────────────────

function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border">
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Form default state ────────────────────────────────────────────

const EMPTY_FORM = {
  title:         '',
  content:       '',
  publishedDate: new Date().toISOString().slice(0, 10),
  gsPaperTags:   [] as string[],
  topicTags:     [] as string[],
  mainsAngle:    '',
  sourceName:    '',
  sourceUrl:     '',
};

// ── Main page ─────────────────────────────────────────────────────

export default function AdminCurrentAffairsPage() {
  const { user }  = useAuthStore();
  const router    = useRouter();
  const qc        = useQueryClient();
  const { toasts, show: showToast, dismiss } = useToast();

  useEffect(() => {
    if (user !== null && !user.is_admin) router.replace('/dashboard');
  }, [user, router]);

  const [activeTab,   setActiveTab]   = useState<TabId>('new');
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [deleteTarget,      setDeleteTarget]      = useState<{ id: string; title: string } | null>(null);
  const [rejectTarget,      setRejectTarget]      = useState<{ id: string; title: string } | null>(null);
  const [publishingDraftId, setPublishingDraftId] = useState<string | null>(null);
  const [rejectingDraftId,  setRejectingDraftId]  = useState<string | null>(null);
  const [publishingDay,     setPublishingDay]     = useState<string | null>(null);  // YYYY-MM-DD

  // ── Queries ────────────────────────────────────────────────────
  const { data: drafts, isLoading: draftsLoading } = useQuery({
    queryKey: ['admin', 'current-affairs', 'drafts'],
    queryFn: () => currentAffairsService.getDrafts(),
    enabled: !!user?.is_admin,
    staleTime: 0,
    retry: false,
  });

  const { data: articles, isLoading: publishedLoading } = useQuery({
    queryKey: ['admin', 'current-affairs', 'recent'],
    queryFn: () => currentAffairsService.getRecent(20),
    enabled: !!user?.is_admin,
    staleTime: 0,
    retry: false,
  });

  // ── New-article publish mutation ───────────────────────────────
  const publishMutation = useMutation({
    mutationFn: () => currentAffairsService.publish({
      title:         form.title,
      content:       form.content,
      publishedDate: form.publishedDate || undefined,
      gsPaperTags:   form.gsPaperTags.length ? form.gsPaperTags : undefined,
      topicTags:     form.topicTags.length   ? form.topicTags   : undefined,
      mainsAngle:    form.mainsAngle  || undefined,
      sourceName:    form.sourceName  || undefined,
      sourceUrl:     form.sourceUrl   || undefined,
    }),
    onSuccess: () => {
      showToast('success', 'Article published! AI processing complete.');
      setForm({ ...EMPTY_FORM });
      qc.invalidateQueries({ queryKey: ['admin', 'current-affairs', 'recent'] });
      qc.invalidateQueries({ queryKey: ['current-affairs'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Publish failed. Please try again.';
      showToast('error', msg);
    },
  });

  // ── Publish-draft mutation ─────────────────────────────────────
  const publishDraftMutation = useMutation({
    mutationFn: (id: string) => currentAffairsService.publishDraft(id),
    onMutate: (id) => setPublishingDraftId(id),
    onSettled: () => setPublishingDraftId(null),
    onSuccess: () => {
      showToast('success', 'Draft published to the public feed.');
      qc.invalidateQueries({ queryKey: ['admin', 'current-affairs', 'drafts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'current-affairs', 'recent'] });
      qc.invalidateQueries({ queryKey: ['current-affairs'] });
    },
    onError: () => showToast('error', 'Could not publish draft. Try again.'),
  });

  // ── Reject (delete) draft mutation ────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: (id: string) => currentAffairsService.deleteById(id),
    onMutate: (id) => setRejectingDraftId(id),
    onSettled: () => { setRejectingDraftId(null); setRejectTarget(null); },
    onSuccess: () => {
      showToast('success', 'Draft rejected and removed.');
      qc.invalidateQueries({ queryKey: ['admin', 'current-affairs', 'drafts'] });
    },
    onError: () => showToast('error', 'Could not reject draft. Try again.'),
  });

  // ── Publish all drafts for a date ─────────────────────────────
  const publishDayMutation = useMutation({
    mutationFn: (date: string) => currentAffairsService.publishDay(date),
    onMutate: (date) => setPublishingDay(date),
    onSettled: () => setPublishingDay(null),
    onSuccess: (data) => {
      showToast('success', `${data.published} article${data.published !== 1 ? 's' : ''} published for ${data.date}.`);
      qc.invalidateQueries({ queryKey: ['admin', 'current-affairs', 'drafts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'current-affairs', 'recent'] });
      qc.invalidateQueries({ queryKey: ['current-affairs'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Could not publish day. Try again.';
      showToast('error', msg);
    },
  });

  // ── Delete published article mutation ─────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => currentAffairsService.deleteById(id),
    onSuccess: () => {
      showToast('success', 'Article deleted.');
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ['admin', 'current-affairs', 'recent'] });
      qc.invalidateQueries({ queryKey: ['current-affairs'] });
    },
    onError: () => showToast('error', 'Could not delete the article. Try again.'),
  });

  const set = (field: keyof typeof EMPTY_FORM, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    publishMutation.mutate();
  };

  const toggleGS = (tag: string) =>
    set('gsPaperTags', form.gsPaperTags.includes(tag)
      ? form.gsPaperTags.filter((t) => t !== tag)
      : [...form.gsPaperTags, tag]);

  if (!user?.is_admin) return null;

  const draftCount = drafts?.length ?? 0;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Current Affairs Admin" />

      <div className="flex-1 p-5 lg:p-6 max-w-4xl w-full mx-auto space-y-6">

        {/* Admin badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin · Current Affairs Publisher
          </div>
          <span className="text-xs text-muted-foreground">
            Published articles are visible to all users on the public page within seconds.
          </span>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-secondary/60 border border-border w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                activeTab === id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {id === 'drafts' && draftCount > 0 && (
                <span
                  className="ml-0.5 h-4.5 min-w-4.5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#D97706' }}
                >
                  {draftCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ NEW ARTICLE TAB ══ */}
        {activeTab === 'new' && (
          <form onSubmit={handleSubmit}>
            <div
              className="rounded-2xl border border-border bg-card p-6 space-y-5"
              style={{ boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. India–EU Free Trade Agreement: Latest Round"
                  required
                  disabled={publishMutation.isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Article Content <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                  placeholder="Paste the full article text here. AI will auto-generate summary, key facts, and exam relevance…"
                  rows={8}
                  required
                  disabled={publishMutation.isPending}
                  className="resize-y min-h-32"
                />
                <p className="text-[10px] text-muted-foreground">
                  {form.content.trim().split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Published Date</label>
                  <Input
                    type="date"
                    value={form.publishedDate}
                    onChange={(e) => set('publishedDate', e.target.value)}
                    disabled={publishMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Source Name</label>
                  <Input
                    value={form.sourceName}
                    onChange={(e) => set('sourceName', e.target.value)}
                    placeholder="The Hindu, PIB, IE…"
                    disabled={publishMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Source URL</label>
                  <Input
                    type="url"
                    value={form.sourceUrl}
                    onChange={(e) => set('sourceUrl', e.target.value)}
                    placeholder="https://…"
                    disabled={publishMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  GS Paper Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {GS_OPTIONS.map((tag) => {
                    const cfg      = GS_COLORS[tag];
                    const isActive = form.gsPaperTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleGS(tag)}
                        disabled={publishMutation.isPending}
                        className={cn(
                          'text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer disabled:opacity-50',
                          isActive ? 'text-white border-transparent' : 'text-muted-foreground border-border bg-background hover:border-primary/30',
                        )}
                        style={isActive ? { background: cfg.color } : {}}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Topic Tags
                  <span className="font-normal normal-case tracking-normal text-muted-foreground/60 ml-1">(Enter or comma to add)</span>
                </label>
                <TagInput
                  tags={form.topicTags}
                  onChange={(tags) => set('topicTags', tags)}
                  placeholder="Polity, Economy, Environment, IR…"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Mains Angle
                  <span className="font-normal normal-case tracking-normal text-muted-foreground/60 ml-1">(optional)</span>
                </label>
                <Input
                  value={form.mainsAngle}
                  onChange={(e) => set('mainsAngle', e.target.value)}
                  placeholder="e.g. Discuss the constitutional validity of EWS reservation."
                  disabled={publishMutation.isPending}
                />
              </div>

              <div className="pt-1 flex items-center justify-between gap-4">
                {publishMutation.isPending && (
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    AI is processing… this takes 5–10 seconds
                  </p>
                )}
                <div className="ml-auto flex items-center gap-3">
                  {(form.title || form.content) && !publishMutation.isPending && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...EMPTY_FORM })}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Clear form
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={publishMutation.isPending || !form.title.trim() || !form.content.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
                  >
                    {publishMutation.isPending
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing…</>
                      : <><Send className="h-4 w-4" />Publish</>}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ══ DRAFTS TAB ══ */}
        {activeTab === 'drafts' && (
          <section>
            {draftsLoading ? (
              <SkeletonList count={3} />
            ) : !drafts || drafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center gap-3">
                <FileText className="h-10 w-10 text-muted-foreground/25" />
                <p className="text-sm font-semibold text-foreground">No drafts pending review</p>
                <p className="text-xs text-muted-foreground">Drafts from the AI pipeline will appear here for approval.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Group drafts by publishedDate */}
                {Array.from(
                  drafts.reduce((map, d) => {
                    const key = d.publishedDate?.slice(0, 10) ?? 'unknown';
                    if (!map.has(key)) map.set(key, []);
                    map.get(key)!.push(d);
                    return map;
                  }, new Map<string, typeof drafts>()),
                )
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([dateKey, group]) => {
                    const d = new Date(`${dateKey}T00:00:00`);
                    const dateLabel = isNaN(d.getTime())
                      ? dateKey
                      : d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                    const isPublishingThisDay = publishingDay === dateKey;
                    return (
                      <div key={dateKey} className="space-y-3">
                        {/* Date group header */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-bold text-foreground">{dateLabel}</span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(217,119,6,0.1)', color: '#D97706', border: '1px solid rgba(217,119,6,0.25)' }}
                            >
                              {group.length} draft{group.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => publishDayMutation.mutate(dateKey)}
                            disabled={isPublishingThisDay || publishDraftMutation.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)', boxShadow: '0 2px 8px rgba(124,58,237,0.25)' }}
                          >
                            {isPublishingThisDay
                              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Publishing all…</>
                              : <><CheckCheck className="h-3.5 w-3.5" />Publish All for this Day</>}
                          </button>
                        </div>

                        {/* Individual drafts */}
                        <div className="space-y-3 pl-1 border-l-2" style={{ borderColor: 'rgba(124,58,237,0.15)' }}>
                          {group.map((d) => (
                            <DraftCard
                              key={d.id}
                              draft={d}
                              onPublish={(id, title) => {
                                setRejectTarget(null);
                                publishDraftMutation.mutate(id);
                                void title;
                              }}
                              onReject={(id, title) => setRejectTarget({ id, title })}
                              publishingId={publishingDraftId}
                              rejectingId={rejectingDraftId}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        )}

        {/* ══ PUBLISHED TAB ══ */}
        {activeTab === 'published' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                {articles ? `${articles.length} most recent published articles` : ''}
              </p>
            </div>

            {publishedLoading ? (
              <SkeletonList count={3} />
            ) : !articles || articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center gap-3">
                <Newspaper className="h-10 w-10 text-muted-foreground/25" />
                <p className="text-sm font-semibold text-foreground">No articles yet</p>
                <p className="text-xs text-muted-foreground">Publish your first article from the New Article tab.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {articles.map((a) => (
                  <ArticleRow
                    key={a.id}
                    article={a}
                    onDelete={(id, title) => setDeleteTarget({ id, title })}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Delete published article confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          icon={<Trash2 className="h-5 w-5" />}
          iconBg="rgba(220,38,38,0.1)"
          iconColor="#DC2626"
          heading="Delete article?"
          body={`"${deleteTarget.title}" will be permanently removed from the public feed.`}
          confirmLabel="Delete"
          confirmBg="#DC2626"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending}
        />
      )}

      {/* Reject draft confirmation */}
      {rejectTarget && (
        <ConfirmDialog
          icon={<XCircle className="h-5 w-5" />}
          iconBg="rgba(220,38,38,0.1)"
          iconColor="#DC2626"
          heading="Reject this draft?"
          body={`"${rejectTarget.title}" will be permanently deleted and won't be published.`}
          confirmLabel="Reject"
          confirmBg="#DC2626"
          onConfirm={() => rejectMutation.mutate(rejectTarget.id)}
          onCancel={() => setRejectTarget(null)}
          loading={rejectMutation.isPending}
        />
      )}

      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
