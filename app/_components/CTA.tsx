'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function CTA() {
  return (
    <section className="w-full py-16 bg-zinc-950/20" style={{ borderTop: '1px solid var(--color-border-base)' }}>
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Glowing Gradient Banner Container */}
        <div 
          className="w-full rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-6 relative overflow-hidden border border-white/5 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgb(88 28 135 / 75%) 0%, rgb(49 46 129 / 75%) 50%, rgb(20 20 23 / 90%) 100%)',
          }}
        >
          {/* Inner ambient glows */}
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          {/* Heading */}
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight max-w-2xl font-bold text-white z-10"
            style={{ fontFamily: 'var(--font-inter, sans-serif)' }}
          >
            Ready to turn your professional story into a stunning site?
          </h2>

          {/* Action button */}
          <div className="z-10 mt-2">
            <Link href="/workspace">
              <button 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-100 transition-all duration-100 shadow-xl shadow-black/20"
              >
                Start for free
                <ArrowRight className="h-4 w-4 text-zinc-950" />
              </button>
            </Link>
          </div>

          {/* Sub-label */}
          <p className="text-xs text-zinc-400 z-10">
            No credit card required. Generate in under 60 seconds.
          </p>

        </div>
      </div>
    </section>
  )
}

export default CTA
