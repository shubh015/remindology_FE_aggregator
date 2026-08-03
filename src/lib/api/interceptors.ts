import { apiClient } from './client';
import { useAuthStore } from '@/store/use-auth-store';
import { useAiLimitStore } from '@/store/use-ai-limit-store';

function parseAiHeaders(headers: Record<string, string>) {
  const used      = parseInt(headers['x-ai-calls-used']      ?? '', 10);
  const remaining = parseInt(headers['x-ai-calls-remaining'] ?? '', 10);
  const limit     = parseInt(headers['x-ai-calls-limit']     ?? '', 10);
  if (!isNaN(used) && !isNaN(remaining) && !isNaN(limit)) {
    useAiLimitStore.getState().updateFromHeaders(used, remaining, limit);
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = () => {
  // Request Interceptor: Attach bearer token if present
  apiClient.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Intercept 401s to refresh token
  apiClient.interceptors.response.use(
    (response) => {
      parseAiHeaders(response.headers as Record<string, string>);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Prevent circular loops on auth endpoints or missing request configs
      if (!originalRequest) {
        return Promise.reject(error);
      }

      // Handle AI daily limit — show modal, do NOT retry
      if (error.response?.status === 429) {
        const data = error.response.data as { code?: string } | undefined;
        if (data?.code === 'AI_DAILY_LIMIT_REACHED') {
          parseAiHeaders(error.response.headers as Record<string, string>);
          useAiLimitStore.getState().showLimitModal();
          return Promise.reject(error);
        }
      }

      // Check for 401 errors and verify that we haven't already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        // If the unauthorized endpoint is the auth endpoints themselves, clean up and fail
        if (
          originalRequest.url === '/auth/refresh' ||
          originalRequest.url === '/auth/login' ||
          originalRequest.url === '/auth/signup'
        ) {
          useAuthStore.getState().clearAuth();
          return Promise.reject(error);
        }

        // Queue requests if a refresh is already in progress
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = useAuthStore.getState().refreshToken;
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call endpoint to refresh tokens passing the refresh token in request body
          const response = await apiClient.post('/auth/refresh', { refreshToken });
          // response.data is ApiResponse<{ accessToken: string }>
          const { accessToken } = response.data.data;

          const currentUser = useAuthStore.getState().user;
          if (!currentUser) {
            throw new Error('User session lost');
          }

          // Update auth store keeping user and refresh token
          useAuthStore.getState().setAuth(currentUser, accessToken, refreshToken);

          processQueue(null, accessToken);
          isRefreshing = false;

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          useAuthStore.getState().clearAuth();

          // Redirect to login if running in client browser context
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
