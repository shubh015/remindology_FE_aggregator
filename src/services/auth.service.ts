import { apiClient } from '@/lib/api/client';
import { AuthResponse, User } from '@/types/auth';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const authService = {
  async signup(data: Record<string, unknown>): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/signup', data);
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<{ message: string; token: string; resetLink: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; token: string; resetLink: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data.data;
  },

  async resetPassword(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    const response = await apiClient.post<ApiResponse<unknown>>('/auth/reset-password', data);
    return response.data;
  },

  async login(data: Record<string, unknown>): Promise<AuthResponse> {
    // The backend login response nests tokens inside a 'tokens' object
    const response = await apiClient.post<
      ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>
    >('/auth/login', data);

    return {
      user: response.data.data.user,
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
    };
  },

  async googleAuth(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/google',
      { idToken }
    );
    return response.data.data;
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/user/me');
    return response.data.data;
  },

  async updateProfile(data: {
    targetExam?: string | null;
    examDate?: string | null;
    optionalSubject?: string | null;
  }): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>('/user/profile', data);
    return response.data.data;
  },
};

export default authService;
