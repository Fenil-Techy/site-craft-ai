'use client'
import Link from 'next/link'
import React from 'react'

function Footer() {
  return (
    <footer
      className="w-full py-8 mt-auto"
      style={{
        borderTop: '1px solid var(--color-border-base)',
        backgroundColor: 'var(--color-bg-surface)'
      }}
    >
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-1.5 text-base font-bold tracking-tight select-none" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
          <span style={{ color: 'var(--color-text-primary)' }}>Craft</span>
          <span style={{ color: 'var(--color-brand)' }}>Portfolio</span>
          <span className="ml-1 text-[10px] text-zinc-500 font-normal">© {new Date().getFullYear()}</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</Link>
          <Link href="/workspace" className="hover:text-zinc-300 transition-colors">Workspace</Link>
          <a href="https://craftportfolio.online" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
            Official Site
          </a>
        </div>

        {/* Security / Privacy line */}
        <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
          🔒 Secure 256-bit SSL checkout
        </p>

      </div>
    </footer>
  )
}

export default Footer
