'use client';

import Link from 'next/link';
import { FileText, ArrowRight, AlertCircle, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Content } from '@/types/content';

interface RecentUploadsProps {
  contents: Content[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onUpload: () => void;
}

// Coloured status dot
function StatusDot({ status }: { status: Content['status'] }) {
  const map: Record<Content['status'], string> = {
    COMPLETED:  'bg-emerald-500',
    FAILED:     'bg-destructive',
    PROCESSING: 'bg-amber-400',
    PENDING:    'bg-amber-400',
  };
  return (
    <span
      className={cn('h-2 w-2 rounded-full shrink-0', map[status] ?? 'bg-muted-foreground')}
      title={status}
    />
  );
}

export function RecentUploads({ contents, isLoading, isError, error, onUpload }: RecentUploadsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Materials</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Latest uploads · click to study</p>
        </div>
        <Link
          href="/contents"
          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pb-4">
        {isLoading ? (
          <div className="space-y-0 divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-3 flex items-center gap-3">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/5 border border-destructive/20 p-3.5 text-xs text-destructive mt-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error?.message || 'Could not load materials.'}</span>
          </div>
        ) : contents && contents.length > 0 ? (
          <div className="divide-y divide-border/60">
            {contents.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/contents/${item.id}`}
                className="group flex items-center gap-3 py-3 hover:bg-secondary/30 transition-colors rounded-sm -mx-2 px-2"
              >
                {/* Status dot */}
                <StatusDot status={item.status} />

                {/* Title */}
                <p className="text-[13px] font-medium text-foreground flex-1 truncate leading-snug">
                  {item.title}
                </p>

                {/* Date + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground tabular-nums hidden sm:block">
                    {formatDate(item.created_at)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/25 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No uploads yet"
            description="Upload your first article or notes to get your AI study kit."
            actionText="Upload Material"
            onAction={onUpload}
          />
        )}
      </div>

      {/* Footer CTA */}
      {!isLoading && !isError && contents && contents.length > 0 && (
        <div className="px-5 pb-4 mt-auto">
          <button
            onClick={onUpload}
            className="flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground border border-dashed border-border rounded-xl py-2 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" /> Upload new material
          </button>
        </div>
      )}
    </div>
  );
}
