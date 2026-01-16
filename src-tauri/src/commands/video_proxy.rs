/**
 * Video Proxy Commands
 * 
 * Proxies video content from 4chan CDN to bypass CORS restrictions.
 * Downloads videos to local cache, then serves via local HTTP server.
 */

use tauri::{AppHandle, Manager};
use std::fs::File;
use std::io::Write;
use crate::video_server::get_video_server_url;

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct VideoInfo {
    pub url: String,         // URL to access the video (from local server)
    pub content_type: String,
    pub cached: bool,        // Whether video was already cached
}

/// Download video to cache and return local server URL for playback
#[tauri::command]
pub async fn proxy_video(url: String, app: AppHandle) -> Result<VideoInfo, String> {
    // Get video server URL
    let server_url = get_video_server_url()
        .ok_or_else(|| "Video server not running".to_string())?;
    
    // Create cache directory
    let cache_dir = app.path().cache_dir()
        .map_err(|e| format!("Failed to get cache dir: {}", e))?
        .join("videos");
    
    std::fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("Failed to create cache dir: {}", e))?;

    // Extract filename from URL
    let filename = url.split('/').last()
        .ok_or_else(|| "Invalid URL".to_string())?;
    
    let cache_path = cache_dir.join(filename);
    let video_url = format!("{}/{}", server_url, filename);

    // Check if already cached
    if cache_path.exists() {
        let content_type = if filename.ends_with(".webm") {
            "video/webm"
        } else if filename.ends_with(".mp4") {
            "video/mp4"
        } else if filename.ends_with(".swf") {
            "application/x-shockwave-flash"
        } else {
            "video/webm"
        };
        
        return Ok(VideoInfo {
            url: video_url,
            content_type: content_type.to_string(),
            cached: true,
        });
    }

    // Download video
    let client = reqwest::Client::new();
    let response = client.get(&url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .header("Referer", "https://boards.4chan.org/")
        .send()
        .await
        .map_err(|e| format!("Failed to download video: {}", e))?;

    let content_type = response.headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("video/webm")
        .to_string();

    let bytes = response.bytes()
        .await
        .map_err(|e| format!("Failed to read video bytes: {}", e))?;

    // Save to cache
    let mut file = File::create(&cache_path)
        .map_err(|e| format!("Failed to create cache file: {}", e))?;
    
    file.write_all(&bytes)
        .map_err(|e| format!("Failed to write video: {}", e))?;

    Ok(VideoInfo {
        url: video_url,
        content_type,
        cached: false,
    })
}

/// Get the video server URL
#[tauri::command]
pub fn get_video_server_url_cmd() -> Result<String, String> {
    get_video_server_url()
        .ok_or_else(|| "Video server not running".to_string())
}

/// Clear video cache
#[tauri::command]
pub async fn clear_video_cache(app: AppHandle) -> Result<u64, String> {
    let cache_dir = app.path().cache_dir()
        .map_err(|e| format!("Failed to get cache dir: {}", e))?
        .join("videos");
    
    let mut cleared_bytes: u64 = 0;
    
    if cache_dir.exists() {
        // Count bytes before clearing
        if let Ok(entries) = std::fs::read_dir(&cache_dir) {
            for entry in entries.flatten() {
                if let Ok(meta) = entry.metadata() {
                    cleared_bytes += meta.len();
                }
            }
        }
        
        std::fs::remove_dir_all(&cache_dir)
            .map_err(|e| format!("Failed to clear cache: {}", e))?;
    }
    
    Ok(cleared_bytes)
}
