'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetData, setResetData] = useState<{ message: string; resetLink: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(data.email);
      setResetData({
        message: response.message || 'Password reset link generated successfully',
        resetLink: response.resetLink,
      });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        apiError.response?.data?.message ||
        apiError.message ||
        'Failed to generate reset link. Please check the email address.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-[3px] border-rule bg-paper-raised shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="doc-h2 mb-0!">Forgot Password</CardTitle>
        <CardDescription className="text-sm text-ink-muted">
          Enter your email address and we will generate a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetData ? (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="doc-h3 mb-0!">{resetData.message}</h3>
            <p className="text-xs text-ink-muted max-w-[280px]">
              For testing convenience, you can copy the generated reset link or click below to navigate directly:
            </p>
            
            <div className="w-full p-3 rounded-[3px] border border-rule bg-paper-deep text-left space-y-2">
              <span className="font-label text-[11px] text-ink-muted uppercase tracking-[0.14em] block">Reset URL</span>
              <a 
                href={resetData.resetLink}
                className="ks-link text-xs font-medium break-all block"
              >
                {resetData.resetLink}
              </a>
            </div>

            <Button asChild className="w-full font-medium mt-2">
              <a href={resetData.resetLink}>
                Go to Reset Password
              </a>
            </Button>
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
              <label className="font-label text-[11px] font-medium text-ink-muted uppercase tracking-[0.14em]" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="candidate@remindology.com"
                  disabled={isLoading}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive pl-9' : 'pl-9'}
                  {...register('email')}
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium mt-0.5">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full font-medium cursor-pointer mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating link...
                </>
              ) : (
                'Generate Reset Link'
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
