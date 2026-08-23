'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/use-auth-store';
import { courseService } from '@/services/course.service';
import type {
  CourseExamPatternStage, CourseBooklistEntry, CourseExamInfoFact, CourseYearWiseBreakdown,
} from '@/types/features';
import {
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, X, Plus, Trash2, Link2, ExternalLink,
  CheckCheck, Undo2,
} from 'lucide-react';

// ── Toast (mirrors admin/courses) ───────────────────────────────────

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

// ── Shared section chrome ───────────────────────────────────────────

function SectionCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
        {hint && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function AddRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-75 transition-opacity cursor-pointer"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

const inputCls = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

// ── Exam Pattern editor: [{ stage, description }] ───────────────────

function ExamPatternEditor({ value, onChange }: { value: CourseExamPatternStage[]; onChange: (v: CourseExamPatternStage[]) => void }) {
  const update = (i: number, field: keyof CourseExamPatternStage, val: string) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { stage: '', description: '' }]);

  return (
    <div className="space-y-3">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2 items-start rounded-xl border border-border/60 p-3">
          <div className="flex-1 space-y-2">
            <input
              value={row.stage}
              onChange={(e) => update(i, 'stage', e.target.value)}
              placeholder="Stage — e.g. Prelims"
              className={`${inputCls} font-bold`}
            />
            <Textarea
              value={row.description}
              onChange={(e) => update(i, 'description', e.target.value)}
              placeholder="Description of this stage — marks, duration, negative marking, etc."
              rows={2}
            />
          </div>
          <RemoveButton onClick={() => remove(i)} />
        </div>
      ))}
      <AddRowButton onClick={add} label="Add stage" />
    </div>
  );
}

// ── Exam Info editor: [{ label, value }] ─────────────────────────────

function ExamInfoEditor({ value, onChange }: { value: CourseExamInfoFact[]; onChange: (v: CourseExamInfoFact[]) => void }) {
  const update = (i: number, field: keyof CourseExamInfoFact, val: string) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { label: '', value: '' }]);

  return (
    <div className="space-y-2.5">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={row.label}
            onChange={(e) => update(i, 'label', e.target.value)}
            placeholder="Label — e.g. Eligibility"
            className={`${inputCls} w-40 shrink-0 font-semibold`}
          />
          <input
            value={row.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            placeholder="Value — e.g. Graduate in any discipline"
            className={`${inputCls} flex-1`}
          />
          <RemoveButton onClick={() => remove(i)} />
        </div>
      ))}
      <AddRowButton onClick={add} label="Add fact" />
    </div>
  );
}

// ── Booklist editor: [{ subject, books: [{ title, author, note }] }] ─

function BooklistEditor({ value, onChange }: { value: CourseBooklistEntry[]; onChange: (v: CourseBooklistEntry[]) => void }) {
  const updateSubject = (i: number, subject: string) =>
    onChange(value.map((g, idx) => (idx === i ? { ...g, subject } : g)));
  const removeGroup = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const addGroup = () => onChange([...value, { subject: '', books: [] }]);

  const updateBook = (gi: number, bi: number, field: 'title' | 'author' | 'note', val: string) =>
    onChange(value.map((g, idx) => (idx === gi
      ? { ...g, books: g.books.map((b, bidx) => (bidx === bi ? { ...b, [field]: val } : b)) }
      : g)));
  const removeBook = (gi: number, bi: number) =>
    onChange(value.map((g, idx) => (idx === gi ? { ...g, books: g.books.filter((_, bidx) => bidx !== bi) } : g)));
  const addBook = (gi: number) =>
    onChange(value.map((g, idx) => (idx === gi ? { ...g, books: [...g.books, { title: '', author: '', note: '' }] } : g)));

  return (
    <div className="space-y-4">
      {value.map((group, gi) => (
        <div key={gi} className="rounded-xl border border-border/60 p-3.5 space-y-3">
          <div className="flex gap-2 items-center">
            <input
              value={group.subject}
              onChange={(e) => updateSubject(gi, e.target.value)}
              placeholder="Subject — e.g. Polity"
              className={`${inputCls} font-bold flex-1`}
            />
            <RemoveButton onClick={() => removeGroup(gi)} />
          </div>
          <div className="space-y-2 pl-3 border-l-2 border-primary/15">
            {group.books.map((book, bi) => (
              <div key={bi} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                <input
                  value={book.title}
                  onChange={(e) => updateBook(gi, bi, 'title', e.target.value)}
                  placeholder="Book title"
                  className={inputCls}
                />
                <input
                  value={book.author ?? ''}
                  onChange={(e) => updateBook(gi, bi, 'author', e.target.value)}
                  placeholder="Author (optional)"
                  className={inputCls}
                />
                <input
                  value={book.note ?? ''}
                  onChange={(e) => updateBook(gi, bi, 'note', e.target.value)}
                  placeholder="Note — e.g. NCERT (optional)"
                  className={inputCls}
                />
                <RemoveButton onClick={() => removeBook(gi, bi)} />
              </div>
            ))}
            <AddRowButton onClick={() => addBook(gi)} label="Add book" />
          </div>
        </div>
      ))}
      <AddRowButton onClick={addGroup} label="Add subject" />
    </div>
  );
}

