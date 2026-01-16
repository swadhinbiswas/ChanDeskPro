/**
 * 7chan Provider
 * 
 * Implementation of ImageboardProvider for 7chan.org
 * 
 * Note: 7chan uses Kusaba X board software and has a different API structure.
 * Some features may require HTML parsing rather than JSON API.
 */

import { invoke } from '@tauri-apps/api/core'
import type {
    ImageboardProvider,
    Board,
    CatalogThread,
    Thread,
    Post,
    PostData,
    PostResult
} from '../types'

// 7chan boards (hardcoded as 7chan doesn't have a board list API)
const SEVEN_CHAN_BOARDS: Board[] = [
    // Anime/Media
    { id: 'a', name: 'Anime', nsfw: false, category: 'Anime & Media' },
    { id: 'me', name: 'Mecha', nsfw: false, category: 'Anime & Media' },
    { id: 'co', name: 'Comics & Cartoons', nsfw: false, category: 'Anime & Media' },
    { id: 'tv', name: 'Movies & TV', nsfw: false, category: 'Anime & Media' },

    // Technology
    { id: 'pr', name: 'Programming', nsfw: false, category: 'Technology' },
    { id: 'tech', name: 'Technology', nsfw: false, category: 'Technology' },

    // Games
    { id: 'tg', name: 'Tabletop Games', nsfw: false, category: 'Games' },
    { id: 'vg', name: 'Video Games', nsfw: false, category: 'Games' },

    // Other
    { id: 'b', name: 'Random', nsfw: true, category: 'Random' },
    { id: 'gfx', name: 'Graphics', nsfw: false, category: 'Creative' },
    { id: 'w', name: 'Weapons', nsfw: false, category: 'Interests' },
    { id: 'fit', name: 'Fitness', nsfw: false, category: 'Lifestyle' },
    { id: 'fl', name: 'Flash', nsfw: false, category: 'Creative' },
    { id: 'lit', name: 'Literature', nsfw: false, category: 'Culture' },
    { id: 'phi', name: 'Philosophy', nsfw: false, category: 'Culture' },
    { id: 'x', name: 'Paranormal', nsfw: false, category: 'Interests' },

    // NSFW
    { id: 'gif', name: 'Animated GIFs', nsfw: true, category: 'Adult' },
    { id: 'd', name: 'Alternative Hentai', nsfw: true, category: 'Adult' },
    { id: 'h', name: 'Hentai', nsfw: true, category: 'Adult' },
    { id: 'di', name: 'Sexy Beautiful Traps', nsfw: true, category: 'Adult' },
]

class SevenChanProvider implements ImageboardProvider {
    // Identity
    id = '7chan'
    name = '7chan'
    shortName = '7ch'
    baseUrl = 'https://7chan.org'
    color = '#7C3AED'  // Purple
    icon = '7️⃣'

    // Configuration
    nsfw = true  // Has mostly NSFW content
    supportsPosting = false  // Not implemented yet
    supportsCaptcha = false
    requiresAuth = false

    async fetchBoards(): Promise<Board[]> {
        // Return hardcoded boards (7chan doesn't have a board list API)
        return SEVEN_CHAN_BOARDS
    }

    async fetchCatalog(board: string): Promise<CatalogThread[]> {
        try {
            // 7chan uses a different format - we'll need backend support
            const result = await invoke<any>('fetch_sevenchan_catalog', { board })
            return result || []
        } catch (error) {
            // 7chan scraping often fails - fail silently
            console.warn(`7chan /${board}/: board may not be accessible`)
            return []
        }
    }

    async fetchThread(board: string, threadId: number): Promise<Thread> {
        try {
            const result = await invoke<any>('fetch_sevenchan_thread', { board, threadId })
            return result || { posts: [] }
        } catch (error) {
            console.warn(`7chan thread ${threadId}: not accessible`)
            return { posts: [] }
        }
    }

    getImageUrl(board: string, tim: number, ext: string): string {
        // 7chan image URL format
        return `https://7chan.org/${board}/src/${tim}${ext}`
    }

    getThumbnailUrl(board: string, tim: number): string {
        // 7chan thumbnail format
        return `https://7chan.org/${board}/thumb/${tim}s.jpg`
    }
}

// Factory function
export function createSevenChanProvider(): ImageboardProvider {
    return new SevenChanProvider()
}

export default SevenChanProvider
