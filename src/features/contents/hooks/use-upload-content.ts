'use client';

import { useMutation } from '@tanstack/react-query';
import { contentService } from '@/services/content.service';
import type { UploadFormData } from '@/features/contents/schemas';

export function useUploadContent() {
  return useMutation({
    mutationFn: (data: UploadFormData) => contentService.create(data),
  });
}
