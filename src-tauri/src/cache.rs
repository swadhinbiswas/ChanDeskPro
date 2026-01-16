/**
 * Thread Cache Module
 * 
 * SQLite-based caching for threads and posts with automatic cleanup.
 * 
 * Features:
 * - Cache threads and posts locally
 * - Automatic cleanup by age (default: 7 days)
 * - Size-based cleanup (default: 100MB limit)
 * - Cache statistics
 */

use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use chrono::{DateTime, Utc};
use lazy_static::lazy_static;

// Cache configuration
const DEFAULT_MAX_AGE_DAYS: i64 = 7;
const DEFAULT_MAX_SIZE_MB: u64 = 100;

lazy_static! {
    static ref DB_CONNECTION: Mutex<Option<Connection>> = Mutex::new(None);
}

/// Get the cache database path
fn get_cache_db_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("chandesk")
        .join("cache");
    
    std::fs::create_dir_all(&data_dir).ok();
    data_dir.join("threads.db")
}

/// Initialize the database connection and schema
pub fn init_cache_db() -> Result<()> {
    let path = get_cache_db_path();
    let conn = Connection::open(&path)?;
    
    // Create tables
    conn.execute_batch(r#"
        -- Cached threads metadata
        CREATE TABLE IF NOT EXISTS cached_threads (
            id INTEGER PRIMARY KEY,
            board TEXT NOT NULL,
            thread_id INTEGER NOT NULL,
            subject TEXT,
            reply_count INTEGER DEFAULT 0,
            image_count INTEGER DEFAULT 0,
            last_modified INTEGER NOT NULL,
            cached_at INTEGER NOT NULL,
            accessed_at INTEGER NOT NULL,
            UNIQUE(board, thread_id)
        );
        
        -- Cached posts
        CREATE TABLE IF NOT EXISTS cached_posts (
            id INTEGER PRIMARY KEY,
            board TEXT NOT NULL,
            thread_id INTEGER NOT NULL,
            post_no INTEGER NOT NULL,
            resto INTEGER DEFAULT 0,
            time INTEGER NOT NULL,
            name TEXT,
            trip TEXT,
            subject TEXT,
            comment TEXT,
            tim INTEGER,
            ext TEXT,
            filename TEXT,
            fsize INTEGER,
            w INTEGER,
            h INTEGER,
            cached_at INTEGER NOT NULL,
            UNIQUE(board, post_no)
        );
        
        -- Cache metadata for tracking size
        CREATE TABLE IF NOT EXISTS cache_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        
        -- Indexes for faster lookups
        CREATE INDEX IF NOT EXISTS idx_threads_board ON cached_threads(board);
        CREATE INDEX IF NOT EXISTS idx_threads_cached ON cached_threads(cached_at);
        CREATE INDEX IF NOT EXISTS idx_threads_accessed ON cached_threads(accessed_at);
        CREATE INDEX IF NOT EXISTS idx_posts_thread ON cached_posts(board, thread_id);
        CREATE INDEX IF NOT EXISTS idx_posts_cached ON cached_posts(cached_at);
    "#)?;
    
    let mut guard = DB_CONNECTION.lock().unwrap();
    *guard = Some(conn);
    
    Ok(())
}

/// Get a database connection
fn get_connection() -> Result<std::sync::MutexGuard<'static, Option<Connection>>> {
    let guard = DB_CONNECTION.lock().unwrap();
    if guard.is_none() {
        drop(guard);
        init_cache_db()?;
        return Ok(DB_CONNECTION.lock().unwrap());
    }
    Ok(guard)
}

/// Cached thread data structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CachedThread {
    pub board: String,
    pub thread_id: i64,
    pub subject: Option<String>,
    pub reply_count: i32,
    pub image_count: i32,
    pub last_modified: i64,
    pub cached_at: i64,
    pub accessed_at: i64,
}

/// Cached post data structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CachedPost {
    pub board: String,
    pub thread_id: i64,
    pub post_no: i64,
    pub resto: i64,
    pub time: i64,
    pub name: Option<String>,
    pub trip: Option<String>,
    pub subject: Option<String>,
    pub comment: Option<String>,
    pub tim: Option<i64>,
    pub ext: Option<String>,
    pub filename: Option<String>,
    pub fsize: Option<i64>,
    pub w: Option<i32>,
    pub h: Option<i32>,
}

