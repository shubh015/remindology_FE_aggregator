import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const MIDNIGHT = '#09091F';
const TEXT_DARK = '#1A1836';
const TEXT_MID = '#6B63A0';

const EFFECTIVE_DATE = 'July 29, 2026';

export const metadata = {
  title: 'Terms of Service — Remindology',
  description: 'The terms and conditions governing your use of Remindology.',
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

export default function TermsPage() {
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
            Terms of Service
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
            Please read these Terms of Service (&quot;Terms&quot;) carefully before using Remindology (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
            By creating an account or using our Service, you agree to be bound by these Terms and our{' '}
            <Link href="/privacy" className="font-semibold hover:underline" style={{ color: '#7C3AED' }}>Privacy Policy</Link>.
            If you do not agree, do not use the Service.
          </p>

          <Section title="1. About Remindology">
            <p>
              Remindology is an AI-powered study platform designed for students preparing for competitive examinations in India —
              including UPSC Civil Services Examination (CSE), Staff Selection Commission (SSC) exams, and State Public Service Commission (PSC) examinations.
            </p>
            <p>
              The Service allows you to submit study material and receive AI-generated educational outputs including summaries, revision notes,
              multiple-choice questions (MCQs), key topic extractions, study plans, daily challenges, and current affairs digests.
            </p>
            <p>
              Support for K-12 board examinations, JEE, NEET, and additional competitive exams is planned for future releases.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years old to use the Service, or if you are under 18, you must have the consent and supervision of a parent or legal guardian.
              By creating an account, you represent that you meet these requirements.
              You must not be barred from receiving our services under the laws of India or any other applicable jurisdiction.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <Sub title="3.1 Google Sign-In">
              <p>
                Account creation and sign-in are handled exclusively through Google OAuth 2.0. By signing in, you authorise us to receive your name,
                email address, and Google profile picture as described in our Privacy Policy.
                You are responsible for the security of your Google account.
              </p>
            </Sub>
            <Sub title="3.2 Account Responsibility">
              <p>
                You are responsible for all activity that occurs under your account. You must notify us immediately at{' '}
                <a href="mailto:remindology2026@gmail.com" className="font-semibold hover:underline" style={{ color: '#7C3AED' }}>
                  remindology2026@gmail.com
                </a>{' '}
                if you believe your account has been compromised or accessed without your authorisation.
              </p>
            </Sub>
            <Sub title="3.3 One Account Per User">
              <p>
                You may not create multiple accounts or share your account with others. Accounts are personal and non-transferable.
              </p>
            </Sub>
          </Section>

          <Section title="4. Free and Pro Plans">
            <Sub title="4.1 Free Plan">
              <p>
                All registered users receive a Free plan that includes:
              </p>
              <Ul items={[
                'AI summaries, revision notes, and MCQs',
                'Up to 10 study material uploads per calendar month',
                'Key topic extractions',
                'Daily challenge and study streaks',
                'Personal study library',
              ]} />
            </Sub>
            <Sub title="4.2 Pro Plan (Coming Soon)">
              <p>
                A Pro subscription plan at ₹149/month is under development and not yet available for purchase.
                When launched, it will include unlimited uploads, mains answer evaluation, weak-zone analytics, AI-generated 30-day study plans,
                current affairs digests, and priority AI processing.
                Pricing, billing terms, and refund policies for the Pro plan will be published when it becomes available.
              </p>
            </Sub>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree to use Remindology only for lawful purposes and in accordance with these Terms. You must not:</p>
            <Ul items={[
              'Upload content that infringes any copyright, trademark, or other intellectual property right.',
              'Upload content that is defamatory, obscene, threatening, or otherwise unlawful.',
              'Upload content containing personally identifiable information of third parties without their consent.',
              'Attempt to reverse engineer, scrape, or reproduce any AI-generated content or features of the Service at scale.',
              'Use automated tools, bots, or scripts to interact with the Service in ways not intended for human users.',
              'Attempt to circumvent usage limits, account restrictions, or security measures.',
              'Use the Service to generate content intended to deceive, mislead, or defraud others.',
              'Resell, sublicense, or commercialise access to the Service or its AI-generated outputs without our written permission.',
            ]} />
          </Section>

          <Section title="6. Your Content">
            <Sub title="6.1 Ownership">
              <p>
                You retain full ownership of any study material you upload to the Service (&quot;Your Content&quot;).
                We do not claim any ownership rights over Your Content.
              </p>
            </Sub>
            <Sub title="6.2 Licence to Us">
              <p>
                By submitting Your Content, you grant us a non-exclusive, worldwide, royalty-free licence to process, store, and display Your Content
                solely for the purpose of providing the Service to you.
                We will not use Your Content to train our AI models without your explicit consent.
              </p>
            </Sub>
            <Sub title="6.3 Your Responsibility">
              <p>
                You are solely responsible for ensuring that Your Content does not violate any applicable laws or third-party rights.
                We are not responsible for reviewing Your Content for legality or accuracy.
              </p>
            </Sub>
          </Section>

          <Section title="7. AI-Generated Content">
            <p>
              Remindology uses AI to generate educational content from the material you provide. Please note the following important limitations:
            </p>
            <Ul items={[
              'AI-generated outputs (summaries, notes, MCQs, study plans) are for educational assistance only. They are not a substitute for authoritative textbooks, official government publications, or expert instruction.',
              'AI may produce inaccurate, incomplete, or outdated information. Always cross-check AI outputs against verified sources, especially for examination preparation.',
              'We do not guarantee that AI-generated content will be free of errors, omissions, or biases.',
              'You should not rely solely on AI-generated content for answers in examinations or for professional, legal, or medical advice.',
            ]} />
          </Section>

          <Section title="8. Intellectual Property">
            <Sub title="8.1 Our Property">
              <p>
                Remindology, its logo, the Service&apos;s design, features, underlying software, and all content created by us (excluding Your Content) are owned by us
                or our licensors and are protected by applicable Indian and international intellectual property laws.
                You may not copy, reproduce, modify, distribute, or create derivative works from any part of the Service without our express written permission.
              </p>
            </Sub>
            <Sub title="8.2 AI Output Ownership">
              <p>
                AI-generated outputs produced from Your Content are made available to you for personal educational use.
                We do not claim copyright ownership over outputs generated from Your Content specifically.
                However, you may not republish or commercialise AI-generated outputs in bulk or in ways that compete with Remindology.
              </p>
            </Sub>
          </Section>

          <Section title="9. Disclaimers">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
              TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
              We do not warrant that AI-generated content is accurate, complete, or suitable for any particular examination or purpose.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, REMINDOLOGY AND ITS FOUNDERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR
              ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOSS OF DATA, LOSS OF EXAM PERFORMANCE,
              LOSS OF PROFITS, OR ANY OTHER LOSSES — ARISING FROM YOUR USE OF, OR INABILITY TO USE, THE SERVICE.
            </p>
            <p>
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US
              IN THE 12 MONTHS PRECEDING THE CLAIM, OR ₹500, WHICHEVER IS GREATER.
              THIS LIMITATION APPLIES REGARDLESS OF THE LEGAL THEORY UNDER WHICH THE CLAIM IS BROUGHT.
            </p>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Remindology and its founders, officers, employees, and agents from and against any claims,
              liabilities, damages, judgements, losses, costs, and expenses (including reasonable legal fees) arising from:
            </p>
            <Ul items={[
              'Your use of the Service in violation of these Terms',
              'Your Content infringing any third-party rights',
              'Any misrepresentation made by you',
            ]} />
          </Section>

          <Section title="12. Termination">
            <Sub title="12.1 By You">
              <p>
                You may delete your account at any time from your profile settings or by emailing us.
                Deletion is permanent and will remove your account data as described in our Privacy Policy.
              </p>
            </Sub>
            <Sub title="12.2 By Us">
              <p>
                We may suspend or terminate your account at any time — with or without notice — if you violate these Terms,
                engage in fraudulent activity, or if we discontinue the Service.
                We will make reasonable efforts to notify you before termination except in cases of serious violations.
              </p>
            </Sub>
            <Sub title="12.3 Effect of Termination">
              <p>
                Upon termination, your right to use the Service ceases immediately.
                Sections 6, 7, 8, 9, 10, 11, and 14 of these Terms shall survive termination.
              </p>
            </Sub>
          </Section>

          <Section title="13. Changes to the Service and Terms">
            <p>
              We may modify or discontinue any part of the Service at any time without liability to you.
              We may also update these Terms from time to time. When we make material changes, we will notify you by email or via a prominent notice in the Service,
              and revise the &quot;Last updated&quot; date above.
              Your continued use of the Service after such notice constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="14. Governing Law and Dispute Resolution">
            <p>
              These Terms are governed by and construed in accordance with the laws of India.
              Any dispute arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
              Before initiating formal legal proceedings, we encourage you to contact us to resolve disputes informally.
            </p>
          </Section>

          <Section title="15. Miscellaneous">
            <Ul items={[
              'Entire Agreement: These Terms, together with the Privacy Policy, constitute the entire agreement between you and Remindology regarding the Service.',
              'Severability: If any provision of these Terms is found invalid or unenforceable, the remaining provisions will remain in full force.',
              'No Waiver: Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.',
              'Assignment: You may not assign your rights under these Terms. We may assign our rights without restriction.',
              'Force Majeure: We are not liable for delays or failures caused by circumstances beyond our reasonable control.',
            ]} />
          </Section>

          <Section title="16. Contact Us">
            <p>
              Questions about these Terms? We&apos;re happy to help.
            </p>
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
            href="/privacy"
            className="text-sm font-medium hover:underline"
            style={{ color: '#7C3AED' }}
          >
            Read our Privacy Policy →
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
