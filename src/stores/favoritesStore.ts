import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesStore {
    favorites: string[]
    addFavorite: (boardId: string) => void
    removeFavorite: (boardId: string) => void
    toggleFavorite: (boardId: string) => void
    reorderFavorites: (newOrder: string[]) => void
}

export const useFavoritesStore = create<FavoritesStore>()(
    persist(
        (set) => ({
            favorites: ['g', 'v', 'a'], // Default favorites

            addFavorite: (boardId) =>
                set((state) => ({
                    favorites: state.favorites.includes(boardId)
                        ? state.favorites
                        : [...state.favorites, boardId],
                })),

            removeFavorite: (boardId) =>
                set((state) => ({
                    favorites: state.favorites.filter((id) => id !== boardId),
                })),

            toggleFavorite: (boardId) =>
                set((state) => ({
                    favorites: state.favorites.includes(boardId)
                        ? state.favorites.filter((id) => id !== boardId)
                        : [...state.favorites, boardId],
                })),

            reorderFavorites: (newOrder) =>
                set({ favorites: newOrder }),
        }),
        {
            name: 'favorites-storage',
        }
    )
)

