'use client';
import { Button } from '@/components/ui/button'
import UserDetailContext from '@/context/UserDetailContext';
import { SignInButton, useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { ArrowUp, ImagePlus, Layout, LayoutDashboard, Loader2Icon, ShoppingCart, Sparkles, User } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react'
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';
import { v4 as uuidv4 } from 'uuid';
function Hero() {
  const router = useRouter()
  const [userInput, setUserInput] = useState<string>()
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const context = useContext(UserDetailContext)

  if (!context) {
    throw new Error("UserDetailContext not provided")
  }

  const { userDetail, setUserDetail } = context
  const { has } = useAuth()
  const hasUnlimitedAcess = has({ plan: 'pro' })

  const CreateNewProject = async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    if (!hasUnlimitedAcess && userDetail?.credits! <= 0) {
      toast.error("You have no credits left. Please upgrade to unlimited")
      return;
    }

    setLoading(true)
    const projectId = uuidv4()
    const frameId = generateRandomFrameNumber()
    const messages = [{
      role: "user",
      content: userInput
    }]
    try {
      const result = await axios.post("/api/projects", {
        projectId: projectId,
        frameId: frameId,
        messages: messages,
        credits: userDetail?.credits
      })
      console.log(result.data)
      toast.success('Project created')
      router.push(`/playground/${projectId}?frameId=${frameId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUserDetail((prev: any) => ({
        ...prev,
        credits: prev?.credits - 1
      }))
      setLoading(false)
    } catch (error) {
      toast.error("Internal server error")
      console.log(error)
    }
  }

  const suggestions = [
    {
      label: "SaaS Dashboard",
      prompt:
        "Create an analytics dashboard for a SaaS product to track users, revenue, subscriptions, and key business metrics with charts and KPIs.",
      icon: LayoutDashboard,
    },
    {
      label: "Landing Page",
      prompt:
        "Create a high-converting landing page for a startup or SaaS product with hero section, features, pricing, testimonials, and CTA.",
      icon: Layout,
    },
    {
      label: "E-commerce Store",
      prompt:
        "Build a modern e-commerce website with product listings, filters, product detail pages, cart, and checkout flow.",
      icon: ShoppingCart,
    },
    {
      label: "Portfolio Website",
      prompt:
        "Create a clean personal portfolio website to showcase projects, skills, experience, and contact information.",
      icon: User,
    },
    {
      label: "AI Startup Website",
      prompt:
        "Build a futuristic AI startup website explaining the product, features, use cases, pricing, and include a strong call-to-action.",
      icon: Sparkles,
    },
  ];
  if (!isLoaded) {
    return <div className='flex items-center justify-center h-[80vh]'><Loader/></div>
  }
  return (
    <div className="relative flex flex-col items-center justify-center h-[80vh]">

      {/* Background Gradient */}
      <div className="absolute -top-60 left-1/2 -translate-x-1/2 h-[800px] w-[800px] rounded-full bg-blue-500 opacity-20 blur-3xl -z-10"></div>

      {/* Bottom left blob */}
      <div className="absolute bottom-0 left-20 h-[500px] w-[500px] rounded-full bg-purple-500 opacity-20 blur-3xl -z-10"></div>
      {/* header & description */}
      <h2 className='text-6xl font-bold text-white'>Want to build your own website?</h2>
      <p className='text-2xl text-gray-300 mt-4'>Craft your website with AI and get it done in minutes</p>

      {/* Input box */}
      <div className='w-full max-w-2xl border mt-5 p-5 rounded-2xl bg-black'>
        <textarea placeholder='Describe how your dream website should looks like' className='h-24 w-full focus:outline-none focus:ring-0 resize-none text-white' onChange={(e) => setUserInput(e.target.value)} value={userInput}></textarea>
        <div className='flex justify-between items-center'>
          <Button variant={'default'} size={'icon-lg'}><ImagePlus /></Button>
          {
            !user ?
              <SignInButton mode='modal' forceRedirectUrl={"/workspace"}>
                <Button disabled={!userInput}><ArrowUp /></Button>
              </SignInButton> :
              <Button disabled={!userInput} onClick={CreateNewProject}>{loading ? <Loader2Icon className='animate-spin' /> : <ArrowUp />}</Button>
          }
        </div>
      </div>
      {/* suggestions list */}
      <div className='w-full max-w-xl mx-auto grid grid-cols-3 gap-3 mt-5 justify-items-center'>
        {
          suggestions.map((sug, index) => (
            <Button key={index} variant={'heroButton'}  onClick={() => setUserInput(sug.prompt)}>
              <sug.icon />
              {sug.label}
            </Button>
          ))
        }
      </div>
    </div>
  )
}

export default Hero

const generateRandomFrameNumber = () => {
  const num = Math.floor(Math.random() * 10000);
  return num
}