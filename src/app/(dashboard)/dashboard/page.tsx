'use client';

import { useMemo, useState } from 'react';
import { useContents } from '@/features/contents/hooks/use-contents';
import { useWeakZones } from '@/features/analytics/hooks/use-weak-zones';
import { useDailyChallenge } from '@/features/daily-challenge/hooks/use-daily-challenge';
import { computeContentStats } from '@/features/dashboard/utils/content-insights';
import { WelcomeBanner } from '@/features/dashboard/components/WelcomeBanner';
import { StatsRow } from '@/features/dashboard/components/StatsRow';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { SubjectBreakdown } from '@/features/dashboard/components/SubjectBreakdown';
import { RecentUploads } from '@/features/dashboard/components/RecentUploads';
import { WeakZoneRadar } from '@/features/dashboard/components/WeakZoneRadar';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { UploadModal } from '@/features/contents/components/UploadModal';
import { PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: contents, isLoading, isError, error } = useContents();
  const { data: zones } = useWeakZones();
  const { challenge } = useDailyChallenge();

  const stats = useMemo(
    () => (contents ? computeContentStats(contents) : null),
    [contents]
  );

  const weakZoneCount   = zones?.length ?? 0;
  const streakCompleted = challenge?.alreadyCompleted ?? false;

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Dashboard"
        action={
          <Button
            onClick={() => setIsUploadOpen(true)}
            size="sm"
            className="cursor-pointer font-semibold gap-2 px-4 h-9 text-sm rounded-xl shadow-sm shadow-primary/20"
          >
            <PlusCircle className="h-4 w-4" />
            Upload Content
          </Button>
        }
      />

      <div className="flex-1 p-5 lg:p-6 max-w-5xl w-full mx-auto space-y-4">

        {/* Hero banner */}
        <WelcomeBanner
          user={user}
          completionRate={stats?.completionRate ?? 0}
          recentCount={stats?.recentCount ?? 0}
          total={stats?.total ?? 0}
          isLoading={isLoading}
        />

        {/* AI metric cards */}
        <StatsRow
          stats={stats}
          isLoading={isLoading}
          weakZoneCount={weakZoneCount}
          streakCompleted={streakCompleted}
        />

        {/* Feature quick actions */}
        <QuickActions />

        {/* ── 3-column bottom grid — each card fits its own content ── */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start">
          <RecentUploads
            contents={contents}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onUpload={() => setIsUploadOpen(true)}
          />
          <SubjectBreakdown stats={stats} isLoading={isLoading} />
          <WeakZoneRadar />
        </div>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
