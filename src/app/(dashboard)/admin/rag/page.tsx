'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/use-auth-store';
import { ragService } from '@/services/rag.service';
import type { IngestResult, SourceStatus } from '@/services/rag.service';
import {
  Database, FileText, FileUp, Search, Trash2, CheckCircle2,
  AlertCircle, X, Loader2, ShieldCheck, RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);
  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return { toasts, show, dismiss };
}

// ── Confirm dialog ────────────────────────────────────────────────

function ConfirmDialog({
  source, onConfirm, onCancel,
}: {
  source: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Delete knowledge source?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Delete all chunks for <span className="font-mono font-bold text-foreground">"{source}"</span>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-bold text-destructive-foreground hover:opacity-90 transition-opacity cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field helpers ─────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
      {children}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground">{children}</p>;
}

// ── Elapsed timer hook ────────────────────────────────────────────

function useElapsed(running: boolean) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) { setSecs(0); return; }
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return secs;
}

function fmtElapsed(s: number) {
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${s}s`;
}

// ── Success banner ────────────────────────────────────────────────

function SuccessBanner({ result, showChars }: { result: IngestResult; showChars?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 p-4">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-bold text-emerald-700 dark:text-emerald-400">Ingestion complete</p>
        <p className="text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
          Ingested <span className="font-bold">{result.chunksAdded}</span> chunks from{' '}
          <span className="font-bold">{result.pages}</span> page{result.pages !== 1 ? 's' : ''} for source{' '}
          <span className="font-mono font-bold">"{result.source}"</span>
          {showChars && result.extractedChars != null && (
            <> (<span className="font-bold">{result.extractedChars.toLocaleString()}</span> characters extracted)</>
          )}
          .
        </p>
      </div>
    </div>
  );
}

// ── Processing state ──────────────────────────────────────────────

function ProcessingState({ elapsed, label }: { elapsed: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-violet-500/8 border border-violet-500/20 p-4">
      <Loader2 className="h-4 w-4 text-violet-500 animate-spin shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-violet-700 dark:text-violet-400">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Elapsed: {fmtElapsed(elapsed)}</p>
      </div>
    </div>
  );
}

// ── Tab types ─────────────────────────────────────────────────────

type TabId = 'text' | 'pdf' | 'sources';
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'text',    label: 'Ingest Text', icon: FileText },
  { id: 'pdf',     label: 'Ingest PDF',  icon: FileUp   },
  { id: 'sources', label: 'Knowledge Sources', icon: Database },
];

// ── Source row type ───────────────────────────────────────────────

interface SourceRow {
  source: string;
  chunkCount: number | null;
  loading: boolean;
  error?: string;
}

// ── Main page ─────────────────────────────────────────────────────

export default function AdminRagPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { toasts, show: showToast, dismiss } = useToast();

  // Admin guard
  useEffect(() => {
    if (user !== null && !user.is_admin && !user.isAdmin) router.replace('/dashboard');
  }, [user, router]);

  if (!user?.is_admin && !user?.isAdmin) return null;

  return (
    <AdminRagContent showToast={showToast} toasts={toasts} dismiss={dismiss} />
  );
}

function AdminRagContent({
  showToast, toasts, dismiss,
}: {
  showToast: (type: ToastType, message: string) => void;
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  const [tab, setTab] = useState<TabId>('text');

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Knowledge Base"
        action={
          <span className="flex items-center gap-1.5 text-xs font-bold text-violet-500 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="h-3 w-3" />Admin
          </span>
        }
      />

      <div className="flex-1 p-6 sm:p-8 max-w-3xl w-full mx-auto space-y-6">

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-2xl bg-secondary/60 border border-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                tab === id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {tab === 'text'    && <IngestTextTab    showToast={showToast} />}
        {tab === 'pdf'     && <IngestPdfTab     showToast={showToast} />}
        {tab === 'sources' && <KnowledgeSources showToast={showToast} />}
      </div>

      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

// ── Tab 1: Ingest Text ────────────────────────────────────────────

function IngestTextTab({ showToast }: { showToast: (t: ToastType, m: string) => void }) {
  const [source,   setSource]   = useState('');
  const [rawText,  setRawText]  = useState('');
  const [subject,  setSubject]  = useState('');
  const [reingest, setReingest] = useState(false);
  const [state,    setState]    = useState<'idle' | 'submitting' | 'success'>('idle');
  const [result,   setResult]   = useState<IngestResult | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  const elapsed = useElapsed(state === 'submitting');

  const validate = (): string | null => {
    if (!source.trim())  return 'Source is required.';
    if (!/^[a-z0-9_]+$/.test(source.trim())) return 'Source must be snake_case (lowercase letters, digits, underscores only).';
    if (!rawText.trim()) return 'Raw text is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { showToast('error', err); return; }

    setState('submitting');
    setError(null);
    setResult(null);

    try {
      const data = await ragService.ingestText({
        source: source.trim(),
        rawText: rawText.trim(),
        subject: subject.trim() || undefined,
        reingest,
      });
      setResult(data);
      setState('success');
      showToast('success', `Ingested ${data.chunksAdded} chunks for "${data.source}"`);
    } catch (err: unknown) {
      const msg = extractError(err);
      setError(msg);
      setState('idle');
      showToast('error', msg);
    }
  };

  const reset = () => { setState('idle'); setResult(null); setError(null); };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {state === 'success' && result && (
        <div className="space-y-3">
          <SuccessBanner result={result} />
          <button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
            <RotateCcw className="h-3 w-3" />Ingest another
          </button>
        </div>
      )}

      {state === 'submitting' && (
        <ProcessingState elapsed={elapsed} label="Processing text — chunking and embedding…" />
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
        <div className="space-y-1.5">
          <Label required>Source</Label>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="ncert_polity_ch4"
            disabled={state === 'submitting'}
            className="font-mono text-sm"
          />
          <FieldHint>Unique snake_case identifier, e.g. ncert_polity_ch4 or pyq_2023_gs2</FieldHint>
        </div>

        <div className="space-y-1.5">
          <Label>Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Polity, Economy, History…"
            disabled={state === 'submitting'}
          />
        </div>

        <div className="space-y-1.5">
          <Label required>Raw text</Label>
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste raw content here…"
            disabled={state === 'submitting'}
            rows={12}
            className="font-mono text-sm resize-y"
          />
          <FieldHint>{rawText.length.toLocaleString()} characters</FieldHint>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reingest}
              onChange={(e) => setReingest(e.target.checked)}
              disabled={state === 'submitting'}
              className="mt-0.5 h-4 w-4 rounded border-border accent-violet-600 cursor-pointer"
            />
            <div>
              <span className="text-sm font-semibold text-foreground">Force re-ingest</span>
              {reingest && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  ⚠ This will delete all existing chunks for this source.
                </p>
              )}
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {state === 'submitting' ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
        ) : (
          <><Database className="h-4 w-4" />Ingest Text</>
        )}
      </button>
    </form>
  );
}

// ── Tab 2: Ingest PDF ─────────────────────────────────────────────

const PDF_MAX_BYTES = 50 * 1024 * 1024;

function IngestPdfTab({ showToast }: { showToast: (t: ToastType, m: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file,     setFile]     = useState<File | null>(null);
  const [source,   setSource]   = useState('');
  const [subject,  setSubject]  = useState('');
  const [reingest, setReingest] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [state,    setState]    = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');
  const [result,   setResult]   = useState<IngestResult | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  const elapsed = useElapsed(state === 'processing');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > PDF_MAX_BYTES) {
      showToast('error', `File too large (max 50 MB). Your file: ${(f.size / 1024 / 1024).toFixed(1)} MB`);
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const validate = (): string | null => {
    if (!file)          return 'Please select a PDF file.';
    if (!source.trim()) return 'Source is required.';
    if (!/^[a-z0-9_]+$/.test(source.trim())) return 'Source must be snake_case (lowercase letters, digits, underscores only).';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { showToast('error', err); return; }

    setState('uploading');
    setUploadPct(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file!);
    formData.append('source', source.trim());
    if (subject.trim()) formData.append('subject', subject.trim());
    if (reingest)        formData.append('reingest', 'true');

    try {
      const data = await ragService.ingestPdf(formData, (pct) => {
        setUploadPct(pct);
        if (pct === 100) setState('processing');
      });
      setResult(data);
      setState('success');
      showToast('success', `Ingested ${data.chunksAdded} chunks for "${data.source}"`);
    } catch (err: unknown) {
      const msg = extractError(err);
      setError(msg);
      setState('idle');
      showToast('error', msg);
    }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setError(null);
    setFile(null);
    setUploadPct(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {state === 'success' && result && (
        <div className="space-y-3">
          <SuccessBanner result={result} showChars />
          <button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
            <RotateCcw className="h-3 w-3" />Ingest another
          </button>
        </div>
      )}

      {state === 'uploading' && (
        <div className="rounded-2xl bg-violet-500/8 border border-violet-500/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-400">Uploading…</p>
            <p className="text-sm font-bold text-violet-600">{uploadPct}%</p>
          </div>
          <div className="h-2 rounded-full bg-violet-500/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-200"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
        </div>
      )}

      {state === 'processing' && (
        <ProcessingState elapsed={elapsed} label="Uploaded — AI is chunking and embedding the PDF…" />
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 space-y-5">

        {/* File picker */}
        <div className="space-y-1.5">
          <Label required>PDF file</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors cursor-pointer',
              file ? 'border-violet-500/40 bg-violet-500/5' : 'border-border hover:border-violet-500/30',
            )}
          >
            <FileUp className={cn('h-5 w-5 shrink-0', file ? 'text-violet-500' : 'text-muted-foreground')} />
            {file ? (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-foreground">Click to select PDF</p>
                <p className="text-[11px] text-muted-foreground">Max 50 MB</p>
              </div>
            )}
            {file && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={state !== 'idle'}
            className="hidden"
          />
        </div>

        <div className="space-y-1.5">
          <Label required>Source</Label>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="ncert_polity"
            disabled={state !== 'idle'}
            className="font-mono text-sm"
          />
          <FieldHint>Unique snake_case identifier</FieldHint>
        </div>

        <div className="space-y-1.5">
          <Label>Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Polity, Economy, History…"
            disabled={state !== 'idle'}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reingest}
              onChange={(e) => setReingest(e.target.checked)}
              disabled={state !== 'idle'}
              className="mt-0.5 h-4 w-4 rounded border-border accent-violet-600 cursor-pointer"
            />
            <div>
              <span className="text-sm font-semibold text-foreground">Force re-ingest</span>
              {reingest && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  ⚠ This will delete all existing chunks for this source.
                </p>
              )}
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={state !== 'idle'}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {state !== 'idle' ? (
          <><Loader2 className="h-4 w-4 animate-spin" />
            {state === 'uploading' ? `Uploading… ${uploadPct}%` : 'Processing…'}
          </>
        ) : (
          <><FileUp className="h-4 w-4" />Ingest PDF</>
        )}
      </button>
    </form>
  );
}

// ── Tab 3: Knowledge Sources ──────────────────────────────────────

function KnowledgeSources({ showToast }: { showToast: (t: ToastType, m: string) => void }) {
  const [input,   setInput]   = useState('');
  const [rows,    setRows]    = useState<SourceRow[]>([]);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const checkStatus = async () => {
    const src = input.trim();
    if (!src) return;
    if (!/^[a-z0-9_]+$/.test(src)) {
      showToast('error', 'Source must be snake_case (lowercase letters, digits, underscores only).');
      return;
    }
    // Add or reset row as loading
    setRows((prev) => {
      const exists = prev.find((r) => r.source === src);
      if (exists) return prev.map((r) => r.source === src ? { ...r, loading: true, error: undefined } : r);
      return [...prev, { source: src, chunkCount: null, loading: true }];
    });
    setInput('');

    try {
      const data = await ragService.getSourceStatus(src);
      setRows((prev) => prev.map((r) =>
        r.source === src ? { ...r, chunkCount: data.chunkCount, loading: false } : r,
      ));
    } catch (err: unknown) {
      const msg = extractError(err);
      setRows((prev) => prev.map((r) =>
        r.source === src ? { ...r, loading: false, error: msg } : r,
      ));
      showToast('error', `Failed to fetch status for "${src}"`);
    }
  };

  const handleDelete = async (src: string) => {
    setConfirm(null);
    setDeleting(src);
    try {
      await ragService.deleteSource(src);
      setRows((prev) => prev.map((r) =>
        r.source === src ? { ...r, chunkCount: 0, loading: false } : r,
      ));
      showToast('success', `Deleted all chunks for "${src}"`);
    } catch (err: unknown) {
      showToast('error', extractError(err));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Lookup input */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-semibold text-foreground">Check source status</p>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkStatus()}
            placeholder="ncert_polity_ch4"
            className="font-mono text-sm flex-1"
          />
          <button
            type="button"
            onClick={checkStatus}
            disabled={!input.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Search className="h-3.5 w-3.5" />
            Check
          </button>
        </div>
      </div>

      {/* Results table */}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Source</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Chunks</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.source} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-foreground">
                    {row.source}
                  </td>
                  <td className="px-4 py-3">
                    {row.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : row.error ? (
                      <span className="text-xs text-destructive">Error</span>
                    ) : row.chunkCount === 0 ? (
                      <span className="text-xs text-muted-foreground">0 chunks</span>
                    ) : (
                      <span className="font-bold text-foreground">{row.chunkCount?.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setConfirm(row.source)}
                      disabled={row.loading || deleting === row.source}
                      className="flex items-center gap-1 text-xs font-semibold text-destructive hover:text-destructive/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-auto"
                    >
                      {deleting === row.source
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <Database className="h-8 w-8 opacity-30" />
          <p className="text-sm">Enter a source name above to check its status.</p>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          source={confirm}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ── Error helper ──────────────────────────────────────────────────

function extractError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    // Axios error shape
    const data = (e.response as Record<string, unknown> | undefined)?.data;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (typeof d.message === 'string') return d.message;
      if (typeof d.error === 'string')   return d.error;
    }
    if (typeof e.message === 'string') return e.message;
  }
  return 'An unexpected error occurred.';
}
