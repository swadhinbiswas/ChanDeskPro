/**
 * Provider Store
 * 
 * Zustand store for managing the active imageboard provider.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { providerRegistry, type ProviderInfo } from '../providers'

interface ProviderState {
    // Current active provider
    activeProviderId: string

    // Per-provider state (board selections, favorites, etc.)
    providerState: Record<string, {
        currentBoard: string | null
        currentThread: number | null
        favorites: string[]
    }>

    // Actions
    setActiveProvider: (id: string) => void
    setCurrentBoard: (board: string | null) => void
    setCurrentThread: (threadId: number | null) => void
    addFavorite: (board: string) => void
    removeFavorite: (board: string) => void
    toggleFavorite: (board: string) => void

    // Getters
    getActiveProvider: () => ReturnType<typeof providerRegistry.get>
    getCurrentBoard: () => string | null
    getCurrentThread: () => number | null
    getFavorites: () => string[]
}

export const useProviderStore = create<ProviderState>()(
    persist(
        (set, get) => ({
            activeProviderId: '4chan',
            providerState: {
                '4chan': { currentBoard: null, currentThread: null, favorites: ['g', 'v', 'a'] },
                '7chan': { currentBoard: null, currentThread: null, favorites: [] },
            },

            setActiveProvider: (id) => {
                if (providerRegistry.has(id)) {
                    set({ activeProviderId: id })
                }
            },

            setCurrentBoard: (board) => {
                const { activeProviderId, providerState } = get()
                const current = providerState[activeProviderId] || { currentBoard: null, currentThread: null, favorites: [] }
                set({
                    providerState: {
                        ...providerState,
                        [activeProviderId]: { ...current, currentBoard: board, currentThread: null }
                    }
                })
            },

            setCurrentThread: (threadId) => {
                const { activeProviderId, providerState } = get()
                const current = providerState[activeProviderId] || { currentBoard: null, currentThread: null, favorites: [] }
                set({
                    providerState: {
                        ...providerState,
                        [activeProviderId]: { ...current, currentThread: threadId }
                    }
                })
            },

            addFavorite: (board) => {
                const { activeProviderId, providerState } = get()
                const current = providerState[activeProviderId] || { currentBoard: null, currentThread: null, favorites: [] }
                if (!current.favorites.includes(board)) {
                    set({
                        providerState: {
                            ...providerState,
                            [activeProviderId]: { ...current, favorites: [...current.favorites, board] }
                        }
                    })
                }
            },

            removeFavorite: (board) => {
                const { activeProviderId, providerState } = get()
                const current = providerState[activeProviderId] || { currentBoard: null, currentThread: null, favorites: [] }
                set({
                    providerState: {
                        ...providerState,
                        [activeProviderId]: {
                            ...current,
                            favorites: current.favorites.filter(f => f !== board)
                        }
                    }
                })
            },

            toggleFavorite: (board) => {
                const { getFavorites, addFavorite, removeFavorite } = get()
                if (getFavorites().includes(board)) {
                    removeFavorite(board)
                } else {
                    addFavorite(board)
                }
            },

            getActiveProvider: () => {
                return providerRegistry.get(get().activeProviderId)
            },

            getCurrentBoard: () => {
                const { activeProviderId, providerState } = get()
                return providerState[activeProviderId]?.currentBoard || null
            },

            getCurrentThread: () => {
                const { activeProviderId, providerState } = get()
                return providerState[activeProviderId]?.currentThread || null
            },

            getFavorites: () => {
                const { activeProviderId, providerState } = get()
                return providerState[activeProviderId]?.favorites || []
            },
        }),
        {
            name: 'provider-storage',
        }
    )
)

export default useProviderStore
