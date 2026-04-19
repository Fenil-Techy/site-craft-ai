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
import UserDetailContext from "@/context/UserDetailContext"
import { UserButton } from "@clerk/nextjs"
import Image from "next/image"
import { useContext, useState } from "react"


export function AppSidebar() {
    const [projectList, setProjectList] = useState([])
    const context = useContext(UserDetailContext)

    if (!context) {
        throw new Error("UserDetailContext not provided")
    }

    const { userDetail, setUserDetail } = context
    if(!userDetail){
        return <div>Loading...</div>
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
                    {
                        projectList.length === 0 &&
                        <div className="text-gray-500">No Project Found!</div>
                    }
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="mb-5">
                <div className="p-3 space-y-3 bg-secondary border rounded-2xl">
                    <h2 className="font-bold">Remaining Credits : <span>{userDetail.credits}</span></h2>
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