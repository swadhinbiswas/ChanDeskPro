/**
 * Cache Commands
 * 
 * Tauri commands for thread caching operations.
 */

use crate::cache::{self, CacheStats, CachedPost};
use serde::{Deserialize, Serialize};

/// Get cache statistics
#[tauri::command]
pub async fn get_thread_cache_stats() -> Result<CacheStats, String> {
    cache::get_cache_stats().map_err(|e| e.to_string())
}

/// Check if a thread is cached
#[tauri::command]
pub async fn is_thread_cached(board: String, thread_id: i64, max_age_secs: Option<i64>) -> Result<bool, String> {
    let age = max_age_secs.unwrap_or(3600); // Default: 1 hour freshness
    cache::is_thread_cached(&board, thread_id, age).map_err(|e| e.to_string())
}

/// Get a cached thread
#[tauri::command]
pub async fn get_cached_thread(board: String, thread_id: i64) -> Result<Option<CachedThreadResponse>, String> {
    match cache::get_cached_thread(&board, thread_id) {
        Ok(Some((thread, posts))) => Ok(Some(CachedThreadResponse {
            board: thread.board,
            thread_id: thread.thread_id,
            subject: thread.subject,
            reply_count: thread.reply_count,
            image_count: thread.image_count,
            last_modified: thread.last_modified,
            cached_at: thread.cached_at,
            posts,
        })),
        Ok(None) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[derive(Debug, Serialize)]
pub struct CachedThreadResponse {
    pub board: String,
    pub thread_id: i64,
    pub subject: Option<String>,
    pub reply_count: i32,
    pub image_count: i32,
    pub last_modified: i64,
    pub cached_at: i64,
    pub posts: Vec<CachedPost>,
}

/// Cache a thread
#[tauri::command]
pub async fn cache_thread(board: String, thread_id: i64, subject: Option<String>, posts: Vec<CachedPost>) -> Result<(), String> {
    cache::cache_thread(&board, thread_id, subject.as_deref(), &posts).map_err(|e| e.to_string())
}

/// Run cache cleanup
#[tauri::command]
pub async fn cleanup_thread_cache(max_age_days: Option<i64>, max_size_mb: Option<u64>) -> Result<CleanupResult, String> {
    let (deleted_by_age, deleted_by_size) = cache::run_auto_cleanup(max_age_days, max_size_mb)
        .map_err(|e| e.to_string())?;
    
    Ok(CleanupResult {
        deleted_by_age,
        deleted_by_size,
    })
}

#[derive(Debug, Serialize)]
pub struct CleanupResult {
    pub deleted_by_age: i64,
    pub deleted_by_size: i64,
}

/// Clear all thread cache
#[tauri::command]
pub async fn clear_thread_cache() -> Result<(), String> {
    cache::clear_all_cache().map_err(|e| e.to_string())
}
