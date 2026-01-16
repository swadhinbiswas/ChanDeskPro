import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FilterType = 'keyword' | 'tripcode' | 'name' | 'regex' | 'subject'

export interface Filter {
    id: string
    type: FilterType
    value: string
    enabled: boolean
    caseSensitive: boolean
    hideThread: boolean // Hide entire thread vs just the post
    boards: string[] // Empty = all boards
    createdAt: number
}

export interface FilterMatch {
    filterId: string
    matchedText: string
    postNo?: number
}

interface FilterState {
    filters: Filter[]
    hiddenThreads: Set<string> // board:threadId
    hiddenPosts: Set<string>   // board:postNo

    // Actions
    addFilter: (filter: Omit<Filter, 'id' | 'createdAt'>) => void
    removeFilter: (id: string) => void
    updateFilter: (id: string, updates: Partial<Filter>) => void
    toggleFilter: (id: string) => void
    clearFilters: () => void
    importFilters: (filters: Filter[]) => void
    exportFilters: () => Filter[]

    // Runtime matching
    hideThread: (board: string, threadId: number) => void
    hidePost: (board: string, postNo: number) => void
    unhideThread: (board: string, threadId: number) => void
    unhidePost: (board: string, postNo: number) => void
    isThreadHidden: (board: string, threadId: number) => boolean
    isPostHidden: (board: string, postNo: number) => boolean
    clearHidden: () => void
}

// Test if text matches a filter
export function matchesFilter(text: string, filter: Filter): boolean {
    if (!filter.enabled || !text) return false

    const searchText = filter.caseSensitive ? text : text.toLowerCase()
    const filterValue = filter.caseSensitive ? filter.value : filter.value.toLowerCase()

    switch (filter.type) {
        case 'keyword':
        case 'subject':
            return searchText.includes(filterValue)
        case 'tripcode':
            // Tripcodes start with ! or !!
            return searchText.includes(filterValue) &&
                (filterValue.startsWith('!') || filterValue.startsWith('!!'))
        case 'name':
            return searchText === filterValue || searchText.startsWith(filterValue + ' ')
        case 'regex':
            try {
                const flags = filter.caseSensitive ? 'g' : 'gi'
                const regex = new RegExp(filter.value, flags)
                return regex.test(text)
            } catch {
                return false
            }
        default:
            return false
    }
}

// Check if a post matches any filter
export function checkFilters(
    post: {
        com?: string | null
        name?: string | null
        trip?: string | null
        sub?: string | null
    },
    filters: Filter[],
    board: string
): Filter | null {
    const enabledFilters = filters.filter(f =>
        f.enabled &&
        (f.boards.length === 0 || f.boards.includes(board))
    )

    for (const filter of enabledFilters) {
        switch (filter.type) {
            case 'keyword':
                if (post.com && matchesFilter(post.com, filter)) return filter
                break
            case 'subject':
                if (post.sub && matchesFilter(post.sub, filter)) return filter
                break
            case 'tripcode':
                if (post.trip && matchesFilter(post.trip, filter)) return filter
                break
            case 'name':
                if (post.name && matchesFilter(post.name, filter)) return filter
                break
            case 'regex':
                const fullText = [post.com, post.name, post.trip, post.sub]
                    .filter(Boolean)
                    .join(' ')
                if (matchesFilter(fullText, filter)) return filter
                break
        }
    }

    return null
}

export const useFilterStore = create<FilterState>()(
    persist(
        (set, get) => ({
            filters: [],
            hiddenThreads: new Set(),
            hiddenPosts: new Set(),

            addFilter: (filterData) => {
                const filter: Filter = {
                    ...filterData,
                    id: `filter-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    createdAt: Date.now(),
                }
                set((state) => ({
                    filters: [...state.filters, filter],
                }))
            },

            removeFilter: (id) => {
                set((state) => ({
                    filters: state.filters.filter((f) => f.id !== id),
                }))
            },

            updateFilter: (id, updates) => {
                set((state) => ({
                    filters: state.filters.map((f) =>
                        f.id === id ? { ...f, ...updates } : f
                    ),
                }))
            },

            toggleFilter: (id) => {
                set((state) => ({
                    filters: state.filters.map((f) =>
                        f.id === id ? { ...f, enabled: !f.enabled } : f
                    ),
                }))
            },

            clearFilters: () => {
                set({ filters: [] })
            },

            importFilters: (filters) => {
                set((state) => ({
                    filters: [
                        ...state.filters,
                        ...filters.map((f) => ({
                            ...f,
                            id: `filter-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                        })),
                    ],
                }))
            },

            exportFilters: () => {
                return get().filters
            },

            hideThread: (board, threadId) => {
                set((state) => {
                    const newSet = new Set(state.hiddenThreads)
                    newSet.add(`${board}:${threadId}`)
                    return { hiddenThreads: newSet }
                })
            },

            hidePost: (board, postNo) => {
                set((state) => {
                    const newSet = new Set(state.hiddenPosts)
                    newSet.add(`${board}:${postNo}`)
                    return { hiddenPosts: newSet }
                })
            },

            unhideThread: (board, threadId) => {
                set((state) => {
                    const newSet = new Set(state.hiddenThreads)
                    newSet.delete(`${board}:${threadId}`)
                    return { hiddenThreads: newSet }
                })
            },

            unhidePost: (board, postNo) => {
                set((state) => {
                    const newSet = new Set(state.hiddenPosts)
                    newSet.delete(`${board}:${postNo}`)
                    return { hiddenPosts: newSet }
                })
            },

            isThreadHidden: (board, threadId) => {
                return get().hiddenThreads.has(`${board}:${threadId}`)
            },

            isPostHidden: (board, postNo) => {
                return get().hiddenPosts.has(`${board}:${postNo}`)
            },

            clearHidden: () => {
                set({ hiddenThreads: new Set(), hiddenPosts: new Set() })
            },
        }),
        {
            name: 'filter-storage',
            partialize: (state) => ({
                filters: state.filters,
                // Convert Sets to arrays for JSON serialization
                hiddenThreads: Array.from(state.hiddenThreads),
                hiddenPosts: Array.from(state.hiddenPosts),
            }),
            merge: (persisted: any, current) => ({
                ...current,
                ...persisted,
                // Convert arrays back to Sets
                hiddenThreads: new Set(persisted?.hiddenThreads || []),
                hiddenPosts: new Set(persisted?.hiddenPosts || []),
            }),
        }
    )
)
