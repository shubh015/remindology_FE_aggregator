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
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-bold">Forgot Password</CardTitle>
        <CardDescription className="text-xs">
          Enter your email address and we will generate a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetData ? (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{resetData.message}</h3>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              For testing convenience, you can copy the generated reset link or click below to navigate directly:
            </p>
            
            <div className="w-full p-3 rounded-lg border border-border/80 bg-secondary/30 text-left space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Reset URL</span>
              <a 
                href={resetData.resetLink}
                className="text-xs text-primary font-medium hover:underline break-all block"
              >
                {resetData.resetLink}
              </a>
            </div>

            <Button asChild className="w-full font-semibold mt-2">
              <a href={resetData.resetLink}>
                Go to Reset Password
              </a>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3.5 text-xs text-destructive border border-destructive/20 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="email">
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
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              </div>
              {errors.email && (
                <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full font-semibold cursor-pointer mt-2" disabled={isLoading}>
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
      <CardFooter className="flex flex-col items-center border-t border-border pt-4">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
