/**
 * Lightbox Store
 * 
 * Global state for fullscreen image lightbox.
 * Allows opening lightbox from anywhere in the app.
 */

import { create } from 'zustand'

interface LightboxImage {
    url: string
    thumbnail: string
    filename?: string
    width?: number
    height?: number
}

interface LightboxStore {
    isOpen: boolean
    images: LightboxImage[]
    currentIndex: number

    // Actions
    openLightbox: (images: LightboxImage[], index?: number) => void
    closeLightbox: () => void
    setIndex: (index: number) => void
    next: () => void
    prev: () => void
}

export const useLightboxStore = create<LightboxStore>((set, get) => ({
    isOpen: false,
    images: [],
    currentIndex: 0,

    openLightbox: (images, index = 0) => {
        set({
            isOpen: true,
            images,
            currentIndex: index,
        })
    },

    closeLightbox: () => {
        set({
            isOpen: false,
            images: [],
            currentIndex: 0,
        })
    },

    setIndex: (index) => {
        const { images } = get()
        if (index >= 0 && index < images.length) {
            set({ currentIndex: index })
        }
    },

    next: () => {
        const { currentIndex, images } = get()
        if (currentIndex < images.length - 1) {
            set({ currentIndex: currentIndex + 1 })
        }
    },

    prev: () => {
        const { currentIndex } = get()
        if (currentIndex > 0) {
            set({ currentIndex: currentIndex - 1 })
        }
    },
}))
