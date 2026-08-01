'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

import { setCookie, cn } from '@/lib/utils';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { isOnboardingComplete } from '@/lib/onboarding';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

function LoginForm() {
  const searchParams = useSearchParams();
  const { setAuth, setNeedsOnboarding, setPostAuthRedirect } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      
      // Set flags BEFORE setAuth so auth layout reads them on the same render cycle
      setNeedsOnboarding(!isOnboardingComplete(response.user.id));
      setPostAuthRedirect(searchParams.get('redirect'));
      setAuth(response.user, response.accessToken, response.refreshToken);
      setCookie('remindology_logged_in', 'true', 604800);
      // No router.replace — auth layout is the single redirect controller
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        apiError.response?.data?.message || 
        apiError.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-bold">Welcome back</CardTitle>
        <CardDescription className="text-xs">
          Sign in to continue your exam prep
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Primary: Google */}
        <GoogleAuthButton />

        {/* Secondary: email/password — for existing accounts only */}
        <details className="group">
          <summary className="flex items-center justify-center gap-2 cursor-pointer select-none list-none">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground group-open:hidden whitespace-nowrap">
              signed up with email? sign in here
            </span>
            <span className="text-[11px] font-medium text-muted-foreground hidden group-open:inline whitespace-nowrap">
              hide email sign in
            </span>
            <div className="flex-1 h-px bg-border" />
          </summary>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="candidate@remindology.com"
                disabled={isLoading}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={cn('pr-10', errors.password ? 'border-destructive focus-visible:ring-destructive' : '')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full font-semibold cursor-pointer" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
              ) : (
                'Sign In with Email'
              )}
            </Button>
          </form>
        </details>
      </CardContent>
      <CardFooter className="flex flex-col items-center border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-8 bg-card border border-border rounded-lg shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
