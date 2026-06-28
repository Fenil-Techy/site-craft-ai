/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnSaveContext } from '@/context/OnSaveContext'
import Image from 'next/image'
import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'
import {
  Download, MonitorIcon, Smartphone, SquareArrowOutUpRightIcon,
  Code2Icon, Save, MousePointer2, MousePointer2Off, CheckCircle2
} from 'lucide-react'
import { ViewCodeBlock } from './ViewCodeBlock'
import { hasWatermark } from '@/config/features'

const HTML_CODE = `<!DOCTYPE html>
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

          <!-- Custom scrollbar styles inside preview iframe -->
          <style>
            ::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            ::-webkit-scrollbar-track {
              background: #0d0d0d;
            }
            ::-webkit-scrollbar-thumb {
              background: #262626;
              border-radius: 9999px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #44403c;
            }
            * {
              scrollbar-width: thin;
              scrollbar-color: #262626 #0d0d0d;
            }
          </style>
      </head>
      
{code}

      </html>`

type PlaygroundHeaderProps = {
  screenSize: string
  setScreenSize: (size: string) => void
  code: string
  tier: string
  liveEditorEnabled: boolean
  onToggleLiveEditor: () => void
  projectTitle?: string
  onUpdateTitle?: (newTitle: string) => Promise<void> | void
}

