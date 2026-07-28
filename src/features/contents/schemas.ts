import { z } from 'zod';

export const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  raw_text: z.string().min(20, 'Content must be at least 20 characters'),
});

export type UploadFormData = z.infer<typeof uploadSchema>;
