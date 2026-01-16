/**
 * 22chan Provider
 * 
 * Implementation of ImageboardProvider for 22chan.org
 * 
 * 22chan uses a custom Django stack and requires HTML scraping
 * since there's no JSON API available.
 */

import { invoke } from '@tauri-apps/api/core'
import type {
    ImageboardProvider,
    Board,
    CatalogThread,
    Thread,
    Post,
} from '../types'

class TwentyTwoChanProvider implements ImageboardProvider {
    // Identity
    id = '22chan'
    name = '22chan'
    shortName = '22'
    baseUrl = 'https://22chan.org'
    color = '#1E3A5F'  // Dark blue
    icon = '🔷'

    // Configuration
    nsfw = true  // Has NSFW boards
    supportsPosting = false  // Scraping only
    supportsCaptcha = false
    requiresAuth = false

    async fetchBoards(): Promise<Board[]> {
        try {
            const result = await invoke<any[]>('fetch_twentytwochan_boards')
            return (result || []).map(b => ({
                id: b.id,
                name: b.name,
                description: b.description,
                nsfw: b.nsfw,
                category: b.category || '22chan',
            }))
        } catch (error) {
            console.error('Failed to fetch 22chan boards:', error)
            return []
        }
    }

    async fetchCatalog(board: string): Promise<CatalogThread[]> {
        try {
            const result = await invoke<any[]>('fetch_twentytwochan_catalog', { board })

            return (result || []).map(thread => ({
                no: thread.no,
                sub: thread.sub,
                com: thread.com,
                tim: thread.tim ? parseInt(thread.tim, 10) || undefined : undefined,
                ext: thread.ext,
                replies: thread.replies || 0,
                images: thread.images || 0,
                time: thread.time || Date.now() / 1000,
                name: thread.name,
            }))
        } catch (error) {
            // 22chan scraping can fail for various reasons - fail silently
            console.warn(`22chan /${board}/: board may not exist or is inaccessible`)
            return []
        }
    }

    async fetchThread(board: string, threadId: number): Promise<Thread> {
        try {
            const result = await invoke<any>('fetch_twentytwochan_thread', { board, threadId })

            if (!result || !result.posts) {
                return { posts: [] }
            }

            const posts: Post[] = result.posts.map((post: any) => ({
                no: post.no,
                resto: post.resto,
                time: post.time || Date.now() / 1000,
                name: post.name,
                trip: post.trip,
                sub: post.sub,
                com: post.com,
                tim: post.tim ? parseInt(post.tim, 10) || undefined : undefined,
                ext: post.ext,
                filename: post.filename,
            }))

            return { posts }
        } catch (error) {
            console.error(`Failed to fetch 22chan thread ${threadId}:`, error)
            return { posts: [] }
        }
    }

    getImageUrl(board: string, tim: number, ext: string): string {
        // 22chan image URL: stored in /UserMedia/uploads/
        // The tim here is actually the filename without extension
        return `https://22chan.org/UserMedia/uploads/${tim}${ext}`
    }

    getThumbnailUrl(board: string, tim: number): string {
        // 22chan thumbnails are in /UserMedia/uploads/thumbnails/
        return `https://22chan.org/UserMedia/uploads/thumbnails/${tim}s.jpg`
    }
}

// Factory function
export function createTwentyTwoChanProvider(): ImageboardProvider {
    return new TwentyTwoChanProvider()
}

export default TwentyTwoChanProvider
