/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { Progress } from "@/components/ui/progress"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import UserDetailContext from "@/context/UserDetailContext"
import { useAuth, UserButton } from "@clerk/nextjs"
import axios from "axios"
import { Crown, Loader2Icon, SquarePen, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MAX_FREE_CREDITS } from "@/config/credits"
import { isUpgradedTier } from "@/config/features"

export function AppSidebar() {
    const [projectList, setProjectList] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const { open } = useSidebar()
    const context = useContext(UserDetailContext)
    const router = useRouter()

    if (!context) throw new Error("UserDetailContext not provided")

    const { userDetail } = context
    const { has } = useAuth()
    const hasUnlimitedAcess = has ? has({ plan: 'pro' }) : false
    const isPro = hasUnlimitedAcess || isUpgradedTier(userDetail?.tier);

    useEffect(() => {
        const CACHE_TTL_MS = 5 * 60 * 1000
        try {
            const raw = localStorage.getItem("projects")
            if (raw) {
                const parsed = JSON.parse(raw) as { data: typeof projectList; cachedAt: number }
                const isStale = Date.now() - (parsed.cachedAt ?? 0) > CACHE_TTL_MS
                if (!isStale && Array.isArray(parsed.data)) {
                    setProjectList(parsed.data)
                    getProjectList(false)
                    return
                }
            }
        } catch {
            localStorage.removeItem("projects")
        }
        getProjectList(true)
    }, [])

    const getProjectList = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true)
            const result = await axios.get("/api/project_list")
            setProjectList(result.data)
            localStorage.setItem("projects", JSON.stringify({ data: result.data, cachedAt: Date.now() }))
        } catch (error) {
            console.error(error)
        } finally {
            if (showLoader) setLoading(false)
        }
    }

    const creditPercent = userDetail
        ? (userDetail.credits / (userDetail.maxCredits || MAX_FREE_CREDITS)) * 100
        : null;

    const lowCredits = userDetail && !isPro && userDetail.credits <= (userDetail.maxCredits || MAX_FREE_CREDITS) * 0.2 && userDetail.credits > 0;
    const noCredits = userDetail && !isPro && userDetail.credits === 0;

    return (
        <Sidebar
            collapsible="icon"
            className={`overflow-hidden transition-all duration-300 ${open ? "" : "w-15!"}`}
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderRight: '1px solid var(--color-border-base)',
            }}
        >
            {/* Header */}
            <SidebarHeader className="px-3 py-4 flex flex-col">
                {open ? (
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png?v=3" alt="CraftPortfolio logo" width={32} height={32} className="h-8 w-8" />
                        <span
                            className="text-lg font-bold tracking-tight"
                            style={{ fontFamily: 'var(--font-inter, sans-serif)', color: 'var(--color-text-primary)' }}
                        >
                            Craft<span style={{ color: 'var(--color-brand)' }}>Portfolio</span>
                        </span>
                    </div>
                ) : (
                    <img src="/logo.png?v=3" alt="logo" width={32} height={32} className="h-8 w-8 mx-auto" />
                )}
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className={`p-2 ${open ? 'overflow-y-auto' : ''}`}>
                {open ? (
                    <>
                        {/* Projects section */}
                        <div className="mb-1 px-1">
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                                Projects
                            </p>
                        </div>
                        <SidebarGroup>
                            <div className="flex flex-col gap-0.5">
                                {loading
                                    ? [1, 2, 3, 4, 5].map((_, i) => (
                                        <Skeleton key={i} className="w-full h-9 rounded-lg" style={{ backgroundColor: 'var(--color-bg-raised)' }} />
                                    ))
                                    : projectList.length === 0
                                        ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                                <div
                                                    className="mb-2 flex items-center justify-center w-10 h-10 rounded-xl"
                                                    style={{ backgroundColor: 'var(--color-bg-raised)', border: '1px solid var(--color-border-base)' }}
                                                >
                                                    <SquarePen className="h-4 w-4" style={{ color: 'var(--color-text-tertiary)' }} />
                                                </div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No projects yet</p>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Create your first portfolio</p>
                                            </div>
                                        )
                                        : projectList.map((project: any) => (
                                            <Link key={project.projectId} href={`/playground/${project.projectId}?frameId=${project.frameId}`}>
                                                <div
                                                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-100 cursor-pointer group"
                                                    style={{ color: 'var(--color-text-secondary)' }}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-raised)';
                                                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                                                    }}
                                                >
                                                    <div
                                                        className="h-1.5 w-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: 'var(--color-border-strong)' }}
                                                    />
                                                    <h2 className="text-sm line-clamp-1">
                                                        {project?.title || project?.chats?.[0]?.chatMessage?.[0]?.content || "Untitled Project"}
                                                    </h2>
                                                </div>
                                            </Link>
                                        ))
                                }
                            </div>
                        </SidebarGroup>
                    </>
                ) : null}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="pb-4">
                {open ? (
                    <div className="mx-1">
                        {isPro ? (
                            <div
                                className="p-3 rounded-xl flex items-center gap-3 w-full"
                                style={{
                                    background: 'linear-gradient(135deg, rgb(251 191 36 / 10%), rgb(245 158 11 / 5%))',
                                    border: '1px solid var(--color-brand-border)',
                                }}
                            >
                                <div
                                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                                    style={{ backgroundColor: 'var(--color-brand)', color: 'var(--color-text-invert)' }}
                                >
                                    <Crown className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>Pro Plan</p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-brand-border shrink-0 select-none">
                                            {!userDetail ? <Loader2Icon className="animate-spin h-2.5 w-2.5" /> : `${userDetail.credits} Cr`}
                                        </span>
                                    </div>
                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Active Plan</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="p-3 rounded-xl flex flex-col gap-3"
                                style={{
                                    backgroundColor: 'var(--color-bg-raised)',
                                    border: `1px solid ${noCredits ? 'rgb(248 113 113 / 30%)' : lowCredits ? 'rgb(251 191 36 / 30%)' : 'var(--color-border-base)'}`,
                                }}
                            >
                                {/* Credits count */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="h-3.5 w-3.5" style={{ color: 'var(--color-brand)' }} />
                                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Credits</span>
                                    </div>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                        {!userDetail ? <Loader2Icon className="animate-spin h-3.5 w-3.5" /> : userDetail.credits}
                                    </span>
                                </div>

                                {/* Progress */}
                                <Progress value={creditPercent} className="h-1.5" />

                                {/* Warning */}
                                {(lowCredits || noCredits) && (
                                    <p
                                        className="text-xs leading-snug"
                                        style={{ color: noCredits ? 'var(--color-error)' : 'var(--color-warning)' }}
                                    >
                                        {noCredits
                                            ? "You're out of credits. Upgrade to continue."
                                            : "Credits running low — consider upgrading."}
                                    </p>
                                )}

                                {/* CTA */}
                                <Link href="/pricing" className="block">
                                    <button
                                        className="w-full py-2 rounded-lg text-sm font-semibold transition-all duration-100"
                                        style={{
                                            backgroundColor: 'var(--color-brand)',
                                            color: 'var(--color-text-invert)',
                                            boxShadow: 'var(--shadow-brand)',
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-hover)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand)'}
                                    >
                                        {noCredits ? "Buy Credits" : "Upgrade to Pro"}
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* User row */}
                        <div className="mt-3 flex items-center gap-2.5 px-1">
                            <UserButton />
                            {userDetail && (
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                        {userDetail.name || 'My Account'}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                                        {userDetail.email || ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <UserButton />
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}