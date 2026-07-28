'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, ShieldAlert, LogOut } from 'lucide-react';

import { deleteCookie } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    // Clear Zustand store state
    clearAuth();
    // Delete the login protection cookie
    deleteCookie('remindology_logged_in');
    // Redirect to login
    router.replace('/login');
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="My Profile" />

      <div className="flex-1 p-8 space-y-6 max-w-2xl w-full mx-auto animate-fade-in">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-sm font-bold text-foreground">Candidate Details</CardTitle>
            <CardDescription className="text-xs">
              UPSC Aspirant profile and credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* User name field */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-muted/20 border border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Full Name</p>
                <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Aspirant'}</p>
              </div>
            </div>

            {/* Email field */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-muted/20 border border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Email Address</p>
                <p className="text-xs font-bold text-foreground truncate">{user?.email || 'aspirant@remindology.com'}</p>
              </div>
            </div>

            {/* Target exam details */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-muted/20 border border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldAlert className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Target Exam Scope</p>
                <p className="text-xs font-bold text-foreground truncate">UPSC Civil Services Examination (CSE)</p>
              </div>
            </div>

            {/* Signout button */}
            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="cursor-pointer font-semibold gap-1.5 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
