'use client'
import Link from 'next/link'
import React from 'react'
import { Mail, Lock } from 'lucide-react'

const footerLinks = {
  Product: [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Workspace', href: '/workspace' },
  ],
  Company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms-and-conditions' },
  ],
}

function Footer() {
  return (
    <footer
      className="w-full mt-auto"
      style={{
        borderTop: '1px solid var(--color-border-base)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      {/* Main footer content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="CraftPortfolio home">
              <img src="/logo.png" alt="CraftPortfolio logo" width={28} height={28} className="h-7 w-7" />
              <span
                className="text-base font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-inter, sans-serif)', color: 'var(--color-text-primary)' }}
              >
                Craft<span style={{ color: 'var(--color-brand)' }}>Portfolio</span>
              </span>
            </Link>
            <p className="text-xs leading-5 mb-5" style={{ color: 'var(--color-text-tertiary)' }}>
              AI-powered portfolio builder. Generate a professional portfolio website in seconds.
            </p>
            <a
              href="mailto:fenilkapopara34@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs transition-colors hover:underline"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <Mail className="w-3 h-3" />
              fenilkapopara34@gmail.com
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-zinc-200"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: 'var(--color-border-base)' }}
      >
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            © {new Date().getFullYear()} CraftPortfolio. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <Lock className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            256-bit SSL Secured
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
