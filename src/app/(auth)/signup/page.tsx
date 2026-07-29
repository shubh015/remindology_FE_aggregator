'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export default function SignupPage() {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl mb-2"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(192,38,211,0.1))', border: '1px solid rgba(124,58,237,0.2)' }}>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-lg font-bold">Create your account</CardTitle>
        <CardDescription className="text-xs">
          Start your AI-powered exam prep — free, no credit card needed
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <GoogleAuthButton />

        {/* What you get */}
        <div className="rounded-xl p-4 space-y-2.5"
          style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            What you get
          </p>
          {[
            'AI summaries, revision notes & MCQs from your material',
            'Daily challenges tailored to your exam',
            'Current affairs with mains angle',
            'Personalised 30-day study plan',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="text-primary font-bold mt-0.5 shrink-0">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/70 leading-relaxed">
          By continuing you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-center border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
