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

// ── Delete confirmation dialog ────────────────────────────────────

function DeleteDialog({
  title, onConfirm, onCancel, loading,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Delete article?</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              &ldquo;{title}&rdquo; will be permanently removed and disappear from the public feed.
            </p>
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
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Article row ───────────────────────────────────────────────────

function ArticleRow({
  article,
  onDelete,
}: {
  article: { id: string; title: string; publishedDate: string; gsPaperTags: string[]; topicTags: string[] };
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
          {article.gsPaperTags.map((tag) => {
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
  const { user } = useAuthStore();
  const router   = useRouter();
  const qc       = useQueryClient();
  const { toasts, show: showToast, dismiss } = useToast();

  // Guard — redirect non-admins immediately
  useEffect(() => {
    if (user !== null && !user.is_admin) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // ── Recent articles query ──────────────────────────────────────
  const { data: articles, isLoading: listLoading } = useQuery({
    queryKey: ['admin', 'current-affairs', 'recent'],
    queryFn: () => currentAffairsService.getRecent(20),
    enabled: !!user?.is_admin,
    staleTime: 0,
    retry: false,
  });

  // ── Publish mutation ───────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: () => currentAffairsService.publish({
      title:         form.title,
      content:       form.content,
      publishedDate: form.publishedDate || undefined,
      gsPaperTags:   form.gsPaperTags.length ? form.gsPaperTags : undefined,
      topicTags:     form.topicTags.length ? form.topicTags : undefined,
      mainsAngle:    form.mainsAngle || undefined,
      sourceName:    form.sourceName || undefined,
      sourceUrl:     form.sourceUrl  || undefined,
    }),
    onSuccess: () => {
      showToast('success', 'Article published successfully! AI processing complete.');
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

  // ── Delete mutation ────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => currentAffairsService.deleteById(id),
    onSuccess: () => {
      showToast('success', 'Article deleted.');
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ['admin', 'current-affairs', 'recent'] });
      qc.invalidateQueries({ queryKey: ['current-affairs'] });
    },
    onError: () => {
      showToast('error', 'Could not delete the article. Try again.');
    },
  });

  const set = (field: keyof typeof EMPTY_FORM, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    publishMutation.mutate();
  };

  const toggleGS = (tag: string) => {
    set('gsPaperTags', form.gsPaperTags.includes(tag)
      ? form.gsPaperTags.filter((t) => t !== tag)
      : [...form.gsPaperTags, tag]);
  };

  if (!user?.is_admin) return null;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Publish Current Affairs" />

      <div className="flex-1 p-5 lg:p-6 max-w-4xl w-full mx-auto space-y-8">

        {/* Admin badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin · Current Affairs Publisher
          </div>
          <span className="text-xs text-muted-foreground">
            Published articles are visible to all users on the public page within seconds.
          </span>
        </div>

        {/* ── Publish form ── */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            Publish New Article
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              className="rounded-2xl border border-border bg-card p-6 space-y-5"
              style={{ boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}
            >
              {/* Title */}
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

              {/* Content */}
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

              {/* Date + Source row */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Published Date
                  </label>
                  <Input
                    type="date"
                    value={form.publishedDate}
                    onChange={(e) => set('publishedDate', e.target.value)}
                    disabled={publishMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Source Name
                  </label>
                  <Input
                    value={form.sourceName}
                    onChange={(e) => set('sourceName', e.target.value)}
                    placeholder="The Hindu, PIB, IE…"
                    disabled={publishMutation.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Source URL
                  </label>
                  <Input
                    type="url"
                    value={form.sourceUrl}
                    onChange={(e) => set('sourceUrl', e.target.value)}
                    placeholder="https://…"
                    disabled={publishMutation.isPending}
                  />
                </div>
              </div>

              {/* GS Paper Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  GS Paper Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {GS_OPTIONS.map((tag) => {
                    const cfg     = GS_COLORS[tag];
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

              {/* Topic Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Topic Tags
                  <span className="font-normal normal-case tracking-normal text-muted-foreground/60 ml-1">(press Enter or comma to add)</span>
                </label>
                <TagInput
                  tags={form.topicTags}
                  onChange={(tags) => set('topicTags', tags)}
                  placeholder="Polity, Economy, Environment, IR…"
                />
              </div>

              {/* Mains Angle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Mains Angle
                  <span className="font-normal normal-case tracking-normal text-muted-foreground/60 ml-1">(optional prompt for aspirants)</span>
                </label>
                <Input
                  value={form.mainsAngle}
                  onChange={(e) => set('mainsAngle', e.target.value)}
                  placeholder="e.g. Discuss the constitutional validity of EWS reservation."
                  disabled={publishMutation.isPending}
                />
              </div>

              {/* Submit */}
              <div className="pt-1 flex items-center justify-between gap-4">
                {publishMutation.isPending && (
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    AI is processing the article… this takes 5–10 seconds
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
        </section>

        {/* ── Recent articles ── */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            Recent Articles
            {articles && (
              <span className="text-xs font-medium text-muted-foreground ml-1">
                ({articles.length} loaded)
              </span>
            )}
          </h2>

          {listLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
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
          ) : !articles || articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center gap-3">
              <Newspaper className="h-10 w-10 text-muted-foreground/25" />
              <p className="text-sm font-semibold text-foreground">No articles yet</p>
              <p className="text-xs text-muted-foreground">Publish your first article using the form above.</p>
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
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteDialog
          title={deleteTarget.title}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending}
        />
      )}

      {/* Toasts */}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
