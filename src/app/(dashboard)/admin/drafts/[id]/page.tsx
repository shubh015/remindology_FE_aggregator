'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { currentAffairsService } from '@/services/current-affairs.service';
import type { EnrichedData, PrelimsFact, KeyTerm } from '@/types/features';
import {
  ArrowLeft, Pencil, Eye, Save, Send,
  Loader2, AlertCircle, CheckCircle2, X, Plus, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichEditor } from '@/components/editor/RichEditor';

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
          className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg pointer-events-auto"
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

// ── TagInput (inline copy) ────────────────────────────────────────

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

// ── Shared label ──────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
      {children}
    </label>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-sm font-bold uppercase tracking-widest mb-4"
      style={{ color: '#7C3AED' }}
    >
      {children}
    </h3>
  );
}

function Divider() {
  return <div className="border-t border-border my-6" />;
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary/40 transition-colors';

const textareaCls =
  'w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary/40 transition-colors resize-y';

// ── Form state type ───────────────────────────────────────────────

interface FormState {
  title: string;
  publishedDate: string;
  gsPaperTags: string[];
  topicTags: string[];
  mainsAngle: string;
  summary: string;
  keyFactsRaw: string;         // textarea: one fact per line
  whyInNews: string;
  historicalBackground: string;
  syllabusDetail: string;
  mainsAnglesRaw: string;      // textarea: one per line
  wayForwardRaw: string;       // textarea: one per line
  constitutionalProvisionsRaw: string; // textarea: one per line
  prelimsFacts: PrelimsFact[];
  keyTerms: KeyTerm[];
}

function emptyForm(): FormState {
  return {
    title: '',
    publishedDate: '',
    gsPaperTags: [],
    topicTags: [],
    mainsAngle: '',
    summary: '',
    keyFactsRaw: '',
    whyInNews: '',
    historicalBackground: '',
    syllabusDetail: '',
    mainsAnglesRaw: '',
    wayForwardRaw: '',
    constitutionalProvisionsRaw: '',
    prelimsFacts: [],
    keyTerms: [],
  };
}

// ── Preview section components ────────────────────────────────────

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold" style={{ color: '#7C3AED' }}>{title}</h4>
      {children}
    </div>
  );
}

function BulletList({ items, html = false }: { items: string[]; html?: boolean }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-1 list-none pl-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#7C3AED' }} />
          {html
            ? <span dangerouslySetInnerHTML={{ __html: item }} />
            : <span>{item}</span>}
        </li>
      ))}
    </ul>
  );
}

// Extract individual facts from a rich-text HTML string (handles bullet lists + bare paragraphs)
function extractHtmlFacts(html: string): string[] {
  if (typeof document === 'undefined' || !html) return [];
  const div = document.createElement('div');
  div.innerHTML = html;
  const items = div.querySelectorAll('li');
  if (items.length > 0) {
    return Array.from(items).map((li) => {
      const p = li.querySelector('p');
      return (p ? p.innerHTML : li.innerHTML).trim();
    }).filter(Boolean);
  }
  return Array.from(div.querySelectorAll('p')).map((p) => p.innerHTML.trim()).filter(Boolean);
}

// Build bullet-list HTML from an array of fact strings (plain or HTML)
function factsToHtml(facts: string[]): string {
  if (!facts.length) return '';
  return `<ul>${facts.map((f) => `<li><p>${f}</p></li>`).join('')}</ul>`;
}

// ── Main page ─────────────────────────────────────────────────────

