import { useState, useEffect, useMemo } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { fetchCatalog, fetchThread } from './utils/apiClient'
import { exportThread } from './utils/exportThread'
import type { CatalogThread, Post as PostType, Thread } from './types/api'
import EnhancedSidebar from './components/layout/EnhancedSidebar'
import ProviderTabs from './components/layout/ProviderTabs'
import ImageLightbox from './components/media/ImageLightbox'
import ImageGallery from './components/media/ImageGallery'
import HomeView from './components/home/HomeView'
import QuickReply from './components/thread/QuickReply'
import PostComponent from './components/thread/Post'
import ShortcutsCheatSheet from './components/common/ShortcutsCheatSheet'
import GlobalSearch from './components/common/GlobalSearch'
import { Toaster } from './components/ui/sonner'
import UpdateChecker from './components/common/UpdateChecker'
import { OnboardingProvider } from './components/onboarding/OnboardingTour'
import { useFavoritesStore } from './stores/favoritesStore'
import { useWatchlistStore } from './stores/watchlistStore'
import { useLastSeenStore } from './stores/lastSeenStore'
import { useLightboxStore } from './stores/lightboxStore'
import { useAutoRefresh } from './hooks/useAutoRefresh'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import type { KeyboardShortcut } from './hooks/useKeyboardShortcuts'
import { useLinkClickHandler } from './hooks/useLinkClickHandler'
import { useTheme } from './hooks/useTheme'
import { initNotifications } from './utils/notifications'
import BrowserContainer from './components/browser/BrowserContainer'
import { RefreshCw, ChevronLeft, ChevronRight, Search, MessageSquare, Grid, Download, Eye, EyeOff } from 'lucide-react'
import './index.css'
import './providers' // Initialize providers

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
        },
    },
})

