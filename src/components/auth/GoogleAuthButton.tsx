'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { authService } from '@/services/auth.service';
import { setCookie } from '@/lib/utils';
import { isOnboardingComplete } from '@/lib/onboarding';

interface GoogleAuthButtonProps {
  redirectTo?: string;
}

export function GoogleAuthButton({ redirectTo = '/dashboard' }: GoogleAuthButtonProps) {
  const { setAuth, setNeedsOnboarding, setPostAuthRedirect } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google did not return a credential. Please try again.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.googleAuth(credentialResponse.credential);
      // Set flags BEFORE setAuth so the auth layout reads them on the same render cycle
      setNeedsOnboarding(!isOnboardingComplete(response.user.id));
      setPostAuthRedirect(redirectTo !== '/dashboard' ? redirectTo : null);
      setAuth(response.user, response.accessToken, response.refreshToken);
      setCookie('remindology_logged_in', 'true', 604800);
      // No router.replace here — auth layout is the single redirect controller
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground bg-muted/30">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in with Google…
        </div>
      ) : (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Google sign-in was cancelled or failed.')}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="320"
          />
        </div>
      )}
    </div>
  );
}
