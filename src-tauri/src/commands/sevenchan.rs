/**
 * 7chan API Commands
 * 
 * Backend commands for fetching data from 7chan.org
 * 
 * Note: 7chan uses Kusaba X which has a different API format than 4chan.
 * The catalog and thread endpoints return JSON in a different structure.
 */

use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;

const SEVENCHAN_BASE: &str = "https://7chan.org";

#[derive(Debug, Serialize, Deserialize)]
pub struct SevenChanPost {
    pub no: u64,
    pub resto: u64,
    pub time: u64,
    pub name: Option<String>,
    pub trip: Option<String>,
    pub sub: Option<String>,
    pub com: Option<String>,
    pub tim: Option<u64>,
    pub ext: Option<String>,
    pub filename: Option<String>,
    pub fsize: Option<u64>,
    pub w: Option<u32>,
    pub h: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SevenChanThread {
    pub posts: Vec<SevenChanPost>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SevenChanCatalogThread {
    pub no: u64,
    pub sub: Option<String>,
    pub com: Option<String>,
    pub tim: Option<u64>,
    pub ext: Option<String>,
    pub replies: u32,
    pub images: u32,
    pub time: u64,
}

/// Fetch catalog from 7chan
/// 7chan doesn't have a proper JSON API for catalog, so we need to parse differently
#[tauri::command]
pub async fn fetch_sevenchan_catalog(board: String) -> Result<Vec<SevenChanCatalogThread>, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    // Try JSON catalog first (some Kusaba X boards support this)
    let url = format!("{}/{}/catalog.json", SEVENCHAN_BASE, board);
    
    match client.get(&url).send().await {
        Ok(response) if response.status().is_success() => {
            let text = response.text().await.map_err(|e| e.to_string())?;
            
            // Try to parse as JSON array of pages (4chan-like format)
            if let Ok(pages) = serde_json::from_str::<Vec<Value>>(&text) {
                let mut threads = Vec::new();
                for page in pages {
                    if let Some(page_threads) = page.get("threads").and_then(|t| t.as_array()) {
                        for thread in page_threads {
                            if let Ok(t) = serde_json::from_value::<SevenChanCatalogThread>(thread.clone()) {
                                threads.push(t);
                            }
                        }
                    }
                }
                return Ok(threads);
            }
            
            // Try flat array format
            if let Ok(threads) = serde_json::from_str::<Vec<SevenChanCatalogThread>>(&text) {
                return Ok(threads);
            }
            
            Err("Failed to parse 7chan catalog".to_string())
        }
        _ => {
            // Fallback: try fetching page 0 and extracting threads
            let page_url = format!("{}/{}/0.json", SEVENCHAN_BASE, board);
            let response = client.get(&page_url).send().await.map_err(|e| e.to_string())?;
            
            if response.status().is_success() {
                let text = response.text().await.map_err(|e| e.to_string())?;
                if let Ok(page) = serde_json::from_str::<Value>(&text) {
                    if let Some(threads) = page.get("threads").and_then(|t| t.as_array()) {
                        let catalog: Vec<SevenChanCatalogThread> = threads
                            .iter()
                            .filter_map(|t| {
                                let posts = t.get("posts")?.as_array()?;
                                let op = posts.first()?;
                                Some(SevenChanCatalogThread {
                                    no: op.get("no")?.as_u64()?,
                                    sub: op.get("sub").and_then(|v| v.as_str()).map(String::from),
                                    com: op.get("com").and_then(|v| v.as_str()).map(String::from),
                                    tim: op.get("tim").and_then(|v| v.as_u64()),
                                    ext: op.get("ext").and_then(|v| v.as_str()).map(String::from),
                                    replies: t.get("posts")?.as_array()?.len().saturating_sub(1) as u32,
                                    images: 0,
                                    time: op.get("time")?.as_u64()?,
                                })
                            })
                            .collect();
                        return Ok(catalog);
                    }
                }
            }
            
            Err(format!("7chan /{board}/ is not accessible or has no JSON API"))
        }
    }
}

/// Fetch a thread from 7chan
#[tauri::command]
pub async fn fetch_sevenchan_thread(board: String, thread_id: u64) -> Result<SevenChanThread, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    // 7chan thread JSON endpoint
    let url = format!("{}/{}/res/{}.json", SEVENCHAN_BASE, board, thread_id);
    
    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("Thread not found: HTTP {}", response.status()));
    }
    
    let text = response.text().await.map_err(|e| e.to_string())?;
    
    // Try to parse - 7chan format may vary
    if let Ok(thread) = serde_json::from_str::<SevenChanThread>(&text) {
        return Ok(thread);
    }
    
    // Try wrapping in posts array
    if let Ok(value) = serde_json::from_str::<Value>(&text) {
        if let Some(posts) = value.get("posts").and_then(|p| p.as_array()) {
            let thread_posts: Vec<SevenChanPost> = posts
                .iter()
                .filter_map(|p| serde_json::from_value(p.clone()).ok())
                .collect();
            return Ok(SevenChanThread { posts: thread_posts });
        }
    }
    
    Err("Failed to parse 7chan thread".to_string())
}
