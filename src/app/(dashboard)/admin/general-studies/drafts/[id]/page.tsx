'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/use-auth-store';
import { generalStudiesService } from '@/services/general-studies.service';
import {
  ArrowLeft, Save, Send, Trash2, Loader2, AlertCircle,
  CheckCircle2, X, HelpCircle, ListOrdered,
} from 'lucide-react';

// ── Toast (mirrors admin/general-studies) ──────────────────────────

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
      {children}
    </p>
  );
}

export default function AdminGSDraftEditPage() {
  const { user } = useAuthStore();
  const router   = useRouter();
  const params   = useParams<{ id: string }>();
  const id       = params.id;
  const qc       = useQueryClient();
  const { toasts, show: showToast, dismiss } = useToast();

  useEffect(() => {
    if (user !== null && !user.is_admin && !user.isAdmin) router.replace('/dashboard');
  }, [user, router]);

  const isAdmin = !!user?.is_admin || !!user?.isAdmin;

  // No admin get-by-id endpoint exists — load the drafts list and find this one.
  const { data: drafts, isLoading, isError } = useQuery({
    queryKey: ['admin', 'general-studies', 'drafts'],
    queryFn: () => generalStudiesService.getDrafts(),
    enabled: isAdmin && !!id,
    staleTime: 0,
    retry: false,
  });

  const draft = drafts?.find((d) => d.id === id);

  const [title, setTitle] = useState('');
  const [rawContent, setRawContent] = useState('');

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setRawContent(draft.rawContent);
    }
  }, [draft]);

  const saveMutation = useMutation({
    mutationFn: () => generalStudiesService.updateArticle(id, { title, rawContent }),
    onSuccess: () => {
      showToast('success', 'Draft saved.');
      qc.invalidateQueries({ queryKey: ['admin', 'general-studies', 'drafts'] });
    },
    onError: () => showToast('error', 'Could not save. Try again.'),
  });

  const publishMutation = useMutation({
    mutationFn: () => generalStudiesService.publishArticle(id),
    onSuccess: () => {
      showToast('success', 'Published to the public site.');
      router.push('/admin/general-studies');
    },
    onError: () => showToast('error', 'Could not publish. Try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => generalStudiesService.deleteArticle(id),
    onSuccess: () => {
      showToast('success', 'Draft deleted.');
      router.push('/admin/general-studies');
    },
    onError: () => showToast('error', 'Could not delete. Try again.'),
  });

  const isBusy = saveMutation.isPending || publishMutation.isPending || deleteMutation.isPending;
  const contentChanged = draft && rawContent !== draft.rawContent;

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !draft) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6">
        <AlertCircle className="h-10 w-10 text-destructive/60" />
        <p className="text-sm font-semibold">Could not load this draft.</p>
        <button
          onClick={() => router.push('/admin/general-studies')}
          className="text-xs font-semibold text-primary underline cursor-pointer"
        >
          Back to General Studies Admin
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-5 py-3 border-b border-border bg-card/80 backdrop-blur-md">
        <button
          onClick={() => router.push('/admin/general-studies')}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">
            <span className="font-semibold text-foreground">Editing:</span> {draft.title}
          </p>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={isBusy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saveMutation.isPending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
            : <><Save className="h-3.5 w-3.5" />Save</>}
        </button>

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

      <div className="flex-1 p-5 lg:p-6 max-w-3xl w-full mx-auto space-y-8">

        {/* Editable fields */}
        <div className="space-y-4">
          <div>
            <SectionLabel>Title</SectionLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isBusy}
            />
          </div>
          <div>
            <SectionLabel>Raw Content</SectionLabel>
            <Textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={10}
              disabled={isBusy}
              className="resize-y min-h-40"
            />
            {contentChanged && (
              <div className="flex items-start gap-2 mt-2 rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Editing raw content won't regenerate the summary, sections, key points, mains angles
                  or FAQs below — there's no re-enrich endpoint yet. If the content changed
                  significantly, delete this draft and create a new one instead of publishing stale AI output.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Read-only AI output preview */}
        <div className="rounded-2xl border border-border bg-secondary/20 p-6 space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            AI-Generated Output <span className="font-normal normal-case tracking-normal text-muted-foreground/60">(read-only preview)</span>
          </p>

          <div>
            <SectionLabel>Summary</SectionLabel>
            <p className="text-sm text-foreground leading-relaxed">{draft.summary}</p>
          </div>

          {draft.keyPoints.length > 0 && (
            <div>
              <SectionLabel>Key Points</SectionLabel>
              <ul className="space-y-1.5 list-disc pl-4">
                {draft.keyPoints.map((point, i) => (
                  <li key={i} className="text-sm text-foreground leading-relaxed">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {draft.sections.length > 0 && (
            <div>
              <SectionLabel>Sections</SectionLabel>
              <div className="space-y-3">
                {draft.sections.map((s, i) => (
                  <div key={i} className="rounded-xl bg-card border border-border/60 p-3.5">
                    <p className="text-xs font-bold text-primary mb-1">{s.heading}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {draft.mainsAngles.length > 0 && (
            <div>
              <SectionLabel>
                <span className="flex items-center gap-1.5"><ListOrdered className="h-3.5 w-3.5" />Mains Angle Questions</span>
              </SectionLabel>
              <ol className="space-y-1.5 list-decimal pl-4">
                {draft.mainsAngles.map((angle, i) => (
                  <li key={i} className="text-sm text-foreground leading-relaxed">{angle}</li>
                ))}
              </ol>
            </div>
          )}

          {draft.faqs.length > 0 && (
            <div>
              <SectionLabel>
                <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5" />FAQs</span>
              </SectionLabel>
              <div className="space-y-3">
                {draft.faqs.map((faq, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold text-foreground">{faq.question}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delete */}
        <div className="pt-2 border-t border-border">
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={isBusy}
            className="flex items-center gap-1.5 text-xs font-bold text-destructive hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete this draft
          </button>
        </div>
      </div>

      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
