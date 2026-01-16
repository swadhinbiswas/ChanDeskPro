import { useState, useMemo, useEffect } from 'react'
import { Search, ChevronDown, ChevronRight, Star, Home } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useProviderStore } from '../../stores/providerStore'
import { providerRegistry } from '../../providers'
import type { Board } from '../../providers/types'

// Map provider boards to sidebar format
type BoardCategory = string

const CATEGORY_COLORS: Record<string, string> = {
    'Favorites': '#eab308',
    'Japanese Culture': '#ef4444',
    'Video Games': '#22c55e',
    'Technology': '#3b82f6',
    'Creative': '#a855f7',
    'Culture': '#f97316',
    'Interests': '#14b8a6',
    'Random': '#6b7280',
    'Adult': '#ec4899',
    'Other': '#6b7280',
    'Anime & Media': '#ef4444',
    'Games': '#22c55e',
    'Lifestyle': '#f97316',
}

const CATEGORY_ICONS: Record<string, string> = {
    'Favorites': '⭐',
    'Japanese Culture': '🎌',
    'Video Games': '🎮',
    'Technology': '💻',
    'Creative': '🎨',
    'Culture': '🌍',
    'Interests': '📚',
    'Random': '🎲',
    'Adult': '🔞',
    'Other': '📁',
    'Anime & Media': '🎌',
    'Games': '🎮',
    'Lifestyle': '💪',
}

interface EnhancedSidebarProps {
    currentBoard: string | null
    onBoardSelect: (boardId: string) => void
    onHomeClick?: () => void
    favorites: string[]
    onToggleFavorite: (boardId: string) => void
}

export default function EnhancedSidebar({
    currentBoard,
    onBoardSelect,
    onHomeClick,
    favorites,
    onToggleFavorite,
}: EnhancedSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [collapsedCategories, setCollapsedCategories] = useState<Set<BoardCategory>>(new Set())
    const [showNSFW, setShowNSFW] = useState(false)

    const { activeProviderId } = useProviderStore()
    const provider = providerRegistry.get(activeProviderId)

    const { data: allBoards = [], isLoading } = useQuery({
        queryKey: ['boards', activeProviderId],
        queryFn: async () => {
            if (!provider) return []
            return provider.fetchBoards()
        },
        enabled: !!provider,
    })

    // Group boards by category
    const boardsByCategory = useMemo(() => {
        const filtered = allBoards.filter(board => {
            if (!showNSFW && board.nsfw) return false
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                return board.id.toLowerCase().includes(query) ||
                    board.name.toLowerCase().includes(query)
            }
            return true
        })

        const grouped = new Map<BoardCategory, Board[]>()

        // Add favorites first if any
        const favoriteBoards = filtered.filter(b => favorites.includes(b.id))
        if (favoriteBoards.length > 0) {
            grouped.set('Favorites', favoriteBoards)
        }

        // Group other boards by category
        filtered.forEach(board => {
            if (!favorites.includes(board.id)) {
                const category = board.category || 'Other'
                const existing = grouped.get(category) || []
                grouped.set(category, [...existing, board])
            }
        })

        return grouped
    }, [allBoards, favorites, searchQuery, showNSFW])

    const toggleCategory = (category: BoardCategory) => {
        const newCollapsed = new Set(collapsedCategories)
        if (newCollapsed.has(category)) {
            newCollapsed.delete(category)
        } else {
            newCollapsed.add(category)
        }
        setCollapsedCategories(newCollapsed)
    }

    if (isLoading) {
        return (
            <div className="w-64 bg-dark-surface border-r border-dark-border p-4">
                <div className="text-gray-400">Loading boards...</div>
            </div>
        )
    }

    return (
        <div className="w-64 bg-dark-surface/80 backdrop-blur-xl border-r border-dark-border flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-dark-border bg-gradient-to-r from-dark-surface to-dark-elevated">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gradient">Boards</h2>
                    {onHomeClick && (
                        <button
                            onClick={onHomeClick}
                            className={`p-2 rounded-lg transition-colors ${!currentBoard
                                ? 'bg-primary-600 text-white'
                                : 'hover:bg-dark-hover text-gray-400 hover:text-white'
                                }`}
                            title="Home - Popular Threads"
                        >
                            <Home className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search boards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-dark-elevated rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* NSFW Toggle */}
                <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showNSFW}
                        onChange={(e) => setShowNSFW(e.target.checked)}
                        className="rounded"
                    />
                    <span>Show 18+ boards</span>
                </label>
            </div>

            {/* Board List */}
            <div className="flex-1 overflow-y-auto">
                {Array.from(boardsByCategory.entries()).map(([category, boards]) => {
                    const isCollapsed = collapsedCategories.has(category)
                    const color = CATEGORY_COLORS[category]

                    return (
                        <div key={category} className="border-b border-dark-border/50">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between p-3 hover:bg-dark-hover transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span>{CATEGORY_ICONS[category]}</span>
                                    <span className="font-semibold text-sm">{category}</span>
                                    <span className="text-xs text-gray-500">({boards.length})</span>
                                </div>
                                {isCollapsed ? (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {/* Boards in Category */}
                            {!isCollapsed && (
                                <div className="pb-2">
                                    {boards.map(board => (
                                        <div
                                            key={board.id}
                                            className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors cursor-pointer ${currentBoard === board.id
                                                ? 'bg-primary-600/20 border-l-4'
                                                : 'hover:bg-dark-hover border-l-4 border-transparent'
                                                }`}
                                            style={currentBoard === board.id ? { borderLeftColor: color } : {}}
                                        >
                                            <div
                                                className="flex-1 min-w-0"
                                                onClick={() => onBoardSelect(board.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm" style={{ color }}>
                                                        /{board.id}/
                                                    </span>
                                                    {board.nsfw && <span className="text-xs">🔞</span>}
                                                </div>
                                                <div className="text-xs text-gray-400 truncate">
                                                    {board.name}
                                                </div>
                                            </div>

                                            {/* Favorite Star */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onToggleFavorite(board.id)
                                                }}
                                                className="flex-shrink-0 ml-2 p-1 hover:bg-dark-elevated rounded"
                                            >
                                                <Star
                                                    className={`w-3 h-3 ${favorites.includes(board.id)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-600'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Stats Footer */}
            <div className="p-3 border-t border-dark-border text-xs text-gray-500">
                {allBoards.length} boards • {favorites.length} favorites
            </div>
        </div>
    )
}
