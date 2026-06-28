'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Messages } from '../[projectId]/page'
import { ArrowUp, Check, Copy, Lock, Loader2Icon, Bot, User } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import Link from 'next/link'

type Props = {
  messages: Messages[]
  onSend: (input: string) => void
  loading: boolean
  /** When true, the input is replaced with an upgrade prompt (free tier limit) */
  chatBlocked?: boolean
}

// Animated typing indicator
function TypingIndicator() {
  return (
    <div className="flex justify-start items-center gap-2.5 px-1 py-2">
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
        style={{ backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-border)' }}
      >
        <Bot className="h-3.5 w-3.5" style={{ color: 'var(--color-brand)' }} />
      </div>
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-xl rounded-tl-sm"
        style={{ backgroundColor: 'var(--color-bg-raised)', border: '1px solid var(--color-border-base)' }}
      >
        {[0, 150, 300].map((delay, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--color-text-tertiary)', animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// Copy button for assistant messages
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      aria-label="Copy message"
      className="mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-100 rounded"
      style={{ color: 'var(--color-text-tertiary)' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)'}
    >
      {copied
        ? <Check className="h-3.5 w-3.5" style={{ color: 'var(--color-success)' }} />
        : <Copy className="h-3.5 w-3.5" />
      }
    </button>
  )
}

function ChatSection({ messages, onSend, loading, chatBlocked = false }: Props) {
  const [input, setInput] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (!input?.trim()) return
    onSend(input)
    setInput('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div
      className="flex h-full w-full min-h-0 flex-col lg:h-full lg:w-96 lg:min-w-72 lg:max-w-120 xl:w-120"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border-base)',
      }}
    >
      {/* Chat header */}
      <div
        className="px-4 py-3 flex items-center gap-2 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-base)' }}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-border)' }}
        >
          <Bot className="h-4 w-4" style={{ color: 'var(--color-brand)' }} />
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>AI Assistant</span>
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center my-auto">
            <div
              className="mb-3 flex items-center justify-center w-12 h-12 rounded-2xl"
              style={{ backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-border)' }}
            >
              <Bot className="h-6 w-6" style={{ color: 'var(--color-brand)' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Polishing Your Portfolio</p>
            <p className="text-xs mt-1 max-w-[200px]" style={{ color: 'var(--color-text-secondary)' }}>
              Describe changes below, or choose a quick prompt to update the preview:
            </p>

            {/* Quick Modification Suggestions */}
            <div className="mt-5 w-full max-w-[280px] flex flex-col gap-2">
              {[
                { label: "Change theme accent to Saffron gold", text: "Change the primary color scheme of the website to Saffron gold accent." },
                { label: "Add a modern experience timeline", text: "Add a clean, responsive professional experience timeline section with job roles and dates." },
                { label: "Use a clean projects grid with icons", text: "Add a grid-based Projects section showcasing work titles, descriptions, and Lucide tech icons." }
              ].map((sug, i) => (
                <button
                  key={i}
                  onClick={() => onSend(sug.text)}
                  disabled={loading}
                  className="text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-850/50"
                  style={{
                    backgroundColor: 'var(--color-bg-raised)',
                    borderColor: 'var(--color-border-base)',
                    color: 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand-border)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-base)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                  }}
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`group flex items-start gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5"
                  style={msg.role === 'user'
                    ? { backgroundColor: 'var(--color-bg-overlay)', border: '1px solid var(--color-border-strong)' }
                    : { backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-border)' }
                  }
                >
                  {msg.role === 'user'
                    ? <User className="h-3 w-3" style={{ color: 'var(--color-text-secondary)' }} />
                    : <Bot className="h-3 w-3" style={{ color: 'var(--color-brand)' }} />
                  }
                </div>

                {/* Bubble */}
                <div
                  className="rounded-xl px-3 py-2.5 text-sm leading-relaxed break-words"
                  style={msg.role === 'user'
                    ? {
                        backgroundColor: 'var(--color-bg-overlay)',
                        border: '1px solid var(--color-border-strong)',
                        color: 'var(--color-text-primary)',
                        borderRadius: '12px 4px 12px 12px',
                      }
                    : {
                        backgroundColor: 'var(--color-bg-raised)',
                        border: '1px solid var(--color-border-base)',
                        color: 'var(--color-text-primary)',
                        borderRadius: '4px 12px 12px 12px',
                        width: '100%',
                      }
                  }
                >
                  {msg.content}
                </div>

                {/* Copy for assistant */}
                {msg.role === 'assistant' && <CopyButton text={msg.content} />}
              </div>
            </div>
          ))
        )}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {chatBlocked ? (
        <div
          className="shrink-0 p-4 flex flex-col items-center gap-3"
          style={{ borderTop: '1px solid var(--color-border-base)', backgroundColor: 'var(--color-bg-raised)' }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <Lock className="h-4 w-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
            <span>Free plan · 1 generation included</span>
          </div>
          <Link href="/pricing" className="w-full">
            <button
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-100"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-text-invert)',
                boxShadow: 'var(--shadow-brand)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand)'}
            >
              Upgrade to keep building →
            </button>
          </Link>
        </div>
      ) : (
        <div
          className="shrink-0 p-3"
          style={{ borderTop: '1px solid var(--color-border-base)' }}
        >
          <div
            className="flex items-end gap-2 rounded-xl p-2 transition-all duration-100"
            style={{
              backgroundColor: 'var(--color-bg-raised)',
              border: '1px solid var(--color-border-base)',
            }}
            onFocusCapture={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgb(251 191 36 / 40%)';
            }}
            onBlurCapture={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-base)';
            }}
          >
            <textarea
              className="flex-1 resize-none text-sm leading-relaxed bg-transparent min-h-[40px] max-h-28 px-1"
              style={{
                color: 'var(--color-text-primary)',
                caretColor: 'var(--color-brand)',
                outline: 'none',
                border: 'none',
              }}
              placeholder="Describe a change… (Ctrl+Enter to send)"
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-100 disabled:opacity-40"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              style={{
                backgroundColor: input.trim() ? 'var(--color-brand)' : 'var(--color-bg-overlay)',
                color: input.trim() ? 'var(--color-text-invert)' : 'var(--color-text-tertiary)',
              }}
            >
              {loading
                ? <Loader2Icon className="h-4 w-4 animate-spin" />
                : <ArrowUp className="h-4 w-4" />
              }
            </button>
          </div>
          <p className="mt-1.5 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Ctrl+Enter to send
          </p>
        </div>
      )}
    </div>
  )
}

export default ChatSection