function ThreadView({ board, threadId, onClose }: { board: string; threadId: number; onClose: () => void }) {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)
    const [showQuickReply, setShowQuickReply] = useState(false)
    const [quotePost, setQuotePost] = useState<number | undefined>(undefined)
    const [showGallery, setShowGallery] = useState(false)
    const [showExportMenu, setShowExportMenu] = useState(false)

    // Watchlist integration
    const { watchedThreads, watchThread, unwatchThread } = useWatchlistStore()
    const isWatched = watchedThreads.some(t => t.id === threadId)

    // Last seen tracking for new post indicators
    const { getLastSeen, updateLastSeen, isNewPost } = useLastSeenStore()
    const lastSeenPostNo = getLastSeen(threadId)

    const { data: thread, isLoading, error, refetch } = useQuery<Thread>({
        queryKey: ['thread', board, threadId],
        queryFn: () => fetchThread(board, threadId),
    })

    // Get posts safely (may be undefined during loading)
    const posts = thread?.posts || []
    const op = posts[0]

    // Update last seen post when thread loads or updates
    // This hook must be BEFORE any early returns!
    useEffect(() => {
        if (posts.length > 0) {
            const lastPost = posts[posts.length - 1]
            updateLastSeen(threadId, lastPost.no)
        }
    }, [posts, threadId, updateLastSeen])

    // Collect all images for lightbox
    const allImages = useMemo(() => posts
        .filter((p: PostType) => p.tim && p.ext)
        .map((p: PostType) => ({
            url: `https://i.4cdn.org/${board}/${p.tim}${p.ext}`,
            thumbnail: `https://i.4cdn.org/${board}/${p.tim}s.jpg`,
            filename: p.filename ? `${p.filename}${p.ext}` : undefined,
            width: p.w,
            height: p.h,
        })), [posts, board])

    const openLightbox = (tim: number) => {
        const index = allImages.findIndex((img: any) => img.url.includes(`/${tim}`))
        if (index !== -1) {
            setLightboxIndex(index)
            setLightboxOpen(true)
        }
    }

    // Early returns MUST be AFTER all hooks
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-400">Loading thread...</div>
            </div>
        )
    }

    if (error || !thread) {
        return (
            <div className="flex-1 flex items-center justify-center flex-col gap-4">
                <div className="text-red-400">Error loading thread</div>
                <button onClick={onClose} className="px-4 py-2 bg-primary-600 rounded hover:bg-primary-700">
                    Back to Catalog
                </button>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-dark-surface border-b border-dark-border p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">
                        {op?.sub || `Thread #${threadId}`}
                    </h1>
                    <p className="text-sm text-gray-400">
                        /{board}/ • {posts.length} posts
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => refetch()}
                        className="px-3 py-2 bg-dark-elevated hover:bg-dark-hover rounded transition-colors flex items-center gap-2"
                        title="Refresh thread"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowGallery(true)}
                        className="px-3 py-2 bg-dark-elevated hover:bg-dark-hover rounded transition-colors flex items-center gap-2"
                        title="View all images"
                    >
                        <Grid className="w-4 h-4" />
                        Gallery
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="px-3 py-2 bg-dark-elevated hover:bg-dark-hover rounded transition-colors flex items-center gap-2"
                            title="Export thread"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        {showExportMenu && thread && (
                            <div className="absolute top-full right-0 mt-1 bg-dark-elevated border border-dark-border rounded-lg shadow-lg py-1 z-50 min-w-32">
                                <button
                                    onClick={() => { exportThread(thread, board, { format: 'json' }); setShowExportMenu(false) }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-dark-hover"
                                >
                                    JSON
                                </button>
                                <button
                                    onClick={() => { exportThread(thread, board, { format: 'html' }); setShowExportMenu(false) }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-dark-hover"
                                >
                                    HTML
                                </button>
                                <button
                                    onClick={() => { exportThread(thread, board, { format: 'txt' }); setShowExportMenu(false) }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-dark-hover"
                                >
                                    Plain Text
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowQuickReply(true)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded transition-colors flex items-center gap-2"
                        title="Reply to thread"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Reply
                    </button>
                    <button
                        onClick={() => {
                            if (isWatched) {
                                unwatchThread(threadId)
                            } else {
                                watchThread({
                                    id: threadId,
                                    board: board,
                                    title: op?.sub || `Thread #${threadId}`,
                                    lastReplyCount: posts.length,
                                })
                            }
                        }}
                        className={`px-3 py-2 rounded transition-colors flex items-center gap-2 ${isWatched
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                            : 'bg-dark-elevated hover:bg-dark-hover'
                            }`}
                        title={isWatched ? 'Unwatch thread' : 'Watch thread'}
                    >
                        {isWatched ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isWatched ? 'Watching' : 'Watch'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-dark-elevated hover:bg-dark-hover rounded transition-colors"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {posts.map((post: PostType, index: number) => (
                    <PostComponent
                        key={post.no}
                        post={post}
                        board={board}
                        isOP={index === 0}
                        allPosts={posts}
                        isNew={isNewPost(threadId, post.no)}
                    />
                ))}
            </div>

            {/* Image Lightbox */}
            {lightboxOpen && (
                <ImageLightbox
                    images={allImages}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}

            {/* Quick Reply */}
            {showQuickReply && (
                <QuickReply
                    board={board}
                    threadId={threadId}
                    replyTo={quotePost}
                    onClose={() => {
                        setShowQuickReply(false)
                        setQuotePost(undefined)
                    }}
                    onSuccess={() => refetch()}
                />
            )}

            {/* Image Gallery */}
            <ImageGallery
                posts={posts}
                board={board}
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                onImageClick={(index) => {
                    setShowGallery(false)
                    setLightboxIndex(index)
                    setLightboxOpen(true)
                }}
            />
        </div>
    )
}

function CatalogView({ board, onThreadClick }: { board: string; onThreadClick: (threadId: number) => void }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)

    const { data: catalog, isLoading, error, refetch } = useQuery({
        queryKey: ['catalog', board],
        queryFn: () => fetchCatalog(board),
    })

    // Reset search when board changes
    useEffect(() => {
        setSearchTerm('')
    }, [board])

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-400">Loading /{board}/ catalog...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-red-400">Error loading catalog: {(error as Error).message}</div>
            </div>
        )
    }

    const allThreads = catalog?.flatMap((page: any) => page.threads) || []

    // Filter threads based on search term
    const threads = allThreads.filter((thread: CatalogThread) => {
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
            (thread.sub && thread.sub.toLowerCase().includes(searchLower)) ||
            (thread.com && thread.com.toLowerCase().includes(searchLower)) ||
            thread.no.toString().includes(searchLower)
        )
    })

    // Create indexed image list from current view threads only for proper lightbox
    const createImageList = () => {
        const imageList: Array<{ url: string; thumbnail: string; filename?: string; threadNo: number; tim: number }> = []

        threads.forEach((thread: CatalogThread) => {
            if (thread.tim && thread.ext) {
                imageList.push({
                    url: `https://i.4cdn.org/${board}/${thread.tim}${thread.ext}`,
                    thumbnail: `https://i.4cdn.org/${board}/${thread.tim}s.jpg`,
                    filename: thread.sub || `Thread #${thread.no}`,
                    threadNo: thread.no,
                    tim: thread.tim,
                })
            }
        })

        return imageList
    }

    const imageList = createImageList()

    const openLightbox = (e: React.MouseEvent, clickedTim: number) => {
        e.stopPropagation()

        // Find the index of the clicked image
        const index = imageList.findIndex(img => img.tim === clickedTim)

        if (index !== -1) {
            setLightboxIndex(index)
            setLightboxOpen(true)
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-dark-surface border-b border-dark-border p-4 flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold">/{board}/ - Catalog</h1>
                    <p className="text-gray-400">{threads.length} threads</p>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-md relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-dark-border rounded-md leading-5 bg-dark-bg text-gray-300 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm"
                        placeholder="Filter threads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => refetch()}
                    className="px-3 py-2 bg-dark-elevated hover:bg-dark-hover rounded transition-colors flex items-center gap-2"
                    title="Refresh catalog"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {threads.map((thread: CatalogThread) => (
                        <div
                            key={thread.no}
                            onClick={() => onThreadClick(thread.no)}
                            className="bg-dark-surface rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer border-t-4"
                            style={{ borderTopColor: '#6366f1' }}
                        >
                            {thread.tim && thread.ext ? (
                                <div
                                    className="aspect-video bg-dark-elevated relative group"
                                    onClick={(e) => openLightbox(e, thread.tim!)}
                                >
                                    <img
                                        src={`https://i.4cdn.org/${board}/${thread.tim}s.jpg`}
                                        alt="Thread"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-sm">Click for full size</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-dark-elevated flex items-center justify-center">
                                    <span className="text-4xl">💬</span>
                                </div>
                            )}

                            <div className="p-3">
                                {thread.sub && (
                                    <h3 className="font-semibold text-sm mb-1 truncate">{thread.sub}</h3>
                                )}

                                {thread.teaser && (
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                        {thread.teaser}
                                    </p>
                                )}

                                <div className="flex gap-3 text-xs text-gray-400">
                                    <span>💬 {thread.replies}</span>
                                    <span>🖼️ {thread.images}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {threads.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No threads found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {/* Image Lightbox */}
            {lightboxOpen && imageList.length > 0 && (
                <ImageLightbox
                    images={imageList}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    )
}

function AppContent() {
    const [board, setBoard] = useState<string | null>(null)
    const [currentThread, setCurrentThread] = useState<number | null>(null)
    const { favorites, toggleFavorite } = useFavoritesStore()

    // Auto-refresh hook
    useAutoRefresh({ board, threadId: currentThread })

    // Global link click handler - opens external links in in-app browser
    useLinkClickHandler()

    // Apply theme from settings (dark/light/auto)
    useTheme()

    const handleThreadClick = (threadId: number) => {
        setCurrentThread(threadId)
    }

    const handleBackToCatalog = () => {
        setCurrentThread(null)
    }

    const handleBoardSelect = (boardId: string) => {
        setBoard(boardId)
        setCurrentThread(null)
    }

    const [showShortcuts, setShowShortcuts] = useState(false)
    const [showGlobalSearch, setShowGlobalSearch] = useState(false)

    // Ctrl+K for Global Search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setShowGlobalSearch(s => !s)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Define keyboard shortcuts
    const shortcuts: KeyboardShortcut[] = useMemo(() => [
        {
            key: '?',
            callback: () => setShowShortcuts(s => !s),
            description: 'Toggle keyboard shortcuts help',
        },
        {
            key: 'Escape',
            callback: () => {
                if (currentThread) {
                    handleBackToCatalog()
                }
            },
            description: 'Close thread / Go back',
        },
        {
            key: 'r',
            callback: () => {
                // Would trigger refresh - using query invalidation
                queryClient.invalidateQueries({ queryKey: ['thread', board, currentThread] })
                queryClient.invalidateQueries({ queryKey: ['catalog', board] })
            },
            description: 'Refresh current view',
        },
    ], [board, currentThread])

    useKeyboardShortcuts({ shortcuts })

    return (
        <div className="h-full flex flex-col bg-dark-bg text-white">
            {/* Provider Tabs */}
            <ProviderTabs />

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                <EnhancedSidebar
                    currentBoard={board}
                    onBoardSelect={handleBoardSelect}
                    onHomeClick={() => {
                        setBoard(null)
                        setCurrentThread(null)
                    }}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                />

                {!board ? (
                    <HomeView onThreadClick={(b: string, t: number) => {
                        setBoard(b)
                        setCurrentThread(t)
                    }} />
                ) : currentThread ? (
                    <ThreadView board={board} threadId={currentThread} onClose={handleBackToCatalog} />
                ) : (
                    <CatalogView board={board} onThreadClick={handleThreadClick} />
                )}

                {/* Keyboard Shortcuts Help */}
                <ShortcutsCheatSheet
                    isOpen={showShortcuts}
                    onClose={() => setShowShortcuts(false)}
                />

                {/* Global Search Modal */}
                <GlobalSearch
                    isOpen={showGlobalSearch}
                    onClose={() => setShowGlobalSearch(false)}
                    onSelectThread={(b, t) => {
                        setBoard(b)
                        setCurrentThread(t)
                    }}
                    onSelectBoard={handleBoardSelect}
                    currentBoard={board}
                />
            </div>
        </div>
    )
}

function GlobalLightbox() {
    const { isOpen, images, currentIndex, closeLightbox } = useLightboxStore()

    // Alt+F keyboard shortcut to close lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === 'f') {
                e.preventDefault()
                // Alt+F with lightbox open = close it
                if (isOpen) {
                    closeLightbox()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, closeLightbox])

    if (!isOpen || images.length === 0) return null

    return (
        <ImageLightbox
            images={images}
            initialIndex={currentIndex}
            onClose={closeLightbox}
        />
    )
}

function App() {
    // Init notifications on app start
    useEffect(() => {
        initNotifications()
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <OnboardingProvider>
                <AppContent />
                {/* Global fullscreen lightbox (Alt+F / double-click) */}
                <GlobalLightbox />
                {/* Update checker notification */}
                <UpdateChecker />
                {/* In-app browser overlay */}
                <BrowserContainer />
                {/* Toast notifications */}
                <Toaster />
            </OnboardingProvider>
        </QueryClientProvider>
    )
}

export default App
