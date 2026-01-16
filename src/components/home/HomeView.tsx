import { useState, useEffect } from 'react'
import { getImageUrl, getThumbnailUrl } from '../../utils/apiClient'
import CachedImage from '../common/CachedImage'
import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { useProviderStore } from '../../stores/providerStore'
import { providerRegistry } from '../../providers'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface PopularThread {
    no: number
    board: string
    provider?: string  // Added provider field
    title?: string
    com: string
    tim: number
    ext: string
    replies: number
    images: number
}

// Map of boards to human readable names for the header
const BOARD_NAMES: Record<string, string> = {
    // 4chan boards
    a: 'Anime & Manga',
    v: 'Video Games',
    vg: 'Video Game Generals',
    co: 'Comics & Cartoons',
    g: 'Technology',
    tv: 'Television & Film',
    sp: 'Sports',
    fit: 'Fitness',
    pol: 'Politically Incorrect',
    int: 'International',
    sci: 'Science & Math',
    // 7chan boards
    tech: 'Technology',
    pr: 'Programming',
    gfx: 'Graphics',
    phi: 'Philosophy',
    lit: 'Literature',
}

// Provider colors for badges
const PROVIDER_COLORS: Record<string, string> = {
    '4chan': '#117743',
    '7chan': '#7C3AED',
}

// Function to fetch popular threads from 4chan backend
async function fetchPopularThreads(): Promise<PopularThread[]> {
    return await invoke('fetch_popular_threads')
}

export default function HomeView({ onThreadClick }: { onThreadClick: (board: string, threadId: number) => void }) {
    const { activeProviderId } = useProviderStore()
    const provider = providerRegistry.get(activeProviderId)

    // For 4chan, use existing popular threads endpoint
    // For other providers, we'll fetch from their catalog
    const { data: threads, isLoading, error } = useQuery({
        queryKey: ['popular-threads', activeProviderId],
        queryFn: async () => {
            if (activeProviderId === '4chan') {
                // Use existing 4chan popular threads
                const result = await fetchPopularThreads()
                return result.map(t => ({ ...t, provider: '4chan' }))
            } else if (provider) {
                // For other providers, fetch from a popular board's catalog
                const boards = await provider.fetchBoards()
                const sfwBoards = boards.filter(b => !b.nsfw).slice(0, 3)

                const allThreads: PopularThread[] = []
                for (const board of sfwBoards) {
                    try {
                        const catalog = await provider.fetchCatalog(board.id)
                        const topThreads = catalog
                            .sort((a, b) => (b.replies || 0) - (a.replies || 0))
                            .slice(0, 5)
                            .map(t => ({
                                no: t.no,
                                board: board.id,
                                provider: activeProviderId,
                                title: t.sub,
                                com: t.com || '',
                                tim: t.tim || 0,
                                ext: t.ext || '.jpg',
                                replies: t.replies || 0,
                                images: t.images || 0,
                            }))
                        allThreads.push(...topThreads)
                    } catch (e) {
                        console.warn(`Failed to fetch ${board.id}:`, e)
                    }
                }
                return allThreads.sort((a, b) => b.replies - a.replies).slice(0, 16)
            }
            return []
        },
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000 * 5, // 5 minutes
    })

    // Get provider info for display
    const providerInfo = provider ? {
        name: provider.name,
        color: provider.color,
        icon: provider.icon,
    } : { name: 'Unknown', color: '#666', icon: '❓' }

    return (
        <div className="flex-1 flex flex-col h-full bg-dark-bg text-gray-200 overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-dark-border bg-gradient-to-r from-dark-surface via-dark-elevated to-dark-surface sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-2xl animate-pulse">{providerInfo.icon}</span>
                    <div>
                        <h1 className="text-2xl font-bold text-gradient">
                            Popular Threads
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Top trending threads on {providerInfo.name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardHeader className="p-0">
                                    <Skeleton className="h-6 w-full" />
                                </CardHeader>
                                <Skeleton className="aspect-video w-full" />
                                <CardContent className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                    <div className="flex gap-4 pt-2">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="text-center p-12 text-red-400 bg-dark-elevated rounded-lg">
                        <h2 className="text-lg font-bold mb-2">Failed to load trends</h2>
                        <p>{(error as Error).message}</p>
                    </div>
                )}

                {threads && threads.length === 0 && !isLoading && (
                    <div className="text-center p-12 text-gray-400 bg-dark-elevated rounded-lg">
                        <h2 className="text-lg font-bold mb-2">No threads available</h2>
                        <p>This provider may not have accessible content yet.</p>
                    </div>
                )}

                {threads && threads.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {threads.map((thread) => (
                            <div
                                key={`${thread.provider}-${thread.board}-${thread.no}`}
                                className="bg-dark-elevated border border-dark-border rounded-lg overflow-hidden hover:border-primary-500/50 transition-all cursor-pointer flex flex-col group hover-rise click-scale"
                                onClick={() => onThreadClick(thread.board, thread.no)}
                            >
                                {/* Board header with provider badge */}
                                <div
                                    className="px-3 py-2 text-xs font-bold text-white flex items-center justify-between"
                                    style={{ backgroundColor: PROVIDER_COLORS[thread.provider || '4chan'] || '#666' }}
                                >
                                    <span>/{thread.board}/ - {BOARD_NAMES[thread.board] || thread.board}</span>
                                    <span className="opacity-70 text-[10px] uppercase">
                                        {thread.provider || '4chan'}
                                    </span>
                                </div>

                                {/* Thumbnail */}
                                {thread.tim > 0 && (
                                    <div className="aspect-video overflow-hidden bg-dark-bg">
                                        <CachedImage
                                            src={getThumbnailUrl(thread.board, thread.tim)}
                                            alt="Thread thumbnail"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-3 flex-1 flex flex-col">
                                    {/* Title */}
                                    {thread.title && (
                                        <h3 className="font-semibold text-white mb-2 line-clamp-2"
                                            dangerouslySetInnerHTML={{ __html: thread.title }}
                                        />
                                    )}

                                    {/* Comment snippet */}
                                    <p className="text-sm text-gray-400 line-clamp-3 flex-1"
                                        dangerouslySetInnerHTML={{
                                            __html: thread.com?.replace(/<br\s*\/?>/gi, ' ').slice(0, 200) || 'No content'
                                        }}
                                    />

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-dark-border text-xs text-gray-500">
                                        <span>💬 {thread.replies} replies</span>
                                        <span>🖼️ {thread.images} images</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
