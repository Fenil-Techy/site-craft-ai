'use client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

function AppHeader() {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 py-3"
      style={{
        backgroundColor: 'rgb(13 13 13 / 80%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border-base)',
      }}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger
          className="shrink-0 transition-colors duration-100"
          style={{ color: 'var(--color-text-secondary)' }}
        />
      </div>

      {/* Empty space right align - header has no profile or pricing tabs anymore as requested */}
      <div className="flex items-center gap-3" />
    </header>
  )
}

export default AppHeader