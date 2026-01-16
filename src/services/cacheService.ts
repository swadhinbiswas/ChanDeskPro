/**
 * Cache Service
 * 
 * Frontend wrapper for SQLite thread caching.
 * Provides utilities to check, fetch, and manage cached threads.
 */

import { invoke } from '@tauri-apps/api/core';

// Types
export interface CacheStats {
    thread_count: number;
    post_count: number;
    db_size_bytes: number;
    oldest_cache_timestamp: number | null;
    newest_cache_timestamp: number | null;
}

export interface CachedPost {
    board: string;
    thread_id: number;
    post_no: number;
    resto: number;
    time: number;
    name: string | null;
    trip: string | null;
    subject: string | null;
    comment: string | null;
    tim: number | null;
    ext: string | null;
    filename: string | null;
    fsize: number | null;
    w: number | null;
    h: number | null;
}

export interface CachedThread {
    board: string;
    thread_id: number;
    subject: string | null;
    reply_count: number;
    image_count: number;
    last_modified: number;
    cached_at: number;
    posts: CachedPost[];
}

export interface CleanupResult {
    deleted_by_age: number;
    deleted_by_size: number;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
    return invoke<CacheStats>('get_thread_cache_stats');
}

/**
 * Check if a thread is cached and fresh
 * @param maxAgeSecs Maximum age in seconds (default: 1 hour)
 */
export async function isThreadCached(
    board: string,
    threadId: number,
    maxAgeSecs: number = 3600
): Promise<boolean> {
    return invoke<boolean>('is_thread_cached', {
        board,
        threadId,
        maxAgeSecs
    });
}

/**
 * Get a cached thread
 */
export async function getCachedThread(
    board: string,
    threadId: number
): Promise<CachedThread | null> {
    return invoke<CachedThread | null>('get_cached_thread', {
        board,
        threadId
    });
}

/**
 * Cache a thread
 */
export async function cacheThread(
    board: string,
    threadId: number,
    subject: string | null,
    posts: CachedPost[]
): Promise<void> {
    return invoke('cache_thread', {
        board,
        threadId,
        subject,
        posts
    });
}

/**
 * Run cache cleanup
 */
export async function runCacheCleanup(
    maxAgeDays?: number,
    maxSizeMb?: number
): Promise<CleanupResult> {
    return invoke<CleanupResult>('cleanup_thread_cache', {
        maxAgeDays,
        maxSizeMb,
    });
}

/**
 * Clear all thread cache
 */
export async function clearThreadCache(): Promise<void> {
    return invoke('clear_thread_cache');
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
