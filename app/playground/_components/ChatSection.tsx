'use client'
import React, { useState } from 'react'
import { Messages } from '../[projectId]/page'
import { ArrowUp, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'

type Props={
  messages:Messages[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSend:any
  loading:boolean
}

function ChatSection({messages,onSend,loading}:Props) {

  const [input,setInput]=useState<string>()

  const handleSend=()=>{
    if(!input?.trim()) return;

    onSend(input)
    setInput("")
  }

  return (
    <div className='w-96 h-[91vh] shadow p-4 flex flex-col'>
        <div className='flex-1 overflow-y-auto p-4 space-y-3 flex flex-col'>
          {
            messages.length==0?
            (
              <p className='text-gray-400 text-center'>No Messages Yet!</p>
            ):
            (
              messages.map((msg,index)=>(
                <div key={index} className={` flex ${msg.role==='user'?"justify-end":"justify-start"}`}>
                    <div className={`p-2 max-w-[80%] rounded-lg ${msg.role==='user'?"bg-gray-900 text-gray-200":"bg-gray-300 text-black"}`}>
                      {msg.content}
                    </div>
                </div>
              ))
            )
          }
          {loading&&
          <div className='flex justify-start items-center p-4 gap-2'>
            <Loader size={28}/>
            <p>Thinking...</p>
          </div>
          }
        </div>
        <div className=' flex border-t items-center gap-2 p-3 '>
          <textarea className='flex-1 rounded-lg border resize-none px-3 py-2 focus:outline-none focus:ring-2'onChange={(e)=>setInput(e.target.value)} value={input}/>
          <Button onClick={handleSend}>{loading?<Loader2Icon className='animate-spin'/>:<ArrowUp/>}</Button>
        </div>
    </div>
  )
}

export default ChatSection