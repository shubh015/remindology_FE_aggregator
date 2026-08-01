'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { authService } from '@/services/auth.service';
import { TARGET_EXAM_LABELS, type TargetExam } from '@/types/auth';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, BookOpen, LogOut, CheckCircle2, Loader2, Pencil, X } from 'lucide-react';
import { deleteCookie } from '@/lib/utils';

// ── Exam options ──────────────────────────────────────────────────

const EXAM_OPTIONS: { key: TargetExam; label: string; subtitle: string; color: string; bg: string; border: string }[] = [
  { key: 'UPSC_CSE',   label: TARGET_EXAM_LABELS.UPSC_CSE,   subtitle: 'Prelims · Mains · Interview',       color: '#7C3AED', bg: 'rgba(124,58,237,0.07)',  border: 'rgba(124,58,237,0.22)' },
  { key: 'SSC_CGL',    label: TARGET_EXAM_LABELS.SSC_CGL,    subtitle: 'Combined Graduate Level',           color: '#0891B2', bg: 'rgba(8,145,178,0.07)',   border: 'rgba(8,145,178,0.22)'  },
  { key: 'SSC_CHSL',   label: TARGET_EXAM_LABELS.SSC_CHSL,   subtitle: 'Combined Higher Secondary Level',   color: '#0891B2', bg: 'rgba(8,145,178,0.07)',   border: 'rgba(8,145,178,0.22)'  },
  { key: 'IBPS_PO',    label: TARGET_EXAM_LABELS.IBPS_PO,    subtitle: 'Probationary Officer',              color: '#059669', bg: 'rgba(5,150,105,0.07)',   border: 'rgba(5,150,105,0.22)'  },
  { key: 'IBPS_CLERK', label: TARGET_EXAM_LABELS.IBPS_CLERK, subtitle: 'Clerical Cadre',                    color: '#059669', bg: 'rgba(5,150,105,0.07)',   border: 'rgba(5,150,105,0.22)'  },
  { key: 'RRB_NTPC',   label: TARGET_EXAM_LABELS.RRB_NTPC,   subtitle: 'Non-Technical Popular Categories', color: '#D97706', bg: 'rgba(217,119,6,0.07)',   border: 'rgba(217,119,6,0.22)'  },
  { key: 'NDA_CDS',    label: TARGET_EXAM_LABELS.NDA_CDS,    subtitle: 'National Defence / Combined Defence', color: '#DC2626', bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.22)'  },
  { key: 'STATE_PSC',  label: TARGET_EXAM_LABELS.STATE_PSC,  subtitle: 'State Public Service Commission',  color: '#7C3AED', bg: 'rgba(124,58,237,0.07)',  border: 'rgba(124,58,237,0.22)' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth, updateUser } = useAuthStore();

  const [editing, setEditing]     = useState(false);
  const [selected, setSelected]   = useState<TargetExam | null>(user?.target_exam ?? null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      const updated = await authService.updateProfile({ targetExam: selected });
      updateUser(updated);
      setEditing(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setSaveError(e.response?.data?.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentExam = user?.target_exam ? EXAM_OPTIONS.find((e) => e.key === user.target_exam) : null;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="My Profile" />

      <div className="flex-1 p-8 space-y-6 max-w-2xl w-full mx-auto animate-fade-in">

        {/* ── Candidate details ── */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-sm font-bold text-foreground">Candidate Details</CardTitle>
            <CardDescription className="text-xs">Your profile and credentials</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">

            {/* Name */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-muted/20 border border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Full Name</p>
                <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Aspirant'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-muted/20 border border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Email Address</p>
                <p className="text-xs font-bold text-foreground truncate">{user?.email || '—'}</p>
              </div>
            </div>

            {/* Target exam */}
            <div className="rounded-lg bg-muted/20 border border-border overflow-hidden">
              <div className="flex items-center gap-4 p-3.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: currentExam ? `${currentExam.bg}` : 'rgba(124,58,237,0.08)', color: currentExam?.color ?? '#7C3AED' }}
                >
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Target Exam</p>
                  <p
                    className="text-xs font-bold truncate"
                    style={{ color: currentExam?.color ?? 'var(--foreground)' }}
                  >
                    {currentExam ? currentExam.label : 'Not set'}
                  </p>
                </div>
                <button
                  onClick={() => { setEditing(!editing); setSelected(user?.target_exam ?? null); setSaveError(null); }}
                  className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Inline exam picker */}
              {editing && (
                <div className="border-t border-border p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {EXAM_OPTIONS.map((exam) => {
                      const isSel = selected === exam.key;
                      return (
                        <button
                          key={exam.key}
                          onClick={() => setSelected(exam.key)}
                          className="flex items-center gap-3 rounded-xl p-3 text-left transition-all cursor-pointer"
                          style={{
                            background: isSel ? exam.bg : 'transparent',
                            border: `1.5px solid ${isSel ? exam.color : 'rgba(0,0,0,0.07)'}`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold" style={{ color: isSel ? exam.color : 'var(--foreground)' }}>
                              {exam.label}
                            </p>
                            <p className="text-[10px] mt-0.5 text-muted-foreground">{exam.subtitle}</p>
                          </div>
                          {isSel && <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: exam.color }} />}
                        </button>
                      );
                    })}
                  </div>

                  {saveError && (
                    <p className="text-xs text-destructive">{saveError}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={handleSaveExam}
                      disabled={!selected || saving || selected === user?.target_exam}
                      className="font-semibold text-xs cursor-pointer"
                    >
                      {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</> : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditing(false); setSelected(user?.target_exam ?? null); setSaveError(null); }}
                      className="font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Exam date (if set) */}
            {user?.exam_date && (
              <div className="flex items-center gap-4 p-3.5 rounded-lg bg-muted/20 border border-border">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xs font-bold">📅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Exam Date</p>
                  <p className="text-xs font-bold text-foreground">
                    {new Date(user.exam_date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
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
      </div>
    </div>
  );
}
