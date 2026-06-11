import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

function AppHeader() {
  return (
  <div className='flex justify-between items-center p-5'>
    <SidebarTrigger/>
    <div className='flex gap-3'>
            <div>
            <Link href={"/pricing"}>
            <Button variant={'ghost'} className='text-base text-gray-300 p-3 hover:bg-zinc-800 hover:text-white'>Pricing</Button>
            </Link>
            <Link href={"/contact"}>
            <Button variant={'ghost'} className='text-base text-gray-300 p-3 hover:bg-zinc-800 hover:text-white'>Contact</Button>
            </Link>
            </div>
    <UserButton/>
    </div>
  </div>
  )
}

export default AppHeader