/// Cache a thread with its posts
pub fn cache_thread(board: &str, thread_id: i64, subject: Option<&str>, posts: &[CachedPost]) -> Result<()> {
    let guard = get_connection()?;
    let conn = guard.as_ref().unwrap();
    let now = Utc::now().timestamp();
    
    // Insert/update thread metadata
    conn.execute(
        r#"INSERT OR REPLACE INTO cached_threads 
           (board, thread_id, subject, reply_count, image_count, last_modified, cached_at, accessed_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)"#,
        params![
            board,
            thread_id,
            subject,
            posts.len() as i32 - 1,
            posts.iter().filter(|p| p.tim.is_some()).count() as i32,
            now,
            now
        ],
    )?;
    
    // Insert/update posts
    for post in posts {
        conn.execute(
            r#"INSERT OR REPLACE INTO cached_posts 
               (board, thread_id, post_no, resto, time, name, trip, subject, comment, tim, ext, filename, fsize, w, h, cached_at)
               VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)"#,
            params![
                post.board,
                post.thread_id,
                post.post_no,
                post.resto,
                post.time,
                post.name,
                post.trip,
                post.subject,
                post.comment,
                post.tim,
                post.ext,
                post.filename,
                post.fsize,
                post.w,
                post.h,
                now
            ],
        )?;
    }
    
    Ok(())
}

/// Get a cached thread with its posts
pub fn get_cached_thread(board: &str, thread_id: i64) -> Result<Option<(CachedThread, Vec<CachedPost>)>> {
    let guard = get_connection()?;
    let conn = guard.as_ref().unwrap();
    let now = Utc::now().timestamp();
    
    // Update accessed_at
    conn.execute(
        "UPDATE cached_threads SET accessed_at = ?1 WHERE board = ?2 AND thread_id = ?3",
        params![now, board, thread_id],
    )?;
    
    // Get thread metadata
    let thread: Option<CachedThread> = conn.query_row(
        "SELECT board, thread_id, subject, reply_count, image_count, last_modified, cached_at, accessed_at 
         FROM cached_threads WHERE board = ?1 AND thread_id = ?2",
        params![board, thread_id],
        |row| Ok(CachedThread {
            board: row.get(0)?,
            thread_id: row.get(1)?,
            subject: row.get(2)?,
            reply_count: row.get(3)?,
            image_count: row.get(4)?,
            last_modified: row.get(5)?,
            cached_at: row.get(6)?,
            accessed_at: row.get(7)?,
        }),
    ).ok();
    
    if thread.is_none() {
        return Ok(None);
    }
    
    // Get posts
    let mut stmt = conn.prepare(
        "SELECT board, thread_id, post_no, resto, time, name, trip, subject, comment, tim, ext, filename, fsize, w, h
         FROM cached_posts WHERE board = ?1 AND thread_id = ?2 ORDER BY post_no ASC"
    )?;
    
    let posts: Vec<CachedPost> = stmt.query_map(params![board, thread_id], |row| {
        Ok(CachedPost {
            board: row.get(0)?,
            thread_id: row.get(1)?,
            post_no: row.get(2)?,
            resto: row.get(3)?,
            time: row.get(4)?,
            name: row.get(5)?,
            trip: row.get(6)?,
            subject: row.get(7)?,
            comment: row.get(8)?,
            tim: row.get(9)?,
            ext: row.get(10)?,
            filename: row.get(11)?,
            fsize: row.get(12)?,
            w: row.get(13)?,
            h: row.get(14)?,
        })
    })?.filter_map(|r| r.ok()).collect();
    
    Ok(Some((thread.unwrap(), posts)))
}

/// Check if a thread is cached and fresh (within max_age_days)
pub fn is_thread_cached(board: &str, thread_id: i64, max_age_secs: i64) -> Result<bool> {
    let guard = get_connection()?;
    let conn = guard.as_ref().unwrap();
    let cutoff = Utc::now().timestamp() - max_age_secs;
    
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM cached_threads WHERE board = ?1 AND thread_id = ?2 AND cached_at > ?3",
        params![board, thread_id, cutoff],
        |row| row.get(0),
    )?;
    
    Ok(count > 0)
}

