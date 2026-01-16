import { invoke } from '@tauri-apps/api/core'
import type { BoardInfo } from '../types/boards'
import type { Thread, Catalog } from '../types/api'

export async function fetchAllBoardsWithMetadata(): Promise<BoardInfo[]> {
    return await invoke<BoardInfo[]>('fetch_all_boards_with_metadata')
}

export async function searchBoards(query: string): Promise<BoardInfo[]> {
    return await invoke<BoardInfo[]>('search_boards', { query })
}

export async function fetchCatalog(board: string): Promise<Catalog> {
    return await invoke<Catalog>('fetch_catalog', { board })
}

export async function fetchThread(board: string, threadId: number): Promise<Thread> {
    return await invoke<Thread>('fetch_thread', { board, threadId })
}

// Image proxy to bypass CORS
export async function fetchImageWithProxy(url: string): Promise<string> {
    return await invoke<string>('fetch_image_with_cors_bypass', { url })
}

export async function clearImageCache(): Promise<void> {
    return await invoke('clear_image_cache')
}

// Media caching
export async function downloadMedia(url: string, board: string, threadId: number): Promise<string> {
    return await invoke<string>('download_media', { url, board, threadId })
}

export async function getCachedMediaPath(board: string, threadId: number, filename: string): Promise<string | null> {
    return await invoke<string | null>('get_cached_media_path', { board, threadId, filename })
}

export async function clearMediaCache(): Promise<void> {
    return await invoke('clear_media_cache')
}

export async function getCacheSize(): Promise<number> {
    return await invoke<number>('get_cache_size')
}

// Posting functions
export interface PostRequest {
    board: string
    resto?: number
    name?: string
    email?: string
    subject?: string
    comment: string
    file_path?: string
    file_name?: string
}

export interface PostResponse {
    success: boolean
    thread_id?: number
    post_id?: number
    error?: string
}

export async function submitPost(request: PostRequest, passToken?: string | null): Promise<PostResponse> {
    return await invoke<PostResponse>('submit_post', { request, passToken })
}

export async function getPostCooldown(): Promise<number> {
    return await invoke<number>('get_post_cooldown')
}

export async function validatePassToken(token: string): Promise<boolean> {
    return await invoke<boolean>('validate_pass_token', { token })
}

// Helper functions for image URLs
export function getImageUrl(board: string, tim: number, ext: string): string {
    return `https://i.4cdn.org/${board}/${tim}${ext}`
}

export function getThumbnailUrl(board: string, tim: number): string {
    return `https://i.4cdn.org/${board}/${tim}s.jpg`
}

export function getThreadUrl(board: string, threadId: number): string {
    return `https://boards.4channel.org/${board}/thread/${threadId}`
}

