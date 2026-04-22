import { Button } from '@/components/ui/button'
import { OnSaveContext } from '@/context/OnSaveContext'
import Image from 'next/image'
import React, { useContext } from 'react'

function PlaygroundHeader() {
  const{onSave,setOnSave}=useContext(OnSaveContext)
  return (
    <div className='flex justify-between items-center p-4 shadow'>
        <Image src={'/logo.png'} alt='logo' width={40} height={40}/>
        <Button onClick={()=>setOnSave(Date.now())}>Save</Button>
    </div>
  )
}

export default PlaygroundHeader