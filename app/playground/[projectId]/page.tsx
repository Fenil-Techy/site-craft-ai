/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesign from '../_components/WebsiteDesign'
// import SettingSection from '../_components/SettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

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

const prompt = `
You are a senior frontend engineer and world-class UI/UX designer.

Your task is to generate either:
1. A modern, production-ready website UI (if user asks for any UI/website/landing page/dashboard/ecommerce/blog)
OR
2. A helpful normal text response (if user is asking casual questions)

----------------------------

INPUT:
User Request: {userInput}

----------------------------

CASE 1 — UI GENERATION

If the user is asking for any UI or website:

You MUST generate a complete, high-quality UI using:

TECH STACK:
- HTML5
- Tailwind CSS (CDN only)
- Optional: Alpine.js (only if needed for interactions)
- Optional: Chart.js (only if charts are required)

OUTPUT RULES:
- Return ONLY <body> HTML
- No explanations, no markdown, no comments outside HTML
- Do NOT include <html>, <head>, or <!DOCTYPE>
- Start the response with exactly: [[MODE:CODE]]
- After that marker, return only the HTML body content

----------------------------

DESIGN REQUIREMENTS:
- Modern SaaS-grade UI (Stripe / Vercel / Linear style)
- Clean spacing system (p-4, p-6, gap-6)
- Rounded-xl cards
- Soft shadows (shadow-md, hover:shadow-lg)
- Subtle hover animations (duration-300, scale-105)
- Strong visual hierarchy

----------------------------

LAYOUT RULES:
Adapt layout based on user request:

- SaaS/dashboard → sidebar + navbar + analytics cards
- Landing page → hero + features + CTA + footer
- Ecommerce → product grid + filters + product cards
- Portfolio → hero + about + projects + contact
- Blog → posts grid + sidebar + categories

Always ensure layout feels complete and real (not template-like).

----------------------------

UI COMPONENTS:
Include only relevant ones:
- Navbar (clean, spaced)
- Hero section (strong headline + CTA)
- Feature sections
- Cards (consistent design)
- Tables (if needed)
- Forms (if needed)
- Footer

----------------------------

IMAGES:
- Use Unsplash images only
- Add meaningful alt text

----------------------------

RESPONSIVENESS:
- Mobile-first design
- Proper breakpoints (sm, md, lg)
- Stack layout on mobile

----------------------------

INTERACTIONS:
- Smooth transitions
- Hover effects
- Dropdowns/modals only if necessary

----------------------------

CASE 2 — NORMAL CHAT

If the user is NOT asking for UI:

Respond normally in a friendly, helpful tone.

Do NOT generate HTML.
- Start the response with exactly: [[MODE:CHAT]]
- After that marker, return only plain text response

----------------------------

FINAL RULE:
Make the UI feel like a real startup product, not AI-generated.
Avoid generic layouts. Always adapt to the user’s intent.
Do not output anything before the mode marker.
`;

function Playground() {
    const{projectId}=useParams()
    const params=useSearchParams()
    const frameId=params.get('frameId')
    const [frameDetail,setFrameDetail]=useState<Frame>()
    const[loading,setLoading]=useState(false)
    const[generatedCode,setGeneratedCode]=useState<string>("")

    const [messages,setMessages]=useState<Messages[]>()

    useEffect(()=>{
      if(!frameId) return 
      void axios.get(`/api/frames?frameId=${frameId}&projectId=${projectId}`).then((result)=>{
        console.log(result.data)
        setFrameDetail(result.data)
        const designCode = result.data?.designCode;
        const hasStoredDesignCode =
          typeof designCode === "string" && designCode.trim().length > 0;
        if (hasStoredDesignCode) {
          const codeFence = "```html";
          const index = designCode.indexOf(codeFence);
          const formattedCode =
            index >= 0
              ? designCode.slice(index + codeFence.length).trimStart()
              : designCode;
          setGeneratedCode(formattedCode);
        } else {
          setGeneratedCode("");
        }
        setMessages(result.data?.chatMessages ?? []);
        if(result.data?.chatMessages?.length===1 && !hasStoredDesignCode){
          const userMsg=result.data?.chatMessages[0].content
          // eslint-disable-next-line react-hooks/immutability
          SendMessage(userMsg)
        }
      })
    },[frameId,projectId])
    
    const SendMessage = async (userInput: string) => {
      setGeneratedCode("");
      setLoading(true);
    
      // add user message
      setMessages((prev: any) => [
        ...(prev || []),
        { role: "user", content: userInput },
      ]);
    
      try {
        const res = await fetch("/api/ai-model", {
          method: "POST",
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: prompt?.replace('{userInput}',userInput),
              },
            ],
          }),
        });
    
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        let fullText = "";
        let rawResponse = "";
        let eventBuffer = "";
        let mode: "code" | "chat" | null = null;
    
        // reset previous code
        setGeneratedCode("");
    
        while (true) {
          const { done, value }: any = await reader?.read();
          if (done) break;
    
          const chunk = decoder.decode(value, { stream: true });

          eventBuffer += chunk;
          const lines = eventBuffer.split("\n");
          eventBuffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;
            if (!line.startsWith("data: ")) continue;
    
            const data = line.replace("data: ", "");
    
            if (data === "[DONE]") break;
    
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices[0]?.delta?.content;
    
              if (!text) continue;
    
              rawResponse += text;

              if (!mode) {
                const modeMatch = rawResponse.match(/^\s*\[\[MODE:(CODE|CHAT)\]\]/);
                if (modeMatch) {
                  mode = modeMatch[1] === "CODE" ? "code" : "chat";
                }
              }

              const cleanedText = rawResponse
                .replace(/^\s*\[\[MODE:(?:CODE|CHAT)\]\]\s*/, "");
              fullText = cleanedText;

              if (mode === "code") {
                setGeneratedCode(cleanedText);
              }
            } catch {}
          }
        }

        // fallback when model misses marker
        if (!mode) {
          const htmlSignal = /<(main|section|div|header|footer|nav|article|aside|form|body)\b/i;
          mode = htmlSignal.test(fullText) ? "code" : "chat";
        }
    
        // ✅ final message depends on type
        setMessages((prev: any) => [
          ...(prev || []),
          {
            role: "assistant",
            content: mode === "code"
              ? "Your beautiful website code is ready"
              : fullText,
            },
          ]);
          if (mode === "code") {
            await SaveGeneratedCode(fullText);
          }
      } catch (error) {
        console.error("Error:", error);
        
        setMessages((prev: any) => [
          ...(prev || []),
          {
            role: "assistant",
            content: "Something went wrong",
          },
        ]);
      }
      setLoading(false);
    };
    
    useEffect(()=>{
     
      if(messages && messages.length>0 && !loading){
        // eslint-disable-next-line react-hooks/immutability
        SaveMessages()
      }
    },[messages])

    const SaveMessages=async ()=>{
      const result=await axios.put("/api/chats",{
        messages:messages,
        frameId:frameId
      })
    }


    const SaveGeneratedCode=async(code:string)=>{
      const result = await axios.put("/api/frames",{
        designCode:code,
        frameId:frameId,projectId:projectId
      })
      console.log(result.data)
      toast.success("website is ready")
    }

  return (
    <div>
        <PlaygroundHeader/>
        <div className='flex'>
        <ChatSection messages={messages ?? []} onSend={(input:string)=>SendMessage(input)} loading={loading}/>
        <WebsiteDesign generatedCode={generatedCode}/>
        
        </div>
    </div>
  )
}

export default Playground