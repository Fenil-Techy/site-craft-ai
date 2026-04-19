import React from 'react'
import { Messages } from '../[projectId]/page'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props={
  messages:Messages[]
}

function ChatSection({messages}:Props) {
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
                    <div className={`p-2 max-w-[80%] rounded-lg ${msg.role==='user'?"bg-gray-100 text-black":"bg-gray-300 text-black"}`}>
                      {msg.content}
                    </div>
                </div>
              ))
            )
          }
        </div>
        <div className=' flex border-t items-center gap-2 p-3 '>
          <textarea className='flex-1 rounded-lg border resize-none px-3 py-2 focus:outline-none focus:ring-2'/>
          <Button><ArrowUp/></Button>
        </div>
    </div>
  )
}

export default ChatSection