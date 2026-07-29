import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const MIDNIGHT = '#09091F';
const TEXT_DARK = '#1A1836';
const TEXT_MID = '#6B63A0';

const EFFECTIVE_DATE = 'July 29, 2026';

export const metadata = {
  title: 'Privacy Policy — Remindology',
  description: 'How Remindology collects, uses, and protects your personal data.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="text-xl font-bold mb-4 pb-3"
        style={{ color: TEXT_DARK, borderBottom: '1px solid rgba(124,58,237,0.12)' }}
      >
        {title}
      </h2>
      <div className="space-y-4 text-[15px] leading-relaxed" style={{ color: TEXT_MID }}>
        {children}
      </div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold mb-1.5" style={{ color: TEXT_DARK, fontSize: '0.95rem' }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 ml-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#7C3AED' }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif', background: '#F5F4FF', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ background: MIDNIGHT, borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
              style={{ background: BRAND_GRAD }}
            >
              R
            </div>
            <span
              className="text-[17px] font-bold"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #E879F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Remindology
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'rgba(196,181,253,0.6)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Page title */}
      <div style={{ background: MIDNIGHT, borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#C4B5FD' }}
          >
            Legal
          </div>
          <h1
            className="text-4xl font-extrabold tracking-tight mb-3"
            style={{ color: '#F0EEFF' }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: 'rgba(196,181,253,0.6)', fontSize: '0.9rem' }}>
            Effective date: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 4px 32px rgba(124,58,237,0.06)' }}
        >

          <p className="text-[15px] leading-relaxed mb-10" style={{ color: TEXT_MID }}>
            Remindology (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is an AI-powered study platform built for students preparing for UPSC CSE, SSC, and State PSC examinations.
            This Privacy Policy explains how we collect, use, store, and protect your personal information when you access or use our website and services (&quot;Service&quot;).
            By using Remindology, you agree to the practices described in this policy.
          </p>

          <Section title="1. Information We Collect">
            <Sub title="1.1 Account Information via Google Sign-In">
              <p>
                We use Google OAuth 2.0 as our sole sign-in method. When you authenticate through Google, we receive and store:
              </p>
              <Ul items={[
                'Your full name as registered with Google',
                'Your Google account email address',
                'Your Google profile picture URL (for display purposes)',
                'A unique Google account identifier',
              ]} />
              <p className="mt-3">
                We do not receive or store your Google password. We request only the minimum OAuth scopes needed to identify you.
              </p>
            </Sub>

            <Sub title="1.2 Study Content You Upload">
              <p>
                When you use Remindology, you may paste or upload study material (text, chapters, articles, notes). This content is processed by our AI to generate summaries, revision notes, MCQs, and other study tools.
                Your uploaded content is stored in your personal study library and is not shared with other users.
              </p>
            </Sub>

            <Sub title="1.3 Usage and Activity Data">
              <p>We collect data about how you use the Service, including:</p>
              <Ul items={[
                'Pages viewed and features used',
                'Study streaks, daily challenge results, and progress metrics',
                'Upload frequency and content counts',
                'Browser type, operating system, and device information',
                'IP address and approximate geolocation (country/state level)',
                'Timestamps of logins and key actions',
              ]} />
            </Sub>

            <Sub title="1.4 Communications">
              <p>
                If you contact us by email, we retain the content of your message and your contact details in order to respond to you.
              </p>
            </Sub>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <Ul items={[
              'Create and manage your account',
              'Deliver the AI study tools and features (summaries, notes, MCQs, study plans, etc.)',
              'Personalise your experience — tracking progress, streaks, and weak zones',
              'Improve and debug the Service',
              'Send you product updates, new feature announcements, or important account notices (you can opt out of marketing emails at any time)',
              'Detect and prevent fraud, abuse, or violations of our Terms of Service',
              'Comply with applicable Indian and international laws',
            ]} />
          </Section>

          <Section title="3. AI Processing of Your Study Content">
            <p>
              The core of Remindology is AI-powered processing. When you submit study material, it is sent to AI services to generate educational outputs.
              Please be aware of the following:
            </p>
            <Ul items={[
              'Do not upload content containing sensitive personal information, confidential business data, or classified material.',
              'AI-generated outputs (summaries, MCQs, notes) may not always be 100% accurate. Always cross-check critical information with authoritative sources.',
              'Your study content may be processed by third-party AI infrastructure providers under strict data processing agreements.',
            ]} />
          </Section>

          <Section title="4. Data Sharing and Third Parties">
            <p>
              We do not sell, rent, or trade your personal data. We may share data only in the following circumstances:
            </p>
            <Sub title="4.1 Service Providers">
              <p>
                We use trusted third-party vendors to operate the Service — including cloud hosting (Railway), AI model providers, and analytics tools.
                These providers act as data processors and are contractually required to protect your data and use it only to provide services to us.
              </p>
            </Sub>
            <Sub title="4.2 Legal Compliance">
              <p>
                We may disclose your information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights,
                your safety, or the safety of others.
              </p>
            </Sub>
            <Sub title="4.3 Business Transfers">
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
                We will notify you via email and/or a prominent notice on our website before your data becomes subject to a different privacy policy.
              </p>
            </Sub>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your personal data for as long as your account is active or as needed to provide the Service.
              If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required by law to retain it for longer.
              Aggregated, anonymised usage statistics that cannot identify you individually may be retained indefinitely.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures to protect your data, including:
            </p>
            <Ul items={[
              'HTTPS/TLS encryption for all data in transit',
              'Access tokens that expire and refresh automatically',
              'Role-based access controls limiting who on our team can access user data',
              'Regular security reviews of our infrastructure',
            ]} />
            <p className="mt-3">
              No method of electronic storage or transmission is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify you as required by applicable law.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the following rights regarding your personal data:</p>
            <Ul items={[
              'Access — request a copy of the personal data we hold about you.',
              'Correction — ask us to correct inaccurate or incomplete data.',
              'Deletion — request that we delete your account and all associated personal data.',
              'Portability — request your study content and account data in a portable format.',
              'Objection — object to processing of your data for direct marketing purposes.',
              'Withdraw consent — withdraw your Google Sign-In at any time by revoking access in your Google account settings.',
            ]} />
            <p className="mt-3">
              To exercise any of these rights, please email us at{' '}
              <a href="mailto:remindology2026@gmail.com" className="font-semibold hover:underline" style={{ color: '#7C3AED' }}>
                remindology2026@gmail.com
              </a>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Cookies and Local Storage">
            <p>
              We use a minimal set of browser storage mechanisms:
            </p>
            <Ul items={[
              'A session cookie ("remindology_logged_in") to maintain your logged-in state across page loads.',
              'LocalStorage to persist your authentication tokens and preferences on your device.',
            ]} />
            <p className="mt-3">
              We do not use third-party advertising cookies or tracking pixels.
              You can clear cookies and local storage at any time through your browser settings, which will sign you out of the Service.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Remindology is designed for adults and students who are at least 18 years old or who are preparing for competitive examinations under parental or guardian supervision.
              We do not knowingly collect personal data from children under 13. If we become aware that we have collected data from a child under 13 without parental consent,
              we will delete that data promptly. If you believe a child under 13 has provided us with personal data, please contact us immediately.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the &quot;Last updated&quot; date at the top of this page.
              For significant changes, we will notify registered users by email or via an in-app notification.
              Your continued use of the Service after the effective date of a revised policy constitutes your acceptance of the changes.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              This Privacy Policy is governed by the laws of India, including the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
              Any disputes arising under this policy shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
            <div
              className="mt-4 p-5 rounded-xl"
              style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)' }}
            >
              <p className="font-semibold mb-1" style={{ color: TEXT_DARK }}>Remindology</p>
              <p>India</p>
              <a
                href="mailto:remindology2026@gmail.com"
                className="inline-flex items-center gap-2 mt-2 font-semibold hover:underline"
                style={{ color: '#7C3AED' }}
              >
                <Mail className="h-4 w-4" />
                remindology2026@gmail.com
              </a>
            </div>
          </Section>

        </div>

        {/* Bottom nav */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/terms"
            className="text-sm font-medium hover:underline"
            style={{ color: '#7C3AED' }}
          >
            Read our Terms of Service →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground"
            style={{ color: TEXT_MID }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Remindology
          </Link>
        </div>
      </div>

      {/* Footer strip */}
      <footer
        className="border-t py-6"
        style={{ background: MIDNIGHT, borderColor: 'rgba(124,58,237,0.2)' }}
      >
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'rgba(196,181,253,0.35)' }}>
            © 2026 Remindology. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs hover:text-white transition-colors" style={{ color: 'rgba(196,181,253,0.5)' }}>Privacy Policy</Link>
            <Link href="/terms" className="text-xs hover:text-white transition-colors" style={{ color: 'rgba(196,181,253,0.5)' }}>Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
