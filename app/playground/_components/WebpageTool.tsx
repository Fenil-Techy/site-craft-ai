/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Code, Code2Icon, Download, MonitorIcon, PhoneIcon, Smartphone, SquareArrowOutUpRightIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { ViewCodeBlock } from './ViewCodeBlock'

const HTML_CODE=`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
          <title>AI Website Builder</title>

          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>

          <!-- Flowbite CSS & JS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

          <!-- Font Awesome / Lucide -->
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

          <!-- Chart.js -->
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

          <!-- AOS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>

          <!-- GSAP -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

          <!-- Lottie -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.2/lottie.min.js"></script>

          <!-- Swiper -->
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
          <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

          <!-- Tippy.js -->
          <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
          <script src="https://unpkg.com/@popperjs/core@2"></script>
          <script src="https://unpkg.com/tippy.js@6"></script>
      </head>
      <body id="root">
{code}
</body>
      </html>`

function WebpageTool({screenSize,setScreenSize,code}:any) {
    const[finalCode,setFinalCode]=useState<string>("")
    useEffect(()=>{
        const cleanCode=(HTML_CODE.replace('{code}',code)||"").replaceAll("```html",'').replace("```",'').replace('html','')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFinalCode(cleanCode)
    },[code])
    const ViewInNewTab=()=>{
        if(!finalCode) return 

        
        const blob=new Blob([finalCode||""],{type:"text/html"})
        const url=URL.createObjectURL(blob)
        window.open(url,"_blank")
    }
    const downloadButton=()=>{
        const blob=new Blob([finalCode||""],{type:"text/html"})
        const url=URL.createObjectURL(blob)
        const a=document.createElement('a')
        a.href=url;
        a.download='index.html';
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

    }
  return (
    <div className='w-full p-2 rounded-xl border-2 flex justify-between items-center'>
        <div className='flex gap-2'>
            <Button variant={'ghost'} onClick={()=>setScreenSize('desktop')} className={`${screenSize=='desktop'?"border-primary":null}`}><MonitorIcon/></Button>
            <Button variant={'ghost'} onClick={()=>setScreenSize('mobile')}  className={`${screenSize=='mobile'?"border-primary":null}`}><Smartphone/></Button>
            
        </div>
        <div className='flex gap-2'>
            <Button variant={'outline'} onClick={()=>ViewInNewTab()}>View <SquareArrowOutUpRightIcon/></Button>
            <ViewCodeBlock code={finalCode}>
            <Button>Code<Code2Icon/></Button>
            </ViewCodeBlock>
            <Button onClick={downloadButton}>Download<Download/></Button>
        </div>
    </div>
  )
}

export default WebpageTool