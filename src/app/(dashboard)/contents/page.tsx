'use client';

import { useState } from 'react';
import { useContents } from '@/features/contents/hooks/use-contents';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { UploadModal } from '@/features/contents/components/UploadModal';
import { FileText, PlusCircle, Search, ArrowRight, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 8;

export default function ContentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: contents, isLoading, isError, error } = useContents();

  const filteredContents = contents?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const totalPages = Math.max(Math.ceil(filteredContents.length / ITEMS_PER_PAGE), 1);
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="My Study Contents"
        action={
          <Button onClick={() => setIsUploadOpen(true)} size="sm" className="cursor-pointer font-semibold gap-2 px-4 h-9 text-sm rounded-[3px]">
            <PlusCircle className="h-4 w-4" />
            Upload Content
          </Button>
        }
      />

      <div className="flex-1 p-8 space-y-6 max-w-5xl w-full mx-auto">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <Input
            placeholder="Search by title..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-10 text-sm rounded-[3px]"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-[2px]" />)}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 rounded-[2px] bg-paper-raised p-4 text-sm text-[oklch(52%_.16_35)] border border-rule">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Error fetching study contents: {error?.message || 'Please try again later.'}</span>
          </div>
        ) : filteredContents.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-[2px] border border-rule bg-paper-raised overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-rule bg-paper-deep">
                    <th className="px-5 py-3.5 font-label text-[11px] font-normal text-ink-muted uppercase tracking-[0.14em]">Title</th>
                    <th className="px-5 py-3.5 font-label text-[11px] font-normal text-ink-muted uppercase tracking-[0.14em]">Uploaded</th>
                    <th className="px-5 py-3.5 font-label text-[11px] font-normal text-ink-muted uppercase tracking-[0.14em]">Status</th>
                    <th className="px-5 py-3.5 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedContents.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-b border-rule hover:bg-paper-deep transition-colors duration-150 ease-ks last:border-0 ${idx % 2 !== 0 ? 'bg-paper/60' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-semibold text-ink max-w-[260px] truncate">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-muted tabular-nums whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={item.status === 'COMPLETED' ? 'success' : item.status === 'FAILED' ? 'destructive' : 'warning'}
                          className="text-[10px] font-semibold"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/contents/${item.id}`}
                          className="inline-flex items-center gap-1.5 ks-link text-sm font-medium text-ink cursor-pointer"
                        >
                          Open
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted tabular-nums">
                Showing {Math.min(filteredContents.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–{Math.min(filteredContents.length, currentPage * ITEMS_PER_PAGE)} of {filteredContents.length}
              </span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-[3px] cursor-pointer"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-label text-xs px-3 text-ink tabular-nums">{currentPage} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-[3px] cursor-pointer"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={searchQuery ? 'No matches found' : 'Your library is empty'}
            description={
              searchQuery
                ? `No articles matching "${searchQuery}". Try refining your keywords.`
                : 'No files added yet. Upload UPSC articles or preparation notes to get started.'
            }
            actionText={searchQuery ? 'Clear Search' : 'Upload Study Material'}
            onAction={searchQuery ? () => setSearchQuery('') : () => setIsUploadOpen(true)}
          />
        )}
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
