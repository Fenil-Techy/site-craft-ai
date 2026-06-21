'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import UserDetailContext from '@/context/UserDetailContext'
import { OnSaveContext } from '@/context/OnSaveContext'
import posthog from 'posthog-js'


function Provider({
    children,
  }: {
    children: React.ReactNode
  }) {

    const [userDetail, setUserDetail] = useState<AppUser | null>(null)
    const [onSave, setOnSave] = useState<number | null>(null)

    const{user}=useUser()

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
        if (key) {
          posthog.init(key, {
            api_host: host,
            person_profiles: 'identified_only',
          });
        }
      }
    }, []);

    useEffect(()=>{
        if(!user) return

        void axios.post('/api/users/',{}).then((result)=>{
            const dbUser = result.data?.user;
            setUserDetail(dbUser ?? null)

            // Identify user in PostHog for A/B testing and flags
            if (dbUser && typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
              posthog.identify(dbUser.clerkId || user.id, {
                email: dbUser.email,
                name: dbUser.name,
              });
            }
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