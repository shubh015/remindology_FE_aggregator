'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      setError('Password reset token is missing from URL query.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword({
        token,
        password: data.password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        apiError.response?.data?.message ||
        apiError.message ||
        'Failed to reset password. The link may have expired or is invalid.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-[3px] border-rule bg-paper-raised shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="doc-h2 mb-0!">Reset Password</CardTitle>
        <CardDescription className="text-sm text-ink-muted">
          Enter your new password to regain access to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="doc-h3 mb-0!">Missing Reset Token</h3>
            <p className="text-xs text-ink-muted max-w-[280px]">
              This URL appears to be invalid or incomplete. Please request a new password reset link.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="doc-h3 mb-0!">Password Reset Successfully!</h3>
            <p className="text-xs text-ink-muted max-w-[240px]">
              Your password has been changed. Redirecting to the sign-in page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded-[3px] bg-destructive/5 p-3.5 text-xs text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-label text-[11px] font-medium text-ink-muted uppercase tracking-[0.14em]" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={cn('pl-9 pr-10', errors.password ? 'border-destructive focus-visible:ring-destructive' : '')}
                  {...register('password')}
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-ink-muted hover:text-ink transition-colors duration-150 ease-ks focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive font-medium mt-0.5">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-label text-[11px] font-medium text-ink-muted uppercase tracking-[0.14em]" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={cn('pl-9 pr-10', errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : '')}
                  {...register('confirmPassword')}
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-ink-muted hover:text-ink transition-colors duration-150 ease-ks focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-destructive font-medium mt-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full font-medium cursor-pointer mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center border-t border-rule pt-4">
        <Link href="/login" className="nav-link text-xs! inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-8 bg-paper-raised border border-rule rounded-[3px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
