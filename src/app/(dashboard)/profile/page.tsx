'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { authService } from '@/services/auth.service';
import { TARGET_EXAM_LABELS, type TargetExam } from '@/types/auth';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, BookOpen, LogOut, CheckCircle2, Loader2, Pencil, X, CalendarDays, BookMarked, Bell, BellOff, Share, SquarePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { deleteCookie } from '@/lib/utils';
import { usePushNotifications } from '@/hooks/use-push-notifications';

// ── Exam options ──────────────────────────────────────────────────

const EXAM_OPTIONS: { key: TargetExam; label: string; subtitle: string }[] = [
  { key: 'UPSC_CSE',   label: TARGET_EXAM_LABELS.UPSC_CSE,   subtitle: 'Prelims · Mains · Interview', },
  { key: 'SSC_CGL',    label: TARGET_EXAM_LABELS.SSC_CGL,    subtitle: 'Combined Graduate Level', },
  { key: 'SSC_CHSL',   label: TARGET_EXAM_LABELS.SSC_CHSL,   subtitle: 'Combined Higher Secondary Level', },
  { key: 'IBPS_PO',    label: TARGET_EXAM_LABELS.IBPS_PO,    subtitle: 'Probationary Officer', },
  { key: 'IBPS_CLERK', label: TARGET_EXAM_LABELS.IBPS_CLERK, subtitle: 'Clerical Cadre', },
  { key: 'RRB_NTPC',   label: TARGET_EXAM_LABELS.RRB_NTPC,   subtitle: 'Non-Technical Popular Categories', },
  { key: 'NDA_CDS',    label: TARGET_EXAM_LABELS.NDA_CDS,    subtitle: 'National Defence / Combined Defence', },
  { key: 'STATE_PSC',  label: TARGET_EXAM_LABELS.STATE_PSC,  subtitle: 'State Public Service Commission', },
];

