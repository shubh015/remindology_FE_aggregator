'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { contentService } from '@/services/content.service';
import { SummaryTab } from '@/features/ai-analysis/components/SummaryTab';
import { TopicsTab } from '@/features/ai-analysis/components/TopicsTab';
import { MCQsTab } from '@/features/ai-analysis/components/MCQsTab';
import { RevisionNotesTab } from '@/features/ai-analysis/components/RevisionNotesTab';
import { MnemonicsTab } from '@/features/ai-analysis/components/MnemonicsTab';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AiUsageIndicator } from '@/components/ai/AiUsageIndicator';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContentDetailPage({ params }: PageProps) {
  const { id: contentId } = use(params);

  const { data: content, isLoading, isError, error } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => contentService.getById(contentId),
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8 space-y-6 max-w-5xl w-full mx-auto animate-pulse">
          <div className="h-6 w-32 bg-muted-foreground/10 rounded" />
          <div className="h-10 w-2/3 bg-muted-foreground/10 rounded" />
          <div className="h-10 w-full bg-muted-foreground/10 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !content) {
    return (
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8 max-w-5xl w-full mx-auto flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-xs text-destructive border border-destructive/20 max-w-md">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Failed to load study content: {error?.message || 'Item not found.'}</span>
          </div>
          <Link href="/contents" className="mt-4">
            <Button size="sm" variant="outline" className="cursor-pointer text-xs">Back to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Learning Workspace"
        action={
          <Link href="/contents">
            <Button variant="outline" size="sm" className="cursor-pointer text-[10px] font-semibold gap-1 h-8">
              <ArrowLeft className="h-3 w-3" />All Contents
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-8 space-y-6 max-w-5xl w-full mx-auto">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={content.status === 'COMPLETED' ? 'success' : content.status === 'FAILED' ? 'destructive' : 'warning'}
              className="text-[9px]"
            >
              {content.status}
            </Badge>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              <span>Added {new Date(content.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight">{content.title}</h2>
        </div>

        <div className="flex justify-end">
          <AiUsageIndicator />
        </div>

        {/* 5-tab learning suite */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-xl border border-border bg-muted/65 p-1 rounded-lg">
            <TabsTrigger value="summary"  className="cursor-pointer text-[11px] font-semibold">Summary</TabsTrigger>
            <TabsTrigger value="topics"   className="cursor-pointer text-[11px] font-semibold">Topics</TabsTrigger>
            <TabsTrigger value="mcqs"     className="cursor-pointer text-[11px] font-semibold">MCQs</TabsTrigger>
            <TabsTrigger value="revision" className="cursor-pointer text-[11px] font-semibold">Notes</TabsTrigger>
            <TabsTrigger value="mnemonics" className="cursor-pointer text-[11px] font-semibold">Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="summary"   className="focus-visible:outline-none"><SummaryTab contentId={contentId} /></TabsContent>
          <TabsContent value="topics"    className="focus-visible:outline-none"><TopicsTab contentId={contentId} /></TabsContent>
          <TabsContent value="mcqs"      className="focus-visible:outline-none"><MCQsTab contentId={contentId} /></TabsContent>
          <TabsContent value="revision"  className="focus-visible:outline-none"><RevisionNotesTab contentId={contentId} /></TabsContent>
          <TabsContent value="mnemonics" className="focus-visible:outline-none"><MnemonicsTab contentId={contentId} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