function PlaygroundHeader({
  screenSize,
  setScreenSize,
  code,
  tier,
  liveEditorEnabled,
  onToggleLiveEditor,
  projectTitle = "Untitled Project",
  onUpdateTitle
}: PlaygroundHeaderProps) {
  const context = useContext(OnSaveContext)
  if (!context) throw new Error('OnSaveContext not provided')
  const { setOnSave } = context
  const [isSaving, setIsSaving] = useState(false)
  const [savedRecently, setSavedRecently] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitleValue, setEditingTitleValue] = useState(projectTitle)

  useEffect(() => {
    setEditingTitleValue(projectTitle)
  }, [projectTitle])

  useEffect(() => {
    if (isSaving) {
      const timer = setTimeout(() => {
        setIsSaving(false)
        setSavedRecently(true)
        setTimeout(() => setSavedRecently(false), 2000)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isSaving])

  const finishEditingTitle = async () => {
    setIsEditingTitle(false)
    if (editingTitleValue.trim() && editingTitleValue !== projectTitle) {
      setIsSaving(true)
      try {
        if (onUpdateTitle) {
          await onUpdateTitle(editingTitleValue.trim())
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsSaving(false)
        setSavedRecently(true)
        setTimeout(() => setSavedRecently(false), 2000)
      }
    }
  }

  const finalCode = useMemo(() => {
    let cleanCode = (HTML_CODE.replace("{code}", code) || "")
      .replaceAll("```html", "")
      .replaceAll("```", "")
      .replace("html", "")

    if (hasWatermark(tier) && !cleanCode.includes("CraftPortfolio")) {
      const watermarkHtml = `
  <!-- CraftPortfolio Watermark -->
  <div class="w-full text-center py-8 text-xs text-zinc-500/60 border-t border-zinc-100/10 mt-12 bg-transparent pointer-events-auto">
    <a href="https://craftportfolio.online" target="_blank" class="inline-flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
      <span>Made with</span>
      <span class="font-semibold" style="color:#fbbf24">Craft</span><span class="font-semibold" style="color:#a8a29e">Portfolio</span>
    </a>
  </div>`
      if (cleanCode.includes("</body>")) {
        cleanCode = cleanCode.replace("</body>", `${watermarkHtml}\n</body>`)
      } else {
        cleanCode += watermarkHtml
      }
    }
    return cleanCode
  }, [code, tier])

  const ViewInNewTab = () => {
    if (!finalCode) return
    const blob = new Blob([finalCode], { type: "text/html" })
    window.open(URL.createObjectURL(blob), "_blank")
  }

  const downloadButton = () => {
    const blob = new Blob([finalCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'index.html'
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const handleSaveTrigger = () => {
    setIsSaving(true)
    setOnSave(Date.now())
  }

  // Icon button base style
  const iconBtn = {
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-base)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: `all var(--duration-fast) var(--ease-out)`,
    flexShrink: 0,
  } as React.CSSProperties

  const textBtn = {
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-base)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all var(--duration-fast) var(--ease-out)`,
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties

  const hoverStyle = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
    const el = e.currentTarget as HTMLElement
    el.style.backgroundColor = enter ? 'var(--color-bg-surface)' : 'transparent'
    el.style.color = enter ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
  }

  return (
    <header
      className="sticky top-0 z-50 flex h-18 items-center justify-between px-3 sm:px-4 md:px-6"
      style={{
        backgroundColor: 'rgb(13 13 13 / 90%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border-base)',
      }}
    >
      {/* Logo & Project Title */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/workspace" className="flex items-center gap-2">
          <img src="/logo.png?v=3" alt="CraftPortfolio" width={32} height={32} className="h-8 w-8" />
          <span
            className="hidden md:block text-lg font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-inter, sans-serif)', color: 'var(--color-text-primary)' }}
          >
            Craft<span style={{ color: 'var(--color-brand)' }}>Portfolio</span>
          </span>
        </Link>
        
        <span className="hidden sm:block text-zinc-800">/</span>

        {/* Editable Title */}
        <div className="hidden sm:block min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={editingTitleValue}
              onChange={e => setEditingTitleValue(e.target.value)}
              onBlur={finishEditingTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') finishEditingTitle()
                if (e.key === 'Escape') {
                  setEditingTitleValue(projectTitle)
                  setIsEditingTitle(false)
                }
              }}
              autoFocus
              className="bg-transparent border-b border-zinc-700 px-1 py-0.5 text-xs text-zinc-200 outline-none focus:border-brand focus:border-b"
              style={{ width: `${Math.max(editingTitleValue.length * 7.5, 90)}px` }}
            />
          ) : (
            <span
              onClick={() => {
                setEditingTitleValue(projectTitle)
                setIsEditingTitle(true)
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-850/50 block truncate max-w-[150px] font-medium"
              title="Click to rename project"
            >
              {projectTitle}
            </span>
          )}
        </div>

        <span className="hidden sm:block text-zinc-800">/</span>

        {/* Save Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500 select-none shrink-0">
          <div className={`h-1.5 w-1.5 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span>{isSaving ? 'Saving...' : 'Saved'}</span>
        </div>
      </div>

      {/* Center — Screen size toggle */}
      <div
        className="hidden lg:flex items-center gap-0.5 p-1 rounded-lg"
        style={{ backgroundColor: 'var(--color-bg-raised)', border: '1px solid var(--color-border-base)' }}
      >
        {[
          { size: 'desktop', icon: MonitorIcon, label: 'Desktop preview' },
          { size: 'mobile', icon: Smartphone, label: 'Mobile preview' },
        ].map(({ size, icon: Icon, label }) => (
          <button
            key={size}
            onClick={() => setScreenSize(size)}
            aria-label={label}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-100"
            style={{
              backgroundColor: screenSize === size ? 'var(--color-bg-overlay)' : 'transparent',
              color: screenSize === size ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              border: screenSize === size ? '1px solid var(--color-border-strong)' : '1px solid transparent',
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">

        {/* Live editor toggle — text (sm+) */}
        <button
          onClick={onToggleLiveEditor}
          aria-label={liveEditorEnabled ? "Disable live editor" : "Enable live editor"}
          title={liveEditorEnabled ? "Live editor ON" : "Live editor OFF"}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-100"
          style={liveEditorEnabled
            ? { backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-border)', color: 'var(--color-brand)' }
            : { backgroundColor: 'transparent', border: '1px solid var(--color-border-base)', color: 'var(--color-text-secondary)' }
          }
        >
          {liveEditorEnabled
            ? <MousePointer2 className="h-3.5 w-3.5" />
            : <MousePointer2Off className="h-3.5 w-3.5" />
          }
          {liveEditorEnabled ? "Editor On" : "Editor Off"}
        </button>

        {/* Live editor icon — mobile */}
        <button
          onClick={onToggleLiveEditor}
          aria-label="Toggle live editor"
          className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-100"
          style={liveEditorEnabled
            ? { backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-border)', color: 'var(--color-brand)' }
            : { backgroundColor: 'transparent', border: '1px solid var(--color-border-base)', color: 'var(--color-text-secondary)' }
          }
        >
          {liveEditorEnabled ? <MousePointer2 className="h-4 w-4" /> : <MousePointer2Off className="h-4 w-4" />}
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px" style={{ backgroundColor: 'var(--color-border-base)' }} />

        {/* View — icon (mobile) */}
        <button style={iconBtn} onClick={ViewInNewTab} aria-label="Open in new tab" className="flex sm:hidden"
          onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
          <SquareArrowOutUpRightIcon className="h-3.5 w-3.5" />
        </button>

        {/* View — text (sm+) */}
        <button style={textBtn} onClick={ViewInNewTab} className="hidden sm:flex"
          onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
          <SquareArrowOutUpRightIcon className="h-3.5 w-3.5" />
          View
        </button>

        {/* Code */}
        <ViewCodeBlock code={finalCode}>
          <div className="inline-flex">
            <button style={iconBtn} aria-label="View code" className="flex sm:hidden"
              onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
              <Code2Icon className="h-3.5 w-3.5" />
            </button>
            <button style={textBtn} className="hidden sm:flex"
              onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
              <Code2Icon className="h-3.5 w-3.5" />
              Code
            </button>
          </div>
        </ViewCodeBlock>

        {/* Download — icon (mobile) */}
        <button style={iconBtn} onClick={downloadButton} aria-label="Download HTML" className="flex sm:hidden"
          onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
          <Download className="h-3.5 w-3.5" />
        </button>

        {/* Download — text (sm+) */}
        <button style={textBtn} onClick={downloadButton} className="hidden sm:flex"
          onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
          <Download className="h-3.5 w-3.5" />
          Download
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px" style={{ backgroundColor: 'var(--color-border-base)' }} />

        {/* Save — icon (mobile) */}
        <button
          style={{
            ...iconBtn,
            backgroundColor: 'var(--color-brand)',
            color: 'var(--color-text-invert)',
            border: 'none',
          }}
          onClick={handleSaveTrigger}
          disabled={isSaving}
          aria-label="Save"
          className="flex sm:hidden disabled:opacity-60"
        >
          {savedRecently
            ? <CheckCircle2 className="h-3.5 w-3.5" />
            : <Save className={`h-3.5 w-3.5 ${isSaving ? 'animate-spin' : ''}`} />
          }
        </button>

        {/* Save — text (sm+) */}
        <button
          style={{
            ...textBtn,
            backgroundColor: savedRecently ? 'var(--color-success)' : 'var(--color-brand)',
            color: savedRecently ? 'var(--onyx-950)' : 'var(--color-text-invert)',
            border: 'none',
            boxShadow: 'var(--shadow-brand)',
          }}
          onClick={handleSaveTrigger}
          disabled={isSaving}
          className="hidden sm:flex disabled:opacity-60"
          onMouseEnter={e => {
            if (!savedRecently) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-hover)';
          }}
          onMouseLeave={e => {
            if (!savedRecently) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand)';
          }}
        >
          {savedRecently ? (
            <><CheckCircle2 className="h-3.5 w-3.5" /> Saved</>
          ) : (
            <><Save className={`h-3.5 w-3.5 ${isSaving ? 'animate-spin' : ''}`} /> {isSaving ? 'Saving…' : 'Save'}</>
          )}
        </button>
      </div>
    </header>
  )
}

export default PlaygroundHeader