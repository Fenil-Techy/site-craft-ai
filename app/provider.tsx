'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import UserDetailContext from '@/context/UserDetailContext'
function Provider({
    children,
  }: {
    children: React.ReactNode
  }) {

    const [userDetail,setUserDetail]=useState<AppUser | null>(null)

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
        {children}
        </UserDetailContext.Provider>
        </div>
  )
}

export default Provider