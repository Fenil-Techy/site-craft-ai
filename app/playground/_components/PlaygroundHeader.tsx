import { Button } from '@/components/ui/button'
import { OnSaveContext } from '@/context/OnSaveContext'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext } from 'react'

function PlaygroundHeader() {
  const{onSave,setOnSave}=useContext(OnSaveContext)
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/40 px-3 py-3 shadow sm:gap-3 sm:px-4 sm:py-4">
      <Link href="/workspace" className="min-w-0">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="logo" width={50} height={50} className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
        <h2 className="truncate text-base font-bold text-white sm:text-xl lg:text-2xl">
          AI <span className="text-blue-400">Craft</span><span className="text-purple-400">Ship</span>
        </h2>
      </div>
      </Link>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link href="/workspace">
        <Button size="sm" className="hidden sm:inline-flex">Make new project +</Button>
        <Button size="sm" className="sm:hidden">New +</Button>
        </Link>
        <Button size="sm" onClick={() => setOnSave(Date.now())}>Save</Button>
      </div>
    </header>
  )
}

export default PlaygroundHeader