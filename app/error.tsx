'use client' // Error boundaries must be Client Components

import Link from 'next/link'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
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
            'radial-gradient(ellipse 50% 50% at 50% 40%, rgba(239,68,68,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative text-center max-w-md">
        {/* Error icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M18 4L32.93 28H3.07L18 4Z"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M18 15v6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="25" r="1.5" fill="#ef4444" />
          </svg>
        </div>

        {/* Error code/title */}
        <div
          className="text-7xl font-black leading-none mb-4 select-none"
          style={{
            fontFamily: 'var(--font-inter, sans-serif)',
            background: 'linear-gradient(135deg, #ef4444 0%, rgba(239,68,68,0.4) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Oops!
        </div>

        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-inter, sans-serif)', color: 'var(--color-text-primary)' }}
        >
          Something went wrong
        </h1>
        <p
          className="text-sm leading-6 mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          An unexpected error occurred. This might be temporary — try refreshing the page.
        </p>

        {/* Error digest (for support) */}
        {error?.digest && (
          <p className="text-xs mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
            Error ID:{' '}
            <code
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-tertiary)' }}
            >
              {error.digest}
            </code>
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            id="error-retry"
            onClick={unstable_retry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-105"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: '#0d0d0d',
              boxShadow: '0 0 20px rgba(251,191,36,0.2)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8a6 6 0 1 1 1.5 4M2 12V8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Try Again
          </button>
          <Link
            href="/"
            id="error-home"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-base)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3L2 8h2v5h4v-3h2v3h4V8h2L8 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            Go Home
          </Link>
        </div>

        {/* Help link */}
        <p className="mt-10 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Problem persisting?{' '}
          <Link
            href="/contact"
            className="hover:underline"
            style={{ color: 'var(--color-brand)' }}
          >
            Contact support
          </Link>
          {error?.digest && (
            <span> with Error ID: <strong>{error.digest}</strong></span>
          )}
        </p>
      </div>
    </div>
  )
}