export default function DraftEditPage() {
  const { user }  = useAuthStore();
  const router    = useRouter();
  const params    = useParams<{ id: string }>();
  const id        = params.id;
  const { toasts, show: showToast, dismiss } = useToast();

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [form, setForm] = useState<FormState>(emptyForm());

  // Admin guard
  useEffect(() => {
    if (user !== null && !user.is_admin && !user.isAdmin) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Fetch draft
  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['draft', id],
    queryFn: () => currentAffairsService.getById(id),
    enabled: !!id && (!!user?.is_admin || !!user?.isAdmin),
    staleTime: 0,
    retry: false,
  });

  // Populate form when article loads
  useEffect(() => {
    if (!article) return;
    const ed = article.enrichedData;
    setForm({
      title:                       article.title,
      publishedDate:               article.publishedDate?.slice(0, 10) ?? '',
      gsPaperTags:                 [...article.gsPaperTags],
      topicTags:                   [...article.topicTags],
      mainsAngle:                  article.mainsAngle ?? '',
      summary:                     article.summary ?? '',
      keyFactsRaw:                 factsToHtml(article.keyFacts ?? []),
      whyInNews:                   ed?.whyInNews ?? '',
      historicalBackground:        ed?.historicalBackground ?? '',
      syllabusDetail:              ed?.syllabusDetail ?? '',
      mainsAnglesRaw:              (ed?.mainsAngles ?? []).join('\n'),
      wayForwardRaw:               (ed?.wayForward ?? []).join('\n'),
      constitutionalProvisionsRaw: (ed?.constitutionalProvisions ?? []).join('\n'),
      prelimsFacts:                ed?.prelimsFacts ? [...ed.prelimsFacts] : [],
      keyTerms:                    ed?.keyTerms ? [...ed.keyTerms] : [],
    });
  }, [article]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      const enrichedData: EnrichedData = {
        whyInNews:                form.whyInNews || undefined,
        historicalBackground:     form.historicalBackground || undefined,
        syllabusDetail:           form.syllabusDetail || undefined,
        mainsAngles:              form.mainsAnglesRaw.split('\n').map((s) => s.trim()).filter(Boolean),
        wayForward:               form.wayForwardRaw.split('\n').map((s) => s.trim()).filter(Boolean),
        constitutionalProvisions: form.constitutionalProvisionsRaw.split('\n').map((s) => s.trim()).filter(Boolean),
        prelimsFacts:             form.prelimsFacts.filter((r) => r.label.trim() || r.value.trim()),
        keyTerms:                 form.keyTerms.filter((r) => r.term.trim() || r.definition.trim()),
      };
      return currentAffairsService.updateDraft(id, {
        title:         form.title,
        summary:       form.summary,
        keyFacts:      extractHtmlFacts(form.keyFactsRaw),
        gsPaperTags:   form.gsPaperTags,
        topicTags:     form.topicTags,
        mainsAngle:    form.mainsAngle,
        publishedDate: form.publishedDate,
        enrichedData,
      });
    },
    onSuccess: () => showToast('success', 'Draft saved successfully.'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Save failed. Please try again.';
      showToast('error', msg);
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: () => currentAffairsService.publishDraft(id),
    onSuccess: () => {
      showToast('success', 'Draft published successfully.');
      router.push('/admin/current-affairs');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Publish failed. Please try again.';
      showToast('error', msg);
    },
  });

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleGS = (tag: string) =>
    set('gsPaperTags', form.gsPaperTags.includes(tag)
      ? form.gsPaperTags.filter((t) => t !== tag)
      : [...form.gsPaperTags, tag]);

  const isBusy = saveMutation.isPending || publishMutation.isPending;

  if (!user?.is_admin && !user?.isAdmin) return null;

  // ── Loading / error ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6">
        <AlertCircle className="h-10 w-10 text-destructive/60" />
        <p className="text-sm font-semibold">Could not load draft.</p>
        <button
          onClick={() => router.push('/admin/current-affairs')}
          className="text-xs font-semibold text-primary underline cursor-pointer"
        >
          Back to drafts
        </button>
      </div>
    );
  }

  const truncatedTitle = article.title.length > 60
    ? `${article.title.slice(0, 60)}…`
    : article.title;

  // Build preview values from form
  const previewKeyFacts           = extractHtmlFacts(form.keyFactsRaw);
  const previewMainsAngles        = form.mainsAnglesRaw.split('\n').map((s) => s.trim()).filter(Boolean);
  const previewWayForward         = form.wayForwardRaw.split('\n').map((s) => s.trim()).filter(Boolean);
  const previewConstProvisions    = form.constitutionalProvisionsRaw.split('\n').map((s) => s.trim()).filter(Boolean);
  const previewPrelimsFacts       = form.prelimsFacts.filter((r) => r.label.trim() || r.value.trim());
  const previewKeyTerms           = form.keyTerms.filter((r) => r.term.trim() || r.definition.trim());

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-5 py-3 border-b border-border bg-card/80 backdrop-blur-md">
        <button
          onClick={() => router.push('/admin/current-affairs')}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">
            <span className="font-semibold text-foreground">Editing:</span> {truncatedTitle}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-0.5 p-0.5 rounded-xl bg-secondary/60 border border-border shrink-0">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'edit'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'preview'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
        </div>

        {/* Save */}
        <button
          onClick={() => saveMutation.mutate()}
          disabled={isBusy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saveMutation.isPending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
            : <><Save className="h-3.5 w-3.5" />Save</>}
        </button>

        {/* Publish */}
        <button
          onClick={() => publishMutation.mutate()}
          disabled={isBusy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #059669, #0891B2)', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}
        >
          {publishMutation.isPending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Publishing…</>
            : <><Send className="h-3.5 w-3.5" />Publish</>}
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-5 lg:p-6 max-w-3xl w-full mx-auto">

        {/* ══ EDIT MODE ══ */}
        {mode === 'edit' && (
          <div className="space-y-0">

            {/* Section: Basic Info */}
            <div>
              <SectionHeading>Basic Info</SectionHeading>

              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <input
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="Article title"
                    className={inputCls}
                  />
                </div>

                <div>
                  <Label>Published Date</Label>
                  <input
                    type="date"
                    value={form.publishedDate}
                    onChange={(e) => set('publishedDate', e.target.value)}
                    className={cn(inputCls, 'w-auto')}
                  />
                </div>

                <div>
                  <Label>GS Paper Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {GS_OPTIONS.map((tag) => {
                      const cfg      = GS_COLORS[tag];
                      const isActive = form.gsPaperTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleGS(tag)}
                          className={cn(
                            'text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer',
                            isActive
                              ? 'text-white border-transparent'
                              : 'text-muted-foreground border-border bg-background hover:border-primary/30',
                          )}
                          style={isActive ? { background: cfg.color } : {}}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>
                    Topic Tags
                    <span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground/60">(Enter or comma to add)</span>
                  </Label>
                  <TagInput
                    tags={form.topicTags}
                    onChange={(tags) => set('topicTags', tags)}
                    placeholder="Polity, Economy, Environment, IR…"
                  />
                </div>

                <div>
                  <Label>Mains Angle</Label>
                  <textarea
                    value={form.mainsAngle}
                    onChange={(e) => set('mainsAngle', e.target.value)}
                    rows={3}
                    placeholder="Mains angle or question framing…"
                    className={textareaCls}
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* Section: Content */}
            <div>
              <SectionHeading>Content</SectionHeading>

              <div className="space-y-4">
                <div>
                  <Label>Summary</Label>
                  <RichEditor
                    value={form.summary}
                    onChange={(html) => set('summary', html)}
                    placeholder="Article summary…"
                    minHeight="120px"
                  />
                </div>

                <div>
                  <Label>
                    Key Facts
                    <span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground/60">Each bullet = one fact</span>
                  </Label>
                  <RichEditor
                    value={form.keyFactsRaw}
                    onChange={(html) => set('keyFactsRaw', html)}
                    placeholder="Add key facts as bullet points…"
                    minHeight="120px"
                    startWithBulletList
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* Section: Enriched Data */}
            <div>
              <SectionHeading>Enriched Data</SectionHeading>

              <div className="space-y-4">
                <div>
                  <Label>Why in News</Label>
                  <RichEditor
                    value={form.whyInNews}
                    onChange={(html) => set('whyInNews', html)}
                    placeholder="Why this topic is in the news…"
                    minHeight="100px"
                  />
                </div>

                <div>
                  <Label>Historical Background</Label>
                  <RichEditor
                    value={form.historicalBackground}
                    onChange={(html) => set('historicalBackground', html)}
                    placeholder="Historical context and background…"
                    minHeight="100px"
                  />
                </div>

                <div>
                  <Label>Syllabus Detail</Label>
                  <textarea
                    value={form.syllabusDetail}
                    onChange={(e) => set('syllabusDetail', e.target.value)}
                    rows={3}
                    placeholder="Relevant syllabus topics…"
                    className={textareaCls}
                  />
                </div>

                <div>
                  <Label>
                    Mains Angles
                    <span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground/60">One per line</span>
                  </Label>
                  <textarea
                    value={form.mainsAnglesRaw}
                    onChange={(e) => set('mainsAnglesRaw', e.target.value)}
                    rows={3}
                    placeholder="Each line is one mains angle"
                    className={textareaCls}
                  />
                </div>

                <div>
                  <Label>
                    Way Forward
                    <span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground/60">One per line</span>
                  </Label>
                  <textarea
                    value={form.wayForwardRaw}
                    onChange={(e) => set('wayForwardRaw', e.target.value)}
                    rows={3}
                    placeholder="Each line is one way forward point"
                    className={textareaCls}
                  />
                </div>

                <div>
                  <Label>
                    Constitutional Provisions
                    <span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground/60">One per line</span>
                  </Label>
                  <textarea
                    value={form.constitutionalProvisionsRaw}
                    onChange={(e) => set('constitutionalProvisionsRaw', e.target.value)}
                    rows={3}
                    placeholder="Each line is one constitutional provision"
                    className={textareaCls}
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* Section: Prelims Facts */}
            <div>
              <SectionHeading>Prelims Facts</SectionHeading>

              <div className="space-y-2">
                {form.prelimsFacts.length > 0 && (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                          <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground w-2/5">Label</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">Value</th>
                          <th className="px-3 py-2 w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {form.prelimsFacts.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-2 py-1.5">
                              <input
                                value={row.label}
                                onChange={(e) => {
                                  const updated = [...form.prelimsFacts];
                                  updated[i] = { ...updated[i], label: e.target.value };
                                  set('prelimsFacts', updated);
                                }}
                                placeholder="Label"
                                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                value={row.value}
                                onChange={(e) => {
                                  const updated = [...form.prelimsFacts];
                                  updated[i] = { ...updated[i], value: e.target.value };
                                  set('prelimsFacts', updated);
                                }}
                                placeholder="Value"
                                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => set('prelimsFacts', form.prelimsFacts.filter((_, j) => j !== i))}
                                className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => set('prelimsFacts', [...form.prelimsFacts, { label: '', value: '' }])}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Row
                </button>
              </div>
            </div>

            <Divider />

            {/* Section: Key Terms */}
            <div>
              <SectionHeading>Key Terms</SectionHeading>

              <div className="space-y-2">
                {form.keyTerms.length > 0 && (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                          <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground w-2/5">Term</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">Definition</th>
                          <th className="px-3 py-2 w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {form.keyTerms.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-2 py-1.5 align-top">
                              <input
                                value={row.term}
                                onChange={(e) => {
                                  const updated = [...form.keyTerms];
                                  updated[i] = { ...updated[i], term: e.target.value };
                                  set('keyTerms', updated);
                                }}
                                placeholder="Term"
                                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
                              />
                            </td>
                            <td className="px-2 py-1.5 align-top">
                              <textarea
                                value={row.definition}
                                onChange={(e) => {
                                  const updated = [...form.keyTerms];
                                  updated[i] = { ...updated[i], definition: e.target.value };
                                  set('keyTerms', updated);
                                }}
                                placeholder="Definition"
                                rows={2}
                                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50 resize-y"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center align-top pt-2">
                              <button
                                type="button"
                                onClick={() => set('keyTerms', form.keyTerms.filter((_, j) => j !== i))}
                                className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => set('keyTerms', [...form.keyTerms, { term: '', definition: '' }])}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Row
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ══ PREVIEW MODE ══ */}
        {mode === 'preview' && (
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

            {/* 1. Title, date, source */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground leading-snug">{form.title || '(No title)'}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                {form.publishedDate && (
                  <span>
                    {new Date(`${form.publishedDate}T00:00:00`).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                )}
                {article.sourceName && <><span>·</span><span>{article.sourceName}</span></>}
              </div>
            </div>

            {/* 2. GS tags + topic tags */}
            {(form.gsPaperTags.length > 0 || form.topicTags.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {form.gsPaperTags.map((tag) => {
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
                {form.topicTags.map((tag) => (
                  <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 3. Summary */}
            {form.summary && form.summary !== '<p></p>' && (
              <PreviewSection title="Summary">
                <div
                  className="text-sm text-foreground leading-relaxed border-l-2 border-primary/20 pl-3 rich-editor-content"
                  dangerouslySetInnerHTML={{ __html: form.summary }}
                />
              </PreviewSection>
            )}

            {/* 4. Key Facts */}
            {previewKeyFacts.length > 0 && (
              <PreviewSection title="Key Facts">
                <BulletList items={previewKeyFacts} html />
              </PreviewSection>
            )}

            {/* 5. Why in News */}
            {form.whyInNews && form.whyInNews !== '<p></p>' && (
              <PreviewSection title="Why in News">
                <div
                  className="text-sm text-foreground leading-relaxed rich-editor-content"
                  dangerouslySetInnerHTML={{ __html: form.whyInNews }}
                />
              </PreviewSection>
            )}

            {/* 6. Historical Background */}
            {form.historicalBackground && form.historicalBackground !== '<p></p>' && (
              <PreviewSection title="Historical Background">
                <div
                  className="text-sm text-foreground leading-relaxed rich-editor-content"
                  dangerouslySetInnerHTML={{ __html: form.historicalBackground }}
                />
              </PreviewSection>
            )}

            {/* 7. Prelims Facts */}
            {previewPrelimsFacts.length > 0 && (
              <PreviewSection title="Prelims Facts">
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {previewPrelimsFacts.map((row, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-semibold text-foreground bg-secondary/30 w-2/5 align-top">
                            {row.label}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground align-top">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </PreviewSection>
            )}

            {/* 8. Key Terms */}
            {previewKeyTerms.length > 0 && (
              <PreviewSection title="Key Terms">
                <dl className="space-y-2">
                  {previewKeyTerms.map((kt, i) => (
                    <div key={i} className="text-sm">
                      <dt className="font-semibold text-foreground inline">{kt.term}: </dt>
                      <dd className="text-muted-foreground inline">{kt.definition}</dd>
                    </div>
                  ))}
                </dl>
              </PreviewSection>
            )}

            {/* 9. Mains Angles */}
            {previewMainsAngles.length > 0 && (
              <PreviewSection title="Mains Angles">
                <BulletList items={previewMainsAngles} />
              </PreviewSection>
            )}

            {/* 10. Way Forward */}
            {previewWayForward.length > 0 && (
              <PreviewSection title="Way Forward">
                <BulletList items={previewWayForward} />
              </PreviewSection>
            )}

            {/* 11. Constitutional Provisions */}
            {previewConstProvisions.length > 0 && (
              <PreviewSection title="Constitutional Provisions">
                <BulletList items={previewConstProvisions} />
              </PreviewSection>
            )}

            {/* 12. Syllabus Detail */}
            {form.syllabusDetail && (
              <PreviewSection title="Syllabus Detail">
                <p className="text-sm text-foreground leading-relaxed">{form.syllabusDetail}</p>
              </PreviewSection>
            )}

          </div>
        )}
      </div>

      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
