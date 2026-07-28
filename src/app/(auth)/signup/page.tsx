'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TARGET_EXAM_LABELS } from '@/types/auth';
import type { TargetExam } from '@/types/auth';

// ── Schemas ───────────────────────────────────────────────────────

const step1Schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const step2Schema = z.object({
  targetExam:      z.string().min(1, 'Please select your target exam'),
  examDate:        z.string().optional(),
  optionalSubject: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

// ── Exam selector grid ────────────────────────────────────────────

function ExamGrid({ selected, onSelect }: { selected: string; onSelect: (v: TargetExam) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.entries(TARGET_EXAM_LABELS) as [TargetExam, string][]).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={cn(
            'text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
            selected === key
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:border-primary/40 hover:bg-primary/5 text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register: r1, handleSubmit: hs1, formState: { errors: e1 } } = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const { register: r2, handleSubmit: hs2, formState: { errors: e2 }, setValue: sv2, watch: w2 } = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });

  const selectedExam = w2('targetExam') as TargetExam | undefined;

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = async (data: Step2Data) => {
    if (!step1Data) return;
    setIsLoading(true);
    setError(null);
    try {
      await authService.signup({ ...step1Data, ...data });
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError.response?.data?.message || apiError.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            {step === 1 ? 'Create Account' : 'Your Exam Profile'}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {[1, 2].map((s) => (
              <div key={s} className={cn('h-1.5 w-6 rounded-full transition-all', s <= step ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>
        </div>
        <CardDescription className="text-xs">
          {step === 1 ? 'Sign up to start your AI-powered exam prep' : 'Help us personalise your experience'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Registration Successful!</h3>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Your account has been created. Redirecting to sign in…
            </p>
          </div>
        ) : step === 1 ? (
          <form onSubmit={hs1(onStep1)} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="name">Full Name</label>
              <Input id="name" type="text" placeholder="Shubham Singh" className={e1.name ? 'border-destructive' : ''} {...r1('name')} />
              {e1.name && <p className="text-[10px] text-destructive font-semibold">{e1.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="email">Email Address</label>
              <Input id="email" type="email" placeholder="candidate@remindology.com" className={e1.email ? 'border-destructive' : ''} {...r1('email')} />
              {e1.email && <p className="text-[10px] text-destructive font-semibold">{e1.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="password">Password</label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={cn('pr-10', e1.password ? 'border-destructive' : '')} {...r1('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground cursor-pointer">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {e1.password && <p className="text-[10px] text-destructive font-semibold">{e1.password.message}</p>}
            </div>
            <Button type="submit" className="w-full font-semibold cursor-pointer mt-2 gap-2">
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={hs2(onStep2)} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target Exam *</label>
              <ExamGrid selected={selectedExam ?? ''} onSelect={(v) => sv2('targetExam', v)} />
              {e2.targetExam && <p className="text-[10px] text-destructive font-semibold">{e2.targetExam.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="examDate">
                Target Exam Date <span className="normal-case font-normal">(optional)</span>
              </label>
              <Input id="examDate" type="date" {...r2('examDate')} />
            </div>

            {(selectedExam === 'UPSC_CSE' || selectedExam === 'STATE_PSC') && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="optionalSubject">
                  Optional Subject <span className="normal-case font-normal">(optional)</span>
                </label>
                <Input id="optionalSubject" type="text" placeholder="e.g. Public Administration" {...r2('optionalSubject')} />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-1.5 cursor-pointer flex-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 font-semibold cursor-pointer gap-2">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</> : 'Create Account'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      {!isSuccess && (
        <CardFooter className="flex flex-col items-center border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
