'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/use-auth-store';
import { courseService } from '@/services/course.service';
import {
  Send, Trash2, AlertCircle, CheckCircle2, X, Loader2,
  ShieldCheck, GraduationCap, Pencil, CheckCheck, Undo2,
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

const EMPTY_FORM = { name: '', shortDescription: '', icon: '', color: '#7C3AED' };

export default function AdminCoursesPage() {
  const { user } = useAuthStore();
  const router   = useRouter();
  const qc       = useQueryClient();
  const { toasts, show: showToast, dismiss } = useToast();

  useEffect(() => {
    if (user !== null && !user.is_admin && !user.isAdmin) router.replace('/dashboard');
  }, [user, router]);

  const isAdmin = !!user?.is_admin || !!user?.isAdmin;

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => courseService.getAllCourses(),
    enabled: isAdmin,
    staleTime: 0,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () => courseService.createCourse({
      name: form.name,
      shortDescription: form.shortDescription || undefined,
      icon: form.icon || undefined,
      color: form.color || undefined,
    }),
    onSuccess: (created) => {
      showToast('success', `"${created.name}" created — add its pattern, booklist & exam info next.`);
      setForm({ ...EMPTY_FORM });
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
      router.push(`/admin/courses/${created.id}`);
    },
    onError: () => showToast('error', 'Could not create course. Try again.'),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => courseService.publishCourse(id),
    onMutate: (id) => setBusyId(id),
    onSettled: () => setBusyId(null),
    onSuccess: () => {
      showToast('success', 'Course published.');
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: () => showToast('error', 'Could not publish. Try again.'),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => courseService.unpublishCourse(id),
    onMutate: (id) => setBusyId(id),
    onSettled: () => setBusyId(null),
    onSuccess: () => {
      showToast('success', 'Course moved back to draft.');
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: () => showToast('error', 'Could not unpublish. Try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onMutate: (id) => setBusyId(id),
    onSettled: () => { setBusyId(null); setDeleteTarget(null); },
    onSuccess: () => {
      showToast('success', 'Course deleted.');
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: () => showToast('error', 'Could not delete. Try again.'),
  });

  const set = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate();
  };

  if (!isAdmin) return null;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Courses Admin" />

      <div className="flex-1 p-5 lg:p-6 max-w-4xl w-full mx-auto space-y-6">

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin · Courses Publisher
          </div>
          <span className="text-xs text-muted-foreground">
            Content here is written by you, not AI — accuracy matters for exam facts.
          </span>
        </div>

        {/* ── Create form ── */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5" style={{ boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Course</p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. UPSC CSE"
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Short Description <span className="text-muted-foreground/60">(one sentence — shown on the course card only)</span>
              </label>
              <Input
                value={form.shortDescription}
                onChange={(e) => set('shortDescription', e.target.value.slice(0, 140))}
                placeholder="e.g. Civil Services Examination for IAS, IPS, IFS & allied services"
                maxLength={140}
                disabled={createMutation.isPending}
              />
              <p className="text-[10px] text-muted-foreground">
                {form.shortDescription.length}/140 — the full syllabus, pattern & booklist go on the next screen, not here.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Icon <span className="text-muted-foreground/60">(lucide-react name, optional)</span>
                </label>
                <Input
                  value={form.icon}
                  onChange={(e) => set('icon', e.target.value)}
                  placeholder="e.g. Landmark"
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => set('color', e.target.value)}
                    disabled={createMutation.isPending}
                    className="h-9 w-11 rounded-md border border-input cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => set('color', e.target.value)}
                    disabled={createMutation.isPending}
                  />
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                type="submit"
                disabled={!form.name.trim() || createMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
              >
                {createMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</>
                  : <><Send className="h-4 w-4" />Create &amp; Edit Details</>}
              </button>
            </div>
          </div>
        </form>

        {/* ── Courses list ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">All Courses</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load courses.
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center gap-2">
              <GraduationCap className="h-8 w-8 text-muted-foreground/25" />
              <p className="text-sm font-semibold text-foreground">No courses yet</p>
              <p className="text-xs text-muted-foreground">Create one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => {
                const busy = busyId === course.id;
                return (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-border bg-card p-5 space-y-3 transition-opacity"
                    style={{ opacity: busy ? 0.6 : 1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-bold text-foreground leading-snug">{course.name}</p>
                        {course.shortDescription && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{course.shortDescription}</p>
                        )}
                      </div>
                      <div
                        className="h-7 px-2.5 rounded-lg flex items-center text-[10px] font-bold shrink-0"
                        style={course.status === 'published'
                          ? { background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }
                          : { background: 'rgba(217,119,6,0.1)', color: '#D97706', border: '1px solid rgba(217,119,6,0.25)' }}
                      >
                        {course.status === 'published' ? 'Published' : 'Draft'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-secondary transition-colors disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      {course.status === 'published' ? (
                        <button
                          onClick={() => unpublishMutation.mutate(course.id)}
                          disabled={busy}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/30 text-amber-600 hover:bg-amber-500/8 transition-colors disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={() => publishMutation.mutate(course.id)}
                          disabled={busy}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, #059669, #0891B2)', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}
                        >
                          {publishMutation.isPending && busyId === course.id
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Publishing…</>
                            : <><CheckCheck className="h-3.5 w-3.5" />Publish</>}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget({ id: course.id, name: course.name })}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-destructive/30 text-destructive hover:bg-destructive/8 transition-colors disabled:cursor-not-allowed cursor-pointer"
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
          heading="Delete course?"
          body={`"${deleteTarget.name}" and all its notifications will be permanently deleted.`}
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
