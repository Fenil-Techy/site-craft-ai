import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Mail, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how CraftPortfolio collects, uses, and protects your personal information.',
  alternates: {
    canonical: 'https://www.craftportfolio.online/privacy-policy',
  },
}

export default function PrivacyPolicy() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--color-border-base)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors hover:text-zinc-200"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
            Privacy Policy
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Last updated: June 29, 2026 · Effective immediately
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose-custom space-y-12">

          <Section title="1. Introduction">
            <p>
              Welcome to <strong>CraftPortfolio</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website{' '}
              <a href="https://www.craftportfolio.online" className="text-brand-link">www.craftportfolio.online</a> and use our services.
            </p>
            <p>
              Please read this policy carefully. If you disagree with its terms, please discontinue use of our platform.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect information in the following ways:</p>
            <SubSection title="2.1 Information You Provide">
              <ul>
                <li><strong>Account Information:</strong> Name, email address, and profile data when you sign up via Clerk authentication.</li>
                <li><strong>Portfolio Content:</strong> Text, descriptions, and prompts you provide to generate your portfolio.</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe — we do not store raw card details.</li>
                <li><strong>Communications:</strong> Messages you send to our support team.</li>
              </ul>
            </SubSection>
            <SubSection title="2.2 Information Collected Automatically">
              <ul>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and click events via Vercel Analytics and Google Analytics (GA4).</li>
                <li><strong>Device Info:</strong> Browser type, OS, IP address, and referring URLs.</li>
                <li><strong>Cookies:</strong> Session cookies for authentication and performance cookies for analytics.</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our AI portfolio generation service.</li>
              <li>Process transactions and send related information (receipts, order confirmations).</li>
              <li>Manage your account and provide customer support.</li>
              <li>Send service-related notices and important updates.</li>
              <li>Monitor usage patterns to improve performance and user experience.</li>
              <li>Detect, prevent, and address technical issues or abuse.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="4. Sharing Your Information">
            <p>We do not sell your personal data. We may share information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Clerk (auth), Stripe (payments), Neon (database), OpenAI (AI generation), Vercel (hosting), Sentry (error tracking), Upstash (rate limiting).</li>
              <li><strong>Analytics Partners:</strong> Google Analytics for usage insights (anonymized).</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting us at{' '}
              <a href="mailto:fenilkapopara34@gmail.com" className="text-brand-link">fenilkapopara34@gmail.com</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>We use cookies for:</p>
            <ul>
              <li><strong>Essential cookies:</strong> Required for authentication and security.</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our platform (Google Analytics).</li>
              <li><strong>Performance cookies:</strong> Used by Vercel Speed Insights to monitor site performance.</li>
            </ul>
            <p>You can control cookies through your browser settings. Disabling cookies may affect functionality.</p>
          </Section>

          <Section title="7. Security">
            <p>
              We implement industry-standard security measures including 256-bit SSL/TLS encryption, strict HTTP security headers (HSTS, CSP, X-Frame-Options), and secure authentication via Clerk. However, no method of transmission over the Internet is 100% secure.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access and receive a copy of your personal data.</li>
              <li>Rectify inaccurate or incomplete data.</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Data portability.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <a href="mailto:fenilkapopara34@gmail.com" className="text-brand-link">fenilkapopara34@gmail.com</a>.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Our service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal data, please contact us immediately.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <ContactCard />
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-xl font-semibold mb-4 pb-3"
        style={{
          color: 'var(--color-text-primary)',
          borderBottom: '1px solid var(--color-border-base)',
          fontFamily: 'var(--font-inter, sans-serif)',
        }}
      >
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
        {children}
      </div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function ContactCard() {
  return (
    <div
      className="mt-4 p-5 rounded-xl"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-base)',
      }}
    >
      <p className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>CraftPortfolio</p>
      <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
        <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
        <a
          href="mailto:fenilkapopara34@gmail.com"
          style={{ color: 'var(--color-brand)' }}
          className="hover:underline"
        >
          fenilkapopara34@gmail.com
        </a>
      </p>
      <p className="text-sm flex items-center gap-2 mt-2" style={{ color: 'var(--color-text-secondary)' }}>
        <Globe className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
        <a
          href="https://www.craftportfolio.online"
          style={{ color: 'var(--color-brand)' }}
          className="hover:underline"
        >
          www.craftportfolio.online
        </a>
      </p>
    </div>
  )
}
