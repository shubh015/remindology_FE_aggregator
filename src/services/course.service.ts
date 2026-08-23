import { publicApiClient } from '@/lib/api/public-client';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from './auth.service';
import type {
  Course, CourseCreateInput, CourseUpdateInput, CourseNotification, CourseNotificationCreateInput,
} from '@/types/features';

export const courseService = {
  // ── Public ─────────────────────────────────────────────────────

  async getCourses(): Promise<Course[]> {
    const response = await publicApiClient.get<ApiResponse<Course[]>>('/courses');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getCourseBySlug(slug: string): Promise<Course> {
    const response = await publicApiClient.get<ApiResponse<Course>>(`/courses/${slug}`);
    return response.data.data;
  },

  // ── Admin ──────────────────────────────────────────────────────

  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<ApiResponse<Course[]>>('/courses/admin/all');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getCourseById(id: string): Promise<Course> {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/admin/${id}`);
    return response.data.data;
  },

  async createCourse(input: CourseCreateInput): Promise<Course> {
    const response = await apiClient.post<ApiResponse<Course>>('/courses', input);
    return response.data.data;
  },

  async updateCourse(id: string, input: CourseUpdateInput): Promise<Course> {
    const response = await apiClient.patch<ApiResponse<Course>>(`/courses/${id}`, input);
    return response.data.data;
  },

  async publishCourse(id: string): Promise<Course> {
    const response = await apiClient.patch<ApiResponse<Course>>(`/courses/${id}/publish`);
    return response.data.data;
  },

  async unpublishCourse(id: string): Promise<Course> {
    const response = await apiClient.patch<ApiResponse<Course>>(`/courses/${id}/unpublish`);
    return response.data.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  },

  // ── Admin — notifications ──────────────────────────────────────

  async getAllNotifications(): Promise<CourseNotification[]> {
    const response = await apiClient.get<ApiResponse<CourseNotification[]>>('/courses/admin/notifications');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async createNotification(input: CourseNotificationCreateInput): Promise<CourseNotification> {
    const response = await apiClient.post<ApiResponse<CourseNotification>>('/courses/notifications', input);
    return response.data.data;
  },

  async setNotificationActive(id: string, isActive: boolean): Promise<CourseNotification> {
    const response = await apiClient.patch<ApiResponse<CourseNotification>>(`/courses/notifications/${id}/active`, { isActive });
    return response.data.data;
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/courses/notifications/${id}`);
  },
};

export default courseService;
