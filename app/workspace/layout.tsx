import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from './_components/app-sidebar'
import AppHeader from './_components/AppHeader'

function WorkSpaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="relative flex w-full min-h-screen flex-col overflow-hidden">
        <AppHeader />
        {children}
      </div>
    </SidebarProvider>
  )
}

export default WorkSpaceLayout