'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { authService } from '@/services/auth.service';
import { setCookie } from '@/lib/utils';

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
      setNeedsOnboarding(!response.user.target_exam && !response.user.targetExam);
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
        <div className="flex items-start gap-2 rounded-[3px] bg-destructive/5 p-3 text-xs text-destructive border border-destructive/20">
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="w-full flex items-center justify-center gap-2 h-10 rounded-[3px] border border-rule-strong text-sm text-ink-muted bg-paper-raised">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in with Google…
        </div>
      ) : (
        <div className="mx-auto flex w-fit justify-center rounded-[4px] border border-transparent transition-colors duration-150 ease-ks hover:border-ink">
          {/* Google renders its own outline button in an iframe (official multicolor "G" kept);
              this wrapper adds an ink border on hover. */}
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
