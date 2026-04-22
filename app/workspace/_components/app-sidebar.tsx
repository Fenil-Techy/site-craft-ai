/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import UserDetailContext from "@/context/UserDetailContext"
import { UserButton } from "@clerk/nextjs"
import axios from "axios"
import { Loader2Icon } from "lucide-react"

import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import { json } from "stream/consumers"


export function AppSidebar() {
    const [projectList, setProjectList] = useState<any[]>([])
    const[loading,setLoading]=useState(false)
    const context = useContext(UserDetailContext)

    if (!context) {
        throw new Error("UserDetailContext not provided")
    }

    const { userDetail, setUserDetail } = context

    useEffect(()=>{
        const cached=localStorage.getItem("projects")
        if(cached){
            setProjectList(JSON.parse(cached))
            // eslint-disable-next-line react-hooks/immutability
            getProjectList(false)
        }
        // eslint-disable-next-line react-hooks/immutability
        else{getProjectList(true)}
    },[])

    const getProjectList = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true)
    
            const result = await axios.get("/api/project_list")
            setProjectList(result.data)
            localStorage.setItem("projects", JSON.stringify(result.data))
        } catch (error) {
            console.error(error)
        } finally {
            if (showLoader) setLoading(false)
        }
    }
   
    return (
        <Sidebar>
            <SidebarHeader className="p-5">
                <div className="flex gap-2 items-center">
                    <Image src={"/logo.png"} alt="logo" width={50} height={50} />
                    <h2 className="font-bold text-2xl">AI CraftShip</h2>
                </div>
                <Button className="mt-5 w-full p-5" >
                    + Make New Website
                </Button>
            </SidebarHeader>

            <SidebarContent className="p-2">
                <SidebarGroupLabel className="font-bold text-2xl">Projects</SidebarGroupLabel>
                <SidebarGroup >
                    <div>
                    {
                       loading? [1,2,3,4,5].map((_,index)=>(
                            <Skeleton key={index} className="w-full h-10 rounded-2xl mt-2"/>
                        ))
                        :
                        projectList.length === 0?
                        <div className="text-gray-500">No Project Found!</div>
                        :
                        projectList.map((project:any,index)=>(
                            <Link key={project.id} href={`/playground/${project.projectId}?frameId=${project.frameId}`}>
                            <div key={project.id} className=" p-2 hover:rounded-2xl hover:bg-gray-200 ">
                               <h2 className="line-clamp-2">
                                {project?.chats[0].chatMessage[0].content||"Untitled Project"}
                                </h2>
                            </div>
                            </Link>
                        ))
                    }
                    </div>
                    
                    
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="mb-5">
                <div className="p-3 space-y-3 bg-secondary border rounded-2xl">
                    <h2 className="font-bold">Remaining Credits : <span>{!userDetail?<Loader2Icon className="animate-spin"/>:userDetail.credits }</span></h2>
                    <Progress value={33}/>
                    <Button className="w-full p-5">Upgrade to Unlimited</Button>
                </div>
                <div className="flex items-center gap-3">
                <UserButton/>
                <Button variant={'ghost'} >Settings</Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}