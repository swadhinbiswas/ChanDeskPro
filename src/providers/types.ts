/**
 * Imageboard Provider System
 * 
 * This module defines the interface that all imageboard providers must implement.
 * This allows ChanDesk Pro to support multiple imageboards with a unified API.
 */

// Common types used across all providers
export interface Board {
    id: string
    name: string
    description?: string
    nsfw: boolean
    category?: string
}

export interface CatalogThread {
    no: number
    sub?: string  // Subject/title
    com?: string  // Comment/content
    tim?: number  // Timestamp for image
    ext?: string  // Image extension
    filename?: string
    replies: number
    images: number
    time: number
    name?: string
    trip?: string
    sticky?: boolean
    closed?: boolean
}

export interface Post {
    no: number
    resto: number  // 0 for OP, thread ID for replies
    time: number
    name?: string
    trip?: string
    sub?: string
    com?: string
    tim?: number
    ext?: string
    filename?: string
    fsize?: number
    w?: number
    h?: number
    tn_w?: number
    tn_h?: number
    replies?: number
    images?: number
}

export interface Thread {
    posts: Post[]
}

export interface PostData {
    board: string
    resto?: number  // Thread ID for replies, omit for new thread
    name?: string
    email?: string
    subject?: string
    comment: string
    file?: File
}

export interface PostResult {
    success: boolean
    threadId?: number
    postId?: number
    error?: string
}

/**
 * The main interface that all imageboard providers must implement.
 * This abstracts the differences between 4chan, 7chan, 8kun, etc.
 */
export interface ImageboardProvider {
    // Identity
    id: string              // Unique identifier (e.g., "4chan", "7chan")
    name: string            // Display name (e.g., "4chan", "7chan")
    shortName: string       // Short name for tabs (e.g., "4ch", "7ch")
    baseUrl: string         // Website URL
    color: string           // Brand color for UI
    icon?: string           // Icon URL or data URI

    // Configuration
    nsfw: boolean           // Is this site NSFW by default?
    supportsPosting: boolean
    supportsCaptcha: boolean
    requiresAuth: boolean   // Requires login/pass?

    // API Methods
    fetchBoards(): Promise<Board[]>
    fetchCatalog(board: string): Promise<CatalogThread[]>
    fetchThread(board: string, threadId: number): Promise<Thread>

    // Media URLs
    getImageUrl(board: string, tim: number, ext: string): string
    getThumbnailUrl(board: string, tim: number): string

    // Optional posting
    submitPost?(data: PostData): Promise<PostResult>
}

/**
 * Provider metadata for the registry
 */
export interface ProviderInfo {
    id: string
    name: string
    shortName: string
    color: string
    icon?: string
    enabled: boolean
}

/**
 * Type for provider constructor
 */
export type ProviderFactory = () => ImageboardProvider