/// Get cache statistics
#[derive(Debug, Serialize, Clone)]
pub struct CacheStats {
    pub thread_count: i64,
    pub post_count: i64,
    pub db_size_bytes: u64,
    pub oldest_cache_timestamp: Option<i64>,
    pub newest_cache_timestamp: Option<i64>,
}

pub fn get_cache_stats() -> Result<CacheStats> {
    let guard = get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let thread_count: i64 = conn.query_row("SELECT COUNT(*) FROM cached_threads", [], |r| r.get(0))?;
    let post_count: i64 = conn.query_row("SELECT COUNT(*) FROM cached_posts", [], |r| r.get(0))?;
    let oldest: Option<i64> = conn.query_row("SELECT MIN(cached_at) FROM cached_threads", [], |r| r.get(0)).ok();
    let newest: Option<i64> = conn.query_row("SELECT MAX(cached_at) FROM cached_threads", [], |r| r.get(0)).ok();
    
    // Get file size
    let db_path = get_cache_db_path();
    let db_size_bytes = std::fs::metadata(&db_path).map(|m| m.len()).unwrap_or(0);
    
    Ok(CacheStats {
        thread_count,
        post_count,
        db_size_bytes,
        oldest_cache_timestamp: oldest,
        newest_cache_timestamp: newest,
    })
}

/// Clean up old cache entries by age
pub fn cleanup_old_cache(max_age_days: i64) -> Result<i64> {
    let guard = get_connection()?;
    let conn = guard.as_ref().unwrap();
    let cutoff = Utc::now().timestamp() - (max_age_days * 24 * 60 * 60);
    
    // Get threads to delete
    let deleted_threads: i64 = conn.execute(
        "DELETE FROM cached_threads WHERE cached_at < ?1",
        params![cutoff],
    )? as i64;
    
    // Delete orphaned posts
    conn.execute(
        "DELETE FROM cached_posts WHERE NOT EXISTS (
            SELECT 1 FROM cached_threads WHERE cached_threads.board = cached_posts.board 
            AND cached_threads.thread_id = cached_posts.thread_id
        )",
        [],
    )?;
    
    // Vacuum to reclaim space
    conn.execute("VACUUM", [])?;
    
    Ok(deleted_threads)
}

/// Clean up cache to stay under size limit
pub fn cleanup_by_size(max_size_mb: u64) -> Result<i64> {
    let stats = get_cache_stats()?;
    let max_size_bytes = max_size_mb * 1024 * 1024;
    
    if stats.db_size_bytes <= max_size_bytes {
        return Ok(0);
    }
    
    let guard = get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    // Delete least recently accessed threads until under limit
    let mut deleted = 0i64;
    while get_cache_stats()?.db_size_bytes > max_size_bytes {
        let result = conn.execute(
            "DELETE FROM cached_threads WHERE thread_id = (
                SELECT thread_id FROM cached_threads ORDER BY accessed_at ASC LIMIT 1
            )",
            [],
        )?;
        
        if result == 0 {
            break; // No more threads to delete
        }
        deleted += result as i64;
    }
    
    // Delete orphaned posts
    conn.execute(
        "DELETE FROM cached_posts WHERE NOT EXISTS (
            SELECT 1 FROM cached_threads WHERE cached_threads.board = cached_posts.board 
            AND cached_threads.thread_id = cached_posts.thread_id
        )",
        [],
    )?;
    
    // Vacuum to reclaim space
    conn.execute("VACUUM", [])?;
    
    Ok(deleted)
}

/// Clear all cache
pub fn clear_all_cache() -> Result<()> {
    let guard = get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    conn.execute("DELETE FROM cached_threads", [])?;
    conn.execute("DELETE FROM cached_posts", [])?;
    conn.execute("VACUUM", [])?;
    
    Ok(())
}

/// Run automatic cleanup (by age and size)
pub fn run_auto_cleanup(max_age_days: Option<i64>, max_size_mb: Option<u64>) -> Result<(i64, i64)> {
    let age_days = max_age_days.unwrap_or(DEFAULT_MAX_AGE_DAYS);
    let size_mb = max_size_mb.unwrap_or(DEFAULT_MAX_SIZE_MB);
    
    let deleted_by_age = cleanup_old_cache(age_days)?;
    let deleted_by_size = cleanup_by_size(size_mb)?;
    
    Ok((deleted_by_age, deleted_by_size))
}