function NotificationsCard() {
  const { status, busy, error, enable, disable } = usePushNotifications();

  return (
    <Card className="border-rule bg-paper-raised rounded-[2px] shadow-none">
      <CardHeader className="border-b border-rule pb-4">
        <CardTitle className="text-base font-semibold tracking-tight text-ink">Notifications</CardTitle>
        <CardDescription className="text-xs text-ink-muted">Reminders for daily challenges and revision due dates</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">

        {status === 'needs-ios-install' && (
          <div className="flex items-start gap-4 p-3.5 rounded-[2px] bg-paper border border-rule">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
              <SquarePlus className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-semibold text-ink">Add Remindology to your Home Screen</p>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                iOS only supports notifications for installed apps. Tap <Share className="inline h-3 w-3 -mt-0.5" /> Share, then
                &quot;Add to Home Screen&quot; — open Remindology from there to enable reminders.
              </p>
            </div>
          </div>
        )}

        {status === 'unsupported' && (
          <div className="flex items-center gap-4 p-3.5 rounded-[2px] bg-paper border border-rule">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink-muted">
              <BellOff className="h-4 w-4" />
            </div>
            <p className="text-xs text-ink-muted">Notifications aren&apos;t supported in this browser.</p>
          </div>
        )}

        {status === 'denied' && (
          <div className="flex items-center gap-4 p-3.5 rounded-[2px] bg-paper border border-rule">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-[oklch(52%_.16_35)]">
              <BellOff className="h-4 w-4" />
            </div>
            <p className="text-xs text-ink-muted">
              Notifications are blocked for this site. Enable them in your browser&apos;s site settings, then refresh.
            </p>
          </div>
        )}

        {(status === 'subscribed' || status === 'unsubscribed') && (
          <div className="flex items-center gap-4 p-3.5 rounded-[2px] bg-paper border border-rule">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep ${status === 'subscribed' ? 'text-ink' : 'text-ink-muted'}`}>
              {status === 'subscribed' ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink">
                {status === 'subscribed' ? 'Notifications enabled' : 'Notifications disabled'}
              </p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {status === 'subscribed' ? 'You’ll get reminders on this device.' : 'Turn on reminders for this device.'}
              </p>
            </div>
            <Button
              size="sm"
              variant={status === 'subscribed' ? 'outline' : 'default'}
              disabled={busy}
              onClick={status === 'subscribed' ? disable : enable}
              className="shrink-0 cursor-pointer font-semibold text-xs"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === 'subscribed' ? 'Disable' : 'Enable'}
            </Button>
          </div>
        )}

        {error && <p className="text-xs text-[oklch(52%_.16_35)]">{error}</p>}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth, updateUser } = useAuthStore();

  const [editing, setEditing]          = useState(false);
  const [selected, setSelected]        = useState<TargetExam | null>(user?.target_exam ?? null);
  const [examDate, setExamDate]        = useState(user?.exam_date ?? '');
  const [optSubject, setOptSubject]    = useState(user?.optional_subject ?? '');
  const [saving, setSaving]            = useState(false);
  const [saveError, setSaveError]      = useState<string | null>(null);

  const TODAY = new Date().toISOString().split('T')[0];

  const handleLogout = () => {
    clearAuth();
    deleteCookie('remindology_logged_in');
    router.replace('/login');
  };

  const handleSaveExam = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Parameters<typeof authService.updateProfile>[0] = { targetExam: selected };
      if (examDate) payload.examDate = examDate;
      if (selected === 'UPSC_CSE' && optSubject.trim()) payload.optionalSubject = optSubject.trim();
      const updated = await authService.updateProfile(payload);
      updateUser(updated);
      setEditing(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setSaveError(e.response?.data?.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openEditor = () => {
    setSelected(user?.target_exam ?? null);
    setExamDate(user?.exam_date ?? '');
    setOptSubject(user?.optional_subject ?? '');
    setSaveError(null);
    setEditing(true);
  };

  const currentExam = user?.target_exam ? EXAM_OPTIONS.find((e) => e.key === user.target_exam) : null;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="My Profile" />

      <div className="flex-1 p-8 space-y-6 max-w-2xl w-full mx-auto animate-fade-in">

        {/* ── Candidate details ── */}
        <Card className="border-rule bg-paper-raised rounded-[2px] shadow-none">
          <CardHeader className="border-b border-rule pb-4">
            <CardTitle className="text-base font-semibold tracking-tight text-ink">Candidate Details</CardTitle>
            <CardDescription className="text-xs text-ink-muted">Your profile and credentials</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">

            {/* Name */}
            <div className="flex items-center gap-4 p-3.5 rounded-[2px] bg-paper border border-rule">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted">Full Name</p>
                <p className="text-xs font-semibold text-ink truncate">{user?.name || 'Aspirant'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-3.5 rounded-[2px] bg-paper border border-rule">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted">Email Address</p>
                <p className="text-xs font-semibold text-ink truncate">{user?.email || '—'}</p>
              </div>
            </div>

            {/* Target exam */}
            <div className="rounded-[2px] bg-paper border border-rule overflow-hidden">
              <div className="flex items-center gap-4 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted">Target Exam</p>
                  <p className="text-xs font-semibold truncate text-ink">
                    {currentExam ? currentExam.label : 'Not set'}
                  </p>
                </div>
                <button
                  onClick={() => editing ? setEditing(false) : openEditor()}
                  className="shrink-0 h-7 w-7 flex items-center justify-center rounded-[3px] border border-rule text-ink-muted hover:text-ink hover:border-rule-strong hover:bg-paper-deep transition-colors duration-150 ease-ks cursor-pointer"
                >
                  {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Inline exam picker */}
              {editing && (
                <div className="border-t border-rule p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {EXAM_OPTIONS.map((exam) => {
                      const isSel = selected === exam.key;
                      return (
                        <button
                          key={exam.key}
                          onClick={() => setSelected(exam.key)}
                          className={`ks-card is-interactive !flex items-center gap-3 p-3 text-left cursor-pointer ${isSel ? 'is-active' : ''}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink">
                              {exam.label}
                            </p>
                            <p className="text-[11px] mt-0.5 text-ink-muted">{exam.subtitle}</p>
                          </div>
                          {isSel && <CheckCircle2 className="h-4 w-4 shrink-0 text-ink" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Exam date */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-ink-muted" />
                      <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                        Exam Date <span className="normal-case font-normal">(optional)</span>
                      </p>
                    </div>
                    <Input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      min={TODAY}
                      className="text-xs"
                    />
                  </div>

                  {/* Optional subject — UPSC only */}
                  {selected === 'UPSC_CSE' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <BookMarked className="h-3.5 w-3.5 text-ink-muted" />
                        <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                          Optional Subject <span className="normal-case font-normal">(optional)</span>
                        </p>
                      </div>
                      <Input
                        type="text"
                        value={optSubject}
                        onChange={(e) => setOptSubject(e.target.value)}
                        placeholder="e.g. History, Geography, Anthropology"
                        className="text-xs"
                      />
                    </div>
                  )}

                  {saveError && (
                    <p className="text-xs text-[oklch(52%_.16_35)]">{saveError}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={handleSaveExam}
                      disabled={!selected || saving}
                      className="font-semibold text-xs cursor-pointer"
                    >
                      {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</> : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Exam date + optional subject (if set) */}
            {(user?.exam_date || user?.optional_subject) && (
              <div className="flex items-start gap-4 p-3.5 rounded-[2px] bg-paper border border-rule">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  {user?.exam_date && (
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted">Exam Date</p>
                      <p className="text-xs font-semibold text-ink">
                        {new Date(user.exam_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {user?.optional_subject && (
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted">Optional Subject</p>
                      <p className="text-xs font-semibold text-ink">{user.optional_subject}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sign out */}
            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="cursor-pointer font-semibold gap-1.5 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Notifications ── */}
        <NotificationsCard />
      </div>
    </div>
  );
}
