import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for does not exist. Return to CraftPortfolio home.',
}

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 40%, rgba(251,191,36,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative text-center max-w-md">
        {/* 404 Number */}
        <div
          className="text-[120px] font-black leading-none mb-6 select-none"
          style={{
            fontFamily: 'var(--font-inter, sans-serif)',
            background: 'linear-gradient(135deg, #fbbf24 0%, rgba(251,191,36,0.3) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>

        {/* Glitch bar */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: i % 3 === 0 ? '24px' : i % 2 === 0 ? '8px' : '16px',
                height: '3px',
                backgroundColor: i === 4 ? 'var(--color-brand)' : 'var(--color-border-base)',
                opacity: i === 4 ? 1 : 0.4,
              }}
            />
          ))}
        </div>

        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-inter, sans-serif)', color: 'var(--color-text-primary)' }}
        >
          Page Not Found
        </h1>
        <p
          className="text-sm leading-6 mb-10"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            id="not-found-home"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-105"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: '#0d0d0d',
              boxShadow: '0 0 20px rgba(251,191,36,0.2)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3L2 8h2v5h4v-3h2v3h4V8h2L8 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            Go Home
          </Link>
          <Link
            href="/contact"
            id="not-found-contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-base)',
            }}
          >
            Contact Support
          </Link>
        </div>

        {/* Quick links */}
        <div
          className="mt-12 pt-8"
          style={{ borderTop: '1px solid var(--color-border-base)' }}
        >
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            Or visit one of these pages:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { href: '/pricing', label: 'Pricing' },
              { href: '/about', label: 'About' },
              { href: '/workspace', label: 'Workspace' },
              { href: '/privacy-policy', label: 'Privacy' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs transition-colors hover:underline"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
