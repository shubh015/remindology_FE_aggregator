'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useUploadContent } from '@/features/contents/hooks/use-upload-content';
import { uploadSchema, type UploadFormData } from '@/features/contents/schemas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2, Sparkles, ArrowUp, FileText } from 'lucide-react';
import type { UploadModalProps } from '@/types/props';

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const router = useRouter();
  const mutation = useUploadContent();
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const rawText = watch('raw_text', '');

  useEffect(() => {
    setCharCount(rawText.length);
    setWordCount(rawText.trim() ? rawText.trim().split(/\s+/).length : 0);
  }, [rawText]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
    }
  }, [rawText]);

  const onSubmit = (data: UploadFormData) => {
    mutation.mutate(data, {
      onSuccess: (content) => {
        reset();
        onClose();
        router.push(`/contents/${content.id}`);
      },
    });
  };

  const { ref: rhfRef, ...rawTextRest } = register('raw_text');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[640px] border-rule bg-paper-raised p-0 gap-0 rounded-[4px] overflow-hidden shadow-lift-2">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-rule">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-ink">Upload Study Material</DialogTitle>
              <p className="text-xs text-ink-muted mt-0.5">
                Paste any article, editorial, or notes — AI will extract UPSC insights.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-5">
            {/* API error */}
            {mutation.isError && (
              <div className="flex items-start gap-2.5 rounded-[2px] bg-[oklch(52%_.16_35/.06)] p-3.5 text-sm text-[oklch(52%_.16_35)] border border-[oklch(52%_.16_35/.25)]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    mutation.error?.message ||
                    'Failed to upload content. Please try again.'}
                </span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-label text-[11px] font-medium text-ink-muted uppercase tracking-[0.14em]" htmlFor="title">
                Document Title
              </label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., GS Paper 2 — Indo-Pacific Relations"
                disabled={mutation.isPending}
                className={errors.title ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* LLM-style content box */}
            <div className="space-y-1.5">
              <label className="font-label text-[11px] font-medium text-ink-muted uppercase tracking-[0.14em]" htmlFor="raw_text">
                Content
              </label>
              <div className={`relative rounded-md border bg-paper-raised transition-colors focus-within:ring-1 focus-within:ring-ink focus-within:border-ink ${errors.raw_text ? 'border-destructive focus-within:ring-destructive' : 'border-input'}`}>
                <Textarea
                  id="raw_text"
                  placeholder="Paste your article, news editorial, or study notes here…"
                  disabled={mutation.isPending}
                  ref={(el) => {
                    rhfRef(el);
                    (textareaRef as React.RefObject<HTMLTextAreaElement | null>).current = el;
                  }}
                  className="border-0 shadow-none rounded-b-none focus:ring-0 pb-12"
                  style={{ minHeight: '160px', maxHeight: '320px' }}
                  {...rawTextRest}
                />
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-rule bg-paper-deep rounded-b-md">
                  <div className="flex items-center gap-3">
                    <span className="font-label text-[11px] text-ink-muted tabular-nums">{wordCount.toLocaleString()} words</span>
                    <span className="text-ink-faint">·</span>
                    <span className="font-label text-[11px] text-ink-muted tabular-nums">{charCount.toLocaleString()} chars</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-ink-muted" />
                    <span className="font-label text-[11px] text-ink-muted">Plain text</span>
                  </div>
                </div>
              </div>
              {errors.raw_text && (
                <p className="text-xs text-destructive font-medium">{errors.raw_text.message}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-rule bg-paper-deep">
            <p className="text-xs text-ink-muted">
              AI will generate summaries, topics, MCQs &amp; revision notes.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
                className="cursor-pointer text-sm h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || charCount < 20}
                className="cursor-pointer text-sm font-semibold h-9 px-5 gap-2 disabled:opacity-40"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    Analyse
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UploadModal;
