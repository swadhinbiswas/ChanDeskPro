/**
 * 4plebs Archive Provider
 * 
 * Implementation of ImageboardProvider for 4plebs.org
 * 
 * 4plebs is a 4chan archive that stores historical threads from select boards.
 * Uses FoolFuuka board software with a different API structure than 4chan.
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

// 4plebs archived boards
const FOURPLEBS_BOARDS: Board[] = [
    { id: 'adv', name: 'Advice', nsfw: false, category: 'Archive' },
    { id: 'f', name: 'Flash', nsfw: false, category: 'Archive' },
    { id: 'hr', name: 'High Resolution', nsfw: false, category: 'Archive' },
    { id: 'o', name: 'Auto', nsfw: false, category: 'Archive' },
    { id: 'pol', name: 'Politically Incorrect', nsfw: true, category: 'Archive' },
    { id: 's4s', name: 'Shit 4chan Says', nsfw: true, category: 'Archive' },
    { id: 'sp', name: 'Sports', nsfw: false, category: 'Archive' },
    { id: 'tg', name: 'Traditional Games', nsfw: false, category: 'Archive' },
    { id: 'trv', name: 'Travel', nsfw: false, category: 'Archive' },
    { id: 'tv', name: 'Television & Film', nsfw: false, category: 'Archive' },
    { id: 'x', name: 'Paranormal', nsfw: false, category: 'Archive' },
]

class FourPlebsProvider implements ImageboardProvider {
    // Identity
    id = '4plebs'
    name = '4plebs Archive'
    shortName = '4pl'
    baseUrl = 'https://4plebs.org'
    color = '#FF6B35'  // Orange
    icon = '📚'

    // Configuration
    nsfw = true  // Has NSFW archived content
    supportsPosting = false  // Archives don't accept new posts
    supportsCaptcha = false
    requiresAuth = false

    async fetchBoards(): Promise<Board[]> {
        // Return hardcoded boards - 4plebs doesn't have a board list API
        return FOURPLEBS_BOARDS
    }

    async fetchCatalog(board: string): Promise<CatalogThread[]> {
        try {
            const result = await invoke<any[]>('fetch_fourplebs_catalog', { board, page: 1 })

            // Convert FoolFuuka format to our standard format
            return (result || []).map(thread => ({
                no: thread.no,
                sub: thread.sub,
                com: thread.com,
                tim: thread.tim ? parseInt(thread.tim, 10) : undefined,
                ext: thread.ext,
                replies: thread.replies || 0,
                images: thread.images || 0,
                time: thread.time,
                name: thread.name,
                trip: thread.trip,
            }))
        } catch (error) {
            // 4plebs rate limits aggressively - fail silently
            console.warn(`4plebs /${board}/: rate limited or inaccessible`)
            return []
        }
    }

    async fetchThread(board: string, threadId: number): Promise<Thread> {
        try {
            const result = await invoke<any>('fetch_fourplebs_thread', { board, threadId })

            if (!result || !result.posts) {
                return { posts: [] }
            }

            // Convert posts to our standard format
            const posts: Post[] = result.posts.map((post: any) => ({
                no: post.no,
                resto: post.resto,
                time: post.time,
                name: post.name,
                trip: post.trip,
                sub: post.sub,
                com: post.com,
                tim: post.tim ? parseInt(post.tim, 10) : undefined,
                ext: post.ext,
                filename: post.filename,
                fsize: post.fsize,
                w: post.w,
                h: post.h,
                tn_w: post.tn_w,
                tn_h: post.tn_h,
            }))

            return { posts }
        } catch (error) {
            console.warn(`4plebs thread ${threadId}: not accessible`)
            return { posts: [] }
        }
    }

    getImageUrl(board: string, tim: number, ext: string): string {
        // 4plebs image URL format via i.4pcdn.org
        return `https://i.4pcdn.org/${board}/${tim}${ext}`
    }

    getThumbnailUrl(board: string, tim: number): string {
        // 4plebs thumbnail format
        return `https://i.4pcdn.org/${board}/${tim}s.jpg`
    }
}

// Factory function
export function createFourPlebsProvider(): ImageboardProvider {
    return new FourPlebsProvider()
}

export default FourPlebsProvider
