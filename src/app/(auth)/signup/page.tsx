'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export default function SignupPage() {
  return (
    <Card className="rounded-[3px] border-rule bg-paper-raised shadow-none">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-[3px] mb-2 bg-paper-deep border border-rule">
          <Sparkles className="h-4 w-4 text-ink" />
        </div>
        <CardTitle className="doc-h2 mb-0!">Create your account</CardTitle>
        <CardDescription className="text-sm text-ink-muted">
          Start your AI-powered exam prep — free, no credit card needed
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <GoogleAuthButton />

        {/* What you get */}
        <div className="rounded-[3px] p-4 space-y-2.5 bg-paper-deep border border-rule">
          <p className="eyebrow">
            What you get
          </p>
          {[
            'AI summaries, revision notes & MCQs from your material',
            'Daily challenges tailored to your exam',
            'Current affairs with mains angle',
            'Personalised 30-day study plan',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-ink-soft">
              <span className="text-ink font-semibold mt-0.5 shrink-0">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-ink-muted leading-relaxed">
          By continuing you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy Policy</Link>.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-center border-t border-rule pt-4">
        <p className="text-xs text-ink-muted">
          Already have an account?{' '}
          <Link href="/login" className="ks-link font-semibold">Sign In</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