// ── Year-wise breakdown editor: [{ year, notes, breakdown: [...] }] ──

function YearWiseBreakdownEditor({ value, onChange }: { value: CourseYearWiseBreakdown[]; onChange: (v: CourseYearWiseBreakdown[]) => void }) {
  const updateYear = (i: number, field: 'year' | 'notes', val: string) =>
    onChange(value.map((y, idx) => (idx === i
      ? { ...y, [field]: field === 'year' ? (parseInt(val, 10) || 0) : val }
      : y)));
  const removeYear = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const addYear = () => onChange([...value, { year: new Date().getFullYear(), notes: '', breakdown: [] }]);

  const updateRow = (yi: number, ri: number, field: 'subject' | 'questions' | 'marks', val: string) =>
    onChange(value.map((y, idx) => (idx === yi
      ? {
          ...y,
          breakdown: y.breakdown.map((r, ridx) => (ridx === ri
            ? { ...r, [field]: field === 'subject' ? val : (parseInt(val, 10) || 0) }
            : r)),
        }
      : y)));
  const removeRow = (yi: number, ri: number) =>
    onChange(value.map((y, idx) => (idx === yi ? { ...y, breakdown: y.breakdown.filter((_, ridx) => ridx !== ri) } : y)));
  const addRow = (yi: number) =>
    onChange(value.map((y, idx) => (idx === yi ? { ...y, breakdown: [...y.breakdown, { subject: '', questions: 0, marks: 0 }] } : y)));

  return (
    <div className="space-y-4">
      {value.map((y, yi) => (
        <div key={yi} className="rounded-xl border border-border/60 p-3.5 space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={y.year}
              onChange={(e) => updateYear(yi, 'year', e.target.value)}
              placeholder="Year"
              className={`${inputCls} w-28 font-bold`}
            />
            <input
              value={y.notes ?? ''}
              onChange={(e) => updateYear(yi, 'notes', e.target.value)}
              placeholder="Notes — e.g. total vacancies, overall difficulty (optional)"
              className={`${inputCls} flex-1`}
            />
            <RemoveButton onClick={() => removeYear(yi)} />
          </div>
          <div className="space-y-2 pl-3 border-l-2 border-primary/15">
            {y.breakdown.map((row, ri) => (
              <div key={ri} className="grid sm:grid-cols-[1fr_120px_120px_auto] gap-2 items-center">
                <input
                  value={row.subject}
                  onChange={(e) => updateRow(yi, ri, 'subject', e.target.value)}
                  placeholder="Subject — e.g. History"
                  className={inputCls}
                />
                <input
                  type="number"
                  value={row.questions}
                  onChange={(e) => updateRow(yi, ri, 'questions', e.target.value)}
                  placeholder="Questions"
                  className={inputCls}
                />
                <input
                  type="number"
                  value={row.marks ?? 0}
                  onChange={(e) => updateRow(yi, ri, 'marks', e.target.value)}
                  placeholder="Marks"
                  className={inputCls}
                />
                <RemoveButton onClick={() => removeRow(yi, ri)} />
              </div>
            ))}
            <AddRowButton onClick={() => addRow(yi)} label="Add subject row" />
          </div>
        </div>
      ))}
      <AddRowButton onClick={addYear} label="Add year" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function AdminCourseEditPage() {
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

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['admin', 'courses', id],
    queryFn: () => courseService.getCourseById(id),
    enabled: isAdmin && !!id,
    staleTime: 0,
    retry: false,
  });

  const [overview, setOverview] = useState('');
  const [examPattern, setExamPattern] = useState<CourseExamPatternStage[]>([]);
  const [booklist, setBooklist] = useState<CourseBooklistEntry[]>([]);
  const [examInfo, setExamInfo] = useState<CourseExamInfoFact[]>([]);
  const [yearWiseBreakdown, setYearWiseBreakdown] = useState<CourseYearWiseBreakdown[]>([]);

  useEffect(() => {
    if (course) {
      setOverview(course.overview ?? '');
      setExamPattern(course.examPattern ?? []);
      setBooklist(course.booklist ?? []);
      setExamInfo(course.examInfo ?? []);
      setYearWiseBreakdown(course.yearWiseBreakdown ?? []);
    }
  }, [course]);

  const saveMutation = useMutation({
    mutationFn: () => courseService.updateCourse(id, { overview, examPattern, booklist, examInfo, yearWiseBreakdown }),
    onSuccess: () => {
      showToast('success', 'Course details saved.');
      qc.invalidateQueries({ queryKey: ['admin', 'courses', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: () => showToast('error', 'Could not save. Try again.'),
  });

  const publishMutation = useMutation({
    mutationFn: () => courseService.publishCourse(id),
    onSuccess: () => {
      showToast('success', 'Course published — live on the public site.');
      qc.invalidateQueries({ queryKey: ['admin', 'courses', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: () => showToast('error', 'Could not publish. Try again.'),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => courseService.unpublishCourse(id),
    onSuccess: () => {
      showToast('success', 'Course moved back to draft.');
      qc.invalidateQueries({ queryKey: ['admin', 'courses', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: () => showToast('error', 'Could not unpublish. Try again.'),
  });

  // ── Notifications ──────────────────────────────────────────────

  const [notifTitle, setNotifTitle] = useState('');
  const [notifLink, setNotifLink]   = useState('');
  const [notifDate, setNotifDate]   = useState('');

  const addNotificationMutation = useMutation({
    mutationFn: () => courseService.createNotification({
      courseId: id, title: notifTitle, linkUrl: notifLink, notificationDate: notifDate || undefined,
    }),
    onSuccess: () => {
      showToast('success', 'Notification published.');
      setNotifTitle(''); setNotifLink(''); setNotifDate('');
      qc.invalidateQueries({ queryKey: ['admin', 'courses', id] });
    },
    onError: () => showToast('error', 'Could not publish notification. Try again.'),
  });

  const toggleNotificationMutation = useMutation({
    mutationFn: ({ notifId, isActive }: { notifId: string; isActive: boolean }) =>
      courseService.setNotificationActive(notifId, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'courses', id] }),
    onError: () => showToast('error', 'Could not update notification.'),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notifId: string) => courseService.deleteNotification(notifId),
    onSuccess: () => {
      showToast('success', 'Notification removed.');
      qc.invalidateQueries({ queryKey: ['admin', 'courses', id] });
    },
    onError: () => showToast('error', 'Could not remove notification.'),
  });

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6">
        <AlertCircle className="h-10 w-10 text-destructive/60" />
        <p className="text-sm font-semibold">Could not load this course.</p>
        <button
          onClick={() => router.push('/admin/courses')}
          className="text-xs font-semibold text-primary underline cursor-pointer"
        >
          Back to Courses Admin
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-0 z-20 flex items-center gap-3 px-5 py-3 border-b border-border bg-card/80 backdrop-blur-md">
        <button
          onClick={() => router.push('/admin/courses')}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p className="text-xs text-muted-foreground truncate">
            <span className="font-semibold text-foreground">Editing:</span> {course.name}
          </p>
          <span
            className="shrink-0 h-5 px-2 rounded-full flex items-center text-[10px] font-bold"
            style={course.status === 'published'
              ? { background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }
              : { background: 'rgba(217,119,6,0.1)', color: '#D97706', border: '1px solid rgba(217,119,6,0.25)' }}
          >
            {course.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saveMutation.isPending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
            : <><Save className="h-3.5 w-3.5" />Save</>}
        </button>
        {course.status === 'published' ? (
          <button
            onClick={() => unpublishMutation.mutate()}
            disabled={unpublishMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/30 text-amber-600 hover:bg-amber-500/8 transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shrink-0"
          >
            {unpublishMutation.isPending
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />…</>
              : <><Undo2 className="h-3.5 w-3.5" />Unpublish</>}
          </button>
        ) : (
          <button
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #059669, #0891B2)' }}
          >
            {publishMutation.isPending
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Publishing…</>
              : <><CheckCheck className="h-3.5 w-3.5" />Publish</>}
          </button>
        )}
      </div>

      <div className="flex-1 p-5 lg:p-6 max-w-3xl w-full mx-auto space-y-6">

        <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Each section below (except Overview) starts empty — click the <span className="font-bold">+ Add</span> button
            to create a row, then type into it. <span className="font-bold">Save</span> stores your changes;
            it does not publish. Use <span className="font-bold">Publish</span> above once you&apos;re happy with how it looks.
          </p>
        </div>

        <SectionCard title="Overview" hint="General 'about this exam' copy shown at the top of the page.">
          <Textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="e.g. The Civil Services Examination (CSE) is conducted annually by UPSC to recruit officers for the IAS, IPS, IFS and other central services…"
            rows={4}
          />
        </SectionCard>

        <SectionCard title="Exam Pattern" hint="Stages of the exam — Prelims, Mains, Interview, etc.">
          <ExamPatternEditor value={examPattern} onChange={setExamPattern} />
        </SectionCard>

        <SectionCard title="Booklist" hint="Recommended books, grouped by subject.">
          <BooklistEditor value={booklist} onChange={setBooklist} />
        </SectionCard>

        <SectionCard title="Exam Information" hint="Key facts — eligibility, age limit, vacancies, official website, etc.">
          <ExamInfoEditor value={examInfo} onChange={setExamInfo} />
        </SectionCard>

        <SectionCard title="Year-wise Question Breakdown" hint="Subject-wise question count per year, for trend analysis.">
          <YearWiseBreakdownEditor value={yearWiseBreakdown} onChange={setYearWiseBreakdown} />
        </SectionCard>

        <SectionCard title="Exam Notifications" hint="Publish a link when a new notification, application window or result is out.">
          <div className="space-y-3">
            {(course.notifications ?? []).length > 0 && (
              <div className="space-y-2">
                {course.notifications!.map((n) => (
                  <div key={n.id} className="flex items-center gap-2 rounded-xl border border-border/60 p-3">
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <a
                        href={n.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 truncate"
                      >
                        {n.title}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      {n.notificationDate && (
                        <p className="text-[11px] text-muted-foreground">{formatDate(n.notificationDate)}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotificationMutation.mutate({ notifId: n.id, isActive: !n.isActive })}
                      className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                      style={n.isActive
                        ? { background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }
                        : { background: 'rgba(107,114,128,0.1)', color: '#6B7280', border: '1px solid rgba(107,114,128,0.25)' }}
                    >
                      {n.isActive ? 'Active' : 'Hidden'}
                    </button>
                    <RemoveButton onClick={() => deleteNotificationMutation.mutate(n.id)} />
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-dashed border-border p-3.5 space-y-2.5">
              <input
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="Title — e.g. UPSC CSE 2026 Notification Out"
                className={inputCls}
              />
              <div className="grid sm:grid-cols-[1fr_160px] gap-2">
                <input
                  value={notifLink}
                  onChange={(e) => setNotifLink(e.target.value)}
                  placeholder="Link URL — official PDF/page"
                  className={inputCls}
                />
                <input
                  type="date"
                  value={notifDate}
                  onChange={(e) => setNotifDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <button
                type="button"
                onClick={() => addNotificationMutation.mutate()}
                disabled={!notifTitle.trim() || !notifLink.trim() || addNotificationMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
              >
                {addNotificationMutation.isPending
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Publishing…</>
                  : <><Plus className="h-3.5 w-3.5" />Publish Notification</>}
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
