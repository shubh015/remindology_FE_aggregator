'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { setupInterceptors } from '@/lib/api/interceptors';
import { registerServiceWorker } from '@/lib/push';

// Initialize Axios interceptors for client side requests
if (typeof window !== 'undefined') {
  setupInterceptors();
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute default stale time
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Registered eagerly (separate from requesting notification permission) so the
  // site is installable as soon as it's visited, not only after a user opts into push.
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default Providers;
