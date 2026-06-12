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
    <div className="flex h-full w-full min-h-0 flex-col border-t border-border p-3 shadow sm:p-4 lg:h-full lg:w-80 lg:min-w-72 lg:max-w-96 lg:border-r lg:border-t-0 xl:w-96">
        <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto p-1 sm:p-2">
          {
            messages.length==0?
            (
              <p className='text-gray-400 text-center'>No Messages Yet!</p>
            ):
            (
              messages.map((msg,index)=>(
                <div key={index} className={`flex ${msg.role==='user'?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg p-2 text-sm sm:text-base wrap-break-word ${msg.role==='user'?"bg-gray-900 text-gray-200":"bg-gray-300 text-black"}`}>
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
        <div className="shrink-0 flex items-end gap-2 border-t p-2 sm:p-3">
          <textarea
            className="min-h-10 max-h-28 flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 sm:text-base"
            placeholder="Describe your changes..."
            rows={2}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <Button className="shrink-0" onClick={handleSend}>
            {loading ? <Loader2Icon className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
    </div>
  )
}

export default ChatSection