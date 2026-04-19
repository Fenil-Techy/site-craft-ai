'use client'
import React, { useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesign from '../_components/WebsiteDesign'
// import SettingSection from '../_components/SettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'

export type Messages={
  role:string,
  content:string
}
export type Frame={
  projectId:string,
  frameId:string,
  designCode:string,
  chatMessages:Messages[]
}

function Playground() {
    const{projectId}=useParams()
    const params=useSearchParams()
    const frameId=params.get('frameId')
    const [frameDetail,setFrameDetail]=useState<Frame>()
    useEffect(()=>{
      if(!frameId) return 
      void axios.get(`/api/frames?frameId=${frameId}&projectId=${projectId}`).then((result)=>{
        console.log(result.data)
        setFrameDetail(result.data)
      })
    },[frameId,projectId])
    
  return (
    <div>
        <PlaygroundHeader/>
        <div className='flex'>
        <ChatSection messages={frameDetail?.chatMessages??[]}/>
        <WebsiteDesign/>
        {/* <SettingSection/> */}
        </div>
    </div>
  )
}

export default Playground