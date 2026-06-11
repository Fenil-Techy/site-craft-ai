import { Button } from '@/components/ui/button'
import { OnSaveContext } from '@/context/OnSaveContext'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext } from 'react'

function PlaygroundHeader() {
  const{onSave,setOnSave}=useContext(OnSaveContext)
  return (
    <div className='flex justify-between items-center p-4 shadow'>
      <Link href={"/workspace"}>
      <div className='flex gap-2 items-center'>
        <Image src="/logo.png" alt="logo" width={50} height={50} />
        <h2 className='text-2xl font-bold text-white'>AI <span className='text-blue-400'>Craft</span><span className='text-purple-400'>Ship</span></h2>
      </div>
      </Link>
      <div className='flex gap-2'>
        <Link href={"/workspace"}>
        <Button>Make new project +</Button>
        </Link>
        <Button onClick={()=>setOnSave(Date.now())}>Save</Button>
      </div>
    </div>
  )
}

export default PlaygroundHeader