/**
 * Archived.moe Provider
 * 
 * Implementation of ImageboardProvider for archived.moe
 * 
 * Archived.moe is a 4chan archive using FoolFuuka software.
 * Archives a very large selection of 4chan boards.
 */

import { invoke } from '@tauri-apps/api/core'
import type {
    ImageboardProvider,
    Board,
    CatalogThread,
    Thread,
    Post,
} from '../types'

class ArchivedMoeProvider implements ImageboardProvider {
    // Identity
    id = 'archivedmoe'
    name = 'Archived.moe'
    shortName = 'arc'
    baseUrl = 'https://archived.moe'
    color = '#8B5CF6'  // Purple
    icon = '🗃️'

    // Configuration
    nsfw = true  // Has NSFW archived content
    supportsPosting = false  // Archives don't accept new posts
    supportsCaptcha = false
    requiresAuth = false

    async fetchBoards(): Promise<Board[]> {
        try {
            const result = await invoke<any[]>('fetch_archivedmoe_boards')
            return (result || []).map(b => ({
                id: b.id,
                name: b.name,
                description: b.description,
                nsfw: b.nsfw,
                category: b.category || 'Archive',
            }))
        } catch (error) {
            console.error('Failed to fetch archived.moe boards:', error)
            return []
        }
    }

    async fetchCatalog(board: string): Promise<CatalogThread[]> {
        try {
            const result = await invoke<any[]>('fetch_archivedmoe_catalog', { board, page: 1 })

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
            console.error(`Failed to fetch archived.moe /${board}/ catalog:`, error)
            return []
        }
    }

    async fetchThread(board: string, threadId: number): Promise<Thread> {
        try {
            const result = await invoke<any>('fetch_archivedmoe_thread', { board, threadId })

            if (!result || !result.posts) {
                return { posts: [] }
            }

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
            console.error(`Failed to fetch archived.moe thread ${threadId}:`, error)
            return { posts: [] }
        }
    }

    getImageUrl(board: string, tim: number, ext: string): string {
        // archived.moe image URL format
        return `https://archived.moe/${board}/full_image/${tim}${ext}`
    }

    getThumbnailUrl(board: string, tim: number): string {
        // archived.moe thumbnail format
        return `https://archived.moe/${board}/thumb/${tim}s.jpg`
    }
}

// Factory function
export function createArchivedMoeProvider(): ImageboardProvider {
    return new ArchivedMoeProvider()
}

export default ArchivedMoeProvider
