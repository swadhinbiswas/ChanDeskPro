/**
 * 4chan Provider
 * 
 * Implementation of ImageboardProvider for 4chan.org
 */

import { invoke } from '@tauri-apps/api/core'
import type {
    ImageboardProvider,
    Board,
    CatalogThread,
    Thread,
    PostData,
    PostResult
} from '../types'

// 4chan board categories
const BOARD_CATEGORIES: Record<string, string> = {
    // Japanese Culture
    a: 'Japanese Culture', jp: 'Japanese Culture', m: 'Japanese Culture',
    // Video Games  
    v: 'Video Games', vg: 'Video Games', vp: 'Video Games', vr: 'Video Games',
    // Technology
    g: 'Technology', sci: 'Technology', diy: 'Technology',
    // Creative
    i: 'Creative', ic: 'Creative', gd: 'Creative', po: 'Creative',
    // Other
    b: 'Random', pol: 'News', int: 'Culture', sp: 'Sports',
}

class FourChanProvider implements ImageboardProvider {
    // Identity
    id = '4chan'
    name = '4chan'
    shortName = '4ch'
    baseUrl = 'https://4chan.org'
    color = '#117743'  // 4chan green
    icon = '🍀'

    // Configuration
    nsfw = false  // Has both SFW and NSFW boards
    supportsPosting = true
    supportsCaptcha = true
    requiresAuth = false

    async fetchBoards(): Promise<Board[]> {
        try {
            const boards = await invoke<any[]>('fetch_all_boards_with_metadata')
            return boards.map(b => ({
                id: b.id,
                name: b.name,
                description: b.description,
                nsfw: b.nsfw,
                category: BOARD_CATEGORIES[b.id] || 'Other',
            }))
        } catch (error) {
            console.error('Failed to fetch 4chan boards:', error)
            return []
        }
    }

    async fetchCatalog(board: string): Promise<CatalogThread[]> {
        try {
            const catalog = await invoke<any>('fetch_catalog', { board })
            // Flatten catalog pages into thread array
            const threads: CatalogThread[] = []
            if (Array.isArray(catalog)) {
                for (const page of catalog) {
                    if (page.threads) {
                        threads.push(...page.threads)
                    }
                }
            }
            return threads
        } catch (error) {
            console.error(`Failed to fetch /${board}/ catalog:`, error)
            return []
        }
    }

    async fetchThread(board: string, threadId: number): Promise<Thread> {
        try {
            const thread = await invoke<Thread>('fetch_thread', { board, threadId })
            return thread
        } catch (error) {
            console.error(`Failed to fetch thread ${threadId}:`, error)
            return { posts: [] }
        }
    }

    getImageUrl(board: string, tim: number, ext: string): string {
        return `https://i.4cdn.org/${board}/${tim}${ext}`
    }

    getThumbnailUrl(board: string, tim: number): string {
        return `https://i.4cdn.org/${board}/${tim}s.jpg`
    }

    async submitPost(data: PostData): Promise<PostResult> {
        try {
            const result = await invoke<PostResult>('submit_post', {
                request: {
                    board: data.board,
                    resto: data.resto || 0,
                    name: data.name,
                    email: data.email,
                    subject: data.subject,
                    comment: data.comment,
                },
                passToken: null,  // Would get from settings
            })
            return result
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to post',
            }
        }
    }
}

// Factory function
export function createFourChanProvider(): ImageboardProvider {
    return new FourChanProvider()
}

export default FourChanProvider
