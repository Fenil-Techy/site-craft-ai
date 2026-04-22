'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import UserDetailContext from '@/context/UserDetailContext'
import { OnSaveContext } from '@/context/OnSaveContext'
function Provider({
    children,
  }: {
    children: React.ReactNode
  }) {

    const [userDetail,setUserDetail]=useState<AppUser | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const[onSave,setOnSave]=useState<any>(null)

    const{user}=useUser()

    useEffect(()=>{
        if(!user) return

        void axios.post('/api/users/',{}).then((result)=>{
            console.log(result.data)
            setUserDetail(result.data?.user ?? null)
        })
    },[user])

  return (
    <div>
        <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
          <OnSaveContext.Provider value={{onSave,setOnSave}}>
        {children}
          </OnSaveContext.Provider>
        </UserDetailContext.Provider>
        </div>
  )
}

export default Provider