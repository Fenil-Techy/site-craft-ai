import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Zap, Palette, SlidersHorizontal, ShieldCheck, Cloud, Share2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about CraftPortfolio — the AI-powered portfolio builder that helps professionals create stunning portfolios in seconds.',
  alternates: {
    canonical: 'https://www.craftportfolio.online/about',
  },
}

const stats = [
  { value: 'AI-Powered', label: 'Generation Engine' },
  { value: 'Seconds', label: 'Portfolio Creation Time' },
  { value: '100%', label: 'Customizable Output' },
  { value: 'Free', label: 'To Get Started' },
]

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Generate a complete, polished portfolio website in under a minute using state-of-the-art AI.',
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    desc: 'Every portfolio is crafted with premium aesthetics — dark themes, smooth animations, and recruiter-ready layouts.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Fully Customizable',
    desc: 'Chat with AI to iterate and refine your portfolio. Change colors, sections, layout, and content in real-time.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    desc: 'Enterprise-grade security with Clerk authentication, 256-bit SSL, and strict privacy controls.',
  },
  {
    icon: Cloud,
    title: 'Cloud-Hosted',
    desc: 'Your portfolio data is securely stored in the cloud and accessible from anywhere, anytime.',
  },
  {
    icon: Share2,
    title: 'Instant Publish',
    desc: 'Share your portfolio with a single link. No complicated deployment or hosting setup required.',
  },
]

export default function AboutPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Hero */}
      <div
        className="border-b relative overflow-hidden"
        style={{ borderColor: 'var(--color-border-base)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="mx-auto max-w-4xl px-6 py-20 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors hover:text-zinc-200"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1
            className="text-5xl font-bold tracking-tight mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-inter, sans-serif)' }}
          >
            Helping Professionals
            <br />
            <span style={{ color: 'var(--color-brand)' }}>Stand Out Online</span>
          </h1>
          <p
            className="text-lg leading-8 max-w-2xl"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            CraftPortfolio was built for one reason — great talent often goes unnoticed because portfolios are hard to build. We&apos;re changing that with AI.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--color-border-base)' }}
      >
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: 'var(--color-brand)', fontFamily: 'var(--font-inter, sans-serif)' }}
                >
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2
              className="text-3xl font-bold mb-5"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-inter, sans-serif)' }}
            >
              Our Mission
            </h2>
            <p className="text-sm leading-7 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              We believe every professional deserves a stunning online presence — regardless of their technical skills. Building a portfolio shouldn&apos;t take days or require a web developer.
            </p>
            <p className="text-sm leading-7 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              CraftPortfolio uses advanced AI to transform a simple description of your skills and experience into a fully functional, beautifully designed portfolio website in seconds.
            </p>
            <p className="text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              Our goal is to level the playing field — so that great talent is recognized, not hidden behind a blank page.
            </p>
          </div>
          <div
            className="p-8 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(251,191,36,0.02) 100%)',
              border: '1px solid rgba(251,191,36,0.15)',
            }}
          >
            <blockquote className="text-lg font-medium italic leading-8" style={{ color: 'var(--color-text-primary)' }}>
              &ldquo;Your portfolio is your first impression. Make it unforgettable — with the help of AI.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: 'var(--color-brand)', color: '#0d0d0d' }}
              >
                CP
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>CraftPortfolio Team</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Founders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-inter, sans-serif)' }}
          >
            What We Offer
          </h2>
          <p className="text-sm mb-10" style={{ color: 'var(--color-text-secondary)' }}>
            Everything you need to go from idea to live portfolio — in minutes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-base)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(251,191,36,0.08)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {feat.title}
                  </h3>
                  <p className="text-xs leading-5" style={{ color: 'var(--color-text-secondary)' }}>
                    {feat.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div
          className="mt-20 p-10 rounded-2xl text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.02) 100%)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-inter, sans-serif)' }}
          >
            Ready to build your portfolio?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Join thousands of professionals who trust CraftPortfolio to represent them online.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-105"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: '#0d0d0d',
                boxShadow: '0 0 24px rgba(251,191,36,0.25)',
              }}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-base)',
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
